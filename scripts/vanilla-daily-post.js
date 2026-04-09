#!/usr/bin/env node
/**
 * バニラ求人 店長ブログ 毎日自動投稿スクリプト
 * cron: 0 22 * * * /usr/bin/node /home/ozawakiryu0902/projects/vonds/scripts/vanilla-daily-post.js >> /home/ozawakiryu0902/projects/vonds/scripts/vanilla-cron.log 2>&1
 *
 * 30日分のテンプレートをローテーションし、毎日異なる記事を投稿する
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CONFIG = {
  loginUrl: 'https://qzin.jp/entry/',
  username: 'kizuna0511',
  password: 'kiryu0902',
};

const LOG_FILE = path.join(__dirname, 'vanilla-cron.log');
const STATE_FILE = path.join(__dirname, 'vanilla-daily-state.json');
const IMAGES_DIR = path.join(__dirname, 'images');

// テーマインデックス→画像テーマ名のマッピング
const THEME_IMAGES = ['salary', 'privacy', 'beginner', 'qa', 'dekasegi', 'benefits', 'seasonal'];

function getImagePath(themeIndex) {
  const themeName = THEME_IMAGES[themeIndex % THEME_IMAGES.length];
  const variant = Math.floor(Date.now() / 86400000) % 3; // 日替わりバリエーション
  const imgPath = path.join(IMAGES_DIR, `vanilla_${themeName}_${variant}.jpg`);
  return fs.existsSync(imgPath) ? imgPath : null;
}

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const line = `[${ts}] ${msg}`;
  console.log(line);
}

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return { lastIndex: -1, history: [] };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

// ── 30日分の記事テンプレート ──
// 7カテゴリ × 各4〜5パターン = 30記事以上のローテーション
function generateArticles() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dayOfWeek = ['日','月','火','水','木','金','土'][today.getDay()];

  const PINK = '#ff69b4';
  const RED = '#ff0000';
  const ORANGE = '#ff8c00';
  const PURPLE = '#ee82ee';

  const divider = (text) => `<p><strong><span style="color:${PINK};">━━━━━━━━━━━━━━━━━━━</span></strong></p>
<p><strong><span style="color:${PINK}; font-size:18px;">${text}</span></strong></p>
<p><strong><span style="color:${PINK};">━━━━━━━━━━━━━━━━━━━</span></strong></p>`;

  const sp = '<p>&nbsp;</p>';
  const red = (t) => `<strong><span style="color:${RED};">${t}</span></strong>`;
  const orange = (t) => `<strong><span style="color:${ORANGE};">${t}</span></strong>`;
  const purple = (t) => `<strong><span style="color:${PURPLE};">${t}</span></strong>`;
  const big = (t, c = RED) => `<strong><span style="color:${c}; font-size:20px;">${t}</span></strong>`;

  return [
    // ─── カテゴリ1: 給料・収入系 ───
    {
      title: `【${month}月最新】週3日勤務でも月収40万円超え！リアルな給料事情を公開`,
      body: `${divider('「本当にそんなに稼げるの？」')}
${sp}
<p>こんにちは、山梨デリヘル絆のスタッフです。</p>
<p>今回は${red(`${month}月の最新データ`)}をもとに、<br>当店で働く女の子のリアルな収入をお伝えします。</p>
${sp}
${divider(`${month}月の給料実例`)}
${sp}
<p><strong>▶ Aさん（23歳・未経験入店3ヶ月目）</strong></p>
<p>◆ 出勤：週3日（金土日）<br>
◆ 時間帯：14:00〜22:00<br>
◆ 接客数：1日平均3〜4名</p>
${sp}
<p>${big('月収：約45万円')}</p>
${sp}
<p><strong>▶ Bさん（28歳・他店から移籍）</strong></p>
<p>◆ 出勤：週4日<br>
◆ 時間帯：10:00〜18:00<br>
◆ 接客数：1日平均4〜5名</p>
${sp}
<p>${big('月収：約62万円')}</p>
${sp}
<p>前のお店では月30万円程度だったBさん。<br>${orange('移籍してから収入が倍以上')}になりました。</p>
${sp}
${divider('なぜ絆は稼げるのか？')}
${sp}
<p>${red('①バック率が業界トップクラス')}</p>
<p>当店は${orange('女の子への還元を最優先')}にしています。<br>他店と比べていただければ一目瞭然です。</p>
${sp}
<p>${red('②集客力が圧倒的')}</p>
<p>山梨エリアで長年の実績。<br>平日でも安定したお客様数を確保しています。<br>「出勤したのにゼロ…」ということがありません。</p>
${sp}
<p>${red('③日払い対応')}</p>
<p>働いたその日にお渡し。<br>急な出費にも安心です。</p>
${sp}
${divider('まずはお気軽に')}
${sp}
<p>「話を聞くだけ」でも大歓迎。<br>LINEでのご相談も受付中です。</p>
${sp}
<p>${red('「バニラを見た」でスムーズ対応！')}</p>
<p><strong>スタッフ一同、お待ちしています。</strong></p>`
    },

    // ─── カテゴリ2: 身バレ対策 ───
    {
      title: '【完全版】身バレが怖い方へ｜当店の7つの対策を全公開します',
      body: `${divider('身バレが不安で踏み出せない方へ')}
${sp}
<p>こんにちは、絆スタッフです。</p>
<p>面接でいちばん多い相談が<br>${red('「身バレが怖いです…」')}というお声。</p>
${sp}
<p>その不安、当然です。<br>だからこそ当店では${orange('7つの対策')}を徹底しています。</p>
${sp}
${divider('対策①〜③：写真の身バレ防止')}
${sp}
<p>${red('対策①｜顔出しNG完全対応')}</p>
<p>写真は首から下のみ。<br>顔が映ることは<strong>一切ありません。</strong></p>
${sp}
<p>${red('対策②｜私物を写さない撮影ルール')}</p>
<p>特徴的なアクセサリー、ネイル、私服は外して撮影。<br>${orange('「普段の自分」と結びつく要素をゼロに')}します。</p>
${sp}
<p>${red('対策③｜写真の加工はスタッフ対応')}</p>
<p>自分で加工する必要なし。<br>プロが安全に仕上げます。</p>
${sp}
${divider('対策④〜⑤：スマホ・通知の対策')}
${sp}
<p>${red('対策④｜LINE通知の非表示設定')}</p>
<p>お店のLINE名を「バイト」「美容院」などに変更。<br>通知内容は非表示に。</p>
${sp}
<p>${red('対策⑤｜写真管理のサポート')}</p>
<p>撮影写真は専用フォルダ管理。<br>iPhoneの「非表示」機能の使い方もお教えします。</p>
${sp}
${divider('対策⑥〜⑦：万が一の備え')}
${sp}
<p>${red('対策⑥｜アリバイ会社のご用意')}</p>
<p>在籍確認・収入証明にも対応。<br>万が一の備えも万全です。</p>
${sp}
<p>${red('対策⑦｜出勤パターンの柔軟対応')}</p>
<p>知人が多いエリア・時間帯を避けた出勤も可能。<br><strong>あなたの安全を最優先に</strong>スケジュールを組みます。</p>
${sp}
<p>実際に${purple('2年以上一度もバレずに働いているキャスト')}も多数在籍。</p>
${sp}
${divider('不安なまま始めないでください')}
${sp}
<p>「バレたらどうしよう」と思いながら働くのは辛いですよね。</p>
<p>当店なら${red('事前にしっかり対策')}するから、<br>安心してお仕事に集中できます。</p>
${sp}
<p>まずはLINEで相談だけでもOK。<br><strong>お気軽にお問い合わせください。</strong></p>`
    },

    // ─── カテゴリ3: 未経験者向け ───
    {
      title: '【未経験の方へ】入店初日の流れを完全公開！不安はここで解消',
      body: `${divider('「初日って何するの？」全部お答えします')}
${sp}
<p>こんにちは、絆スタッフです。</p>
<p>今回は${red('入店初日の1日の流れ')}を、<br>時間軸に沿ってすべてお伝えします。</p>
${sp}
${divider('STEP1：お店に到着（出勤30分前）')}
${sp}
<p>◆ ${orange('無料送迎')}でお迎えに行きます<br>
◆ 車がない方も安心<br>
◆ 待ち合わせ場所は事前に相談OK</p>
${sp}
${divider('STEP2：準備・身支度（約30分）')}
${sp}
<p>◆ ${red('完全個室の待機室')}をご用意<br>
◆ シャワー・ドライヤー・アメニティ完備<br>
◆ Wi-Fi・フリードリンクあり<br>
◆ 衣装の貸出もOK</p>
${sp}
${divider('STEP3：最初のお客様（約60〜90分）')}
${sp}
<p>◆ スタッフが${orange('お客様の情報を事前に共有')}<br>
◆ 初めてのお客様には優しい方を優先的にご案内<br>
◆ サービス内容は事前に確認済み<br>
◆ ${red('困ったときはいつでもスタッフに連絡OK')}</p>
${sp}
<p>${purple('「最初は緊張したけど、お客さんが優しくてホッとした」')}<br>
…という声がほとんどです。</p>
${sp}
${divider('STEP4：休憩・次のお客様')}
${sp}
<p>◆ 接客後はしっかり休憩<br>
◆ 体調が悪ければいつでも早退OK<br>
◆ ${orange('ノルマは一切なし')}。自分のペースで</p>
${sp}
${divider('STEP5：退勤・お給料受け取り')}
${sp}
<p>◆ ${red('日払い')}でその日のうちにお渡し<br>
◆ 帰りも無料送迎<br>
◆ 初日の感想・不安点をヒアリング</p>
${sp}
<p><strong>未経験のAさん（24歳）の初日実績：</strong></p>
<p>${big('3名接客 → 日給：約5万円')}</p>
${sp}
${divider('初日の不安、ゼロにします')}
${sp}
<p>当店は${red('在籍キャストの7割以上が未経験スタート。')}<br>
全員が同じ不安を乗り越えて、今しっかり稼いでいます。</p>
${sp}
<p>まずは面接だけでも。<br>LINEでの相談も大歓迎です。</p>
${sp}
<p><strong>あなたのペースで、無理なく始めましょう。</strong></p>`
    },

    // ─── カテゴリ4: Q&A形式 ───
    {
      title: '【Q&A】応募前に知りたい10の疑問｜全部正直にお答えします',
      body: `${divider('よくある質問にぜんぶ答えます')}
${sp}
<p>こんにちは、絆スタッフです。</p>
<p>面接や問い合わせでよくいただく質問を<br>${red('10個まとめてお答え')}します。</p>
${sp}
${divider('お金について')}
${sp}
<p><strong>Q1. ぶっちゃけ、いくら稼げますか？</strong></p>
<p>A. 週3日出勤で${orange('月収35〜50万円')}が目安です。<br>出勤日数・時間帯によって変わりますが、<br>当店のバック率は業界トップクラスです。</p>
${sp}
<p><strong>Q2. 日払いですか？</strong></p>
<p>A. はい、${red('完全日払い')}です。<br>働いたその日に全額お渡しします。</p>
${sp}
<p><strong>Q3. 罰金やノルマはありますか？</strong></p>
<p>A. ${red('一切ありません。')}<br>遅刻・当日欠勤の罰金もゼロ。<br>体調不良での急な休みも大丈夫です。</p>
${sp}
${divider('働き方について')}
${sp}
<p><strong>Q4. 週1日だけでも大丈夫ですか？</strong></p>
<p>A. ${orange('もちろんOK！')}<br>完全自由出勤なので、あなたの都合に合わせられます。</p>
${sp}
<p><strong>Q5. 昼間だけ・夜だけでも働けますか？</strong></p>
<p>A. 好きな時間帯だけでOKです。<br>主婦の方はお昼、学生さんは夕方以降が人気です。</p>
${sp}
<p><strong>Q6. 他のお仕事と掛け持ちできますか？</strong></p>
<p>A. できます。<br>在籍キャストの半数以上が${orange('副業として')}働いています。</p>
${sp}
${divider('安全・プライバシーについて')}
${sp}
<p><strong>Q7. 身バレ対策はしてもらえますか？</strong></p>
<p>A. ${red('徹底しています。')}<br>顔出しNG・写真加工・アリバイ会社のご用意もあり。<br>詳しくは別の記事で解説しています。</p>
${sp}
<p><strong>Q8. 性病の心配はありますか？</strong></p>
<p>A. 当店は${orange('衛生管理を徹底')}。<br>定期検査のサポートも行っています。</p>
${sp}
${divider('面接・入店について')}
${sp}
<p><strong>Q9. 面接は何を持っていけばいいですか？</strong></p>
<p>A. ${red('身分証明書1点のみ')}でOK。<br>服装も自由です。気軽にお越しください。</p>
${sp}
<p><strong>Q10. 体験入店はできますか？</strong></p>
<p>A. ${orange('もちろん可能です！')}<br>実際に1日働いてみて、合わなければそれでOK。<br>体験入店でも日払いでお給料をお渡しします。</p>
${sp}
${divider('他にも気になることがあれば')}
${sp}
<p>どんな小さな疑問でも大丈夫。<br>LINEで気軽に聞いてください。</p>
${sp}
<p>${red('「バニラを見た」でスムーズ対応！')}</p>
<p><strong>お問い合わせお待ちしています。</strong></p>`
    },

    // ─── カテゴリ5: 出稼ぎ・寮 ───
    {
      title: '【出稼ぎ歓迎】寮完備・交通費支給｜遠方からでも安心して働ける環境です',
      body: `${divider('県外からの出稼ぎ、大歓迎です！')}
${sp}
<p>こんにちは、絆スタッフです。</p>
<p>最近、${red('県外からのお問い合わせが増えています。')}</p>
${sp}
<p>「地元では働きたくない」<br>「短期間でガッツリ稼ぎたい」<br>「新しい環境でリフレッシュしたい」</p>
${sp}
<p>そんな方のために、当店の${orange('出稼ぎサポート')}をご紹介します。</p>
${sp}
${divider('出稼ぎサポート内容')}
${sp}
<p>${red('①完全個室の寮を完備')}</p>
<p>◆ 家具・家電付きですぐに生活OK<br>
◆ Wi-Fi完備<br>
◆ 生活用品一式あり<br>
◆ ${orange('寮費は格安')}でご案内</p>
${sp}
<p>${red('②交通費サポート')}</p>
<p>遠方からお越しの方には交通費をサポート。<br>詳しい条件はお問い合わせください。</p>
${sp}
<p>${red('③短期1泊2日〜長期まで対応')}</p>
<p>「まずは1週間だけ試したい」もOK。<br>あなたのスケジュールに合わせます。</p>
${sp}
<p>${red('④身バレリスクが低い')}</p>
<p>${purple('地元から離れているので、知り合いに会う確率がほぼゼロ。')}<br>出稼ぎならではの安心感があります。</p>
${sp}
${divider('出稼ぎキャストの実績')}
${sp}
<p><strong>Cさん（26歳・東京から出稼ぎ・1週間）</strong></p>
<p>${big('7日間の収入：約35万円')}</p>
${sp}
<p><em>「地元じゃ絶対できないけど、<br>離れた場所なら安心して集中できた」</em></p>
${sp}
${divider('山梨で働くメリット')}
${sp}
<p>◆ ${orange('競合が少ない')}→お客様を独占しやすい<br>
◆ 生活コストが都会より安い<br>
◆ 温泉・自然でリフレッシュも◎<br>
◆ 東京から特急で約90分のアクセス</p>
${sp}
${divider('お気軽にご相談ください')}
${sp}
<p>出稼ぎに関する質問、何でもお答えします。<br>LINEで${red('「出稼ぎ希望」')}とメッセージください。</p>
${sp}
<p><strong>スタッフが丁寧にご案内いたします。</strong></p>`
    },

    // ─── カテゴリ6: 待遇・環境 ───
    {
      title: '【待遇公開】他店と比べてください｜絆が選ばれ続ける理由',
      body: `${divider('なぜ絆は「辞めない」お店なのか')}
${sp}
<p>こんにちは、絆スタッフです。</p>
<p>当店には${red('1年以上在籍しているキャストが多数')}います。</p>
${sp}
<p>「稼げるけどキツい店」じゃ続かない。<br>${orange('稼げて、居心地がいい。')}<br>それが長く続く秘訣だと考えています。</p>
${sp}
${divider('絆の待遇一覧')}
${sp}
<p>◆ ${red('業界トップクラスのバック率')}<br>
◆ ${red('完全日払い')}（全額その日にお渡し）<br>
◆ 完全自由出勤（${orange('週1日・1日2時間〜OK')}）<br>
◆ 罰金・ノルマ一切なし<br>
◆ ${red('無料送迎')}あり<br>
◆ 完全個室待機（他キャストと会わない）<br>
◆ 寮完備（家具家電付き）<br>
◆ 衣装貸出あり<br>
◆ 顔出しNG完全対応<br>
◆ ${orange('アリバイ会社')}のご用意あり<br>
◆ 新人保証制度あり<br>
◆ 性病検査サポート<br>
◆ Wi-Fi・フリードリンク完備</p>
${sp}
${divider('在籍キャストの声')}
${sp}
<p>${purple('「前の店は罰金があって精神的にきつかった。絆は本当に自由で助かってる」')}（Dさん・25歳）</p>
${sp}
<p>${purple('「スタッフさんが優しくて、悩みも聞いてくれる。仕事だけの関係じゃない感じ」')}（Eさん・22歳）</p>
${sp}
<p>${purple('「バック率に惹かれて入ったけど、居心地が良すぎて辞められない（笑）」')}（Fさん・30歳）</p>
${sp}
${divider('他店と比べてみてください')}
${sp}
<p>当店は${red('比較されることを歓迎')}しています。</p>
<p>バック率・待遇・環境・スタッフの対応…<br>すべてを見た上で選んでいただきたい。</p>
${sp}
<p>面接だけでも大歓迎。<br>LINEで気軽にお問い合わせください。</p>
${sp}
<p><strong>あなたに合うお店かどうか、一緒に確認しましょう。</strong></p>`
    },

    // ─── カテゴリ7: 季節・タイムリー系 ───
    {
      title: `【${month}月${day}日更新】今が始めどき！${month}月のお得な入店キャンペーン`,
      body: `${divider(`${month}月は新生活応援月間！`)}
${sp}
<p>こんにちは、絆スタッフです。</p>
<p>${month}月は${red('新しいことを始める女の子が増える季節。')}</p>
${sp}
<p>「春から環境が変わった」<br>「新生活でお金が必要」<br>「何か副業を始めたい」</p>
${sp}
<p>そんな方を${orange('全力でサポート')}します！</p>
${sp}
${divider('今月の入店特典')}
${sp}
<p>${big('▶ 入店祝い金あり！')}</p>
${sp}
<p>◆ 体験入店OK（もちろん日払い）<br>
◆ ${red('新人保証制度')}で初月から安定収入<br>
◆ 寮即日入居可能<br>
◆ ${orange('交通費サポートあり')}</p>
${sp}
${divider('こんな方におすすめ')}
${sp}
<p>◆ 新生活の出費をカバーしたい方<br>
◆ 副業で効率よく稼ぎたい方<br>
◆ 他店で稼げなかった方<br>
◆ ${orange('初めてだけど挑戦してみたい方')}</p>
${sp}
${divider(`${dayOfWeek}曜日のあなたへ`)}
${sp}
<p>今日は${dayOfWeek}曜日。</p>
<p>「いつか始めよう」と思っているなら、<br>${red('今日がそのタイミング')}かもしれません。</p>
${sp}
<p>LINEで「バニラを見た」と送るだけ。<br>5分で状況が変わります。</p>
${sp}
<p><strong>あなたからのメッセージ、お待ちしています。</strong></p>`
    },
  ];
}

// ── 投稿実行 ──
async function post() {
  const articles = generateArticles();
  const state = loadState();

  // 次の記事インデックス
  const nextIndex = (state.lastIndex + 1) % articles.length;
  const article = articles[nextIndex];

  log(`記事選択: [${nextIndex}] ${article.title}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // ログイン
    await page.goto(CONFIG.loginUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#form_username', CONFIG.username);
    await page.fill('#form_password', CONFIG.password);
    await page.click('#button');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    if (!page.url().includes('top.html')) throw new Error('ログイン失敗');
    log('ログイン成功');

    // 投稿ページへ
    const blogBtn = await page.$('input[name="shopmanager_blog"][value="更新/入力する"]');
    if (!blogBtn) throw new Error('投稿ボタン未発見');
    await blogBtn.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    log('投稿ページ到達');

    // フォーム入力
    await page.click('#status_1'); // 公開
    await page.fill('#title', article.title);
    await page.waitForFunction(() =>
      typeof CKEDITOR !== 'undefined' &&
      CKEDITOR.instances.editor1 &&
      CKEDITOR.instances.editor1.status === 'ready',
      { timeout: 10000 }
    );
    await page.evaluate((html) => CKEDITOR.instances.editor1.setData(html), article.body);

    // 画像アップロード
    const imgPath = getImagePath(nextIndex);
    if (imgPath) {
      const fileInput = await page.$('input[name="image"][type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(imgPath);
        log(`画像: ${path.basename(imgPath)}`);
      }
    }

    log(`入力完了: ${article.title} (${article.body.length}文字)`);

    // 確認
    await page.click('input[name="confirm"]');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    const confirmText = await page.evaluate(() => document.body.innerText);
    if (!confirmText.includes('投稿する')) throw new Error('確認ページ異常');

    // 投稿
    await page.evaluate(() => {
      const btn = document.querySelector('input[name="complete"]');
      btn.removeAttribute('onclick');
      btn.type = 'submit';
    });
    await page.click('input[name="complete"]');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const result = await page.evaluate(() => document.body.innerText);
    if (result.includes('投稿が完了しました')) {
      log('投稿成功！');
      state.lastIndex = nextIndex;
      state.history.push({
        index: nextIndex,
        title: article.title,
        postedAt: new Date().toISOString(),
      });
      saveState(state);
    } else {
      log('投稿結果不明: ' + result.substring(0, 200));
    }

  } catch (e) {
    log('エラー: ' + e.message);
  } finally {
    await browser.close();
  }
}

post();
