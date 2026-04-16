#!/usr/bin/env node
/**
 * デリヘルタウン 写メ日記 自動投稿エンジン v2
 *
 * cron: 0 * * * * /usr/bin/node /home/ozawakiryu0902/projects/vonds/scripts/dto-auto-diary.js >> /home/ozawakiryu0902/projects/vonds/scripts/dto-auto-cron.log 2>&1
 *
 * 動作:
 *   1. 管理画面にログインしスケジュールページから各キャストの出勤時間帯を取得
 *   2. 出勤時間を3分割し、各投稿タイミングに該当するかチェック
 *   3. 該当キャストに対し、ユニークな文章を動的生成して投稿
 *   4. 画像は完全重複排除（使い切り後はバリエーション画像へフォールバック）
 *
 * 状態ファイル: dto-auto-state.json
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ============================
// 定数
// ============================
const SHOP_ID = '21720';
const BASE = `https://admin.dto.jp/shop-admin/${SHOP_ID}`;
const LOGIN_URL = 'https://admin.dto.jp/a/auth/input?key=000874b3ba76b36a7c5308288e6501e5';
const LOGIN_ID = 'kisaki-no1@au.com';
const LOGIN_PW = 'kisaki0902';

const IMAGE_DIR = '/home/ozawakiryu0902/noyuto/scripts/dto-images';
const VARIATION_DIR = '/home/ozawakiryu0902/projects/vonds/scripts/dto-variations';
const STATE_FILE = path.join(__dirname, 'dto-auto-state.json');
const ANALYSIS_FILE = path.join(__dirname, 'dto-analysis-result.json');

// 投稿回数/出勤あたり
const POSTS_PER_SHIFT = 3;
// cron間隔（分）- タイミング判定の許容幅
const CRON_WINDOW_MINUTES = 30;

// キャストIDマッピング（管理画面のgalId）
const CASTS = {
  'きみ':   '5297311', 'けい':   '5296926', 'あんな': '5296921',
  'のの':   '5109961', 'まき':   '5079003', 'まどか': '4199302',
  'みき':   '2272539', 'なおみ': '5041113', 'けいか': '4138474',
  'なみ':   '5219440', 'わかな': '3790402',
  'あやせ': '5214107', 'しずか': '5079007', 'つばき': '5121129', 'ゆりか': '5142399',
};

// 旧キャスト（画像フォルダなし・退籍等）- 参照用に残す
const LEGACY_CASTS = {
  'ひいら': '3538242', 'ちはる': '5245217', 'みのり': '5101871',
  'まみか': '5066695', 'ひろか': '5034145',
};

// ============================
// ユーティリティ
// ============================
function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  console.log(`[${ts}] ${msg}`);
}

function jstNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
}

function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex').substring(0, 16);
}

// ============================
// 状態管理
// ============================
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch (e) {
      log(`状態ファイル破損。初期化: ${e.message}`);
    }
  }
  return {
    usedImages: {},       // { castName: [filename, ...] }
    textHashes: {},       // { castName: [hash, ...] }
    todayPosts: {},       // { castName: { date: 'YYYY-MM-DD', count: N, slots: [0,1,2] } }
    history: [],          // 投稿履歴（直近500件保持）
  };
}

function saveState(state) {
  // 履歴は直近500件に制限
  if (state.history.length > 500) {
    state.history = state.history.slice(-500);
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

// ============================
// スケジュール取得
// ============================

/**
 * 管理画面のスケジュールページから出勤情報を取得
 * 返却: { castName: { start: Date, end: Date } }
 */
async function fetchSchedule(page) {
  await page.goto(`${BASE}/schedule`, { waitUntil: 'networkidle', timeout: 30000 });

  // ページのテキストからスケジュール情報をパース
  const scheduleData = await page.evaluate(() => {
    const body = document.body.innerText;
    const rows = document.querySelectorAll('table tr, .schedule-row, [class*="schedule"]');
    const result = { text: body, html: document.body.innerHTML.substring(0, 10000) };
    return result;
  });

  const today = jstNow();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const schedules = {};
  const bodyText = scheduleData.text;

  for (const [castName, galId] of Object.entries(CASTS)) {
    if (!bodyText.includes(castName)) continue;

    // 時間パターンの検出: "18:00~02:00", "18:00-02:00", "18:00～02:00" 等
    // キャスト名の後ろにある時間帯を取得
    const nameIdx = bodyText.indexOf(castName);
    if (nameIdx === -1) continue;

    // キャスト名から次の200文字以内で時間帯を探す
    const chunk = bodyText.substring(nameIdx, nameIdx + 200);
    const timeMatch = chunk.match(/(\d{1,2}):(\d{2})\s*[~～\-→]\s*(\d{1,2}):(\d{2})/);

    if (timeMatch) {
      const startH = parseInt(timeMatch[1]);
      const startM = parseInt(timeMatch[2]);
      const endH = parseInt(timeMatch[3]);
      const endM = parseInt(timeMatch[4]);

      const start = new Date(today);
      start.setHours(startH, startM, 0, 0);

      const end = new Date(today);
      end.setHours(endH, endM, 0, 0);

      // 深夜跨ぎ: 終了時刻 < 開始時刻なら翌日
      if (end <= start) {
        end.setDate(end.getDate() + 1);
      }

      schedules[castName] = { start, end, galId };
    } else {
      // 時間が取れなくてもキャスト名がスケジュールに出ていればデフォルト出勤時間で処理
      const start = new Date(today);
      start.setHours(18, 0, 0, 0);
      const end = new Date(today);
      end.setDate(end.getDate() + 1);
      end.setHours(2, 0, 0, 0);

      schedules[castName] = { start, end, galId };
      log(`  ${castName}: 時間帯取得できず。デフォルト(18:00-02:00)を使用`);
    }
  }

  return schedules;
}

// ============================
// 投稿タイミング計算
// ============================

/**
 * 出勤時間帯を均等に3分割し、各スロットの投稿時刻を返す
 * 例: 18:00-02:00 → [18:00, 20:40, 23:20]
 */
function calculatePostTimes(start, end) {
  const totalMs = end.getTime() - start.getTime();
  const intervalMs = totalMs / POSTS_PER_SHIFT;
  const times = [];
  for (let i = 0; i < POSTS_PER_SHIFT; i++) {
    times.push(new Date(start.getTime() + intervalMs * i));
  }
  return times;
}

/**
 * 現在時刻が投稿タイミングかどうかを判定
 * cron窓（前後CRON_WINDOW_MINUTES分）に該当スロットがあり、かつ未投稿ならtrue
 */
function getPostSlot(now, postTimes, postedSlots) {
  for (let i = 0; i < postTimes.length; i++) {
    if (postedSlots.includes(i)) continue;
    const diff = Math.abs(now.getTime() - postTimes[i].getTime());
    if (diff <= CRON_WINDOW_MINUTES * 60 * 1000) {
      return i;
    }
  }
  return -1;
}

// ============================
// 画像選択（完全重複排除）
// ============================
function getNextImage(castName, state) {
  const castDir = path.join(IMAGE_DIR, castName);
  if (!fs.existsSync(castDir)) return null;

  const allFiles = fs.readdirSync(castDir)
    .filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
    .sort();
  if (allFiles.length === 0) return null;

  if (!state.usedImages[castName]) state.usedImages[castName] = [];
  const used = state.usedImages[castName];
  const unused = allFiles.filter(f => !used.includes(f));

  if (unused.length > 0) {
    // ランダムに選択（順番固定だとパターン化するため）
    const idx = Math.floor(Math.random() * unused.length);
    const selected = unused[idx];
    state.usedImages[castName].push(selected);
    return {
      file: path.join(castDir, selected),
      name: selected,
      remaining: unused.length - 1,
      source: 'original',
    };
  }

  // 全使い切り → バリエーション画像にフォールバック
  return getVariationImage(castName, state);
}

function getVariationImage(castName, state) {
  if (!fs.existsSync(VARIATION_DIR)) return null;

  const prefix = castName + '_';
  const allVariations = fs.readdirSync(VARIATION_DIR)
    .filter(f => f.startsWith(prefix) && /\.(jpg|jpeg|png|gif)$/i.test(f))
    .sort();

  if (allVariations.length === 0) {
    // バリエーションもない → オリジナル画像をリセットして再利用
    log(`  ${castName}: 画像全使い切り+バリエーションなし。リセット`);
    state.usedImages[castName] = [];
    return getNextImage(castName, state);
  }

  const usedKey = `${castName}_variations`;
  if (!state.usedImages[usedKey]) state.usedImages[usedKey] = [];
  const used = state.usedImages[usedKey];
  const unused = allVariations.filter(f => !used.includes(f));

  if (unused.length === 0) {
    // バリエーションも使い切り → 全リセット
    log(`  ${castName}: バリエーションも全使い切り。全リセット`);
    state.usedImages[castName] = [];
    state.usedImages[usedKey] = [];
    return getNextImage(castName, state);
  }

  const idx = Math.floor(Math.random() * unused.length);
  const selected = unused[idx];
  state.usedImages[usedKey].push(selected);
  return {
    file: path.join(VARIATION_DIR, selected),
    name: selected,
    remaining: unused.length - 1,
    source: 'variation',
  };
}

// ============================
// 文章動的生成（テンプレート不使用・毎回ユニーク）
// ============================

/**
 * 競合分析結果があれば読み込み
 */
function loadAnalysis() {
  if (fs.existsSync(ANALYSIS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf-8'));
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * 時間帯を判定
 */
function getTimeSlotLabel(hour) {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night'; // 22-5
}

/**
 * 季節を判定
 */
function getSeason(month) {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

/**
 * ユニークな日記テキストを生成
 * slotIndex: 0=出勤直後, 1=中盤, 2=後半
 */
function generateDiaryText(castName, slotIndex, state) {
  const now = jstNow();
  const hour = now.getHours();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()];
  const timeSlot = getTimeSlotLabel(hour);
  const season = getSeason(now.getMonth() + 1);
  const date = now.getDate();
  const analysis = loadAnalysis();

  // 各パーツのバリエーション
  const greetings = {
    morning: ['おはようございます', 'おはよう', 'Good morning'],
    afternoon: ['こんにちは', 'お昼過ぎました'],
    evening: ['こんばんは', '今日もお疲れ様です', 'こんばんわ'],
    night: ['こんばんは', '夜も深くなってきましたね', 'まだまだ夜はこれから'],
  };

  const seasonWords = {
    spring: ['桜', '春風', 'ぽかぽか', '花粉', '新生活', '春'],
    summer: ['暑い', '夏', 'ひまわり', '花火', '涼しく', 'アイス'],
    autumn: ['秋', '紅葉', '食欲の秋', 'すずしい', 'お月見'],
    winter: ['寒い', '冬', 'あったかい', 'こたつ', 'ホット', 'イルミネーション'],
  };

  const dayVibes = {
    '月': ['週の始まり', '月曜日お疲れ様', 'まだ月曜か…'],
    '火': ['火曜日', '今週もまだまだ'],
    '水': ['週の真ん中', '折り返し', '水曜日'],
    '木': ['あと少しで週末', '木曜日'],
    '金': ['花金', '金曜日', '週末が見えてきた', 'TGIF'],
    '土': ['お休みの人も多いかな', '土曜日', '休日'],
    '日': ['日曜日', 'ゆっくりしてる？', '明日からまた頑張ろう'],
  };

  // スロット別テーマ
  const slotThemes = [
    'arrival',   // 出勤直後
    'midshift',  // 中盤
    'lateshift', // 後半
  ];
  const theme = slotThemes[slotIndex] || 'midshift';

  // タイトルパーツ
  const titleParts = {
    arrival: [
      '出勤しました', 'ただいま', '今日も来たよ', 'スタート',
      `${dayOfWeek}曜日の出勤`, '始まりました', '待ってるね',
    ],
    midshift: [
      'まだまだいるよ', '途中経過', 'ひと息ついて',
      '会いに来てくれた人ありがとう', 'ドキドキ', '甘えたい気分',
      `${dayOfWeek}曜の夜`, '癒してあげる',
    ],
    lateshift: [
      'ラストスパート', 'もう少しいるよ', '最後まで全力',
      'まだ間に合うよ', '今日の締めくくり', '残りわずか',
      'ありがとう', '名残惜しい',
    ],
  };

  // 本文パーツ（組み合わせで生成）
  const openers = {
    arrival: [
      `${pick(greetings[timeSlot])}♡\n\n今日も出勤しました！`,
      `${pick(greetings[timeSlot])}♡\n\n${dayOfWeek}曜日、待ってました！`,
      `${pick(greetings[timeSlot])}\n\n今日は${pick(seasonWords[season])}${season === 'summer' ? 'ですね' : 'の季節'}♡`,
      `${dayOfWeek}曜日の${timeSlot === 'evening' ? '夜' : timeSlot === 'night' ? '深夜' : '昼間'}♡\n\n${pick(greetings[timeSlot])}`,
    ],
    midshift: [
      `${pick(dayVibes[dayOfWeek])}♡\n\nお仕事の合間に見てくれてる？`,
      `ちょっとだけ休憩♡\n\n${pick(seasonWords[season])}の話でもしようかな`,
      `今日来てくれたお兄さんに感謝♡\n\nすごく楽しかった`,
      `${pick(greetings[timeSlot])}♡\n\nまだまだ元気いっぱいだよ`,
    ],
    lateshift: [
      `今日もたくさんありがとう♡\n\nまだもう少しいるからね`,
      `${pick(dayVibes[dayOfWeek])}♡\n\nラストまで待ってます`,
      `あと少しだけど…\n\n最後まで甘えさせてね♡`,
      `今日は${date}日♡\n\n${pick(seasonWords[season])}の夜、一緒に過ごしませんか？`,
    ],
  };

  const middles = [
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n完全個室だから\n2人きりの空間で\nゆっくりできるよ♡`,
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n日頃の疲れ、\nぜんぶ忘れさせてあげる♡\n\n心も体も\nほぐしてあげるね`,
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n初めての方も\n全然緊張しなくて大丈夫♡\n\nすぐ仲良くなれるから\n安心してね`,
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nぎゅーってされたら\nたぶん離れられない♡\n\n…って言ったら\n来てくれる？`,
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n甘えるのも\n甘えられるのも好き♡\n\nあなたの「好き」に\n合わせるからね`,
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n写真じゃ伝わらないこと\nたくさんあるの♡\n\n会ったらもっと\nいいコトあるかも…？`,
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nまったり密着♡\nたっぷりイチャイチャ♡\n\nそんな時間を\n一緒に過ごしたいな`,
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n今日のわたし\nちょっと大胆かも♡\n\n2人きりになったら\n特別なわたし見せてあげる`,
  ];

  const closings = [
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nお誘いお待ちしてます♡\n\n山梨人妻デリヘル妃`,
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n勇気を出して\n会いに来てくれたら\nぜんぶ受け止めるね♡\n\n山梨人妻デリヘル妃`,
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\n「来てよかった」って\n思ってもらえるように\n精一杯がんばります♡\n\n山梨人妻デリヘル妃`,
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nあなたに会えるのを\n楽しみにしてます♡\n\n山梨人妻デリヘル妃`,
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nまた絶対\n会いに来てね♡\n\n山梨人妻デリヘル妃`,
    `\n\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n\nお電話・ネット予約\nどちらでも♡\n\n山梨人妻デリヘル妃`,
  ];

  // 競合分析からのキーワード注入
  let analysisBoost = '';
  if (analysis && analysis.keywords && analysis.keywords.length > 0) {
    const kw = pick(analysis.keywords);
    if (kw && typeof kw === 'string') {
      analysisBoost = `\n\n${kw}`;
    }
  }

  // 絵文字プール（ランダム選択用）
  const emojis = ['♡', '💕', '💗', '🤍', '✨', '🥰', '💋', '🌸', '🌙', '☀️', '🎀', '💖'];

  // 組み立て
  let maxAttempts = 20;
  let title, body, hash;

  if (!state.textHashes[castName]) state.textHashes[castName] = [];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const emoji = pick(emojis);
    title = `${pick(titleParts[theme])}${emoji}`;
    // タイトル40文字制限
    if (title.length > 40) title = title.substring(0, 39) + emoji;

    const opener = pick(openers[theme]);
    const middle = pick(middles);
    const closing = pick(closings);
    body = opener + analysisBoost + middle + closing;

    hash = hashText(title + body);

    // 過去テキストと重複チェック
    if (!state.textHashes[castName].includes(hash)) {
      state.textHashes[castName].push(hash);
      // ハッシュ履歴は直近200件に制限
      if (state.textHashes[castName].length > 200) {
        state.textHashes[castName] = state.textHashes[castName].slice(-200);
      }
      return { title, body, hash };
    }
  }

  // 最大試行でも重複回避できなかった場合、タイムスタンプで強制ユニーク化
  const ts = Date.now().toString(36);
  title = `${pick(titleParts[theme])}${pick(emojis)}`;
  body += `\n\n#${ts}`;
  hash = hashText(title + body);
  state.textHashes[castName].push(hash);
  return { title, body, hash };
}

/**
 * 配列からランダムに1要素を選択
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================
// 投稿実行
// ============================

async function postDiary(page, galId, castName, title, body, imagePath) {
  // 投稿入力ページ
  await page.goto(`${BASE}/diary/${galId}/input`, {
    waitUntil: 'networkidle', timeout: 20000,
  });

  // フォーム入力
  await page.fill('input[name="title"]', title);
  await page.fill('textarea[name="content"]', body);

  // 画像アップロード
  const fileInput = await page.$('input[name="image"][type="file"]');
  if (fileInput) {
    await fileInput.setInputFiles(imagePath);
  } else {
    log(`  ${castName}: 画像inputが見つからない`);
    return false;
  }

  // 確認画面へ
  await page.click('input[type="submit"]');
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  // 登録ボタン押下
  const submits = await page.$$('input[type="submit"]');
  if (submits.length > 0) {
    await submits[submits.length - 1].click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  }

  // 結果確認
  const result = await page.evaluate(() => document.body.innerText);
  return result.includes('完了') || result.includes('登録') || result.includes('一覧');
}

// ============================
// メイン
// ============================
async function main() {
  const state = loadState();
  const now = jstNow();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  log('=== デリヘルタウン写メ日記 自動投稿エンジン v2 ===');
  log(`現在時刻: ${now.toLocaleString('ja-JP')} (${['日','月','火','水','木','金','土'][now.getDay()]}曜日)`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    // ログイン
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#login_id', LOGIN_ID);
    await page.fill('input[name="password"]', LOGIN_PW);
    await page.click('#login_button');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    log('ログイン完了');

    // スケジュール取得
    const schedules = await fetchSchedule(page);
    const castNames = Object.keys(schedules);
    log(`出勤キャスト: ${castNames.length}名 [${castNames.join(', ')}]`);

    if (castNames.length === 0) {
      log('出勤キャストなし。終了。');
      await browser.close();
      return;
    }

    // 各キャストの投稿判定
    let totalPosted = 0;

    for (const [castName, schedule] of Object.entries(schedules)) {
      try {
        const { start, end, galId } = schedule;

        // 画像フォルダ確認
        const castImgDir = path.join(IMAGE_DIR, castName);
        if (!fs.existsSync(castImgDir)) {
          log(`  ${castName}: 画像フォルダなし。スキップ`);
          continue;
        }

        // 今日の投稿状況を確認
        if (!state.todayPosts[castName] || state.todayPosts[castName].date !== todayStr) {
          state.todayPosts[castName] = { date: todayStr, count: 0, slots: [] };
        }
        const todayPost = state.todayPosts[castName];

        // 既に3回投稿済みならスキップ
        if (todayPost.count >= POSTS_PER_SHIFT) {
          continue; // ログ出さない（毎時間呼ばれるため）
        }

        // 投稿タイミング計算
        const postTimes = calculatePostTimes(start, end);
        const slot = getPostSlot(now, postTimes, todayPost.slots);

        if (slot === -1) {
          continue; // タイミングではない
        }

        log(`  ${castName}: スロット${slot + 1}/${POSTS_PER_SHIFT} 投稿実行 (出勤: ${formatTime(start)}-${formatTime(end)})`);

        // 画像選択
        const img = getNextImage(castName, state);
        if (!img) {
          log(`    画像なし。スキップ`);
          continue;
        }

        // 文章生成
        const text = generateDiaryText(castName, slot, state);

        // 投稿実行
        const success = await postDiary(page, galId, castName, text.title, text.body, img.file);

        if (success) {
          log(`    [OK] "${text.title}" / ${img.name} (${img.source}, 残${img.remaining}枚)`);
          todayPost.count++;
          todayPost.slots.push(slot);
          state.history.push({
            cast: castName,
            galId,
            title: text.title,
            textHash: text.hash,
            image: img.name,
            imageSource: img.source,
            slot,
            postedAt: new Date().toISOString(),
          });
          totalPosted++;
        } else {
          log(`    [NG] 投稿結果不明: "${text.title}"`);
        }

        // 連続投稿の間隔（3秒）
        await new Promise(r => setTimeout(r, 3000));

      } catch (e) {
        log(`  ${castName}: エラー - ${e.message.substring(0, 100)}`);
      }
    }

    saveState(state);
    log(`完了: ${totalPosted}件投稿`);

  } catch (e) {
    log('致命的エラー: ' + e.message);
  } finally {
    await browser.close();
  }
}

function formatTime(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// 実行
main();
