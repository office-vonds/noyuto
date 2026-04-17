#!/usr/bin/env node
/**
 * noyutoブランド X自動投稿（Cookie直接認証版）
 *
 * パイプライン:
 *   1. generate_post.py でスレッド生成 → pending_posts/ に保存
 *   2. このスクリプトが pending_posts/ からキューイング → X投稿
 *
 * 初回セットアップ:
 *   node noyuto-x-post.js --setup
 *   → auth_token と ct0 を入力 → 保存
 *
 * Cookie取得方法（1分）:
 *   1. WindowsのChromeで https://x.com を開く（@noyuto でログイン済み）
 *   2. F12（DevTools） → Application タブ → Cookies → https://x.com
 *   3. auth_token の Value をコピー
 *   4. ct0 の Value をコピー
 *
 * コマンド:
 *   node noyuto-x-post.js --setup          # Cookie設定
 *   node noyuto-x-post.js --generate       # テーマからスレッド生成（generate_post.py呼び出し）
 *   node noyuto-x-post.js                  # pending_posts/ から1スレッド投稿
 *   node noyuto-x-post.js --dry-run        # テスト（投稿しない）
 *   node noyuto-x-post.js --full           # 生成 + 投稿（cron用）
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const NOYUTO_SCRIPTS_DIR = '/home/ozawakiryu0902/projects/noyuto/scripts';
const PENDING_POSTS_DIR = path.join(NOYUTO_SCRIPTS_DIR, 'data', 'generated', 'pending_posts');
const POSTED_DIR = path.join(SCRIPT_DIR, 'data', 'noyuto-x', 'posted');
const AUTH_FILE = path.join(SCRIPT_DIR, 'data', 'noyuto-x', '.x-auth.json');
const LOG_FILE = path.join(SCRIPT_DIR, 'data', 'noyuto-x', 'post.log');

const ACCOUNT_NAME = 'noyuto';

const args = process.argv.slice(2);
const setupMode = args.includes('--setup');
const dryRun = args.includes('--dry-run');
const generateMode = args.includes('--generate');
const fullMode = args.includes('--full');

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (e) { /* ignore */ }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()); }));
}

function ensureDirs() {
  [POSTED_DIR, path.dirname(AUTH_FILE)].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

// ── generate_post.py を呼び出してスレッド生成 ──
function generateThread() {
  log('generate_post.py でスレッド生成中...');
  try {
    const result = execSync(
      `cd "${NOYUTO_SCRIPTS_DIR}" && python3 generate_post.py`,
      { encoding: 'utf-8', timeout: 120000, env: { ...process.env } }
    );
    console.log(result);
    log('スレッド生成完了');
    return true;
  } catch (err) {
    log(`ERROR: generate_post.py 実行失敗: ${err.message}`);
    return false;
  }
}

// ── pending_posts/ から最古のスレッドを取得 ──
function getNextThread() {
  if (!fs.existsSync(PENDING_POSTS_DIR)) {
    log(`pending_posts/ が存在しません: ${PENDING_POSTS_DIR}`);
    return null;
  }
  const files = fs.readdirSync(PENDING_POSTS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    log('pending_posts/ にスレッドがありません');
    return null;
  }

  const file = files[0];
  const filePath = path.join(PENDING_POSTS_DIR, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return { file, filePath, data };
  } catch (err) {
    log(`ERROR: JSONパース失敗 ${file}: ${err.message}`);
    return null;
  }
}

// ── X GraphQL API でツイート投稿 ──
function postTweet(authToken, ct0, text, replyToId = null) {
  return new Promise((resolve, reject) => {
    const variables = {
      tweet_text: text,
      dark_request: false,
      media: { media_entities: [], possibly_sensitive: false },
      semantic_annotation_ids: [],
    };

    if (replyToId) {
      variables.reply = { in_reply_to_tweet_id: replyToId, exclude_reply_user_ids: [] };
    }

    const body = JSON.stringify({
      variables,
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
      queryId: 'c50A_puUoQGK_4SXseYz3A',
    });

    const options = {
      hostname: 'x.com',
      path: '/i/api/graphql/c50A_puUoQGK_4SXseYz3A/CreateTweet',
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
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── スレッド投稿（4本を連続リプライ） ──
async function postThread(authToken, ct0, thread, hashtags) {
  const tweetIds = [];

  for (let i = 0; i < thread.length; i++) {
    const item = thread[i];
    let text = item.text;

    // 最後のツイートにハッシュタグ追加
    if (i === thread.length - 1 && hashtags && hashtags.length > 0) {
      text += '\n\n' + hashtags.join(' ');
    }

    // 280文字（日本語140文字相当）を超えないようにトリム
    if (text.length > 280) {
      text = text.substring(0, 277) + '...';
    }

    const replyTo = i > 0 ? tweetIds[i - 1] : null;
    log(`  [${i + 1}/4] ${item.type}: ${text.substring(0, 60)}...`);

    try {
      const result = await postTweet(authToken, ct0, text, replyTo);
      tweetIds.push(result.id);
      log(`  -> Tweet ID: ${result.id}`);

      // レート制限回避: スレッド間に3秒待機
      if (i < thread.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (err) {
      log(`  ERROR: ツイート${i + 1}本目失敗: ${err.message}`);
      if (err.message.includes('401') || err.message.includes('403')) {
        log('  Cookie期限切れの可能性あり。--setup で再取得してください');
      }
      throw err;
    }
  }

  return tweetIds;
}

// ── 投稿済みに移動 ──
function moveToPosted(filePath, fileName, tweetIds) {
  ensureDirs();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const firstId = tweetIds[0] || 'unknown';
  const newName = `${timestamp}_${firstId}_${fileName}`;
  const destPath = path.join(POSTED_DIR, newName);
  fs.renameSync(filePath, destPath);
  log(`移動: ${fileName} -> posted/${newName}`);
}

// ── 認証テスト ──
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

// ── セットアップ ──
async function doSetup() {
  ensureDirs();
  console.log('\n========================================');
  console.log('  noyuto X Cookie セットアップ');
  console.log('========================================');
  console.log('  1. WindowsのChromeで https://x.com を開く');
  console.log('     （@noyuto でログイン済みの状態）');
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

  log('認証テスト中...');
  try {
    const screenName = await testAuth(authToken, ct0);
    log(`認証成功: @${screenName}`);
  } catch (err) {
    log(`WARNING: 認証テスト失敗: ${err.message}`);
    log('Cookie値を再確認してください');
  }
}

// ── メイン投稿処理 ──
async function doPost() {
  ensureDirs();

  const next = getNextThread();
  if (!next) return;

  const { file, filePath, data } = next;
  const thread = data.thread || [];
  const hashtags = data.hashtags || [];

  if (thread.length === 0) {
    log(`ERROR: スレッドが空です: ${file}`);
    return;
  }

  log(`投稿ファイル: ${file}`);
  log(`テーマ: ${data.theme || 'N/A'}`);
  log(`矢印: ${data.arrow_direction || 'N/A'}`);
  log(`スレッド: ${thread.length}本`);

  for (const item of thread) {
    log(`  [${item.position}] ${item.type}: ${(item.text || '').substring(0, 80)}...`);
  }

  if (dryRun) {
    log('[DRY-RUN] 投稿をスキップしました');
    return;
  }

  if (!fs.existsSync(AUTH_FILE)) {
    log('ERROR: 認証情報なし。まず --setup を実行してください');
    log(`  node noyuto-x-post.js --setup`);
    process.exit(1);
  }

  const { authToken, ct0 } = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));

  try {
    const tweetIds = await postThread(authToken, ct0, thread, hashtags);
    log(`スレッド投稿成功: ${tweetIds.length}本`);
    log(`URL: https://x.com/${ACCOUNT_NAME}/status/${tweetIds[0]}`);
    moveToPosted(filePath, file, tweetIds);
  } catch (err) {
    log(`ERROR: スレッド投稿失敗: ${err.message}`);
    process.exit(1);
  }
}

// ── フルモード（生成 + 投稿） ──
async function doFull() {
  // まず pending に在庫があるか確認
  let next = getNextThread();
  if (!next) {
    // 在庫がなければ生成
    const ok = generateThread();
    if (!ok) {
      log('ERROR: スレッド生成失敗。投稿をスキップ');
      process.exit(1);
    }
  }
  await doPost();
}

// ── エントリーポイント ──
(async () => {
  if (setupMode) {
    await doSetup();
  } else if (generateMode) {
    generateThread();
  } else if (fullMode) {
    await doFull();
  } else {
    await doPost();
  }
})();
