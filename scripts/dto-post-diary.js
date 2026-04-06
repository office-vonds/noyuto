#!/usr/bin/env node
/**
 * デリヘルタウン 写メ日記 自動投稿スクリプト
 * 使い方: node dto-post-diary.js [--gal-id ID] [--dry-run]
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SHOP_ID = '21720';
const BASE = `https://admin.dto.jp/shop-admin/${SHOP_ID}`;
const STATE_FILE = path.join(__dirname, 'dto-diary-state.json');
const VARIATIONS_DIR = path.join(__dirname, 'dto-variations');

// キャスト情報
const CASTS = {
  'きみ': { id: '5297311', char: '甘え系' },
};

// 日記テンプレート
const DIARY_TEMPLATES = [
  { title: '出勤しました♡', body: '今日も出勤しました♡\n\nたくさん甘えさせてね💕\n会いに来てくれると嬉しいな♪\n\nお待ちしてます🤍' },
  { title: 'ありがとう💕', body: '今日も遊んでくれた方\nありがとうございます✨\n\nとっても楽しかったです♡\nまた会えますように💗' },
  { title: '今日のわたし♪', body: '今日はちょっとドキドキ♡\n\nたくさんの出会いに感謝✨\n素敵な時間を過ごしましょうね💕' },
  { title: 'おはよう🌸', body: 'おはようございます♡\n\n今日もいいお天気ですね☀️\n元気に出勤してます♪\n\n会いに来てね💕' },
  { title: 'ドキドキ♡', body: '今日はなんだかドキドキ♡\n\n新しい出会いがあるかな？\n楽しみに待ってます💗\n\nよろしくね♪' },
  { title: '癒してあげる♡', body: 'お疲れ様です♡\n\n日頃の疲れ\n癒してあげたいな💕\n\nゆっくりまったり\n過ごしましょうね✨' },
  { title: 'お礼🤍', body: '今日遊んでくれた方\nありがとうございました🤍\n\nとても幸せな時間でした♡\nまたお会いできますように💕' },
  { title: '待ってるよ♡', body: '今日も元気に出勤中♪\n\nたくさん甘えたい気分💕\n\n会いに来てくれたら\nいっぱい癒してあげるね♡' },
];

function loadState() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  return { lastImageIndex: -1, lastTemplateIndex: -1, history: [] };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function getNextImage(castName, state) {
  const files = fs.readdirSync(VARIATIONS_DIR)
    .filter(f => f.startsWith(castName) && f.endsWith('.jpg'))
    .sort();
  if (files.length === 0) return null;
  const nextIdx = (state.lastImageIndex + 1) % files.length;
  state.lastImageIndex = nextIdx;
  return path.join(VARIATIONS_DIR, files[nextIdx]);
}

function getNextTemplate(state) {
  const nextIdx = (state.lastTemplateIndex + 1) % DIARY_TEMPLATES.length;
  state.lastTemplateIndex = nextIdx;
  return DIARY_TEMPLATES[nextIdx];
}

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  console.log(`[${ts}] ${msg}`);
}

async function postDiary(castName, dryRun) {
  const cast = CASTS[castName];
  if (!cast) { log(`キャスト「${castName}」未登録`); return; }

  const state = loadState();
  const template = getNextTemplate(state);
  const imagePath = getNextImage(castName, state);

  log(`キャスト: ${castName} (ID: ${cast.id})`);
  log(`タイトル: ${template.title}`);
  log(`画像: ${imagePath ? path.basename(imagePath) : 'なし'}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    // ログイン
    await page.goto('https://admin.dto.jp/a/auth/input?key=000874b3ba76b36a7c5308288e6501e5', {
      waitUntil: 'networkidle', timeout: 30000
    });
    await page.fill('#login_id', 'kisaki-no1@au.com');
    await page.fill('input[name="password"]', 'kisaki0902');
    await page.click('#login_button');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    log('ログイン完了');

    // 新規投稿ページ
    await page.goto(`${BASE}/diary/${cast.id}/input`, { waitUntil: 'networkidle', timeout: 15000 });
    log('投稿ページ到達');

    // フォーム入力
    await page.fill('input[name="title"]', template.title);
    await page.fill('textarea[name="content"]', template.body);

    // 画像アップロード
    if (imagePath) {
      const fileInput = await page.$('input[name="image"][type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(imagePath);
        log('画像セット完了');
      }
    }

    if (dryRun) {
      await page.screenshot({ path: path.join(__dirname, 'dto-diary-preview.png'), fullPage: true });
      log('[DRY RUN] 入力確認のみ。投稿せず終了。');
      await browser.close();
      return;
    }

    // 確認ボタン
    await page.click('input[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    log('確認ページ到達: ' + page.url());

    // 確認ページの「登録」ボタンを押す
    const registerBtn = await page.$('input[type="submit"][value*="登録"], input[type="submit"][value*="投稿"], button:has-text("登録")');
    if (registerBtn) {
      await registerBtn.click();
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } else {
      // 全submitボタンから「登録」を探す
      const allSubmits = await page.$$eval('input[type="submit"]', els =>
        els.map(e => ({ value: e.value, name: e.name }))
      );
      log('全submitボタン: ' + JSON.stringify(allSubmits));
      // 最後のsubmit（通常「登録」ボタン）
      const submits = await page.$$('input[type="submit"]');
      if (submits.length > 0) {
        await submits[submits.length - 1].click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
      }
    }

    const resultText = await page.evaluate(() => document.body.innerText);
    if (resultText.includes('完了') || resultText.includes('登録') || resultText.includes('一覧')) {
      log('投稿成功！');
      state.history.push({
        cast: castName,
        title: template.title,
        image: imagePath ? path.basename(imagePath) : null,
        postedAt: new Date().toISOString(),
      });
      saveState(state);
    } else {
      log('投稿結果: ' + resultText.substring(0, 300));
      await page.screenshot({ path: path.join(__dirname, 'dto-diary-result.png'), fullPage: true });
    }

  } catch (e) {
    log('エラー: ' + e.message);
    await page.screenshot({ path: path.join(__dirname, 'dto-diary-error.png'), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
}

// 引数
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const castName = 'きみ'; // デフォルト

postDiary(castName, dryRun);
