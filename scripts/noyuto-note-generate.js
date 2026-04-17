#!/usr/bin/env node
/**
 * noyutoブランド NOTE記事自動生成・下書き保存パイプライン
 *
 * パイプライン:
 *   1. generate_post.py が pending_notes/ に記事JSONを保存
 *   2. このスクリプトが pending_notes/ から取得 → note.com に下書き保存
 *
 * note.com への下書き投稿は Playwright（Cookie認証）を使用。
 *
 * コマンド:
 *   node noyuto-note-generate.js --setup          # noteセッション保存
 *   node noyuto-note-generate.js                  # pending_notes/ から1記事を下書き保存
 *   node noyuto-note-generate.js --generate       # generate_post.py を呼んで記事生成
 *   node noyuto-note-generate.js --full            # 生成 + 下書き保存（cron用）
 *   node noyuto-note-generate.js --dry-run         # テスト
 *   node noyuto-note-generate.js --list            # pending記事一覧
 *
 * 初回セットアップ:
 *   1. node noyuto-note-generate.js --setup
 *      → ブラウザが開く → note.com に手動ログイン → Enterキーで保存
 *   2. 以降は自動でセッション再利用
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const NOYUTO_SCRIPTS_DIR = '/home/ozawakiryu0902/projects/noyuto/scripts';
const PENDING_NOTES_DIR = path.join(NOYUTO_SCRIPTS_DIR, 'data', 'generated', 'pending_notes');
const POSTED_NOTES_DIR = path.join(SCRIPT_DIR, 'data', 'noyuto-note', 'posted');
const SESSION_FILE = path.join(SCRIPT_DIR, 'data', 'noyuto-note', 'note_session.json');
const LOG_FILE = path.join(SCRIPT_DIR, 'data', 'noyuto-note', 'note.log');

const NOTE_NEW_URL = 'https://note.com/noyuto_0902/n/new';

const args = process.argv.slice(2);
const setupMode = args.includes('--setup');
const dryRun = args.includes('--dry-run');
const generateMode = args.includes('--generate');
const fullMode = args.includes('--full');
const listMode = args.includes('--list');

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

function ensureDirs() {
  [POSTED_NOTES_DIR, path.dirname(SESSION_FILE), path.dirname(LOG_FILE)].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

// ── generate_post.py を呼んで記事生成 ──
function generateArticle() {
  log('generate_post.py でnote記事生成中...');
  try {
    const result = execSync(
      `cd "${NOYUTO_SCRIPTS_DIR}" && python3 generate_post.py`,
      { encoding: 'utf-8', timeout: 120000, env: { ...process.env } }
    );
    console.log(result);
    log('記事生成完了');
    return true;
  } catch (err) {
    log(`ERROR: generate_post.py 実行失敗: ${err.message}`);
    return false;
  }
}

// ── pending_notes/ から最古の記事を取得 ──
function getNextNote() {
  if (!fs.existsSync(PENDING_NOTES_DIR)) {
    log(`pending_notes/ が存在しません: ${PENDING_NOTES_DIR}`);
    return null;
  }
  const files = fs.readdirSync(PENDING_NOTES_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    log('pending_notes/ に記事がありません');
    return null;
  }

  const file = files[0];
  const filePath = path.join(PENDING_NOTES_DIR, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return { file, filePath, data };
  } catch (err) {
    log(`ERROR: JSONパース失敗 ${file}: ${err.message}`);
    return null;
  }
}

// ── 一覧表示 ──
function listPending() {
  if (!fs.existsSync(PENDING_NOTES_DIR)) {
    console.log('pending_notes/ が存在しません');
    return;
  }
  const files = fs.readdirSync(PENDING_NOTES_DIR).filter(f => f.endsWith('.json')).sort();
  if (files.length === 0) {
    console.log('pending記事: 0件');
    return;
  }
  console.log(`\npending記事: ${files.length}件\n`);
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(PENDING_NOTES_DIR, file), 'utf-8'));
      console.log(`  ${file}`);
      console.log(`    テーマ: ${data.theme || 'N/A'}`);
      console.log(`    タイトル: ${data.title || 'N/A'}`);
      console.log(`    本文: ${(data.body || '').substring(0, 80)}...`);
      console.log('');
    } catch (e) {
      console.log(`  ${file} (パース失敗)`);
    }
  }
}

// ── Playwright でnote.com に下書き保存 ──
async function postDraftToNote(noteData) {
  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    log('ERROR: playwright が見つかりません');
    log('  npm install playwright');
    process.exit(1);
  }

  const title = noteData.title || '';
  const body = noteData.body || '';
  const membershipCta = noteData.membership_cta || '';

  // 本文にメンバーシップCTAを追加
  const fullBody = membershipCta
    ? `${body}\n\n---\n\n${membershipCta}`
    : body;

  log(`note下書き保存: "${title}"`);
  log(`  本文: ${fullBody.length}文字`);

  if (!fs.existsSync(SESSION_FILE)) {
    log('ERROR: noteセッション未設定。--setup を実行してください');
    process.exit(1);
  }

  const browser = await playwright.chromium.launch({
    headless: true,
    channel: 'chrome',
  });

  try {
    const context = await browser.newContext({
      storageState: SESSION_FILE,
    });
    const page = await context.newPage();

    // note新規記事ページに遷移
    await page.goto(NOTE_NEW_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // ログイン確認
    if (page.url().includes('login')) {
      log('ERROR: noteにログインできません。--setup でセッションを更新してください');
      await browser.close();
      process.exit(1);
    }

    // タイトル入力
    // note のエディタ構造: contenteditable なタイトル欄
    const titleSelector = '[data-testid="article-title"], [placeholder*="タイトル"], .o-noteContentHeader__title, h1[contenteditable]';
    await page.waitForSelector(titleSelector, { timeout: 15000 });
    const titleEl = await page.$(titleSelector);
    if (titleEl) {
      await titleEl.click();
      await page.keyboard.type(title, { delay: 30 });
    } else {
      log('WARNING: タイトル欄が見つかりません');
    }

    // 本文入力
    // note のエディタ: ProseMirror / contenteditable な本文欄
    const bodySelector = '[data-testid="article-body"], .ProseMirror, [contenteditable="true"]:not(h1), .o-noteContentBody__editor';
    await page.waitForSelector(bodySelector, { timeout: 10000 });
    const bodyEls = await page.$$(bodySelector);

    // タイトル以外の contenteditable を探す
    let bodyEl = null;
    for (const el of bodyEls) {
      const tag = await el.evaluate(e => e.tagName.toLowerCase());
      if (tag !== 'h1') {
        bodyEl = el;
        break;
      }
    }

    if (bodyEl) {
      await bodyEl.click();
      // Markdown風にペースト（noteはMarkdown一部対応）
      // 長文なので clipboard を使用
      await page.evaluate((text) => {
        navigator.clipboard.writeText(text);
      }, fullBody);
      await page.keyboard.down('Control');
      await page.keyboard.press('v');
      await page.keyboard.up('Control');

      // フォールバック: clipboard が使えない場合は直接入力
      const currentText = await bodyEl.innerText();
      if (!currentText || currentText.trim().length < 10) {
        log('  clipboard貼り付け失敗。直接入力にフォールバック...');
        // 段落ごとに入力
        const paragraphs = fullBody.split('\n');
        for (const p of paragraphs) {
          if (p.trim()) {
            await page.keyboard.type(p, { delay: 5 });
          }
          await page.keyboard.press('Enter');
        }
      }
    } else {
      log('WARNING: 本文欄が見つかりません');
    }

    // 下書き保存ボタンをクリック
    // note の下書き保存は通常「下書き保存」ボタン or 自動保存
    // 少し待って自動保存を待つ
    await page.waitForTimeout(3000);

    // 明示的に下書き保存を試行
    const saveBtn = await page.$('[data-testid="save-draft"], button:has-text("下書き"), button:has-text("保存")');
    if (saveBtn) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
      log('下書き保存ボタンをクリックしました');
    } else {
      log('下書き保存ボタンが見つかりません（自動保存を期待）');
    }

    // 現在のURLを取得（記事IDが含まれている場合がある）
    const currentUrl = page.url();
    log(`現在のURL: ${currentUrl}`);

    await browser.close();
    return { success: true, url: currentUrl };

  } catch (err) {
    log(`ERROR: note下書き保存失敗: ${err.message}`);
    await browser.close();
    throw err;
  }
}

// ── 投稿済みに移動 ──
function moveToPosted(filePath, fileName) {
  ensureDirs();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const newName = `${timestamp}_${fileName}`;
  const destPath = path.join(POSTED_NOTES_DIR, newName);
  fs.renameSync(filePath, destPath);
  log(`移動: ${fileName} -> posted/${newName}`);
}

// ── セットアップ（Playwrightでnoteログインセッション保存） ──
async function doSetup() {
  ensureDirs();
  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    log('ERROR: playwright が見つかりません');
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('  note.com セッション保存');
  console.log('========================================');
  console.log('  ブラウザが開きます。');
  console.log('  note.com にログインしてください。');
  console.log('  ログイン完了後、ターミナルでEnterを押してください。');
  console.log('========================================\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    channel: 'chrome',
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://note.com/login', { waitUntil: 'networkidle' });

  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise(resolve => rl.question('ログイン完了後、Enterを押してください: ', resolve));
  rl.close();

  await context.storageState({ path: SESSION_FILE });
  log(`セッション保存: ${SESSION_FILE}`);
  await browser.close();
  log('セットアップ完了');
}

// ── メイン投稿処理 ──
async function doPost() {
  ensureDirs();
  const next = getNextNote();
  if (!next) return;

  const { file, filePath, data } = next;
  log(`対象記事: ${file}`);
  log(`テーマ: ${data.theme || 'N/A'}`);
  log(`タイトル: ${data.title || 'N/A'}`);

  if (dryRun) {
    log('[DRY-RUN] 下書き保存をスキップしました');
    log(`  タイトル: ${data.title}`);
    log(`  本文冒頭: ${(data.body || '').substring(0, 200)}...`);
    return;
  }

  try {
    const result = await postDraftToNote(data);
    if (result.success) {
      log(`note下書き保存成功: ${result.url}`);
      moveToPosted(filePath, file);
    }
  } catch (err) {
    log(`ERROR: note下書き保存失敗: ${err.message}`);
    process.exit(1);
  }
}

// ── フルモード ──
async function doFull() {
  let next = getNextNote();
  if (!next) {
    const ok = generateArticle();
    if (!ok) {
      log('ERROR: 記事生成失敗');
      process.exit(1);
    }
  }
  await doPost();
}

// ── エントリーポイント ──
(async () => {
  if (setupMode) {
    await doSetup();
  } else if (listMode) {
    listPending();
  } else if (generateMode) {
    generateArticle();
  } else if (fullMode) {
    await doFull();
  } else {
    await doPost();
  }
})();
