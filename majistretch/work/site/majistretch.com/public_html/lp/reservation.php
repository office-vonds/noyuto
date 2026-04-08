<?php
// ===== 予約フォーム処理（PHPMailer + Google Workspace SMTP） =====
// 送信先: info@majistretch.com + yuki.nakagomi@sanken-gr.com
// 自動返信メール付き

// --- サンクスページ表示（GET ?complete=1） ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['complete'])) {
    header('Content-Type: text/html; charset=UTF-8');
    echo <<<'THANKS_HTML'
<!DOCTYPE html>
<html lang="ja">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-93MZ8ERBW5"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-93MZ8ERBW5');
</script>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K32XLKXH');</script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>お申し込みありがとうございます｜本気ストレッチ 甲府上阿原店</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;700&display=swap">
  <link rel="stylesheet" href="https://unpkg.com/ress/dist/ress.min.css">
  <link rel="stylesheet" href="css/style.css">
  <style>
    .p-thanks{background:#FFF5F8;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px}
    .p-thanks__inner{max-width:560px;width:100%;background:#fff;border-radius:12px;padding:48px 32px;box-shadow:0 2px 12px rgba(0,0,0,.06);text-align:center}
    .p-thanks__icon{width:64px;height:64px;margin:0 auto 24px;background:#E8F5E9;border-radius:50%;display:flex;align-items:center;justify-content:center}
    .p-thanks__icon svg{width:32px;height:32px;stroke:#2E7D32}
    .p-thanks__heading{font-family:'Shippori Mincho',serif;font-size:1.5rem;font-weight:700;color:#1A1A1A;margin-bottom:8px;line-height:1.5}
    .p-thanks__sub{font-size:.9rem;color:#666;margin-bottom:32px}
    .p-thanks__message{text-align:left;font-size:.92rem;color:#333;line-height:1.8;margin-bottom:32px;padding:0 8px}
    .p-thanks__message strong{font-weight:700}
    .p-thanks__important{background:#FFF8E1;border:1px solid #FFD54F;border-radius:8px;padding:20px 24px;text-align:left;margin-bottom:32px}
    .p-thanks__important-title{font-size:.9rem;font-weight:700;color:#E65100;margin-bottom:8px}
    .p-thanks__important-body{font-size:.85rem;color:#333;line-height:1.7}
    .p-thanks__tel{display:inline-block;font-size:1.2rem;font-weight:700;color:#E51F5E;letter-spacing:.05em;margin:4px 0}
    .p-thanks__btn{display:inline-block;width:100%;max-width:300px;padding:16px 24px;background:#E51F5E;color:#fff;font-size:1rem;font-weight:700;font-family:'Noto Sans JP',sans-serif;text-decoration:none;border:none;border-radius:50px;cursor:pointer;transition:background .2s,transform .1s;box-shadow:0 4px 12px rgba(229,31,94,.3);margin-top:8px}
    .p-thanks__btn:hover{background:#C91850;transform:translateY(-1px)}
    @media(max-width:600px){.p-thanks__inner{padding:36px 20px}.p-thanks__heading{font-size:1.3rem}}
  </style>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K32XLKXH" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <div class="p-thanks">
    <div class="p-thanks__inner">
      <div class="p-thanks__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h1 class="p-thanks__heading">お申し込み<br>ありがとうございます。</h1>
      <p class="p-thanks__sub">（送信完了）</p>
      <div class="p-thanks__message">
        <p>この度は、ストレッチゼロへご予約のリクエストをいただき、誠にありがとうございます。</p>
        <br>
        <p><strong>本メールは『仮予約』となります。</strong></p>
        <br>
        <p>スタッフが空き状況を確認し、店舗からの『予約確定メール』または『お電話』をもって予約完了となります。</p>
        <br>
        <p>ホットペッパー等のリアルタイム予約とタイムラグがあるため、ご希望に添えない場合がございます。あらかじめご了承下さい。</p>
      </div>
      <div class="p-thanks__important">
        <p class="p-thanks__important-title">&#9632; 重要：お電話番号について</p>
        <p class="p-thanks__important-body">
          以下の電話番号からおかけいたします。<br><br>
          <span class="p-thanks__tel">TEL: 050-8884-8993</span><br><br>
          ※知らない番号からの着信を警戒される方が増えております。恐れ入りますが、スムーズにご連絡できるよう、上記番号からの着信に出られるようお願いいたします。
        </p>
      </div>
      <a href="./" class="p-thanks__btn">TOPへ戻る</a>
    </div>
  </div>
  <script>
    if (window.dataLayer) {
      window.dataLayer.push({ event: 'reservation_submit', reservation_status: 'success' });
    }
  </script>
</body>
</html>
THANKS_HTML;
    exit;
}

header('Content-Type: application/json; charset=UTF-8');

// PHPMailer読み込み
require_once __DIR__ . '/phpmailer/Exception.php';
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';
require_once __DIR__ . '/mail-config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// POST以外は拒否
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => '不正なリクエストです。']);
    exit;
}

// --- 入力値取得・サニタイズ ---
$name       = trim(filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$furigana   = trim(filter_input(INPUT_POST, 'furigana', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$tel        = trim(filter_input(INPUT_POST, 'tel', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$email      = trim(filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL) ?? '');
$email_conf = trim(filter_input(INPUT_POST, 'email_confirm', FILTER_VALIDATE_EMAIL) ?? '');
$date1      = trim(filter_input(INPUT_POST, 'date1', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$time1      = trim(filter_input(INPUT_POST, 'time1', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$date2      = trim(filter_input(INPUT_POST, 'date2', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$time2      = trim(filter_input(INPUT_POST, 'time2', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$date3      = trim(filter_input(INPUT_POST, 'date3', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$time3      = trim(filter_input(INPUT_POST, 'time3', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$course     = trim(filter_input(INPUT_POST, 'course', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$body       = trim(filter_input(INPUT_POST, 'body', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');

// --- バリデーション ---
$errors = [];

if ($name === '') {
    $errors[] = '氏名を入力してください。';
}
if ($furigana === '') {
    $errors[] = 'フリガナを入力してください。';
}
if ($tel === '' || !preg_match('/^[0-9\-]+$/', $tel)) {
    $errors[] = '正しい電話番号を入力してください。';
}
if ($email === '' || $email === false) {
    $errors[] = '正しいメールアドレスを入力してください。';
}
if ($email !== $email_conf) {
    $errors[] = 'メールアドレスが一致しません。';
}
if ($date1 === '' || $time1 === '') {
    $errors[] = '第1希望日時を選択してください。';
}
if ($course === '') {
    $errors[] = 'ご希望コースを選択してください。';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode("\n", $errors)]);
    exit;
}

// --- 希望日時フォーマット ---
$wish1 = "{$date1} {$time1}";
$wish2 = ($date2 && $time2) ? "{$date2} {$time2}" : '未選択';
$wish3 = ($date3 && $time3) ? "{$date3} {$time3}" : '未選択';

// --- SMTP共通設定関数 ---
function createMailer() {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';
    $mail->Encoding   = 'base64';
    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    return $mail;
}

// --- 店舗宛メール ---
$body_shop = <<<EOT
━━━━━━━━━━━━━━━━━━━━━━━━
  WEB予約リクエスト
━━━━━━━━━━━━━━━━━━━━━━━━

【氏名】{$name}
【フリガナ】{$furigana}
【電話番号】{$tel}
【メールアドレス】{$email}

【第1希望】{$wish1}
【第2希望】{$wish2}
【第3希望】{$wish3}

【ご希望コース】{$course}

【お身体のお悩み・備考】
{$body}

━━━━━━━━━━━━━━━━━━━━━━━━
EOT;

// --- 顧客宛 自動返信メール ---
$body_auto = <<<EOT
{$name} 様

この度は、ストレッチゼロへご予約のリクエストをいただき、誠にありがとうございます。

━━━━━━━━━━━━━━━━━━━━━━━━
  ★ 本メールは『仮予約』となります ★
━━━━━━━━━━━━━━━━━━━━━━━━

スタッフが空き状況を確認し、店舗からの
『予約確定メール』または『お電話』をもって
予約完了となります。

ホットペッパー等のリアルタイム予約と
タイムラグがあるため、ご希望に添えない場合が
ございます。あらかじめご了承下さい。

━━━━━━━━━━━━━━━━━━━━━━━━
  ■ 重要：お電話番号について
━━━━━━━━━━━━━━━━━━━━━━━━

以下の電話番号からおかけいたします。

【TEL: 050-8884-8993】

※知らない番号からの着信を警戒される方が
増えております。恐れ入りますが、
スムーズにご連絡できるよう、
上記番号からの着信に出られるよう
お願いいたします。

━━━━━━━━━━━━━━━━━━━━━━━━
  ご予約リクエスト内容
━━━━━━━━━━━━━━━━━━━━━━━━

【氏名】{$name}
【フリガナ】{$furigana}
【電話番号】{$tel}
【メールアドレス】{$email}

【第1希望】{$wish1}
【第2希望】{$wish2}
【第3希望】{$wish3}

【ご希望コース】{$course}

【お身体のお悩み・備考】
{$body}

━━━━━━━━━━━━━━━━━━━━━━━━

お問い合わせ・ご不明点がございましたら
お気軽にご連絡ください。

ストレッチゼロ 甲府上阿原店
TEL: 050-8884-8993
MAIL: info@majistretch.com
営業時間: 9:00〜22:00（完全予約制）

━━━━━━━━━━━━━━━━━━━━━━━━
EOT;

// --- メール送信 ---
try {
    // 店舗宛
    $mail_shop = createMailer();
    $mail_shop->addAddress(MAIL_TO_SHOP);
    $mail_shop->addAddress(MAIL_TO_FORWARD);
    $mail_shop->addReplyTo($email, $name);
    $mail_shop->Subject = "【WEB予約】{$name} 様よりご予約リクエスト";
    $mail_shop->Body = $body_shop;
    $mail_shop->send();

    // 顧客宛自動返信
    $mail_auto = createMailer();
    $mail_auto->addAddress($email, $name);
    $mail_auto->addBCC(MAIL_TO_FORWARD);
    $mail_auto->Subject = '【ストレッチゼロ】ご予約リクエストを受け付けました';
    $mail_auto->Body = $body_auto;
    $mail_auto->send();

    echo json_encode(['success' => true, 'message' => '予約リクエストを送信しました。']);

} catch (Exception $e) {
    error_log('MajiStretch mail error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => '送信に失敗しました。お手数ですがお電話（050-8884-8993）にてご予約ください。']);
}
