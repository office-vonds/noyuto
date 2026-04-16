#!/usr/bin/env node
/**
 * X自動投稿（ブラウザ自動化版 — API不要）
 *
 * 初回: node x-browser-post.js --login
 *   → ブラウザが開く → @unryuto_ai でログイン → Cookieが保存される
 *
 * 投稿: node x-browser-post.js
 *   → queue/ から次の1本を自動投稿（ヘッドレス）
 *
 * テスト: node x-browser-post.js --dry-run
 *   → 投稿内容を表示するだけ（実際には投稿しない）
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUEUE_DIR = path.join(__dirname, 'queue');
const POSTED_DIR = path.join(__dirname, 'posted');
const COOKIE_FILE = path.join(__dirname, '.x-cookies.json');

const args = process.argv.slice(2);
const loginMode = args.includes('--login');
const dryRun = args.includes('--dry-run');

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  console.log(`[${ts}] ${msg}`);
}

function getNextFromQueue() {
  if (!fs.existsSync(QUEUE_DIR)) { log('queue/ が存在しません'); return null; }
  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.txt')).sort();
  if (files.length === 0) { log('queue/ にツイートがありません'); return null; }
  const file = files[0];
  const text = fs.readFileSync(path.join(QUEUE_DIR, file), 'utf-8').trim();
  return { file, text };
}

function moveToPosted(filename) {
  if (!fs.existsSync(POSTED_DIR)) fs.mkdirSync(POSTED_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const newName = `${timestamp}_browser_${filename}`;
  fs.renameSync(path.join(QUEUE_DIR, filename), path.join(POSTED_DIR, newName));
  log(`移動: queue/${filename} → posted/${newName}`);
}

async function doLogin() {
  log('ログインモード: ブラウザを開きます...');
  log('※ @unryuto_ai でログインしてください');
  log('※ ログイン完了後、ブラウザを閉じてください');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  await page.goto('https://x.com/login', { waitUntil: 'networkidle' });

  log('ブラウザでログインしてください。完了したらこのターミナルに戻ってEnterを押してください。');

  // ユーザーがログインを完了するまで待機
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  // Cookie保存
  const cookies = await context.cookies();
  fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));
  log(`Cookie保存完了: ${cookies.length}個 → .x-cookies.json`);

  await browser.close();
  log('ログイン完了。次回から node x-browser-post.js で自動投稿できます。');
}

async function doPost() {
  const next = getNextFromQueue();
  if (!next) return;

  log(`投稿ファイル: queue/${next.file}`);
  log(`投稿内容 (${next.text.length}文字):\n${next.text.substring(0, 100)}...`);

  if (dryRun) {
    log('[DRY-RUN] 投稿をスキップしました');
    const remaining = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.txt')).length;
    log(`残りキュー: ${remaining}本`);
    return;
  }

  if (!fs.existsSync(COOKIE_FILE)) {
    log('ERROR: Cookie未保存。まず node x-browser-post.js --login を実行してください');
    process.exit(1);
  }

  const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE, 'utf-8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  await context.addCookies(cookies);

  try {
    const page = await context.newPage();

    // X.comのホーム画面に移動
    await page.goto('https://x.com/home', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // ログイン状態確認
    const url = page.url();
    if (url.includes('/login') || url.includes('/i/flow')) {
      log('ERROR: Cookie期限切れ。node x-browser-post.js --login で再ログインしてください');
      await browser.close();
      process.exit(1);
    }

    // 投稿欄をクリック
    const tweetBox = await page.waitForSelector('[data-testid="tweetTextarea_0"]', { timeout: 10000 });
    await tweetBox.click();
    await page.waitForTimeout(500);

    // テキストを入力
    await page.keyboard.type(next.text, { delay: 10 });
    await page.waitForTimeout(1000);

    // 投稿ボタンをクリック
    const postButton = await page.waitForSelector('[data-testid="tweetButtonInline"]', { timeout: 5000 });
    await postButton.click();
    await page.waitForTimeout(3000);

    log('投稿成功！');

    // Cookie更新（セッション延長）
    const newCookies = await context.cookies();
    fs.writeFileSync(COOKIE_FILE, JSON.stringify(newCookies, null, 2));

    // キューから移動
    moveToPosted(next.file);

    const remaining = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.txt')).length;
    log(`残りキュー: ${remaining}本`);

  } catch (err) {
    log(`ERROR: ${err.message}`);
    // エラー時のスクショ保存
    try {
      const pages = context.pages();
      if (pages.length > 0) {
        await pages[0].screenshot({ path: path.join(__dirname, 'error-screenshot.png') });
        log('エラー時スクショ: x-posts/error-screenshot.png');
      }
    } catch (_) {}
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// メイン
(async () => {
  if (loginMode) {
    await doLogin();
  } else {
    await doPost();
  }
})();
