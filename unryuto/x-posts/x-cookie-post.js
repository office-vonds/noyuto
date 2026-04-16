#!/usr/bin/env node
/**
 * X自動投稿（Cookie直接認証版 — API不要・ブラウザ自動化不要）
 *
 * 初回セットアップ:
 *   node x-cookie-post.js --setup
 *   → auth_token と ct0 を入力 → 保存
 *
 * Cookie取得方法（1分）:
 *   1. WindowsのChromeで https://x.com を開く（@unryuto_aiでログイン済み）
 *   2. F12（DevTools）→ Application タブ → Cookies → https://x.com
 *   3. auth_token の Value をコピー
 *   4. ct0 の Value をコピー
 *
 * 投稿: node x-cookie-post.js
 * テスト: node x-cookie-post.js --dry-run
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const QUEUE_DIR = path.join(__dirname, 'queue');
const POSTED_DIR = path.join(__dirname, 'posted');
const AUTH_FILE = path.join(__dirname, '.x-auth.json');

const args = process.argv.slice(2);
const setupMode = args.includes('--setup');
const dryRun = args.includes('--dry-run');

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  console.log(`[${ts}] ${msg}`);
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()); }));
}

function getNextFromQueue() {
  if (!fs.existsSync(QUEUE_DIR)) { log('queue/ が存在しません'); return null; }
  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.txt')).sort();
  if (files.length === 0) { log('queue/ にツイートがありません'); return null; }
  const file = files[0];
  const text = fs.readFileSync(path.join(QUEUE_DIR, file), 'utf-8').trim();
  return { file, text };
}

function moveToPosted(filename, tweetId) {
  if (!fs.existsSync(POSTED_DIR)) fs.mkdirSync(POSTED_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const newName = `${timestamp}_${tweetId}_${filename}`;
  fs.renameSync(path.join(QUEUE_DIR, filename), path.join(POSTED_DIR, newName));
  log(`移動: queue/${filename} → posted/${newName}`);
}

// X内部API（GraphQL）でツイート投稿
function postTweet(authToken, ct0, text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      variables: {
        tweet_text: text,
        dark_request: false,
        media: { media_entities: [], possibly_sensitive: false },
        semantic_annotation_ids: [],
      },
      features: {
        communities_web_enable_tweet_community_results_fetch: true,
        c9s_tweet_anatomy_moderator_badge_enabled: true,
        tweetypie_unmention_optimization_enabled: true,
        responsive_web_edit_tweet_api_enabled: true,
        graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
        view_counts_everywhere_api_enabled: true,
        longform_notetweets_consumption_enabled: true,
        responsive_web_twitter_article_tweet_consumption_enabled: true,
        tweet_awards_web_tipping_enabled: false,
        creator_subscriptions_quote_tweet_preview_enabled: false,
        longform_notetweets_rich_text_read_enabled: true,
        longform_notetweets_inline_media_enabled: true,
        articles_preview_enabled: true,
        rweb_video_timestamps_enabled: true,
        rweb_tipjar_consumption_enabled: true,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        freedom_of_speech_not_reach_fetch_enabled: true,
        standardized_nudges_misinfo: true,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        responsive_web_graphql_timeline_navigation_enabled: true,
        responsive_web_enhance_cards_enabled: false,
      },
      queryId: 'mnCM0-KxBCMuRYIT_MSTng',
    });

    const options = {
      hostname: 'x.com',
      path: '/i/api/graphql/mnCM0-KxBCMuRYIT_MSTng/CreateTweet',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'Cookie': `auth_token=${authToken}; ct0=${ct0}`,
        'X-Csrf-Token': ct0,
        'X-Twitter-Auth-Type': 'OAuth2Session',
        'X-Twitter-Active-User': 'yes',
        'X-Twitter-Client-Language': 'ja',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Referer': 'https://x.com/compose/tweet',
        'Origin': 'https://x.com',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            const tweetResult = json?.data?.create_tweet?.tweet_results?.result;
            const tweetId = tweetResult?.rest_id || 'unknown';
            resolve({ id: tweetId, success: true });
          } catch (e) {
            resolve({ id: 'unknown', success: true });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function doSetup() {
  console.log('\n========================================');
  console.log('  X Cookie 取得手順（1分で完了）');
  console.log('========================================');
  console.log('  1. WindowsのChromeで https://x.com を開く');
  console.log('     （@unryuto_ai でログイン済みの状態）');
  console.log('  2. F12 キーを押す（DevTools）');
  console.log('  3. 上部タブ「Application」をクリック');
  console.log('  4. 左メニュー「Cookies」→「https://x.com」');
  console.log('  5. 以下の2つの値をコピー:');
  console.log('     - auth_token');
  console.log('     - ct0');
  console.log('========================================\n');

  const authToken = await ask('auth_token の値: ');
  const ct0 = await ask('ct0 の値: ');

  if (!authToken || !ct0) {
    log('ERROR: 両方の値を入力してください');
    process.exit(1);
  }

  fs.writeFileSync(AUTH_FILE, JSON.stringify({ authToken, ct0 }, null, 2));
  log('認証情報を保存しました');

  // 認証テスト
  log('認証テスト中...');
  try {
    const testResult = await testAuth(authToken, ct0);
    log(`認証成功！ ユーザー: @${testResult}`);
    log('次回から node x-cookie-post.js で自動投稿できます');
  } catch (err) {
    log(`WARNING: 認証テスト失敗: ${err.message}`);
    log('Cookie値を再確認してください');
  }
}

function testAuth(authToken, ct0) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'x.com',
      path: '/i/api/1.1/account/verify_credentials.json',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'Cookie': `auth_token=${authToken}; ct0=${ct0}`,
        'X-Csrf-Token': ct0,
        'X-Twitter-Auth-Type': 'OAuth2Session',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(data).screen_name); }
          catch (e) { resolve('unknown'); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function doPost() {
  const next = getNextFromQueue();
  if (!next) return;

  log(`投稿ファイル: queue/${next.file}`);
  log(`投稿内容 (${next.text.length}文字):\n${next.text}`);

  if (dryRun) {
    log('[DRY-RUN] 投稿をスキップしました');
    const remaining = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.txt')).length;
    log(`残りキュー: ${remaining}本`);
    return;
  }

  if (!fs.existsSync(AUTH_FILE)) {
    log('ERROR: 認証情報なし。まず --setup を実行してください');
    process.exit(1);
  }

  const { authToken, ct0 } = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));

  try {
    const result = await postTweet(authToken, ct0, next.text);
    log(`投稿成功！ Tweet ID: ${result.id}`);
    log(`URL: https://x.com/unryuto_ai/status/${result.id}`);

    moveToPosted(next.file, result.id);

    const remaining = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.txt')).length;
    log(`残りキュー: ${remaining}本`);
  } catch (err) {
    log(`ERROR: ${err.message}`);
    if (err.message.includes('401') || err.message.includes('403')) {
      log('Cookie期限切れの可能性あり。--setup で再取得してください');
    }
    process.exit(1);
  }
}

(async () => {
  if (setupMode) await doSetup();
  else await doPost();
})();
