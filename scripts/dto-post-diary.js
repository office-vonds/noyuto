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
const INPUT_DIR = path.join(__dirname, 'input'); // 元写真: input/キャスト名/*.jpg

// キャスト情報（出勤キャスト）
const CASTS = {
  'きみ':   { id: '5297311', char: '甘え系・透明感' },
  'けい':   { id: '5296926', char: 'セクシー・大人' },
  'あんな': { id: '5296921', char: '元気・天然' },
  'のの':   { id: '5109961', char: '清楚・おっとり' },
  'まき':   { id: '5079003', char: '色気・妖艶' },
  'まどか': { id: '4199302', char: '癒し系・優しい' },
  'みき':   { id: '2272539', char: 'Mキャラ・甘え' },
  'ひいら': { id: '3538242', char: 'クール・ギャップ' },
  'なおみ': { id: '5041113', char: '包容力・人妻感' },
  'けいか': { id: '4138474', char: '妖艶・大人の色気' },
};

// ── 全国ランキング分析に基づくテンプレート ──
// ポイント: 1行15文字前後 + 空行多め + 絵文字(ハート系) + 装飾線
function generateDiaryTemplates() {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = ['日','月','火','水','木','金','土'][now.getDay()];

  // 時間帯に応じた挨拶
  const greeting = hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは';
  const timeEmoji = hour < 12 ? '🌸' : hour < 18 ? '☀️' : '🌙';

  return [
    // ── 出勤報告系 ──
    {
      title: `出勤しました${timeEmoji}`,
      body: `${greeting}♡

今日も出勤しました${timeEmoji}


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


${dayOfWeek}曜日の夜…

ちょっとドキドキしながら
待ってます💕


一緒にまったり
過ごしませんか？♡


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


♡ 完全個室だから
　 2人きりの空間✨

♡ 初めての方も
　 緊張しなくて大丈夫💗

♡ たくさん甘えさせてね🤍


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


お誘いお待ちしてます♡

山梨人妻デリヘル妃🌸`
    },

    // ── お礼系 ──
    {
      title: 'ありがとう💕',
      body: `今日遊びに来てくれた
お兄さん💕

ありがとうございます✨


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


すごく楽しかった…♡

あんなに優しくしてもらえて
幸せな時間でした🥰


「また会いたい」って
言ってもらえて
嬉しかったなぁ💗


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


次はもっともっと
甘えちゃうかも…？♡


また絶対
会いに来てね🤍


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


山梨人妻デリヘル妃🌸`
    },

    // ── 甘え・誘惑系 ──
    {
      title: '甘えたい気分♡',
      body: `今日は
甘えたい気分…♡


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


ぎゅーってされたら
たぶん離れられない💕


…って言ったら
来てくれる？♡


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


お仕事の疲れ、
全部わたしが
癒してあげるね✨


ゆっくりまったり
2人の時間を
楽しみましょ💗


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


♡ 初めてでも大丈夫
♡ 優しくリードします
♡ 緊張ほぐします✨


お待ちしてます🤍

山梨人妻デリヘル妃🌸`
    },

    // ── 癒し系 ──
    {
      title: '癒してあげる🤍',
      body: `お疲れ様です♡


${dayOfWeek}曜日、
頑張ったご褒美に
わたしに会いに来ませんか？✨


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


日頃のストレス、
全部忘れさせてあげる♡


ゆっくり話を聞いて
ぎゅーっと包み込んで

心も体も
ほぐしてあげるね💕


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


━━━ わたしの得意なこと ━━━

♡ まったり密着💗
♡ たっぷりイチャイチャ
♡ 甘い言葉の囁き✨
♡ ふわふわマッサージ


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


「来てよかった」って
思ってもらえるように
精一杯がんばります🥰


山梨人妻デリヘル妃🌸`
    },

    // ── ドキドキ系 ──
    {
      title: 'ドキドキ…♡',
      body: `ねえねえ…♡


今日のわたし、
ちょっとセクシーかも💕


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


写真見てくれた？✨

実物はもっと
いいコトあるかも…♡


って言ったら
気になっちゃう？💗


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


完全個室の空間で
2人だけの秘密の時間🤍


日常では味わえない
ドキドキ体験を
一緒に♡


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


勇気を出して
会いに来てくれたら

ぜーんぶ
受け止めてあげる💕


山梨人妻デリヘル妃🌸`
    },

    // ── 質問系（エンゲージメント狙い） ──
    {
      title: 'どっちが好き？💕',
      body: `突然だけど質問♡


━━━ どっちが好き？ ━━━


A. いっぱい甘えられたい💕

B. いっぱい甘えたい🤍


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


わたしは…

どっちもできちゃう♡


甘えてくれるのも好きだし
甘えさせてくれるのも好き✨


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


あなたの「好き」に
合わせるから

安心して来てね💗


初めてでも
リラックスできる
雰囲気作りが得意です♡


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


お待ちしてます🌸

山梨人妻デリヘル妃`
    },

    // ── 秘密系 ──
    {
      title: '内緒だよ？🤫',
      body: `ここだけの話…♡


実はね、
今日ちょっと
大胆な下着にしてみたの💕


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


見たい？♡


…見せてあげる🤍
会いに来てくれたらね✨


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


写メ日記では
見せられないことも
たくさんあるの♡


2人きりになったら
特別なわたしを
見せてあげる💗


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


━━━ 今日のポイント ━━━

♡ ちょっと大胆な気分
♡ 甘えん坊モードON
♡ ぎゅーっとしたい✨


お誘いお待ちしてます💕

山梨人妻デリヘル妃🌸`
    },

    // ── 感謝・リピーター向け ──
    {
      title: 'いつもありがとう✨',
      body: `いつも会いに来てくれる
お兄さんへ♡


本当にありがとう💕


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


「今日も楽しかった」
「また来るね」

その一言が
すごく嬉しくて

もっともっと
頑張ろうって思えるの✨


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


初めましての方も
もちろん大歓迎💗


最初は緊張するよね。
わたしも最初は
ドキドキだった♡


でも大丈夫。
すぐ仲良くなれるから🤍


┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈


あなたに会えるのを
楽しみにしてます🌸


山梨人妻デリヘル妃`
    },
  ];
}

function loadState() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  return { lastImageIndex: -1, lastTemplateIndex: -1, history: [] };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function getNextImage(castName, state) {
  const castDir = path.join(INPUT_DIR, castName);
  if (!fs.existsSync(castDir)) return null;

  const files = fs.readdirSync(castDir)
    .filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
    .sort();
  if (files.length === 0) return null;

  // 使用済み画像を記録し、未使用を優先
  const usedImages = (state.usedImages || {})[castName] || [];
  const unused = files.filter(f => !usedImages.includes(f));
  let selected;

  if (unused.length > 0) {
    selected = unused[0];
  } else {
    // 全部使い切ったらリセットして先頭から
    if (!state.usedImages) state.usedImages = {};
    state.usedImages[castName] = [];
    selected = files[0];
  }

  // 使用済みに追加
  if (!state.usedImages) state.usedImages = {};
  if (!state.usedImages[castName]) state.usedImages[castName] = [];
  state.usedImages[castName].push(selected);

  return path.join(castDir, selected);
}

function getNextTemplate(state) {
  const templates = generateDiaryTemplates();
  const nextIdx = (state.lastTemplateIndex + 1) % templates.length;
  state.lastTemplateIndex = nextIdx;
  return templates[nextIdx];
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
