#!/usr/bin/env node
/**
 * デリヘルタウン 写メ日記 毎日自動投稿
 * cron: 0 20 * * * /usr/bin/node /home/ozawakiryu0902/projects/vonds/scripts/dto-daily-diary.js >> /home/ozawakiryu0902/projects/vonds/scripts/dto-cron.log 2>&1
 *
 * 1. 本日の出勤キャストを取得
 * 2. 画像があるキャストのみ対象
 * 3. 未使用画像を1枚選択（重複なし）
 * 4. テンプレートからテキスト生成
 * 5. 代理投稿
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SHOP_ID = '21720';
const BASE = `https://admin.dto.jp/shop-admin/${SHOP_ID}`;
const INPUT_DIR = path.join(__dirname, 'input');
const STATE_FILE = path.join(__dirname, 'dto-daily-state.json');

// 全登録キャスト
const CASTS = {
  'きみ':   '5297311', 'けい':   '5296926', 'あんな': '5296921',
  'のの':   '5109961', 'まき':   '5079003', 'まどか': '4199302',
  'みき':   '2272539', 'ひいら': '3538242', 'なおみ': '5041113',
  'けいか': '4138474', 'なみ':   '5219440', 'ちはる': '5245217',
  'みのり': '5101871', 'まみか': '5066695', 'ひろか': '5034145',
  'わかな': '3790402',
};

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  console.log(`[${ts}] ${msg}`);
}

function loadState() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  return { usedImages: {}, templateIndex: {}, history: [] };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

// 未使用画像を取得（完全重複排除）
function getNextImage(castName, state) {
  const castDir = path.join(INPUT_DIR, castName);
  if (!fs.existsSync(castDir)) return null;

  const allFiles = fs.readdirSync(castDir)
    .filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
    .sort();
  if (allFiles.length === 0) return null;

  if (!state.usedImages[castName]) state.usedImages[castName] = [];
  const used = state.usedImages[castName];
  const unused = allFiles.filter(f => !used.includes(f));

  if (unused.length === 0) {
    // 全使い切り → リセットして2周目（ログに記録）
    log(`  ⚠ ${castName}: 全${allFiles.length}枚使い切り。リセットして2周目`);
    state.usedImages[castName] = [];
    return { file: path.join(castDir, allFiles[0]), name: allFiles[0], remaining: allFiles.length - 1 };
  }

  const selected = unused[0];
  state.usedImages[castName].push(selected);
  return { file: path.join(castDir, selected), name: selected, remaining: unused.length - 1 };
}

// テンプレート生成（時間帯・曜日対応、キャストごとにインデックスをずらす）
function getNextTemplate(castName, state) {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = ['日','月','火','水','木','金','土'][now.getDay()];
  const greeting = hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは';
  const emoji = hour < 12 ? '🌸' : hour < 18 ? '☀️' : '🌙';

  const templates = [
    { title: `出勤しました${emoji}`, body: `${greeting}♡\n\n今日も出勤しました${emoji}\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n${dayOfWeek}曜日…\nちょっとドキドキしながら\n待ってます💕\n\n\n一緒にまったり\n過ごしませんか？♡\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n♡ 完全個室だから\n　 2人きりの空間✨\n\n♡ 初めての方も\n　 緊張しなくて大丈夫💗\n\n♡ たくさん甘えさせてね🤍\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nお誘いお待ちしてます♡\n\n山梨人妻デリヘル妃🌸` },
    { title: 'ありがとう💕', body: `今日遊びに来てくれた\nお兄さん💕\n\nありがとうございます✨\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nすごく楽しかった…♡\n\nあんなに優しくしてもらえて\n幸せな時間でした🥰\n\n\n「また会いたい」って\n言ってもらえて\n嬉しかったなぁ💗\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n次はもっともっと\n甘えちゃうかも…？♡\n\n\nまた絶対\n会いに来てね🤍\n\n\n山梨人妻デリヘル妃🌸` },
    { title: '甘えたい気分♡', body: `今日は\n甘えたい気分…♡\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nぎゅーってされたら\nたぶん離れられない💕\n\n\n…って言ったら\n来てくれる？♡\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nお仕事の疲れ、\n全部わたしが\n癒してあげるね✨\n\n\nゆっくりまったり\n2人の時間を\n楽しみましょ💗\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n♡ 初めてでも大丈夫\n♡ 優しくリードします\n♡ 緊張ほぐします✨\n\n\nお待ちしてます🤍\n\n山梨人妻デリヘル妃🌸` },
    { title: '癒してあげる🤍', body: `お疲れ様です♡\n\n\n${dayOfWeek}曜日、\n頑張ったご褒美に\nわたしに会いに来ませんか？✨\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n日頃のストレス、\n全部忘れさせてあげる♡\n\n\nゆっくり話を聞いて\nぎゅーっと包み込んで\n\n心も体も\nほぐしてあげるね💕\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n━━━ 得意なこと ━━━\n\n♡ まったり密着💗\n♡ たっぷりイチャイチャ\n♡ 甘い言葉の囁き✨\n♡ ふわふわマッサージ\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n「来てよかった」って\n思ってもらえるように\n精一杯がんばります🥰\n\n\n山梨人妻デリヘル妃🌸` },
    { title: 'ドキドキ…♡', body: `ねえねえ…♡\n\n\n今日のわたし、\nちょっとセクシーかも💕\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n写真見てくれた？✨\n\n実物はもっと\nいいコトあるかも…♡\n\n\nって言ったら\n気になっちゃう？💗\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n完全個室の空間で\n2人だけの秘密の時間🤍\n\n\n日常では味わえない\nドキドキ体験を\n一緒に♡\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n勇気を出して\n会いに来てくれたら\n\nぜーんぶ\n受け止めてあげる💕\n\n\n山梨人妻デリヘル妃🌸` },
    { title: 'どっちが好き？💕', body: `突然だけど質問♡\n\n\n━━━ どっちが好き？ ━━━\n\n\nA. いっぱい甘えられたい💕\n\nB. いっぱい甘えたい🤍\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nわたしは…\n\nどっちもできちゃう♡\n\n\n甘えてくれるのも好きだし\n甘えさせてくれるのも好き✨\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nあなたの「好き」に\n合わせるから\n\n安心して来てね💗\n\n\n初めてでも\nリラックスできる\n雰囲気作りが得意です♡\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nお待ちしてます🌸\n\n山梨人妻デリヘル妃` },
    { title: '内緒だよ？🤫', body: `ここだけの話…♡\n\n\n実はね、\n今日ちょっと\n大胆な下着にしてみたの💕\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n見たい？♡\n\n\n…見せてあげる🤍\n会いに来てくれたらね✨\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n写メ日記では\n見せられないことも\nたくさんあるの♡\n\n\n2人きりになったら\n特別なわたしを\n見せてあげる💗\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n━━━ 今日のポイント ━━━\n\n♡ ちょっと大胆な気分\n♡ 甘えん坊モードON\n♡ ぎゅーっとしたい✨\n\n\nお誘いお待ちしてます💕\n\n山梨人妻デリヘル妃🌸` },
    { title: 'いつもありがとう✨', body: `いつも会いに来てくれる\nお兄さんへ♡\n\n\n本当にありがとう💕\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n「今日も楽しかった」\n「また来るね」\n\nその一言が\nすごく嬉しくて\n\nもっともっと\n頑張ろうって思えるの✨\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n初めましての方も\nもちろん大歓迎💗\n\n\n最初は緊張するよね。\nわたしも最初は\nドキドキだった♡\n\n\nでも大丈夫。\nすぐ仲良くなれるから🤍\n\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nあなたに会えるのを\n楽しみにしてます🌸\n\n\n山梨人妻デリヘル妃` },
  ];

  if (!state.templateIndex[castName]) state.templateIndex[castName] = -1;
  state.templateIndex[castName] = (state.templateIndex[castName] + 1) % templates.length;
  return templates[state.templateIndex[castName]];
}

async function main() {
  const state = loadState();
  log('=== デリヘルタウン写メ日記 毎日自動投稿 ===');

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

    // 出勤情報取得
    await page.goto(`${BASE}/schedule`, { waitUntil: 'networkidle', timeout: 20000 });
    const scheduleText = await page.evaluate(() => document.body.innerText);

    // 出勤中のキャスト名を抽出
    const onDuty = [];
    for (const [name, id] of Object.entries(CASTS)) {
      if (scheduleText.includes(name)) {
        // 画像があるか確認
        const castDir = path.join(INPUT_DIR, name);
        if (fs.existsSync(castDir)) {
          const imgCount = fs.readdirSync(castDir).filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f)).length;
          if (imgCount > 0) {
            const usedCount = (state.usedImages[name] || []).length;
            onDuty.push({ name, id, imgCount, usedCount, remaining: imgCount - usedCount });
          }
        }
      }
    }

    log(`出勤キャスト（画像あり）: ${onDuty.length}名`);
    onDuty.forEach(c => log(`  ${c.name}: 残${c.remaining}/${c.imgCount}枚`));

    if (onDuty.length === 0) {
      log('投稿対象なし。終了。');
      await browser.close();
      return;
    }

    // 各キャストに1件ずつ投稿
    let success = 0;
    for (const cast of onDuty) {
      try {
        const img = getNextImage(cast.name, state);
        if (!img) { log(`  ${cast.name}: 画像なしスキップ`); continue; }

        const template = getNextTemplate(cast.name, state);

        // 投稿ページ
        await page.goto(`${BASE}/diary/${cast.id}/input`, { waitUntil: 'networkidle', timeout: 15000 });

        // フォーム入力
        await page.fill('input[name="title"]', template.title);
        await page.fill('textarea[name="content"]', template.body);
        const fileInput = await page.$('input[name="image"][type="file"]');
        if (fileInput) await fileInput.setInputFiles(img.file);

        // 確認→登録
        await page.click('input[type="submit"]');
        await page.waitForLoadState('networkidle', { timeout: 15000 });

        const submits = await page.$$('input[type="submit"]');
        if (submits.length > 0) {
          await submits[submits.length - 1].click();
          await page.waitForLoadState('networkidle', { timeout: 15000 });
        }

        const result = await page.evaluate(() => document.body.innerText);
        if (result.includes('完了') || result.includes('登録') || result.includes('一覧')) {
          log(`  ✓ ${cast.name}: "${template.title}" / ${img.name} (残${img.remaining}枚)`);
          state.history.push({
            cast: cast.name, title: template.title,
            image: img.name, postedAt: new Date().toISOString(),
          });
          success++;
        } else {
          log(`  ✗ ${cast.name}: 投稿結果不明`);
        }

        // 連続投稿の間隔（3秒）
        await new Promise(r => setTimeout(r, 3000));

      } catch (e) {
        log(`  ✗ ${cast.name}: エラー - ${e.message.substring(0, 80)}`);
      }
    }

    saveState(state);
    log(`完了: ${success}/${onDuty.length}名投稿成功`);

  } catch (e) {
    log('致命的エラー: ' + e.message);
  } finally {
    await browser.close();
  }
}

main();
