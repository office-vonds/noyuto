<?php
mb_language("Japanese");
mb_internal_encoding("UTF-8");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'POST only']);
    exit;
}

// Gmail SMTP設定
$smtp_host = 'ssl://smtp.gmail.com';
$smtp_port = 465;
$smtp_user = 'office.vonds@gmail.com';
$smtp_pass = 'tnskewjdqnnggkgp';
$to = 'office.vonds@gmail.com';

// ラジオボタン値→日本語
$val_map = [
    'area1'=>'地域限定（区町村単位）','area2'=>'都道府県単位','area3'=>'全国対応','area4'=>'オンライン（地域不問）',
    'pt1'=>'LP（広告専用ランディングページ）','pt2'=>'コーポレートサイト','pt3'=>'サービスサイト','pt4'=>'ECサイト','pt5'=>'既存サイトのリニューアル','pt6'=>'その他',
    'pr1'=>'コンバージョンを増やす','pr2'=>'ブランドイメージを作る','pr3'=>'SEOで検索上位を取る','pr4'=>'競合との差別化','pr5'=>'採用・リクルート強化',
    'g1'=>'男性','g2'=>'女性','g3'=>'どちらも',
    'price1'=>'低価格帯','price2'=>'標準価格帯','price3'=>'高価格帯',
    'ph1'=>'写真が揃っている','ph2'=>'一部ある','ph3'=>'素材がない','ph4'=>'プロ撮影も検討',
    'tx1'=>'原稿がある','tx2'=>'大まかに決まっている','tx3'=>'VONDSに依頼したい',
    'dm1'=>'ドメイン・サーバーあり','dm2'=>'既存あるが新しくしたい','dm3'=>'まだない','dm4'=>'わからない（相談したい）',
    'up1'=>'自分で更新したい','up2'=>'VONDSに依頼したい','up3'=>'ほぼ更新なし',
];

// フィールド名→日本語ラベル
$labels = [
    'company'=>'会社名（屋号）','company_name'=>'会社名','name'=>'ご担当者名','your_name'=>'ご担当者名',
    'email'=>'メールアドレス','mail'=>'メールアドレス','phone'=>'電話番号','tel'=>'電話番号',
    'business'=>'事業内容','service'=>'事業内容','area'=>'営業エリア',
    'website'=>'現在のサイトURL','url'=>'現在のサイトURL','current_url'=>'現在のサイトURL',
    'reason'=>'WEB制作のきっかけ','background'=>'WEB制作のきっかけ',
    'problem'=>'集客で困っていること','pagetype'=>'制作するページの種類',
    'conversion'=>'コンバージョン目標','cv_goal'=>'コンバージョン目標',
    'important'=>'一番大切にしたいこと','priority'=>'一番大切にしたいこと',
    'deadline'=>'公開希望時期','schedule'=>'公開希望時期','budget'=>'制作予算の目安',
    'target'=>'メインターゲット','target_issue'=>'ターゲットの悩み・課題','pain'=>'ターゲットの悩み',
    'strength'=>'貴社の強み・差別化ポイント','competitor'=>'競合情報',
    'gender'=>'ターゲット性別','price'=>'価格帯','design'=>'デザインの雰囲気',
    'design_color'=>'デザインカラー','color'=>'デザインカラー',
    'photo'=>'写真・画像素材','text'=>'テキスト原稿','domain'=>'ドメイン・サーバー',
    'update'=>'公開後の更新・運用','ads'=>'広告運用','note'=>'その他ご要望',
    'message'=>'その他ご要望','remarks'=>'備考',
    'cost'=>'費用の優先度','speed'=>'スピードの優先度','quality'=>'クオリティの優先度',
    'logo'=>'ロゴデータ',
];

// フォームデータ整形
$company = ''; $cname = ''; $cemail = '';
$body_lines = [];

foreach ($_POST as $key => $value) {
    $v = trim($value);
    if ($v === '' || $v === 'undefined') continue;
    if (preg_match('/example\.com/', $v)) continue;
    if (preg_match('/^0{3}/', $v)) continue;

    // 値を変換
    $display_val = isset($val_map[$v]) ? $val_map[$v] : $v;
    if ($display_val === 'on') continue; // チェックボックスの"on"は飛ばす

    // ラベルを変換
    $label = isset($labels[$key]) ? $labels[$key] : $key;

    $body_lines[] = "【{$label}】\n{$display_val}";

    if (in_array($key, ['company','company_name'])) $company = $v;
    if (in_array($key, ['name','your_name'])) $cname = $v;
    if (in_array($key, ['email','mail'])) $cemail = $v;
}

// 件名
$subject = 'VONDSヒアリングシート';
if ($company) $subject .= " {$company}";
if ($cname) $subject .= " {$cname}様";

// 本文
$body = "VONDSヒアリングシート 新規回答\n";
$body .= "受信: " . date('Y/m/d H:i') . "\n";
$body .= str_repeat('=', 40) . "\n\n";
$body .= implode("\n\n", $body_lines);
$body .= "\n\n" . str_repeat('=', 40) . "\n";
$body .= "https://vonds.co.jp/hearing/\n";

// Gmail SMTP送信
function smtp_send($host, $port, $user, $pass, $from, $to_addr, $subj, $msg, $reply_to='') {
    $sock = fsockopen($host, $port, $errno, $errstr, 30);
    if (!$sock) return false;

    $resp = fgets($sock, 512);

    fputs($sock, "EHLO vonds.co.jp\r\n");
    do { $resp = fgets($sock, 512); } while (strpos($resp, '250 ') !== 0 && strpos($resp, '250-') === 0);

    fputs($sock, "AUTH LOGIN\r\n");
    $resp = fgets($sock, 512);

    fputs($sock, base64_encode($user) . "\r\n");
    $resp = fgets($sock, 512);

    fputs($sock, base64_encode($pass) . "\r\n");
    $resp = fgets($sock, 512);
    if (strpos($resp, '235') !== 0) { fclose($sock); return false; }

    fputs($sock, "MAIL FROM:<{$from}>\r\n");
    $resp = fgets($sock, 512);

    fputs($sock, "RCPT TO:<{$to_addr}>\r\n");
    $resp = fgets($sock, 512);

    fputs($sock, "DATA\r\n");
    $resp = fgets($sock, 512);

    $encoded_subj = '=?UTF-8?B?' . base64_encode($subj) . '?=';
    $headers = "From: {$from}\r\n";
    $headers .= "To: {$to_addr}\r\n";
    $headers .= "Subject: {$encoded_subj}\r\n";
    if ($reply_to) $headers .= "Reply-To: {$reply_to}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: base64\r\n";
    $headers .= "\r\n";
    $headers .= chunk_split(base64_encode($msg));
    $headers .= "\r\n.\r\n";

    fputs($sock, $headers);
    $resp = fgets($sock, 512);
    $ok = (strpos($resp, '250') === 0);

    fputs($sock, "QUIT\r\n");
    fclose($sock);
    return $ok;
}

// 管理者向けメール送信
$result = smtp_send($smtp_host, $smtp_port, $smtp_user, $smtp_pass,
    $smtp_user, $to, $subject, $body, $cemail);

// 自動返信
if ($result && $cemail) {
    $auto_subj = '【オフィスVONDS】ヒアリングシートを受け付けました';
    $auto_body = ($cname ?: 'お客') . "様\n\n";
    $auto_body .= "ヒアリングシートにご記入いただきありがとうございます。\n";
    $auto_body .= "内容を確認の上、3営業日以内にご連絡いたします。\n\n";
    $auto_body .= "━━━━━━━━━━━━━━━━━━\n";
    $auto_body .= "株式会社オフィスVONDS\n";
    $auto_body .= "TEL: 055-269-7220\n";
    $auto_body .= "MAIL: office.vonds@gmail.com\n";
    $auto_body .= "URL: https://vonds.co.jp/\n";
    $auto_body .= "━━━━━━━━━━━━━━━━━━\n";

    smtp_send($smtp_host, $smtp_port, $smtp_user, $smtp_pass,
        $smtp_user, $cemail, $auto_subj, $auto_body);
}

echo json_encode(['status' => $result ? 'success' : 'error',
    'message' => $result ? '送信完了' : '送信失敗']);
?>
