#!/bin/bash
# VONDS ヒアリングシート — フォーム送信先設定スクリプト
# メインPCで実行: bash ~/noyuto/setup_hearing.sh

set -e

FTP_HOST="sv1092.wpx.ne.jp"
FTP_USER="vonds.co.jp"
FTP_PASS="kiryu0902"
FTP_OPTS="set ftp:ssl-force true; set ssl:verify-certificate false"
WORK_DIR=~/noyuto/hearing_work
SEND_TO="office.vonds@gmail.com"

echo "=========================================="
echo "VONDS ヒアリングシート セットアップ"
echo "=========================================="

# 1. 作業ディレクトリ準備
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# 2. hearingディレクトリの中身をダウンロード
echo "[1/4] ヒアリングページをダウンロード中..."
lftp -u "$FTP_USER","$FTP_PASS" -e "$FTP_OPTS; mirror hearing/ ./hearing/; quit" "$FTP_HOST"
echo "  ダウンロード完了"

# 3. フォームの構造を確認して表示
echo ""
echo "[2/4] フォーム構造を確認中..."
echo "  ファイル一覧:"
find ./hearing/ -type f | sort
echo ""

# HTMLファイルを探す
HTML_FILE=$(find ./hearing/ -name "*.html" -o -name "*.php" | head -1)
if [ -z "$HTML_FILE" ]; then
    echo "  HTMLファイルが見つかりません"
    echo "  ファイル内容:"
    ls -la ./hearing/
    exit 1
fi
echo "  メインファイル: $HTML_FILE"

# 4. PHPメール送信ハンドラーを作成
echo ""
echo "[3/4] メール送信ハンドラーを作成中..."
cat > ./hearing/send_hearing.php << 'PHPEOF'
<?php
// VONDS ヒアリングシート — メール送信ハンドラー
// 送信先: office.vonds@gmail.com

header('Content-Type: application/json; charset=utf-8');

$to = 'office.vonds@gmail.com';
$subject_prefix = '【VONDSヒアリングシート】';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'POST only']);
    exit;
}

// フォームデータを収集
$fields = [];
foreach ($_POST as $key => $value) {
    $fields[$key] = htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

// 会社名・名前を取得（フォームのfield名に応じて調整）
$company = $fields['company'] ?? $fields['company_name'] ?? $fields['会社名'] ?? '';
$name = $fields['name'] ?? $fields['your_name'] ?? $fields['お名前'] ?? $fields['担当者名'] ?? '';
$email = $fields['email'] ?? $fields['mail'] ?? $fields['メールアドレス'] ?? '';
$phone = $fields['phone'] ?? $fields['tel'] ?? $fields['電話番号'] ?? '';

// 件名
$subject = $subject_prefix;
if ($company) $subject .= $company;
if ($name) $subject .= ' ' . $name . '様';
if (!$company && !$name) $subject .= '新規お問い合わせ';

// 本文を組み立て
$body = "━━━━━━━━━━━━━━━━━━\n";
$body .= "VONDSヒアリングシート 回答\n";
$body .= "━━━━━━━━━━━━━━━━━━\n\n";
$body .= "受信日時: " . date('Y年m月d日 H:i:s') . "\n\n";

foreach ($fields as $key => $value) {
    if ($value !== '') {
        // フィールド名を読みやすく
        $label = str_replace(['_', '-'], ' ', $key);
        $body .= "■ " . $label . "\n";
        $body .= $value . "\n\n";
    }
}

$body .= "━━━━━━━━━━━━━━━━━━\n";
$body .= "このメールはVONDSヒアリングシートから自動送信されました。\n";
$body .= "https://vonds.co.jp/hearing/\n";

// メールヘッダー
$headers = "From: noreply@vonds.co.jp\r\n";
$headers .= "Reply-To: " . ($email ?: 'noreply@vonds.co.jp') . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: VONDS-Hearing-Form\r\n";

// 送信
$result = mb_send_mail($to, $subject, $body, $headers);

if ($result) {
    // 自動返信（送信者にも確認メール）
    if ($email) {
        $auto_subject = '【オフィスVONDS】ヒアリングシートを受け付けました';
        $auto_body = ($name ?: 'お客') . "様\n\n";
        $auto_body .= "この度はヒアリングシートにご記入いただき、ありがとうございます。\n";
        $auto_body .= "内容を確認の上、担当者よりご連絡させていただきます。\n\n";
        $auto_body .= "━━━━━━━━━━━━━━━━━━\n";
        $auto_body .= "株式会社オフィスVONDS\n";
        $auto_body .= "TEL: 055-269-7220\n";
        $auto_body .= "MAIL: office.vonds@gmail.com\n";
        $auto_body .= "URL: https://vonds.co.jp/\n";
        $auto_body .= "━━━━━━━━━━━━━━━━━━\n";

        $auto_headers = "From: office.vonds@gmail.com\r\n";
        $auto_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        mb_send_mail($email, $auto_subject, $auto_body, $auto_headers);
    }

    echo json_encode(['status' => 'success', 'message' => '送信完了']);
} else {
    echo json_encode(['status' => 'error', 'message' => '送信に失敗しました']);
}
?>
PHPEOF

echo "  send_hearing.php 作成完了"

# 5. HTMLファイルのフォーム送信先を変更
echo ""
echo "[4/4] フォーム送信先を変更中..."

# form actionをsend_hearing.phpに変更
if grep -q 'action=' "$HTML_FILE" 2>/dev/null; then
    # action属性を変更
    sed -i 's|action="[^"]*"|action="send_hearing.php"|g' "$HTML_FILE"
    echo "  form action を send_hearing.php に変更"
fi

# もしJavaScriptでfetchやXMLHttpRequestで送信している場合
if grep -q 'fetch\|XMLHttpRequest\|ajax\|submit' "$HTML_FILE" 2>/dev/null; then
    echo "  ※ JavaScriptによるフォーム送信を検出。手動確認が必要な場合があります"
fi

# method="post"を確認
if ! grep -q 'method="post"' "$HTML_FILE" 2>/dev/null; then
    sed -i 's|method="[^"]*"|method="post"|g' "$HTML_FILE" 2>/dev/null
fi

echo ""
echo "  変更後のフォーム部分:"
grep -n -i 'form\|action\|method\|submit' "$HTML_FILE" 2>/dev/null | head -10
echo ""

# 6. アップロード
echo "変更をサーバーにアップロード中..."
lftp -u "$FTP_USER","$FTP_PASS" -e "$FTP_OPTS; mirror -R ./hearing/ hearing/; quit" "$FTP_HOST"

echo ""
echo "=========================================="
echo "完了！"
echo "=========================================="
echo ""
echo "送信先: $SEND_TO"
echo "URL: https://vonds.co.jp/hearing/"
echo ""
echo "テスト送信してください。"
echo "office.vonds@gmail.com にメールが届けば成功です。"
