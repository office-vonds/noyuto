<?php
// ===== 予約フォーム処理（PHPMailer + Google Workspace SMTP） =====
// 送信先: info@majistretch.com + yuki.nakagomi@sanken-gr.com
// 自動返信メール付き

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
    $mail_auto->Subject = '【ストレッチゼロ】ご予約リクエストを受け付けました';
    $mail_auto->Body = $body_auto;
    $mail_auto->send();

    echo json_encode(['success' => true, 'message' => '予約リクエストを送信しました。']);

} catch (Exception $e) {
    error_log('MajiStretch mail error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => '送信に失敗しました。お手数ですがお電話（050-8884-8993）にてご予約ください。']);
}
