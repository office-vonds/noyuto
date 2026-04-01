#!/bin/bash
# VONDSヒアリングシート — メール本文＋迷惑メール修正
# メインPCで実行: bash ~/noyuto/fix_hearing_v2.sh

set -e

FTP_HOST="sv1092.wpx.ne.jp"
FTP_USER="vonds.co.jp"
FTP_PASS="kiryu0902"
FTP_OPTS="set ftp:ssl-force true; set ssl:verify-certificate false"
WORK_DIR=~/noyuto/hearing_work

echo "=========================================="
echo "VONDS ヒアリングシート メール修正 v2"
echo "=========================================="

cd "$WORK_DIR"

# send_hearing.php を全面書き換え
echo "[1/2] メール送信ハンドラーを修正中..."

cat > ./hearing/send_hearing.php << 'PHPEOF'
<?php
// VONDS ヒアリングシート — メール送信ハンドラー v2
// 送信先: office.vonds@gmail.com

mb_language("Japanese");
mb_internal_encoding("UTF-8");

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'POST only']);
    exit;
}

$to = 'office.vonds@gmail.com';

// ============================
// フィールド名 → 日本語ラベル マッピング
// ============================
$field_labels = [
    // 基本情報
    'company' => '会社名（屋号）',
    'company_name' => '会社名（屋号）',
    'name' => 'ご担当者名',
    'your_name' => 'ご担当者名',
    'email' => 'メールアドレス',
    'mail' => 'メールアドレス',
    'phone' => '電話番号',
    'tel' => '電話番号',
    'business' => '事業内容・提供しているサービス',
    'service' => '事業内容・提供しているサービス',

    // 営業エリア
    'area' => '営業エリア',

    // ウェブ制作関連
    'website' => '現在のウェブサイトURL',
    'url' => '現在のウェブサイトURL',
    'current_url' => '現在のウェブサイトURL',
    'reason' => '今回WEB制作を依頼しようと思ったきっかけ・背景',
    'background' => '今回WEB制作を依頼しようと思ったきっかけ・背景',
    'problem' => '現状のウェブ集客で困っていること',
    'pagetype' => '今回制作するページの種類',
    'page_type' => '今回制作するページの種類',
    'conversion' => 'ユーザーに最終的にしてほしい行動（コンバージョン）',
    'cv_goal' => 'コンバージョン目標',
    'important' => '今回の制作で一番大切にしたいこと',

    // スケジュール・予算
    'deadline' => '公開希望時期',
    'schedule' => '公開希望時期',
    'budget' => '制作予算の目安',

    // ターゲット
    'target' => 'メインターゲットの属性',
    'target_issue' => 'ターゲットが抱えている悩み・課題',
    'pain' => 'ターゲットが抱えている悩み・課題',
    'strength' => '貴社の強み・差別化ポイント',
    'competitor' => '競合情報',

    // 制作方針
    'priority' => '制作で一番大切にしたいこと',
    'gender' => 'メインターゲットの性別',
    'price' => '価格帯の位置づけ',
    'design' => 'デザインの雰囲気',
    'design_color' => 'デザインカラー',
    'color' => 'デザインカラー',
    'logo' => 'ロゴデータ',
    'photo' => '写真・画像素材の準備状況',
    'content' => '掲載したい主なコンテンツ',
    'text' => 'サイト文章（テキスト原稿）の準備状況',
    'domain' => 'ドメイン・サーバーの状況',
    'update' => '公開後の更新・運用',
    'ads' => '広告運用について',
    'cost' => '費用の優先度',
    'speed' => 'スピードの優先度',
    'quality' => 'クオリティの優先度',
    'note' => 'その他ご要望・備考',
    'message' => 'その他ご要望・備考',
    'remarks' => 'その他ご要望・備考',
];

// ラジオボタン・チェックボックスの値 → 日本語変換
$value_labels = [
    // 営業エリア
    'area1' => '地域限定（区町村単位）',
    'area2' => '都道府県単位',
    'area3' => '全国対応',
    'area4' => 'オンライン（地域不問）',

    // ページの種類
    'pt1' => 'LP（広告専用ランディングページ）',
    'pt2' => 'コーポレートサイト（会社紹介）',
    'pt3' => 'サービスサイト（特定サービスの紹介）',
    'pt4' => 'ECサイト（商品販売）',
    'pt5' => '既存サイトのリニューアル',
    'pt6' => 'その他',

    // 大切にしたいこと
    'pr1' => 'コンバージョン（問い合わせ/予約数）を増やす',
    'pr2' => 'ブランドイメージを作る（信頼感を出す）',
    'pr3' => 'SEOで検索上位を取る・長期的な集客資産を作る',
    'pr4' => '競合との差別化を明確にする',
    'pr5' => '採用・リクルート強化',

    // 性別
    'g1' => '男性',
    'g2' => '女性',
    'g3' => 'どちらも',

    // 価格帯
    'price1' => '低価格帯（競合より安い・気軽に始める）',
    'price2' => '標準価格帯（相場と同じくらい）',
    'price3' => '高価格帯（質・専門性で高単価を正当化する）',

    // 写真
    'ph1' => '店舗・スタッフ・サービスの写真が揃っている',
    'ph2' => '一部ある（追加が必要）',
    'ph3' => '素材がない（VONDSのストック素材を利用したい）',
    'ph4' => 'プロカメラマンによる撮影も検討している',

    // テキスト原稿
    'tx1' => '原稿がある（データで提供できる）',
    'tx2' => '大まかに決まっているが、整理が必要',
    'tx3' => 'まだ（VONDSに原稿作成も依頼したい）',

    // ドメイン・サーバー
    'dm1' => 'ドメイン・サーバーがある（そのまま使いたい）',
    'dm2' => '既存があるが、新しくしたい（もしくは取得・契約したい）',
    'dm3' => 'まだない（一から取得したい）',
    'dm4' => 'わからない（VONDSに相談したい）',

    // 更新・運用
    'up1' => '自分（クライアント側）で更新できるようにしたい',
    'up2' => 'VONDSに運用・更新も依頼したい',
    'up3' => '公開したらほぼ更新なし（決まっていない）',

    // on値
    'on' => '選択済み',
];

// ============================
// フォームデータ収集・整形
// ============================
$fields = [];
$company = '';
$contact_name = '';
$contact_email = '';

foreach ($_POST as $key => $value) {
    $clean_value = trim($value);
    if ($clean_value === '' || $clean_value === 'undefined') continue;

    // プレースホルダーっぽい値を除外
    if (preg_match('/example\.com|000.*000/', $clean_value)) continue;

    // ラジオボタン・チェックボックスの値を変換
    if (isset($value_labels[$clean_value])) {
        $clean_value = $value_labels[$clean_value];
    } elseif ($clean_value === 'on') {
        $clean_value = '✓ 選択';
    }

    // フィールド名を日本語ラベルに変換
    $label = isset($field_labels[$key]) ? $field_labels[$key] : $key;

    $fields[$label] = htmlspecialchars($clean_value, ENT_QUOTES, 'UTF-8');

    // 特定フィールドを抽出
    if (in_array($key, ['company', 'company_name'])) $company = $clean_value;
    if (in_array($key, ['name', 'your_name'])) $contact_name = $clean_value;
    if (in_array($key, ['email', 'mail'])) $contact_email = $clean_value;
}

// ============================
// メール本文を組み立て
// ============================
$subject = '【VONDSヒアリングシート】';
if ($company) $subject .= $company;
if ($contact_name) $subject .= ' ' . $contact_name . '様';
if (!$company && !$contact_name) $subject .= '新規お問い合わせ';

$body = "";
$body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$body .= "  VONDSヒアリングシート 新規回答\n";
$body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$body .= "受信日時: " . date('Y年m月d日 H:i') . "\n";
$body .= "送信元: https://vonds.co.jp/hearing/\n\n";

// セクション分け
$sections = [
    '基本情報' => ['会社名（屋号）', 'ご担当者名', 'メールアドレス', '電話番号', '事業内容・提供しているサービス', '営業エリア'],
    'ウェブ制作の目的' => ['今回WEB制作を依頼しようと思ったきっかけ・背景', '現状のウェブ集客で困っていること', '今回制作するページの種類', 'ユーザーに最終的にしてほしい行動（コンバージョン）', 'コンバージョン目標', '今回の制作で一番大切にしたいこと', '制作で一番大切にしたいこと'],
    'ターゲット' => ['メインターゲットの属性', 'メインターゲットの性別', 'ターゲットが抱えている悩み・課題', '貴社の強み・差別化ポイント', '競合情報', '価格帯の位置づけ'],
    'デザイン・素材' => ['デザインの雰囲気', 'デザインカラー', 'ロゴデータ', '写真・画像素材の準備状況', '掲載したい主なコンテンツ', 'サイト文章（テキスト原稿）の準備状況'],
    'インフラ・運用' => ['現在のウェブサイトURL', 'ドメイン・サーバーの状況', '公開後の更新・運用', '公開希望時期', '制作予算の目安', '広告運用について'],
    '優先順位' => ['費用の優先度', 'スピードの優先度', 'クオリティの優先度'],
    'その他' => ['その他ご要望・備考'],
];

$used_keys = [];

foreach ($sections as $section_name => $section_fields) {
    $section_content = "";
    foreach ($section_fields as $field_name) {
        if (isset($fields[$field_name]) && $fields[$field_name] !== '') {
            $section_content .= "  " . $field_name . "\n";
            $section_content .= "  → " . $fields[$field_name] . "\n\n";
            $used_keys[] = $field_name;
        }
    }
    if ($section_content) {
        $body .= "【" . $section_name . "】\n";
        $body .= $section_content;
    }
}

// 未分類フィールドも出力
$remaining = array_diff_key($fields, array_flip($used_keys));
if (!empty($remaining)) {
    $body .= "【その他の回答】\n";
    foreach ($remaining as $key => $value) {
        if ($value !== '' && $value !== '✓ 選択') {
            $body .= "  " . $key . "\n";
            $body .= "  → " . $value . "\n\n";
        }
    }
}

$body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$body .= "株式会社オフィスVONDS\n";
$body .= "https://vonds.co.jp/\n";

// ============================
// メール送信
// ============================
$headers = "From: office.vonds@gmail.com\r\n";
if ($contact_email) {
    $headers .= "Reply-To: " . $contact_email . "\r\n";
}
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";

$result = mb_send_mail($to, $subject, $body, $headers);

// 自動返信
if ($result && $contact_email) {
    $auto_subject = '【オフィスVONDS】ヒアリングシートを受け付けました';
    $auto_body = "";
    if ($contact_name) {
        $auto_body .= $contact_name . "様\n\n";
    } else {
        $auto_body .= "お客様\n\n";
    }
    $auto_body .= "この度はヒアリングシートにご記入いただき、\n";
    $auto_body .= "誠にありがとうございます。\n\n";
    $auto_body .= "内容を確認の上、3営業日以内に\n";
    $auto_body .= "担当者よりご連絡させていただきます。\n\n";
    $auto_body .= "ご不明な点がございましたら、\n";
    $auto_body .= "お気軽にお問い合わせください。\n\n";
    $auto_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $auto_body .= "株式会社オフィスVONDS\n";
    $auto_body .= "TEL: 055-269-7220\n";
    $auto_body .= "MAIL: office.vonds@gmail.com\n";
    $auto_body .= "URL: https://vonds.co.jp/\n";
    $auto_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $auto_headers = "From: office.vonds@gmail.com\r\n";
    $auto_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $auto_headers .= "MIME-Version: 1.0\r\n";
    mb_send_mail($contact_email, $auto_subject, $auto_body, $auto_headers);
}

if ($result) {
    echo json_encode(['status' => 'success', 'message' => '送信完了']);
} else {
    echo json_encode(['status' => 'error', 'message' => '送信に失敗しました']);
}
?>
PHPEOF

echo "  send_hearing.php 修正完了"

# アップロード
echo "[2/2] サーバーにアップロード中..."
lftp -u "$FTP_USER","$FTP_PASS" -e "$FTP_OPTS; put ./hearing/send_hearing.php -o hearing/send_hearing.php; quit" "$FTP_HOST"

echo ""
echo "=========================================="
echo "修正完了！"
echo "=========================================="
echo ""
echo "修正内容:"
echo "  1. フィールド名を全て日本語ラベルに変換"
echo "  2. ラジオボタン値を日本語に変換（area1→地域限定 等）"
echo "  3. セクション分けで見やすく整形"
echo "  4. From を office.vonds@gmail.com に変更（迷惑メール対策）"
echo "  5. プレースホルダー値を除外"
echo ""
echo "テスト送信してください: https://vonds.co.jp/hearing/"
