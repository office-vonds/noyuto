#!/usr/bin/env node
/**
 * X自動投稿（ブラウザ自動化版 — API不要）
 *
 * 初回: node x-browser-post.js --login
 *   → ユーザー名・パスワードを入力 → 自動ログイン → Cookie保存
 *
 * 投稿: node x-browser-post.js
 *   → queue/ から次の1本を自動投稿
 *
 * テスト: node x-browser-post.js --dry-run
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer); }));
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
  // --login user pass 形式 or 対話入力
  let username, password;
  const loginIdx = args.indexOf('--login');
  if (args[loginIdx + 1] && args[loginIdx + 2]) {
    username = args[loginIdx + 1];
    password = args[loginIdx + 2];
  } else {
    username = await ask('Xユーザー名 (@unryuto_ai): ');
    password = await ask('パスワード: ');
  }

  log('ヘッドレスブラウザでログイン中...');

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-infobars',
      '--window-size=1280,800',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'Asia/Tokyo',
  });

  // webdriver検知を回避
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en', 'ja'] });
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (params) =>
      params.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(params);
  });

  const page = await context.newPage();

  try {
    // ログインページへ
    await page.goto('https://x.com/i/flow/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // ユーザー名入力
    log('ユーザー名を入力中...');
    // 入力フィールドを探す（複数セレクタ対応）
    await page.waitForSelector('input', { timeout: 15000 });
    const inputs = await page.$$('input');
    let usernameInput = null;
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const ac = await inp.getAttribute('autocomplete');
      if (type === 'text' || name === 'text' || ac === 'username') {
        usernameInput = inp;
        break;
      }
    }
    if (!usernameInput) {
      // フォールバック: 最初の可視inputを使う
      usernameInput = inputs[0];
    }
    await usernameInput.click();
    await page.waitForTimeout(300);
    await page.keyboard.type(username || 'unryuto_ai', { delay: 50 });
    await page.waitForTimeout(500);

    // スクショで状態確認
    await page.screenshot({ path: path.join(__dirname, 'debug-after-username.png') });

    // 「Next」ボタン
    log('Nextボタンをクリック...');
    // Enterキーで送信（ボタンクリックより確実）
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // スクショで状態確認
    await page.screenshot({ path: path.join(__dirname, 'debug-after-next.png') });

    // 追加認証（メールアドレスや電話番号の確認が求められる場合）
    const extraInput = await page.$('input[data-testid="ocfEnterTextTextInput"]');
    if (extraInput) {
      log('追加認証が求められています。メールアドレスまたは電話番号を入力してください:');
      const extraValue = await ask('メールアドレス or 電話番号: ');
      await extraInput.fill(extraValue);
      await page.click('button:has-text("Next"), button:has-text("次へ")');
      await page.waitForTimeout(2000);
    }

    // パスワード入力
    log('パスワードを入力中...');
    const passwordInput = await page.waitForSelector('input[name="password"], input[type="password"]', { timeout: 15000 });
    await passwordInput.click();
    await page.waitForTimeout(300);
    await page.keyboard.type(password, { delay: 50 });
    await page.waitForTimeout(500);

    // ログインボタン — Enterで送信
    log('ログイン実行...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);

    // ログイン確認
    const currentUrl = page.url();
    if (currentUrl.includes('/home') || currentUrl === 'https://x.com/') {
      log('ログイン成功！');
    } else if (currentUrl.includes('/login') || currentUrl.includes('/flow')) {
      // 2FA確認
      const twoFaInput = await page.$('input[data-testid="ocfEnterTextTextInput"]');
      if (twoFaInput) {
        log('2段階認証が必要です。認証コードを入力してください:');
        const code = await ask('認証コード: ');
        await twoFaInput.fill(code);
        const confirmBtns2 = await page.$$('button');
        for (const btn of confirmBtns2) {
          const text = await btn.textContent();
          if (text && (text.includes('次へ') || text.includes('Next') || text.includes('確認'))) {
            await btn.click();
            break;
          }
        }
        await page.waitForTimeout(5000);
      }

      const finalUrl = page.url();
      if (finalUrl.includes('/home') || finalUrl === 'https://x.com/') {
        log('ログイン成功！');
      } else {
        log(`WARNING: ログイン後のURL: ${finalUrl}`);
        await page.screenshot({ path: path.join(__dirname, 'login-debug.png') });
        log('デバッグスクショ: x-posts/login-debug.png');
      }
    }

    // Cookie保存
    const cookies = await context.cookies();
    fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));
    log(`Cookie保存完了: ${cookies.length}個`);
    log('次回から node x-browser-post.js で自動投稿できます');

  } catch (err) {
    log(`ERROR: ${err.message}`);
    await page.screenshot({ path: path.join(__dirname, 'login-error.png') });
    log('エラースクショ: x-posts/login-error.png');
  } finally {
    await browser.close();
  }
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
    log('ERROR: Cookie未保存。まず --login を実行してください');
    process.exit(1);
  }

  const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE, 'utf-8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  await context.addCookies(cookies);

  try {
    const page = await context.newPage();
    await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // ログイン確認
    if (page.url().includes('/login') || page.url().includes('/flow')) {
      log('ERROR: Cookie期限切れ。--login で再ログインしてください');
      await browser.close();
      process.exit(1);
    }

    // 投稿欄をクリック
    const tweetBox = await page.waitForSelector('[data-testid="tweetTextarea_0"]', { timeout: 15000 });
    await tweetBox.click();
    await page.waitForTimeout(500);

    // テキスト入力
    await page.keyboard.type(next.text, { delay: 15 });
    await page.waitForTimeout(1000);

    // 投稿ボタン
    const postButton = await page.waitForSelector('[data-testid="tweetButtonInline"]', { timeout: 5000 });
    await postButton.click();
    await page.waitForTimeout(3000);

    log('投稿成功！');

    // Cookie更新
    const newCookies = await context.cookies();
    fs.writeFileSync(COOKIE_FILE, JSON.stringify(newCookies, null, 2));

    moveToPosted(next.file);

    const remaining = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.txt')).length;
    log(`残りキュー: ${remaining}本`);

  } catch (err) {
    log(`ERROR: ${err.message}`);
    try {
      const pages = context.pages();
      if (pages.length > 0) await pages[0].screenshot({ path: path.join(__dirname, 'error-screenshot.png') });
    } catch (_) {}
    process.exit(1);
  } finally {
    await browser.close();
  }
}

(async () => {
  if (loginMode) await doLogin();
  else await doPost();
})();
