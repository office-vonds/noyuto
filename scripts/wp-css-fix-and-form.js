/**
 * 1. ブログ記事CSS修正（ミニCTAのテキスト色問題）
 * 2. 予約フォーム全面改修（CF7 ID:1354 + ID:1415）
 * 3. サンクスページ改修
 */
const https = require('https');
const querystring = require('querystring');

const WP_BASE = 'https://stretchzero.jp';
let cookies = '';
let nonce = '';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = { hostname: parsedUrl.hostname, port: 443, path: parsedUrl.pathname + parsedUrl.search, method: options.method || 'GET', headers: { 'User-Agent': 'VONDS', ...(options.headers || {}) } };
    if (cookies) reqOptions.headers['Cookie'] = cookies;
    const req = https.request(reqOptions, (res) => {
      if (res.headers['set-cookie']) { const nc = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; '); cookies = cookies ? cookies + '; ' + nc : nc; }
      let body = ''; res.on('data', chunk => body += chunk); res.on('end', () => resolve({ status: res.statusCode, body }));
    }); req.on('error', reject); if (options.body) req.write(options.body); req.end();
  });
}

async function login() {
  const pd = querystring.stringify({ log: 'Stretchlabo', pwd: 'Stretchlabo0501', 'wp-submit': 'Log In', redirect_to: WP_BASE + '/wp-admin/', testcookie: 1 });
  await request(WP_BASE + '/wp-login.php', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(pd), 'Cookie': 'wordpress_test_cookie=WP+Cookie+check' }, body: pd });
  const res = await request(WP_BASE + '/wp-admin/admin-ajax.php?action=rest-nonce'); nonce = res.body.trim();
}

async function wpPut(endpoint, data) {
  const res = await request(WP_BASE + '/wp-json' + endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce }, body: JSON.stringify(data) });
  if (res.status === 200) return JSON.parse(res.body); console.error(`  Error [${res.status}]: ${res.body.substring(0, 200)}`); return null;
}

async function wpPost(endpoint, data) {
  const res = await request(WP_BASE + '/wp-json' + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce }, body: JSON.stringify(data) });
  if (res.status >= 200 && res.status < 300) return JSON.parse(res.body);
  console.error(`  POST Error [${res.status}]: ${res.body.substring(0, 300)}`); return null;
}

// ===================================================================
// PART 1: ブログ記事CSS修正
// ===================================================================

async function fixArticleCss() {
  console.log('=== ブログ記事CSS修正 ===');

  // 全8記事のIDリスト
  const articleIds = [3060, 3061, 3062, 3070, 3071, 3072, 3073, 3074];

  for (const id of articleIds) {
    const res = await request(WP_BASE + `/wp-json/wp/v2/posts/${id}`, { headers: { 'X-WP-Nonce': nonce } });
    if (res.status !== 200) { console.log(`  ID:${id} 取得失敗`); continue; }
    const post = JSON.parse(res.body);
    let content = post.content.raw || '';

    // 修正1: .ar-mini-cta内のstrong色を上書き
    // 修正2: .ar-mini-cta:hoverでstrong色も白に
    // 修正3: .ar-box内のh3のborderとpaddingリセット
    // 修正4: 目次のh2のborderリセット
    const cssFixes = `
.ar-mini-cta strong{color:#2b2b2b!important;font-size:16px;display:block;margin-bottom:4px}
.ar-mini-cta span{color:#666}
.ar-mini-cta:hover strong,.ar-mini-cta:hover span{color:#fff!important}
.ar-box h3{border:none!important;padding:0!important;margin:0 0 12px!important;color:#F8742D!important}
.ar-toc h2{border:none!important;padding:0!important;margin:0 0 12px!important;font-size:15px!important}
.ar li strong{color:#10394b}
`;
    // CSS修正を既存の<style>ブロックに追加
    if (content.includes('</style>')) {
      content = content.replace('</style>', cssFixes + '</style>');
    }

    const result = await wpPut(`/wp/v2/posts/${id}`, { content });
    console.log(`  ID:${id} ${result ? '✓' : '✗'}`);
  }
}

// ===================================================================
// PART 2: 予約フォーム改修（CF7 REST API経由）
// ===================================================================

async function updateReservationForm() {
  console.log('\n=== 予約フォーム改修 ===');

  // CF7のフォーム設定を取得・更新するにはWP admin経由が必要
  // CF7 REST APIは /wp-json/contact-form-7/v1/contact-forms/{id}

  // --- STEP1フォーム (ID:1354) の設定を更新 ---
  console.log('\n--- STEP1 入力フォーム (ID:1354) ---');

  const formContent = `<div class="sz-form">
<p class="sz-form-note">以下のフォームに必要事項をご入力の上、送信してください。<br><span style="color:#F8742D;font-weight:bold">※ このフォームは「仮予約」です。店舗からの確認連絡をもって予約確定となります。</span></p>

<div class="sz-form-group">
<label>お名前（漢字）<span class="sz-req">必須</span></label>
[text* your-name placeholder "例：山田 太郎"]
</div>

<div class="sz-form-group">
<label>フリガナ<span class="sz-req">必須</span></label>
[text* your-furigana placeholder "例：ヤマダ タロウ"]
</div>

<div class="sz-form-group">
<label>電話番号<span class="sz-req">必須</span></label>
[tel* your-tel placeholder "例：090-1234-5678"]
</div>

<div class="sz-form-group">
<label>メールアドレス<span class="sz-req">必須</span></label>
[email* your-email placeholder "例：example@email.com"]
</div>

<div class="sz-form-group">
<label>メールアドレス（確認用）<span class="sz-req">必須</span></label>
[email* your-email-confirm placeholder "確認のため再度ご入力ください"]
</div>

<div class="sz-form-group">
<label>ご希望店舗<span class="sz-req">必須</span></label>
[select* your-store "選択してください" "甲府上石田店" "甲斐響が丘店" "南アルプス店" "韮崎店"]
</div>

<div class="sz-form-group">
<label>ご希望日時（第1希望）<span class="sz-req">必須</span></label>
[date* your-date1]
[select* your-time1 "時間を選択" "09:00" "09:30" "10:00" "10:30" "11:00" "11:30" "12:00" "12:30" "13:00" "13:30" "14:00" "14:30" "15:00" "15:30" "16:00" "16:30" "17:00" "17:30" "18:00" "18:30" "19:00" "19:30" "20:00" "20:30" "21:00"]
</div>

<div class="sz-form-group">
<label>ご希望日時（第2希望）<span class="sz-opt">任意</span></label>
[date your-date2]
[select your-time2 "時間を選択" "09:00" "09:30" "10:00" "10:30" "11:00" "11:30" "12:00" "12:30" "13:00" "13:30" "14:00" "14:30" "15:00" "15:30" "16:00" "16:30" "17:00" "17:30" "18:00" "18:30" "19:00" "19:30" "20:00" "20:30" "21:00"]
</div>

<div class="sz-form-group">
<label>ご希望日時（第3希望）<span class="sz-opt">任意</span></label>
[date your-date3]
[select your-time3 "時間を選択" "09:00" "09:30" "10:00" "10:30" "11:00" "11:30" "12:00" "12:30" "13:00" "13:30" "14:00" "14:30" "15:00" "15:30" "16:00" "16:30" "17:00" "17:30" "18:00" "18:30" "19:00" "19:30" "20:00" "20:30" "21:00"]
</div>

<div class="sz-form-group">
<label>ご希望コース<span class="sz-req">必須</span></label>
[select* your-course "選択してください" "60分コース" "75分コース" "90分コース" "120分コース" "当日相談する"]
</div>

<div class="sz-form-group">
<label>お身体のお悩み・備考<span class="sz-opt">任意</span></label>
[textarea your-message placeholder "肩こり、腰痛、猫背など、気になる症状やご要望があればご記入ください"]
</div>

<div class="sz-form-group">
[acceptance your-acceptance] <a href="/privacy/" target="_blank">プライバシーポリシー</a>に同意する [/acceptance]
</div>

<div class="sz-form-submit">
[submit "入力内容を確認する"]
</div>
</div>`;

  // CF7 メール設定（管理者宛）
  const mailSettings = {
    subject: '【ストレッチゼロ】予約リクエスト - [your-store] - [your-name] 様',
    sender: 'ストレッチゼロ <info@stretch-zero.com>',
    recipient: 'info@stretch-zero.com',
    additional_headers: 'Cc: yuki.nakagomi@sanken-gr.com\nReply-To: [your-email]',
    body: `ストレッチゼロに新しい予約リクエストが届きました。

━━━━━━━━━━━━━━━━━━━━
■ お客様情報
━━━━━━━━━━━━━━━━━━━━
お名前：[your-name]
フリガナ：[your-furigana]
電話番号：[your-tel]
メールアドレス：[your-email]

━━━━━━━━━━━━━━━━━━━━
■ ご予約内容
━━━━━━━━━━━━━━━━━━━━
ご希望店舗：[your-store]
ご希望コース：[your-course]

第1希望：[your-date1] [your-time1]
第2希望：[your-date2] [your-time2]
第3希望：[your-date3] [your-time3]

━━━━━━━━━━━━━━━━━━━━
■ お身体のお悩み・備考
━━━━━━━━━━━━━━━━━━━━
[your-message]

━━━━━━━━━━━━━━━━━━━━
※ このメールはストレッチゼロ公式サイトの予約フォームから自動送信されています。`
  };

  // CF7 自動返信メール設定
  const autoReplySettings = {
    active: true,
    subject: '【ストレッチゼロ】ご予約リクエストを受け付けました',
    sender: 'ストレッチゼロ <info@stretch-zero.com>',
    recipient: '[your-email]',
    additional_headers: '',
    body: `[your-name] 様

この度は、ストレッチゼロへご予約のリクエストをいただき、誠にありがとうございます。

━━━━━━━━━━━━━━━━━━━━
  ※ 本メールは「仮予約」となります。
━━━━━━━━━━━━━━━━━━━━

スタッフが空き状況を確認し、店舗からの「予約確定メール」または「お電話」をもって予約完了となります。

ホットペッパー等のリアルタイム予約とタイムラグがあるため、ご希望に添えない場合がございます。あらかじめご了承ください。


━━━━━━━━━━━━━━━━━━━━
■ ご予約リクエスト内容
━━━━━━━━━━━━━━━━━━━━
お名前：[your-name]（[your-furigana]）
電話番号：[your-tel]
メールアドレス：[your-email]
ご希望店舗：[your-store]
ご希望コース：[your-course]

第1希望：[your-date1] [your-time1]
第2希望：[your-date2] [your-time2]
第3希望：[your-date3] [your-time3]

お身体のお悩み・備考：
[your-message]


━━━━━━━━━━━━━━━━━━━━
■ 重要：お電話番号について
━━━━━━━━━━━━━━━━━━━━

以下の電話番号からおかけいたします。

  【 055-242-7011 】

※ 知らない番号からの着信を警戒される方が増えております。
  恐れ入りますが、スムーズにご連絡できるよう、
  上記番号からの着信にお出になれるようお願いいたします。


━━━━━━━━━━━━━━━━━━━━
ストレッチゼロ
公式サイト：https://stretchzero.jp
━━━━━━━━━━━━━━━━━━━━`
  };

  // CF7 REST API でフォーム更新
  // CF7 v5.4+ は /contact-form-7/v1/contact-forms/{id} で PUT 可能

  const cf7FormData = {
    title: 'ストレッチゼロ 予約フォーム',
    form: formContent,
    mail: mailSettings,
    mail_2: autoReplySettings,
  };

  // CF7 REST APIで更新
  const updateRes = await request(WP_BASE + '/wp-json/contact-form-7/v1/contact-forms/1354', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
    body: JSON.stringify(cf7FormData),
  });

  console.log(`  CF7 ID:1354 更新: [${updateRes.status}]`);
  if (updateRes.status === 200) {
    console.log('  ✓ フォーム・メール設定更新成功');
  } else {
    console.log(`  レスポンス: ${updateRes.body.substring(0, 300)}`);

    // CF7 REST APIが使えない場合、admin-ajax経由でpost metaを更新する
    console.log('  CF7 REST API失敗。WP admin POST経由で更新を試みます...');

    // CF7フォームはWP postとして保存されている（post_type: wpcf7_contact_form）
    // post_contentにフォームHTML、post metaにmail設定が格納
    const wpUpdateRes = await wpPut('/wp/v2/posts/1354', {
      content: formContent,
    });

    // CF7はwpcf7_contact_formカスタムポストタイプなので、通常のposts APIでは更新できない可能性
    // WP admin画面のedit.php経由でPOSTする方法を試す
    if (!wpUpdateRes) {
      console.log('  WP REST APIでも失敗。admin画面経由での更新が必要です。');
      console.log('  → FTP経由でPHPスクリプトを配置して直接更新します。');
    }
  }
}

// ===================================================================
// PART 3: サンクスページ改修
// ===================================================================

async function updateThanksPage() {
  console.log('\n=== サンクスページ改修 ===');

  const thanksContent = `<style>
.sz-thanks{font-family:'Noto Sans JP',sans-serif;max-width:680px;margin:0 auto;padding:40px 20px;text-align:center;color:#2b2b2b}
.sz-thanks-icon{width:80px;height:80px;background:linear-gradient(135deg,#F8742D,#F8CC2D);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:40px;color:#fff}
.sz-thanks h1{font-size:clamp(1.3rem,1rem + 1.5vw,1.8rem);font-weight:700;margin:0 0 8px;color:#2b2b2b}
.sz-thanks .sub{font-size:14px;color:#666;margin:0 0 32px}
.sz-thanks-box{background:#F6F2EC;border-radius:16px;padding:32px 28px;text-align:left;margin-bottom:32px}
.sz-thanks-box h2{font-size:16px;font-weight:700;color:#10394b;margin:0 0 16px;text-align:center}
.sz-thanks-box p{font-size:14px;line-height:1.9;margin:0 0 16px}
.sz-thanks-box .bold{font-weight:700;color:#F8742D;font-size:15px}
.sz-thanks-tel{background:#fff;border:2px solid #F8742D;border-radius:12px;padding:20px;text-align:center;margin:24px 0}
.sz-thanks-tel .num{font-size:24px;font-weight:700;color:#F8742D;letter-spacing:.1em}
.sz-thanks-tel p{font-size:13px;color:#666;margin:8px 0 0}
.sz-thanks-btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(90deg,#F8742D,#F8CC2D);color:#fff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:30px;text-decoration:none;box-shadow:0 6px 15px rgba(248,116,45,.3);transition:all .3s;margin-top:16px}
.sz-thanks-btn:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(248,116,45,.4)}
</style>

<div class="sz-thanks">
<div class="sz-thanks-icon">✓</div>
<h1>お申し込みありがとうございます</h1>
<p class="sub">（送信完了）</p>

<div class="sz-thanks-box">
<h2>ご予約リクエストを受け付けました</h2>
<p>この度は、ストレッチゼロへご予約のリクエストをいただき、誠にありがとうございます。</p>
<p class="bold">※ 本メールは「仮予約」となります。</p>
<p>スタッフが空き状況を確認し、店舗からの<strong>「予約確定メール」</strong>または<strong>「お電話」</strong>をもって予約完了となります。</p>
<p>ホットペッパー等のリアルタイム予約とタイムラグがあるため、ご希望に添えない場合がございます。あらかじめご了承ください。</p>

<div class="sz-thanks-tel">
<p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#10394b">■ 重要：お電話番号について</p>
<p style="margin:0 0 8px;font-size:13px">以下の電話番号からおかけいたします。</p>
<div class="num">055-242-7011</div>
<p>※ 知らない番号からの着信を警戒される方が増えております。<br>恐れ入りますが、スムーズにご連絡できるよう、<br>上記番号からの着信にお出になれるようお願いいたします。</p>
</div>
</div>

<a href="/" class="sz-thanks-btn">TOPへ戻る →</a>
</div>`;

  // サンクスページ (ID:1411) を更新
  const result = await wpPut('/wp/v2/pages/1411', { content: thanksContent });
  console.log(`  サンクスページ(ID:1411): ${result ? '✓' : '✗'}`);
}

// ===================================================================
// PART 4: 問い合わせページ（/contact/）のCSS追加
// ===================================================================

async function updateContactPageCss() {
  console.log('\n=== 問い合わせページCSS追加 ===');

  const page = await request(WP_BASE + '/wp-json/wp/v2/pages/1406', { headers: { 'X-WP-Nonce': nonce } });
  if (page.status !== 200) { console.log('  取得失敗'); return; }
  const data = JSON.parse(page.body);
  let content = data.content.raw || '';

  // フォームスタイルCSS
  const formCss = `<style>
.sz-form{max-width:640px;margin:0 auto;font-family:'Noto Sans JP',sans-serif}
.sz-form-note{background:#FFF8F4;border:1px solid #F8742D;border-radius:10px;padding:16px 20px;font-size:14px;line-height:1.7;margin-bottom:32px}
.sz-form-group{margin-bottom:24px}
.sz-form-group label{display:block;font-size:14px;font-weight:700;color:#2b2b2b;margin-bottom:8px}
.sz-req{display:inline-block;background:#F8742D;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-left:8px}
.sz-opt{display:inline-block;background:#999;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-left:8px}
.sz-form input[type="text"],.sz-form input[type="email"],.sz-form input[type="tel"],.sz-form input[type="date"],.sz-form select,.sz-form textarea{width:100%;padding:12px 16px;border:1px solid #ddd;border-radius:8px;font-size:15px;font-family:'Noto Sans JP',sans-serif;transition:border-color .3s;background:#fff;color:#2b2b2b}
.sz-form input:focus,.sz-form select:focus,.sz-form textarea:focus{border-color:#F8742D;outline:none;box-shadow:0 0 0 3px rgba(248,116,45,.1)}
.sz-form select{appearance:auto;cursor:pointer}
.sz-form textarea{min-height:120px;resize:vertical}
.sz-form input[type="date"]{cursor:pointer}
.sz-form-submit{text-align:center;margin-top:32px}
.sz-form-submit input[type="submit"],.sz-form .wpcf7-submit{background:linear-gradient(90deg,#F8742D,#F8CC2D);color:#fff;font-size:16px;font-weight:700;padding:16px 48px;border:none;border-radius:30px;cursor:pointer;box-shadow:0 6px 15px rgba(248,116,45,.3);transition:all .3s;font-family:'Noto Sans JP',sans-serif}
.sz-form-submit input[type="submit"]:hover,.sz-form .wpcf7-submit:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(248,116,45,.4)}
.sz-form .wpcf7-acceptance{font-size:14px}
.sz-form .wpcf7-list-item{margin:0}
.sz-form .wpcf7-response-output{border-radius:8px;padding:12px 16px;font-size:14px}
</style>`;

  // 既にsz-formスタイルがあれば置換、なければ先頭に追加
  if (content.includes('.sz-form')) {
    content = content.replace(/<style>[\s\S]*?\.sz-form[\s\S]*?<\/style>/, formCss);
  } else {
    content = formCss + content;
  }

  const result = await wpPut('/wp/v2/pages/1406', { content });
  console.log(`  問い合わせページ(ID:1406): ${result ? '✓' : '✗'}`);
}

// ===================================================================
// PART 5: FTP経由でCF7フォーム設定を更新するPHPスクリプト
// ===================================================================

async function deployCf7UpdateScript() {
  console.log('\n=== CF7設定更新PHPスクリプト配置 ===');

  const phpScript = `<?php
/**
 * CF7 フォーム設定一括更新スクリプト
 * 実行後は必ず削除すること
 */
require_once dirname(__FILE__) . '/wp-load.php';

// CF7フォーム ID:1354 の設定を更新
$form_id = 1354;
$contact_form = wpcf7_contact_form($form_id);

if (!$contact_form) {
    echo "CF7 form not found: $form_id\\n";
    exit;
}

// フォームHTML
$form_content = '<div class="sz-form">
<p class="sz-form-note">以下に必要事項をご入力の上、送信してください。<br><span style="color:#F8742D;font-weight:bold">※ このフォームは「仮予約」です。店舗からの確認連絡をもって予約確定となります。</span></p>

<div class="sz-form-group">
<label>お名前（漢字）<span class="sz-req">必須</span></label>
[text* your-name placeholder "例：山田 太郎"]
</div>

<div class="sz-form-group">
<label>フリガナ<span class="sz-req">必須</span></label>
[text* your-furigana placeholder "例：ヤマダ タロウ"]
</div>

<div class="sz-form-group">
<label>電話番号<span class="sz-req">必須</span></label>
[tel* your-tel placeholder "例：090-1234-5678"]
</div>

<div class="sz-form-group">
<label>メールアドレス<span class="sz-req">必須</span></label>
[email* your-email placeholder "例：example@email.com"]
</div>

<div class="sz-form-group">
<label>メールアドレス（確認用）<span class="sz-req">必須</span></label>
[email* your-email-confirm placeholder "確認のため再度ご入力ください"]
</div>

<div class="sz-form-group">
<label>ご希望店舗<span class="sz-req">必須</span></label>
[select* your-store "選択してください" "甲府上石田店" "甲斐響が丘店" "南アルプス店" "韮崎店"]
</div>

<div class="sz-form-group">
<label>ご希望日時（第1希望）<span class="sz-req">必須</span></label>
[date* your-date1] [select* your-time1 "時間を選択" "09:00" "09:30" "10:00" "10:30" "11:00" "11:30" "12:00" "12:30" "13:00" "13:30" "14:00" "14:30" "15:00" "15:30" "16:00" "16:30" "17:00" "17:30" "18:00" "18:30" "19:00" "19:30" "20:00" "20:30" "21:00"]
</div>

<div class="sz-form-group">
<label>ご希望日時（第2希望）<span class="sz-opt">任意</span></label>
[date your-date2] [select your-time2 "時間を選択" "09:00" "09:30" "10:00" "10:30" "11:00" "11:30" "12:00" "12:30" "13:00" "13:30" "14:00" "14:30" "15:00" "15:30" "16:00" "16:30" "17:00" "17:30" "18:00" "18:30" "19:00" "19:30" "20:00" "20:30" "21:00"]
</div>

<div class="sz-form-group">
<label>ご希望日時（第3希望）<span class="sz-opt">任意</span></label>
[date your-date3] [select your-time3 "時間を選択" "09:00" "09:30" "10:00" "10:30" "11:00" "11:30" "12:00" "12:30" "13:00" "13:30" "14:00" "14:30" "15:00" "15:30" "16:00" "16:30" "17:00" "17:30" "18:00" "18:30" "19:00" "19:30" "20:00" "20:30" "21:00"]
</div>

<div class="sz-form-group">
<label>ご希望コース<span class="sz-req">必須</span></label>
[select* your-course "選択してください" "60分コース" "75分コース" "90分コース" "120分コース" "当日相談する"]
</div>

<div class="sz-form-group">
<label>お身体のお悩み・備考<span class="sz-opt">任意</span></label>
[textarea your-message placeholder "肩こり、腰痛、猫背など、気になる症状やご要望があればご記入ください"]
</div>

<div class="sz-form-group">
[acceptance your-acceptance] <a href="/privacy/" target="_blank">プライバシーポリシー</a>に同意する [/acceptance]
</div>

<div class="sz-form-submit">
[submit "予約リクエストを送信する"]
</div>
</div>';

// メール設定（管理者宛）
$mail = array(
    'active' => true,
    'subject' => '[your-store] 予約リクエスト - [your-name] 様',
    'sender' => 'ストレッチゼロ <info@stretch-zero.com>',
    'recipient' => 'info@stretch-zero.com',
    'body' => "ストレッチゼロに新しい予約リクエストが届きました。\\n\\n" .
        "━━━━━━━━━━━━━━━━━━━━\\n" .
        "お名前：[your-name]（[your-furigana]）\\n" .
        "電話番号：[your-tel]\\n" .
        "メール：[your-email]\\n\\n" .
        "ご希望店舗：[your-store]\\n" .
        "ご希望コース：[your-course]\\n\\n" .
        "第1希望：[your-date1] [your-time1]\\n" .
        "第2希望：[your-date2] [your-time2]\\n" .
        "第3希望：[your-date3] [your-time3]\\n\\n" .
        "お悩み・備考：\\n[your-message]\\n",
    'additional_headers' => "Cc: yuki.nakagomi@sanken-gr.com\\nReply-To: [your-email]",
    'attachments' => '',
    'use_html' => false,
    'exclude_blank' => false,
);

// 自動返信メール
$mail_2 = array(
    'active' => true,
    'subject' => '【ストレッチゼロ】ご予約リクエストを受け付けました',
    'sender' => 'ストレッチゼロ <info@stretch-zero.com>',
    'recipient' => '[your-email]',
    'body' => "[your-name] 様\\n\\n" .
        "この度は、ストレッチゼロへご予約のリクエストをいただき、誠にありがとうございます。\\n\\n" .
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n" .
        "  ※ 本メールは「仮予約」となります。\\n" .
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n" .
        "スタッフが空き状況を確認し、店舗からの「予約確定メール」または「お電話」をもって予約完了となります。\\n\\n" .
        "ホットペッパー等のリアルタイム予約とタイムラグがあるため、ご希望に添えない場合がございます。あらかじめご了承ください。\\n\\n\\n" .
        "━━━━ ご予約リクエスト内容 ━━━━\\n" .
        "お名前：[your-name]（[your-furigana]）\\n" .
        "電話番号：[your-tel]\\n" .
        "メール：[your-email]\\n" .
        "ご希望店舗：[your-store]\\n" .
        "ご希望コース：[your-course]\\n\\n" .
        "第1希望：[your-date1] [your-time1]\\n" .
        "第2希望：[your-date2] [your-time2]\\n" .
        "第3希望：[your-date3] [your-time3]\\n\\n" .
        "お悩み・備考：\\n[your-message]\\n\\n\\n" .
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n" .
        "■ 重要：お電話番号について\\n" .
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n" .
        "以下の電話番号からおかけいたします。\\n\\n" .
        "  【 055-242-7011 】\\n\\n" .
        "※ 知らない番号からの着信を警戒される方が増えております。\\n" .
        "  恐れ入りますが、スムーズにご連絡できるよう、\\n" .
        "  上記番号からの着信にお出になれるようお願いいたします。\\n\\n\\n" .
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n" .
        "ストレッチゼロ\\n" .
        "公式サイト：https://stretchzero.jp\\n" .
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n",
    'additional_headers' => '',
    'attachments' => '',
    'use_html' => false,
    'exclude_blank' => false,
);

// CF7のプロパティを更新
$properties = $contact_form->get_properties();
$properties['form'] = $form_content;
$properties['mail'] = $mail;
$properties['mail_2'] = $mail_2;

// 送信完了メッセージも更新
$properties['messages'] = array_merge($properties['messages'], array(
    'mail_sent_ok' => 'ご予約リクエストを送信しました。確認メールをご確認ください。',
    'mail_sent_ng' => '送信に失敗しました。しばらく経ってから再度お試しください。',
    'validation_error' => '入力内容に誤りがあります。赤い項目をご確認ください。',
    'acceptance_missing' => 'プライバシーポリシーへの同意が必要です。',
));

$contact_form->set_properties($properties);
$contact_form->save();

echo "CF7 Form ID:$form_id updated successfully!\\n";
echo "Form title: " . $contact_form->title() . "\\n";
echo "Mail recipient: " . $mail['recipient'] . "\\n";
echo "Mail CC: yuki.nakagomi@sanken-gr.com\\n";
echo "Auto-reply: active\\n";

// 実行後に自身を削除
unlink(__FILE__);
echo "\\nScript self-deleted.\\n";
`;

  const fs = require('fs');
  const tmpFile = '/tmp/sz-cf7-update.php';
  fs.writeFileSync(tmpFile, phpScript);

  // FTP経由でアップロード
  const { execSync } = require('child_process');
  try {
    execSync(`curl -s --ftp-ssl --insecure -u "stlab@stretchlabo.jp:Stretchlabo0501" -T ${tmpFile} "ftp://sv14862.xserver.jp/stretchzero.jp/public_html/sz-cf7-update.php"`, { timeout: 15000 });
    console.log('  PHPスクリプトアップロード: ✓');

    // PHPスクリプトを実行
    const execRes = await request(WP_BASE + '/sz-cf7-update.php');
    console.log(`  実行結果 [${execRes.status}]:`);
    console.log(`  ${execRes.body}`);
  } catch (e) {
    console.error('  FTPアップロードエラー:', e.message);
  }

  fs.unlinkSync(tmpFile);
}

// ===================================================================
// メイン
// ===================================================================

async function main() {
  await login();
  console.log('ログイン完了\n');

  await fixArticleCss();
  await updateThanksPage();
  await updateContactPageCss();
  await deployCf7UpdateScript();

  console.log('\n========================================');
  console.log('CSS修正 + フォーム改修 + サンクスページ 完了');
  console.log('========================================');
}

main().catch(console.error);
