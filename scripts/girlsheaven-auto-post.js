#!/usr/bin/env node
/**
 * ガールズヘブン 店長ブログ自動投稿スクリプト
 * cron: 0 21 * * * /usr/bin/node /home/ozawakiryu0902/projects/vonds/scripts/girlsheaven-auto-post.js >> /home/ozawakiryu0902/projects/vonds/scripts/gh-cron.log 2>&1
 *
 * 投稿制限（1日数回）があるため、翌日22:00に予約投稿する方式
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CONFIG = {
  loginUrl: 'https://manager.girlsheaven-job.net/',
  loginId: '05007',
  loginPass: '70050',
  shopName: '絆甲府店',
};

const STATE_FILE = path.join(__dirname, 'gh-daily-state.json');
const IMAGES_DIR = path.join(__dirname, 'images');

const THEME_IMAGES = ['salary', 'privacy', 'beginner', 'qa', 'dekasegi', 'benefits', 'seasonal'];

function getImagePath(themeIndex) {
  const themeName = THEME_IMAGES[themeIndex % THEME_IMAGES.length];
  const variant = Math.floor(Date.now() / 86400000) % 3;
  const imgPath = path.join(IMAGES_DIR, `gh_${themeName}_${variant}.jpg`);
  return fs.existsSync(imgPath) ? imgPath : null;
}

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  console.log(`[${ts}] ${msg}`);
}

function loadState() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  return { lastIndex: -1, history: [] };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

// 投稿予約の日時（翌日22:00）
function getScheduleDate() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    y: String(tomorrow.getFullYear()),
    m: String(tomorrow.getMonth() + 1).padStart(2, '0'),
    d: String(tomorrow.getDate()).padStart(2, '0'),
    h: '22',
    n: '00',
  };
}

// 全記事末尾に公式サイトリンクを追加
const OFFICIAL_LINK = `

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━━━━━━━━━━━━━</strong></p>

<p><strong style="color:#ff0000;">▶ もっと詳しく知りたい方はこちら</strong></p>
<p>公式求人サイトで給料・待遇・体験談を公開中！</p>
<p><strong><a href="https://kizuna-job.com" target="_blank">https://kizuna-job.com</a></strong></p>

<p><strong style="color:#ff69b4;">━━━━━━━━━━━━━━━</strong></p>`;

function generateArticles() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const categories = [
    'お給料', 'お店の環境', 'うれしい待遇', '採用条件',
    'お客様層', 'お仕事内容', 'スタッフ'
  ];

  return [
    {
      title: `【${month}月最新】週3日でも月収40万超え！リアルな給料事情`,
      category: 'お給料',
      body: `<p>こんにちは、山梨デリヘル絆スタッフです。</p>

<p>面接で一番聞かれるのが<strong>「本当に稼げますか？」</strong>という質問。</p>

<p>答えは<strong style="color:#ff0000;">YES</strong>です。</p>

<p>実際の数字でお見せします。</p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ ${month}月の給料実例 ━━━</strong></p>

<p>&nbsp;</p>

<p><strong>▶ Aさん（23歳・未経験3ヶ月目）</strong></p>
<p>◆ 出勤：週3日（金土日）<br>
◆ 時間：14:00〜22:00<br>
◆ 接客：1日平均3〜4名</p>

<p><strong style="color:#ff0000; font-size:18px;">月収：約45万円</strong></p>

<p>&nbsp;</p>

<p><strong>▶ Bさん（28歳・他店から移籍）</strong></p>
<p>◆ 出勤：週4日<br>
◆ 時間：10:00〜18:00<br>
◆ 接客：1日平均4〜5名</p>

<p><strong style="color:#ff0000; font-size:18px;">月収：約62万円</strong></p>

<p>前のお店では月30万円程度。<strong style="color:#ff8c00;">移籍して収入が倍以上</strong>に。</p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ なぜ絆は稼げるのか？ ━━━</strong></p>

<p>&nbsp;</p>

<p><strong style="color:#ff0000;">①バック率が業界トップクラス</strong></p>
<p>女の子への還元を最優先。他店と比べてください。</p>

<p><strong style="color:#ff0000;">②集客力が圧倒的</strong></p>
<p>山梨エリアで長年の実績。平日でも安定。</p>

<p><strong style="color:#ff0000;">③日払い対応</strong></p>
<p>働いたその日に全額お渡し。</p>

<p>&nbsp;</p>

<p>「話を聞くだけ」でも大歓迎。<br>LINEでお気軽にどうぞ。</p>`
    },

    {
      title: '【完全版】身バレが怖い方へ｜当店の7つの対策を全公開',
      category: 'お店の環境',
      body: `<p>こんにちは、絆スタッフです。</p>

<p>面接で一番多い相談：<strong style="color:#ff0000;">「身バレが怖いです…」</strong></p>

<p>当然の不安です。だからこそ<strong style="color:#ff8c00;">7つの対策</strong>を徹底しています。</p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ 写真の身バレ防止 ━━━</strong></p>

<p><strong style="color:#ff0000;">①顔出しNG完全対応</strong><br>
写真は首から下のみ。顔が映ることは一切ありません。</p>

<p><strong style="color:#ff0000;">②私物を写さない撮影ルール</strong><br>
アクセサリー、ネイル、私服は外して撮影。</p>

<p><strong style="color:#ff0000;">③写真加工はスタッフ対応</strong><br>
自分で加工する必要なし。</p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ スマホ・通知対策 ━━━</strong></p>

<p><strong style="color:#ff0000;">④LINE通知の非表示設定</strong><br>
お店のLINE名を「バイト」「美容院」などに変更。</p>

<p><strong style="color:#ff0000;">⑤写真管理のサポート</strong><br>
専用フォルダ管理。iPhoneの非表示機能もお教えします。</p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ 万が一の備え ━━━</strong></p>

<p><strong style="color:#ff0000;">⑥アリバイ会社のご用意</strong><br>
在籍確認・収入証明にも対応。</p>

<p><strong style="color:#ff0000;">⑦出勤パターンの柔軟対応</strong><br>
知人の多いエリア・時間帯を避けた出勤も可能。</p>

<p>&nbsp;</p>

<p><strong style="color:#ee82ee;">2年以上バレずに働いているキャスト</strong>も多数在籍。</p>

<p>まずはLINEで相談だけでもOK。</p>`
    },

    {
      title: '【未経験の方へ】入店初日の流れを完全公開！',
      category: 'お仕事内容',
      body: `<p>こんにちは、絆スタッフです。</p>

<p><strong style="color:#ff0000;">入店初日の1日の流れ</strong>を全てお伝えします。</p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ STEP1：到着 ━━━</strong></p>
<p>◆ <strong style="color:#ff8c00;">無料送迎</strong>でお迎え<br>
◆ 車がない方も安心</p>

<p><strong style="color:#ff69b4;">━━━ STEP2：準備 ━━━</strong></p>
<p>◆ <strong style="color:#ff0000;">完全個室</strong>の待機室<br>
◆ シャワー・アメニティ完備<br>
◆ Wi-Fi・フリードリンクあり</p>

<p><strong style="color:#ff69b4;">━━━ STEP3：最初の接客 ━━━</strong></p>
<p>◆ お客様情報を事前に共有<br>
◆ 優しいお客様を優先案内<br>
◆ <strong style="color:#ff0000;">困ったらいつでもスタッフに連絡OK</strong></p>

<p><strong style="color:#ff69b4;">━━━ STEP4：退勤 ━━━</strong></p>
<p>◆ <strong style="color:#ff0000;">日払い</strong>でその日にお渡し<br>
◆ 帰りも無料送迎</p>

<p>&nbsp;</p>

<p><strong>未経験Aさん（24歳）の初日実績：</strong></p>
<p><strong style="color:#ff0000; font-size:18px;">3名接客 → 日給：約5万円</strong></p>

<p>&nbsp;</p>

<p>在籍キャストの<strong style="color:#ff0000;">7割以上が未経験スタート。</strong><br>
面接だけでも大歓迎です。</p>`
    },

    {
      title: '【Q&A】応募前の疑問10個に全部答えます',
      category: '採用条件',
      body: `<p>よくある質問にまとめてお答えします。</p>

<p>&nbsp;</p>

<p><strong>Q1. いくら稼げますか？</strong><br>
A. 週3日で<strong style="color:#ff8c00;">月収35〜50万円</strong>が目安。</p>

<p><strong>Q2. 日払いですか？</strong><br>
A. <strong style="color:#ff0000;">完全日払い。</strong>その日に全額手渡し。</p>

<p><strong>Q3. 罰金やノルマは？</strong><br>
A. <strong style="color:#ff0000;">一切なし。</strong>当日欠勤の罰金もゼロ。</p>

<p><strong>Q4. 週1日だけでもOK？</strong><br>
A. <strong style="color:#ff8c00;">もちろんOK！</strong>完全自由出勤。</p>

<p><strong>Q5. 昼だけ・夜だけでも？</strong><br>
A. 好きな時間帯だけでOK。</p>

<p><strong>Q6. 掛け持ちできる？</strong><br>
A. できます。半数以上が副業。</p>

<p><strong>Q7. 身バレ対策は？</strong><br>
A. <strong style="color:#ff0000;">徹底しています。</strong>顔出しNG・アリバイ会社あり。</p>

<p><strong>Q8. 性病の心配は？</strong><br>
A. 衛生管理を徹底。定期検査サポートあり。</p>

<p><strong>Q9. 面接の持ち物は？</strong><br>
A. <strong style="color:#ff0000;">身分証1点のみ。</strong>服装自由。</p>

<p><strong>Q10. 体験入店は？</strong><br>
A. <strong style="color:#ff8c00;">可能！</strong>体験でも日払い。合わなければそれでOK。</p>

<p>&nbsp;</p>

<p>他にも気になることがあればLINEでどうぞ。</p>`
    },

    {
      title: '【出稼ぎ歓迎】寮完備・交通費支給で安心',
      category: 'うれしい待遇',
      body: `<p>こんにちは、絆スタッフです。</p>

<p><strong style="color:#ff0000;">県外からの出稼ぎ、大歓迎です！</strong></p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ サポート内容 ━━━</strong></p>

<p><strong style="color:#ff0000;">①完全個室の寮</strong><br>
家具・家電・Wi-Fi完備。即日入居OK。</p>

<p><strong style="color:#ff0000;">②交通費サポート</strong><br>
遠方の方には交通費を支給。</p>

<p><strong style="color:#ff0000;">③短期1泊2日〜OK</strong><br>
「1週間だけ試したい」もOK。</p>

<p><strong style="color:#ff0000;">④身バレリスクが低い</strong><br>
<strong style="color:#ee82ee;">地元から離れているので知人に会う確率ほぼゼロ。</strong></p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ 出稼ぎ実績 ━━━</strong></p>

<p><strong>Cさん（26歳・東京から1週間）</strong></p>
<p><strong style="color:#ff0000; font-size:18px;">7日間：約35万円</strong></p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ 山梨のメリット ━━━</strong></p>

<p>◆ 競合が少ない→お客様独占<br>
◆ 生活コスト安い<br>
◆ 東京から特急90分</p>

<p>&nbsp;</p>

<p>LINEで「出稼ぎ希望」とメッセージください。</p>`
    },

    {
      title: '【待遇公開】他店と比べてください｜絆が選ばれる理由',
      category: 'うれしい待遇',
      body: `<p>こんにちは、絆スタッフです。</p>

<p>当店には<strong style="color:#ff0000;">1年以上在籍のキャストが多数。</strong></p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ 待遇一覧 ━━━</strong></p>

<p>◆ <strong style="color:#ff0000;">業界トップクラスのバック率</strong><br>
◆ <strong style="color:#ff0000;">完全日払い</strong><br>
◆ 完全自由出勤（週1日・2時間〜OK）<br>
◆ 罰金・ノルマ一切なし<br>
◆ <strong style="color:#ff0000;">無料送迎</strong><br>
◆ 完全個室待機<br>
◆ 寮完備（家具家電付き）<br>
◆ 衣装貸出あり<br>
◆ 顔出しNG完全対応<br>
◆ <strong style="color:#ff8c00;">アリバイ会社</strong>あり<br>
◆ 新人保証制度あり<br>
◆ Wi-Fi・フリードリンク完備</p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ 在籍キャストの声 ━━━</strong></p>

<p><strong style="color:#ee82ee;">「罰金がなくて本当に楽」</strong>（25歳）</p>
<p><strong style="color:#ee82ee;">「スタッフが優しくて安心」</strong>（22歳）</p>
<p><strong style="color:#ee82ee;">「バック率に惹かれて入ったけど居心地良すぎ」</strong>（30歳）</p>

<p>&nbsp;</p>

<p>当店は<strong style="color:#ff0000;">比較されることを歓迎</strong>しています。<br>
面接だけでも大歓迎。LINEでどうぞ。</p>`
    },

    {
      title: `【${month}月更新】今が始めどき！入店キャンペーン実施中`,
      category: 'お店のつぶやき',
      body: `<p>こんにちは、絆スタッフです。</p>

<p>${month}月は<strong style="color:#ff0000;">新しいことを始める女の子が増える季節。</strong></p>

<p>「新生活でお金が必要」<br>
「副業を始めたい」</p>

<p>そんな方を<strong style="color:#ff8c00;">全力サポート！</strong></p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ 今月の特典 ━━━</strong></p>

<p><strong style="color:#ff0000; font-size:18px;">▶ 入店祝い金あり！</strong></p>

<p>◆ 体験入店OK（日払い）<br>
◆ <strong style="color:#ff0000;">新人保証制度</strong>で初月から安定<br>
◆ 寮即日入居可能<br>
◆ <strong style="color:#ff8c00;">交通費サポート</strong></p>

<p>&nbsp;</p>

<p><strong style="color:#ff69b4;">━━━ こんな方に ━━━</strong></p>

<p>◆ 出費をカバーしたい方<br>
◆ 副業で効率よく稼ぎたい方<br>
◆ 他店で稼げなかった方<br>
◆ 初めてだけど挑戦したい方</p>

<p>&nbsp;</p>

<p>「いつか」を「今日」に。<br>
LINEで「バニラを見た」と送るだけ。</p>

<p><strong>お待ちしています。</strong></p>`
    },
  ];
}

async function post() {
  const articles = generateArticles();
  const state = loadState();
  const nextIndex = (state.lastIndex + 1) % articles.length;
  const article = articles[nextIndex];
  const schedule = getScheduleDate();

  // 全記事に公式サイトリンクを追記
  article.body += OFFICIAL_LINK;

  log(`記事選択: [${nextIndex}] ${article.title}`);
  log(`予約投稿: ${schedule.y}/${schedule.m}/${schedule.d} ${schedule.h}:${schedule.n}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  // ダイアログ（alert/confirm）を自動承認
  page.on('dialog', async dialog => {
    log(`ダイアログ検出: "${dialog.message().substring(0, 50)}"`);
    await dialog.accept().catch(() => {});
  });

  try {
    // ログイン
    await page.goto(CONFIG.loginUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#loginId', CONFIG.loginId);
    await page.fill('#loginPass', CONFIG.loginPass);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }),
      page.evaluate(() => document.querySelector('form').submit()),
    ]).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    log('ログイン完了');

    // 店舗選択
    await page.waitForSelector(`a:has-text("${CONFIG.shopName}")`, { timeout: 10000 });
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }),
      page.click(`a:has-text("${CONFIG.shopName}")`),
    ]).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    log('店舗選択完了');

    // ブログ投稿ページへ
    await page.goto('https://manager.girlsheaven-job.net/blog/edit/', {
      waitUntil: 'networkidle', timeout: 20000
    });
    log('投稿ページ到達');

    // 予約日時設定
    await page.selectOption('#keisai_dt_y', schedule.y);
    await page.selectOption('#keisai_dt_m', schedule.m);
    await page.selectOption('#keisai_dt_d', schedule.d);
    await page.selectOption('#keisai_dt_h', schedule.h);
    await page.selectOption('#keisai_dt_n', schedule.n);

    // カテゴリ選択
    const categoryOptions = await page.$$eval('#category_list option', opts =>
      opts.map(o => ({ value: o.value, text: o.textContent.trim() }))
    );
    const matchCat = categoryOptions.find(o => o.text === article.category);
    if (matchCat) {
      await page.selectOption('#category_list', matchCat.value);
    }

    // タイトル
    await page.fill('#title', article.title);

    // 本文（CKEditorかどうか確認して入力）
    const hasCKEditor = await page.evaluate(() =>
      typeof CKEDITOR !== 'undefined' && CKEDITOR.instances && Object.keys(CKEDITOR.instances).length > 0
    );

    if (hasCKEditor) {
      const editorName = await page.evaluate(() => Object.keys(CKEDITOR.instances)[0]);
      await page.waitForFunction((name) => {
        return CKEDITOR.instances[name] && CKEDITOR.instances[name].status === 'ready';
      }, editorName, { timeout: 10000 });
      await page.evaluate((data) => {
        const name = Object.keys(CKEDITOR.instances)[0];
        CKEDITOR.instances[name].setData(data.body);
      }, { body: article.body });
    } else {
      // プレーンtextarea
      await page.fill('#MpContent', article.body);
    }

    // 画像アップロード
    const imgPath = getImagePath(nextIndex);
    if (imgPath) {
      const fileInput = await page.$('input[name="upload_pic_pc"][type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(imgPath);
        log(`画像: ${path.basename(imgPath)}`);
      }
    }

    // 公開設定
    await page.click('#radioPublic');

    log(`入力完了: ${article.title} (${article.body.length}文字)`);

    // 投稿ボタン
    const submitBtn = await page.$('input[type="submit"][value*="投稿"], button:has-text("投稿する"), input[value="投稿する"]');
    if (submitBtn) {
      await submitBtn.click();
    } else {
      // フォームsubmit
      await page.evaluate(() => document.querySelector('form').submit());
    }
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const resultText = await page.evaluate(() => document.body.innerText);
    if (resultText.includes('完了') || resultText.includes('投稿') || resultText.includes('編集・削除')) {
      log('投稿成功！');
      state.lastIndex = nextIndex;
      state.history.push({
        index: nextIndex,
        title: article.title,
        postedAt: new Date().toISOString(),
        scheduled: `${schedule.y}/${schedule.m}/${schedule.d} ${schedule.h}:${schedule.n}`,
      });
      saveState(state);
    } else {
      log('投稿結果（要確認）: ' + resultText.substring(0, 300));
      await page.screenshot({ path: path.join(__dirname, 'gh-post-result.png'), fullPage: true });
    }

  } catch (e) {
    log('エラー: ' + e.message);
    await page.screenshot({ path: path.join(__dirname, 'gh-post-error.png'), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
}

post();
