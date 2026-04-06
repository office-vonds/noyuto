<?php
// ===== 予約フォーム処理 =====
// 送信先: info@majistretch.com
// 自動返信メール付き

header('Content-Type: application/json; charset=UTF-8');

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

// --- 店舗宛メール ---
$to_shop   = 'info@majistretch.com';
$subject_shop = "【WEB予約】{$name} 様よりご予約リクエスト";
$headers_shop = implode("\r\n", [
    'From: info@majistretch.com',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
]);

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
$subject_auto = '【本気ストレッチ】ご予約リクエストを受け付けました';
$headers_auto = implode("\r\n", [
    'From: info@majistretch.com',
    'Content-Type: text/plain; charset=UTF-8',
]);

$body_auto = <<<EOT
{$name} 様

この度は、ストレッチゼロ/本気ストレッチへご予約のリクエストをいただき、誠にありがとうございます。

【重要】本メールは『仮予約』となります。

スタッフが空き状況を確認し、店舗からの『予約確定メール』または『お電話』をもって予約完了となります。
ホットペッパー等のリアルタイム予約とタイムラグがあるため、ご希望に添えない場合がございます。あらかじめご了承下さい。

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

本気ストレッチ 甲府上阿原店
TEL: 050-8884-8993
MAIL: info@majistretch.com
営業時間: 9:00〜22:00（完全予約制）

━━━━━━━━━━━━━━━━━━━━━━━━
EOT;

// --- メール送信 ---
$sent_shop = mb_send_mail($to_shop, $subject_shop, $body_shop, $headers_shop);
$sent_auto = mb_send_mail($email, $subject_auto, $body_auto, $headers_auto);

if ($sent_shop) {
    echo json_encode(['success' => true, 'message' => '予約リクエストを送信しました。']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => '送信に失敗しました。お手数ですがお電話にてご予約ください。']);
}
