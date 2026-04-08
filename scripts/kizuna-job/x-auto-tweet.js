#!/usr/bin/env node
/**
 * X(Twitter) 自動ツイートスクリプト - @rina_xxxfree
 *
 * 3層コンテンツ（共感50%/価値30%/誘導20%）を日替わりで自動投稿
 * PDCAサイクル：週次でエンゲージメント分析→配分自動調整
 *
 * 使い方:
 *   node x-auto-tweet.js              # 次の未投稿ツイートを投稿
 *   node x-auto-tweet.js --dry-run    # テスト（投稿しない）
 *   node x-auto-tweet.js --report     # 週次レポート生成
 *
 * cron（毎日12時と20時の2回投稿）:
 *   0 12 * * * node /home/ozawakiryu0902/projects/vonds/scripts/x-auto-tweet.js >> ~/projects/vonds/scripts/x-tweet-cron.log 2>&1
 *   0 20 * * * node /home/ozawakiryu0902/projects/vonds/scripts/x-auto-tweet.js >> ~/projects/vonds/scripts/x-tweet-cron.log 2>&1
 *
 * 環境変数（.envに設定）:
 *   X_API_KEY=
 *   X_API_SECRET=
 *   X_ACCESS_TOKEN=
 *   X_ACCESS_TOKEN_SECRET=
 */

const crypto = require('crypto');
const https = require('https');
const path = require('path');
const fs = require('fs');

// ── 設定 ──
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const CONFIG = {
  apiKey: process.env.X_API_KEY || '',
  apiSecret: process.env.X_API_SECRET || '',
  accessToken: process.env.X_ACCESS_TOKEN || '',
  accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET || '',
};

const TWEETS_FILE = path.join(__dirname, 'x-tweets-stock.json');
const REPORT_FILE = path.join(__dirname, 'x-weekly-report.json');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const reportMode = args.includes('--report');

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  console.log(`[${ts}] ${msg}`);
}

// ── OAuth 1.0a 署名 ──
function createOAuthSignature(method, url, params) {
  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(
      Object.keys(params).sort().map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&')
    ),
  ].join('&');

  const signingKey = `${encodeURIComponent(CONFIG.apiSecret)}&${encodeURIComponent(CONFIG.accessTokenSecret)}`;
  return crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');
}

function getOAuthHeader(method, url, extraParams = {}) {
  const oauthParams = {
    oauth_consumer_key: CONFIG.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: CONFIG.accessToken,
    oauth_version: '1.0',
  };

  const allParams = { ...oauthParams, ...extraParams };
  oauthParams.oauth_signature = createOAuthSignature(method, url, allParams);

  const header = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ');

  return header;
}

// ── ツイート投稿（X API v2） ──
function postTweet(text) {
  return new Promise((resolve, reject) => {
    const url = 'https://api.twitter.com/2/tweets';
    const body = JSON.stringify({ text });
    const authHeader = getOAuthHeader('POST', url);

    const options = {
      hostname: 'api.twitter.com',
      path: '/2/tweets',
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          const result = JSON.parse(data);
          resolve(result.data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── ツイート選択ロジック（PDCA反映） ──
function selectNextTweet(tweets) {
  const unposted = tweets.filter(t => !t.posted);
  if (unposted.length === 0) {
    log('全ツイートが投稿済み。フラグをリセット。');
    tweets.forEach(t => { t.posted = false; });
    fs.writeFileSync(TWEETS_FILE, JSON.stringify(tweets, null, 2), 'utf-8');
    return tweets[0];
  }

  // PDCA: レポートデータがあれば、エンゲージ率が高いカテゴリを優先
  if (fs.existsSync(REPORT_FILE)) {
    try {
      const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf-8'));
      const weights = report.category_weights || {};

      // 重み付きランダム選択
      const weighted = unposted.map(t => ({
        ...t,
        weight: weights[t.category] || 1,
      }));
      const totalWeight = weighted.reduce((s, t) => s + t.weight, 0);
      let random = Math.random() * totalWeight;
      for (const t of weighted) {
        random -= t.weight;
        if (random <= 0) return t;
      }
    } catch (e) {
      // レポートがない or 壊れている場合は順番に投稿
    }
  }

  return unposted[0];
}

// ── 週次レポート生成 ──
function generateReport(tweets) {
  const posted = tweets.filter(t => t.posted && t.engagement);
  if (posted.length === 0) {
    log('エンゲージメントデータがありません。');
    return;
  }

  const byCategory = {};
  for (const t of posted) {
    const cat = t.category;
    if (!byCategory[cat]) byCategory[cat] = { impressions: 0, engagements: 0, count: 0 };
    byCategory[cat].impressions += t.engagement.impressions || 0;
    byCategory[cat].engagements += t.engagement.likes + t.engagement.retweets + t.engagement.replies || 0;
    byCategory[cat].count++;
  }

  // カテゴリ別の重みを算出（エンゲージ率が高い→重みアップ）
  const weights = {};
  for (const [cat, data] of Object.entries(byCategory)) {
    const rate = data.impressions > 0 ? data.engagements / data.impressions : 0;
    weights[cat] = Math.max(0.5, 1 + (rate - 0.03) * 20); // 基準3%からの偏差
  }

  const report = {
    generated_at: new Date().toISOString(),
    period: '7days',
    categories: byCategory,
    category_weights: weights,
    total_tweets: posted.length,
    recommendation: Object.entries(weights)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, w]) => `${cat}: ${w.toFixed(2)}`)
      .join(', '),
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8');
  log('=== 週次レポート ===');
  log(`投稿数: ${report.total_tweets}`);
  log(`カテゴリ別重み: ${report.recommendation}`);
  log(`保存先: ${REPORT_FILE}`);
}

// ── メイン ──
async function main() {
  if (!CONFIG.apiKey) {
    log('X API keyが設定されていません。.envに以下を追加してください:');
    log('  X_API_KEY=...');
    log('  X_API_SECRET=...');
    log('  X_ACCESS_TOKEN=...');
    log('  X_ACCESS_TOKEN_SECRET=...');
    if (!dryRun) process.exit(1);
  }

  if (!fs.existsSync(TWEETS_FILE)) {
    log(`${TWEETS_FILE} が見つかりません`);
    process.exit(1);
  }

  const tweets = JSON.parse(fs.readFileSync(TWEETS_FILE, 'utf-8'));

  if (reportMode) {
    generateReport(tweets);
    return;
  }

  const tweet = selectNextTweet(tweets);
  log(`ツイート [${tweet.layer}/${tweet.category}]: "${tweet.text}"`);

  if (dryRun) {
    log('[DRY RUN] 投稿をスキップ');
    return;
  }

  try {
    const result = await postTweet(tweet.text);
    log(`✅ 投稿完了 (ID: ${result.id})`);

    // 投稿済みマーク
    const idx = tweets.findIndex(t => t.text === tweet.text);
    if (idx !== -1) {
      tweets[idx].posted = true;
      tweets[idx].posted_at = new Date().toISOString();
      tweets[idx].tweet_id = result.id;
    }
    fs.writeFileSync(TWEETS_FILE, JSON.stringify(tweets, null, 2), 'utf-8');
  } catch (e) {
    log(`❌ 投稿エラー: ${e.message}`);
  }
}

main().catch(e => {
  log(`Fatal: ${e.message}`);
  process.exit(1);
});
