<?php
/**
 * Plugin Name: BAR KOFU SEO Boost
 * Description: 山梨BAR・甲府BAR・山梨バー・甲府バー KW上位獲得のためのSEO強化（LocalBusiness / FAQ / h1補強 / 画像alt）
 * Version: 1.0.0
 * Author: office VONDS
 */

if (!defined('ABSPATH')) exit;

// ─────────────────────────────────────────────
// 1. LocalBusinessスキーマ（BarOrRestaurant）— 甲府BAR・山梨BAR
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => ['BarOrRestaurant', 'NightClub'],
        '@id' => 'https://bar-kofu.com/#barorrestaurant',
        'name' => 'BAR KOFU（バー・コウフ）',
        'description' => '山梨県甲府市の深夜まで楽しめる大人の隠れ家BAR。甲府・山梨のアフターバーとして、お仕事帰りの一杯・二軒目・カラオケ利用にも。広めの駐車場完備・深夜12時以降営業。',
        'url' => 'https://bar-kofu.com/',
        'telephone' => '+81-55-287-6458',
        'image' => 'https://bar-kofu.com/wp-content/uploads/2025/07/cropped-barkofu-logo.300-169.png',
        'priceRange' => '¥¥',
        'servesCuisine' => ['BAR', 'カクテル', 'スープカレー'],
        'acceptsReservations' => true,
        'smokingAllowed' => false,
        'address' => [
            '@type' => 'PostalAddress',
            'addressCountry' => 'JP',
            'addressRegion' => '山梨県',
            'addressLocality' => '甲府市',
            'streetAddress' => '（ACCESSページ参照）',
        ],
        'areaServed' => [
            ['@type' => 'City', 'name' => '甲府市'],
            ['@type' => 'AdministrativeArea', 'name' => '山梨県'],
        ],
        'openingHoursSpecification' => [
            [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
                'opens' => '20:00',
                'closes' => '03:00',
            ],
        ],
        'amenityFeature' => [
            ['@type' => 'LocationFeatureSpecification', 'name' => '駐車場完備', 'value' => true],
            ['@type' => 'LocationFeatureSpecification', 'name' => '深夜営業', 'value' => true],
            ['@type' => 'LocationFeatureSpecification', 'name' => 'アフターバー利用可', 'value' => true],
            ['@type' => 'LocationFeatureSpecification', 'name' => 'カラオケあり', 'value' => true],
        ],
        'sameAs' => [
            'https://www.instagram.com/bar_kofu0620/',
        ],
        'knowsAbout' => ['甲府BAR', '山梨BAR', '甲府バー', '山梨バー', 'アフターバー', '深夜営業BAR', 'カクテル', 'カラオケバー'],
    ];
    echo "\n<script type=\"application/ld+json\" id=\"bar-kofu-localbusiness\">"
        . wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        . "</script>\n";
}, 30);

// ─────────────────────────────────────────────
// 2. FAQPageスキーマ — ロングテール検索で拾われる
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    $faqs = [
        ['BAR KOFUの営業時間は？', 'BAR KOFUは夜20時から深夜3時頃まで営業しています。甲府・山梨で深夜までお楽しみいただけるBARです。'],
        ['甲府駅・甲府市中心部からのアクセスは？', '甲府市内の商業圏から少しだけ離れた立地で、車でのご来店にもアクセスしやすい環境です。広めの駐車場を完備しています。'],
        ['駐車場はありますか？', 'はい。BAR KOFUは広めの駐車場を完備しておりますので、車でのご来店にもご利用いただけます。'],
        ['深夜のアフターバーとして使えますか？', 'はい。甲府・山梨で深夜12時以降も営業しているBARです。一軒目のお店が閉まった後の「二軒目」「アフターバー」としてもご利用いただけます。'],
        ['カラオケはできますか？', 'はい。BAR KOFUはカラオケでも盛り上がれる店内設計です。お仕事帰りのストレス発散・ご友人との二軒目使いにご活用ください。'],
        ['予約は必要ですか？', '混雑時や団体ご利用の場合は事前予約をおすすめします。CONTACTページからお問い合わせください。'],
        ['山梨県内で深夜営業しているBARは珍しい？', '山梨県・甲府市では深夜3時まで営業しているBARは限られています。BAR KOFUは甲府市・山梨県のアフターバー需要にお応えする貴重なお店です。'],
        ['どんな年齢層が利用していますか？', '20代後半〜50代の大人の男女にご利用いただいております。落ち着いた雰囲気の隠れ家的BARとして、デートや接待にも最適です。'],
    ];
    $items = [];
    foreach ($faqs as $f) {
        $items[] = [
            '@type' => 'Question',
            'name' => $f[0],
            'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f[1]],
        ];
    }
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'FAQPage',
        'mainEntity' => $items,
    ];
    echo "\n<script type=\"application/ld+json\" id=\"bar-kofu-faqpage\">"
        . wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        . "</script>\n";
}, 31);

// ─────────────────────────────────────────────
// 3. h1 補強 — 画面非表示のSEO用h1を本文先頭に挿入（KW含む）
// ─────────────────────────────────────────────
add_filter('the_content', function($content) {
    if (!is_front_page() || is_admin()) return $content;
    $seo_h1 = '<h1 class="bar-kofu-seo-h1" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">山梨BAR・甲府BARなら BAR KOFU（バー・コウフ） — 深夜営業・アフターバー・カラオケ対応</h1>';
    return $seo_h1 . $content;
}, 5);

// ─────────────────────────────────────────────
// 4. 画像alt自動補完 — alt空の画像に山梨BAR・甲府BARKW含むaltを付与
// ─────────────────────────────────────────────
add_filter('wp_get_attachment_image_attributes', function($attr, $attachment) {
    if (empty($attr['alt'])) {
        $attr['alt'] = 'BAR KOFU（バー・コウフ） 山梨BAR・甲府BAR・深夜営業';
    }
    return $attr;
}, 10, 2);

// ─────────────────────────────────────────────
// 5. AIOSEO の description を最適化（AIOSEO無効時のfallback）
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    // AIOSEOが既に description を出力している場合は重複回避
    // ここでは追加のKW meta keywords (参考値)
    $kw = '山梨BAR,甲府BAR,山梨バー,甲府バー,甲府 深夜 BAR,甲府 アフターバー,山梨 深夜営業,BAR KOFU,バーコウフ,甲府 カラオケバー';
    echo "<meta name=\"keywords\" content=\"$kw\">\n";
}, 5);

// ─────────────────────────────────────────────
// 6. トップページ本文にKW埋込テキスト（AIOSEO description補強と合わせてロングテール獲得）
// ─────────────────────────────────────────────
add_filter('the_content', function($content) {
    if (!is_front_page()) return $content;
    $seo_text = '<section class="bar-kofu-seo-text" style="background:#1a1a1a;color:#d4af37;padding:50px 20px;text-align:center;margin-top:40px;">
<h2 style="color:#d4af37;font-size:1.8em;margin-bottom:16px;">山梨・甲府で深夜も楽しめるBAR</h2>
<p style="color:#ccc;max-width:800px;margin:0 auto 12px;line-height:1.9;">
<strong style="color:#d4af37;">山梨BAR・甲府BAR</strong>をお探しなら、BAR KOFU（バー・コウフ）。
甲府市の商業圏から少し離れた落ち着いた立地に、広めの駐車場を完備した<strong>大人の隠れ家的なBAR</strong>。
深夜12時以降も営業しているため、甲府・山梨の<strong>アフターバー</strong>としてもご利用いただけます。
</p>
<p style="color:#ccc;max-width:800px;margin:0 auto 12px;line-height:1.9;">
お仕事帰りの一杯、<strong>二軒目利用</strong>、<strong>カラオケで盛り上がりたい</strong>とき、
ご友人との語らい、デートや接待まで、さまざまなシーンで<strong>甲府・山梨のBAR</strong>としてご活用ください。
山梨県内でも深夜3時まで営業しているBARは限られており、BAR KOFUは甲府市・山梨県のアフターバー需要に応える貴重な一店です。
</p>
<p style="color:#888;font-size:0.9em;margin-top:20px;">
【キーワード】山梨BAR / 甲府BAR / 山梨バー / 甲府バー / 甲府 深夜営業 / 甲府 アフターバー / 甲府 カラオケバー / 山梨 BAR 駐車場あり
</p>
</section>';
    return $content . $seo_text;
}, 20);

// ─────────────────────────────────────────────
// 7. Organizationスキーマを BarOrRestaurant と連携（重複回避）
// ─────────────────────────────────────────────
// AIOSEOのOrganizationスキーマはそのまま維持（sameAsリンクあり）
// LocalBusiness側で独自IDにすることで共存

// ─────────────────────────────────────────────
// 8. title タグを個別最適化（AIOSEO title filter経由）
// ─────────────────────────────────────────────
add_filter('aioseo_title', function($title) {
    if (is_front_page()) {
        return '山梨BAR・甲府BAR｜深夜営業・アフターバー・駐車場完備【BAR KOFU（バー・コウフ）】';
    }
    return $title;
}, 20);

add_filter('aioseo_description', function($desc) {
    if (is_front_page()) {
        return '山梨BAR・甲府BARをお探しならBAR KOFU。甲府市の隠れ家的BARで深夜3時まで営業。駐車場完備・カラオケ対応・アフターバー利用OK。山梨県甲府市の大人のためのBAR。';
    }
    return $desc;
}, 20);
