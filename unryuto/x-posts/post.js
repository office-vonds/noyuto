#!/usr/bin/env node
/**
 * UNRYUTO X自動投稿スクリプト (@unRyuto_ai)
 *
 * 使い方:
 *   node post.js                    # queue/ から次の1本を投稿
 *   node post.js --dry-run          # テスト（投稿しない）
 *   node post.js --text "投稿内容"   # 指定テキストを投稿
 *   node post.js --pin <tweet_id>   # 指定ツイートを固定
 *   node post.js --pinned           # pinned.txt の内容を投稿して固定
 *
 * 環境変数（unryuto/.env に設定）:
 *   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
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

const QUEUE_DIR = path.join(__dirname, 'queue');
const POSTED_DIR = path.join(__dirname, 'posted');
const PINNED_FILE = path.join(__dirname, 'pinned.txt');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const pinnedMode = args.includes('--pinned');
const textIdx = args.indexOf('--text');
const pinIdx = args.indexOf('--pin');

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

function getOAuthHeader(method, url) {
  const oauthParams = {
    oauth_consumer_key: CONFIG.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: CONFIG.accessToken,
    oauth_version: '1.0',
  };
  oauthParams.oauth_signature = createOAuthSignature(method, url, oauthParams);
  return 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ');
}

// ── API呼び出し ──
function apiRequest(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const fullUrl = `https://api.twitter.com${urlPath}`;
    const authHeader = getOAuthHeader(method, fullUrl);
    const options = {
      hostname: 'api.twitter.com',
      path: urlPath,
      method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : {});
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── ツイート投稿 ──
async function postTweet(text) {
  log(`投稿内容 (${text.length}文字):\n${text.substring(0, 100)}...`);
  if (dryRun) {
    log('[DRY-RUN] 投稿をスキップしました');
    return { id: 'dry-run-id', text };
  }
  const result = await apiRequest('POST', '/2/tweets', { text });
  log(`投稿成功！ Tweet ID: ${result.data.id}`);
  return result.data;
}

// ── ユーザーID取得 ──
async function getMyUserId() {
  const result = await apiRequest('GET', '/2/users/me');
  return result.data.id;
}

// ── ツイート固定（v1.1 API） ──
// 注意: v2にはpin APIがないため、実装上はv1.1のPOST account/pin_tweetを使う
// Free planでは使えない可能性あり。その場合は手動で固定する

// ── キューから次のツイートを選択 ──
function getNextFromQueue() {
  if (!fs.existsSync(QUEUE_DIR)) {
    log('queue/ ディレクトリが存在しません');
    return null;
  }
  const files = fs.readdirSync(QUEUE_DIR)
    .filter(f => f.endsWith('.txt'))
    .sort();
  if (files.length === 0) {
    log('queue/ にツイートがありません（全て投稿済み）');
    return null;
  }
  const file = files[0];
  const text = fs.readFileSync(path.join(QUEUE_DIR, file), 'utf-8').trim();
  return { file, text };
}

// ── キューのツイートをpostedに移動 ──
function moveToPosted(filename, tweetId) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const newName = `${timestamp}_${tweetId}_${filename}`;
  fs.renameSync(
    path.join(QUEUE_DIR, filename),
    path.join(POSTED_DIR, newName)
  );
  log(`移動: queue/${filename} → posted/${newName}`);
}

// ── メイン ──
async function main() {
  // 鍵チェック
  if (!CONFIG.apiKey || !CONFIG.accessToken) {
    log('ERROR: X API鍵が設定されていません。unryuto/.env を確認してください');
    process.exit(1);
  }

  try {
    // --text モード: 指定テキストを投稿
    if (textIdx !== -1 && args[textIdx + 1]) {
      const text = args[textIdx + 1];
      const result = await postTweet(text);
      log(`完了。Tweet ID: ${result.id}`);
      return;
    }

    // --pinned モード: pinned.txt を投稿
    if (pinnedMode) {
      if (!fs.existsSync(PINNED_FILE)) {
        log('ERROR: pinned.txt が見つかりません');
        process.exit(1);
      }
      const text = fs.readFileSync(PINNED_FILE, 'utf-8').trim();
      const result = await postTweet(text);
      log(`固定ツイート投稿完了。Tweet ID: ${result.id}`);
      log(`\n⚠️  手動で固定してください:`);
      log(`   1. https://x.com/unRyuto_ai/status/${result.id} を開く`);
      log(`   2. ツイートの「...」メニュー → 「プロフィールに固定する」`);
      return;
    }

    // --pin モード（情報表示のみ）
    if (pinIdx !== -1 && args[pinIdx + 1]) {
      const tweetId = args[pinIdx + 1];
      log(`固定するツイート: https://x.com/unRyuto_ai/status/${tweetId}`);
      log(`⚠️  X Free プランではAPI経由のピン留めは不可。手動で固定してください。`);
      return;
    }

    // デフォルト: queue/ から次のツイートを投稿
    const next = getNextFromQueue();
    if (!next) return;

    log(`投稿ファイル: queue/${next.file}`);
    const result = await postTweet(next.text);

    if (!dryRun) {
      moveToPosted(next.file, result.id);
    }

    // 残りキュー数を表示
    const remaining = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.txt')).length;
    log(`残りキュー: ${remaining}本`);

  } catch (err) {
    log(`ERROR: ${err.message}`);
    process.exit(1);
  }
}

main();
