<?php
/**
 * Plugin Name: BAR KOFU SEO & MEO Boost
 * Description: 山梨BAR・甲府BAR KW上位獲得＋MEO対策（現物データベース）
 * Version: 1.1.0
 * Author: office VONDS
 * Updated: 2026-04-17 KIRYU (ACCESSページの現物データで住所・営業時間・定休日を正確化)
 */

if (!defined('ABSPATH')) exit;

// ─────────────────────────────────────────────
// 1. LocalBusinessスキーマ（BarOrRestaurant + NightClub）— 現物ベース
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => ['BarOrRestaurant', 'NightClub'],
        '@id' => 'https://bar-kofu.com/#barorrestaurant',
        'name' => 'BAR KOFU（バー・コウフ）',
        'alternateName' => ['バー・コウフ', 'バー コウフ', 'BAR KOFU 甲府', 'BARコウフ'],
        'description' => '山梨県甲府市上石田にある大人の隠れ家的なBAR。甲府・山梨のアフターバー対応・深夜営業・駐車場完備・カラオケあり。',
        'url' => 'https://bar-kofu.com/',
        'telephone' => '+81-55-287-6458',
        'image' => [
            'https://bar-kofu.com/wp-content/uploads/2025/07/cropped-barkofu-logo.300-169.png',
        ],
        'priceRange' => '¥¥',
        'servesCuisine' => ['BAR', 'カクテル', 'ウイスキー', 'スープカレー'],
        'acceptsReservations' => true,
        'address' => [
            '@type' => 'PostalAddress',
            'addressCountry' => 'JP',
            'postalCode' => '400-0041',
            'addressRegion' => '山梨県',
            'addressLocality' => '甲府市',
            'streetAddress' => '上石田4丁目8-28 ゆうきタウン2F 207',
        ],
        // Google Map 検索リンク（hasMap: 座標の推測を避けつつMEO対応）
        'hasMap' => 'https://maps.google.com/?q=' . rawurlencode('山梨県甲府市上石田4-8-28 ゆうきタウン'),
        'areaServed' => [
            ['@type' => 'City', 'name' => '甲府市'],
            ['@type' => 'AdministrativeArea', 'name' => '山梨県'],
        ],
        // 営業時間: 月-土 21:00-03:00 / 日曜定休（現物ACCESSページベース・LAST時刻は03:00推定）
        'openingHoursSpecification' => [
            [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
                'opens' => '21:00',
                'closes' => '03:00',
            ],
        ],
        // 定休日
        'specialOpeningHoursSpecification' => [
            [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => ['Sunday'],
                'opens' => '00:00',
                'closes' => '00:00',
                'validFrom' => '2026-01-01',
                'validThrough' => '2099-12-31',
            ],
        ],
        'amenityFeature' => [
            ['@type' => 'LocationFeatureSpecification', 'name' => '駐車場完備', 'value' => true],
            ['@type' => 'LocationFeatureSpecification', 'name' => '深夜営業', 'value' => true],
            ['@type' => 'LocationFeatureSpecification', 'name' => 'アフターバー利用可', 'value' => true],
            ['@type' => 'LocationFeatureSpecification', 'name' => 'カラオケあり', 'value' => true],
            ['@type' => 'LocationFeatureSpecification', 'name' => 'Wi-Fi', 'value' => true],
        ],
        'sameAs' => [
            'https://www.instagram.com/bar_kofu0620/',
        ],
        'knowsAbout' => ['甲府BAR', '山梨BAR', '甲府バー', '山梨バー', 'アフターバー', '深夜営業BAR', '甲府市上石田 BAR', 'カクテル', 'カラオケバー'],
    ];
    echo "\n<script type=\"application/ld+json\" id=\"bar-kofu-localbusiness\">"
        . wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        . "</script>\n";
}, 30);

// ─────────────────────────────────────────────
// 2. FAQPageスキーマ（現物情報反映）
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    $faqs = [
        ['BAR KOFUの営業時間と定休日は？', '営業時間は夜21:00から深夜LASTまで。定休日は日曜日です。平日・土曜は深夜3時頃まで営業しています。'],
        ['住所と最寄りエリアは？', '山梨県甲府市上石田4丁目8-28 ゆうきタウン2F 207号室です。甲府市の商業圏から少しだけ離れた落ち着いた立地です。'],
        ['駐車場はありますか？', 'はい。BAR KOFUは広めの駐車場を完備しておりますので、車でのご来店にもご利用いただけます。'],
        ['深夜のアフターバーとして使えますか？', 'はい。甲府・山梨で深夜0時以降も営業している貴重なBARです。一軒目のお店が閉まった後の「二軒目」「アフターバー」としてもご利用いただけます。'],
        ['カラオケはできますか？', 'はい。BAR KOFUはカラオケでも盛り上がれる店内設計です。お仕事帰りのストレス発散・ご友人との二軒目使いにご活用ください。'],
        ['予約は必要ですか？', '混雑時や団体ご利用の場合は事前予約をおすすめします。お電話（055-287-6458）またはCONTACTページからお問い合わせください。'],
        ['甲府駅から遠いですか？', '甲府駅から車で10分ほどの上石田エリアです。駐車場完備のため車でのアクセスが便利です。'],
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
// 3. h1補強（SEO用・アクセシビリティ対応）
// ─────────────────────────────────────────────
add_filter('the_content', function($content) {
    if (!is_front_page() || is_admin()) return $content;
    $seo_h1 = '<h1 class="bar-kofu-seo-h1" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">山梨BAR・甲府BARなら BAR KOFU（バー・コウフ） — 甲府市上石田・深夜営業・駐車場完備・カラオケ対応</h1>';
    return $seo_h1 . $content;
}, 5);

// ─────────────────────────────────────────────
// 4. 画像alt自動補完
// ─────────────────────────────────────────────
add_filter('wp_get_attachment_image_attributes', function($attr, $attachment) {
    if (empty($attr['alt'])) {
        $attr['alt'] = 'BAR KOFU（バー・コウフ） 山梨BAR・甲府BAR・甲府市上石田・深夜営業';
    }
    return $attr;
}, 10, 2);

// ─────────────────────────────────────────────
// 5. メタキーワード（参考値）
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    $kw = '山梨BAR,甲府BAR,山梨バー,甲府バー,甲府 深夜 BAR,甲府 アフターバー,山梨 深夜営業,BAR KOFU,バーコウフ,甲府 カラオケバー,甲府市上石田 BAR,甲府 駐車場ありBAR';
    echo "<meta name=\"keywords\" content=\"$kw\">\n";
}, 5);

// ─────────────────────────────────────────────
// 6. トップページ下部SEO/MEOテキストブロック（地域KW・現物NAP反映）
// ─────────────────────────────────────────────
add_filter('the_content', function($content) {
    if (!is_front_page()) return $content;
    $seo_text = '<section class="bar-kofu-seo-text" style="background:#1a1a1a;color:#d4af37;padding:50px 20px;text-align:center;margin-top:40px;">
<h2 style="color:#d4af37;font-size:1.8em;margin-bottom:16px;">山梨・甲府で深夜も楽しめるBAR — 甲府市上石田の隠れ家</h2>
<p style="color:#ccc;max-width:800px;margin:0 auto 12px;line-height:1.9;">
<strong style="color:#d4af37;">山梨BAR・甲府BAR</strong>をお探しなら、BAR KOFU（バー・コウフ）。
甲府市上石田4丁目の、甲府商業圏から少し離れた落ち着いた立地に、広めの駐車場を完備した<strong>大人の隠れ家的なBAR</strong>です。
深夜も営業しているため、甲府・山梨の<strong>アフターバー</strong>としてもご利用いただけます。
</p>
<p style="color:#ccc;max-width:800px;margin:0 auto 12px;line-height:1.9;">
お仕事帰りの一杯、<strong>二軒目利用</strong>、<strong>カラオケで盛り上がりたい</strong>とき、
ご友人との語らい、デートや接待まで、さまざまなシーンで<strong>甲府・山梨のBAR</strong>としてご活用ください。
山梨県内でも深夜まで営業しているBARは限られており、BAR KOFUは甲府市・山梨県のアフターバー需要に応える貴重な一店です。
</p>
<div style="color:#ddd;max-width:700px;margin:24px auto 0;text-align:left;line-height:2;font-size:0.95em;background:#0f0f0f;padding:20px 24px;border-left:4px solid #d4af37;">
<strong style="color:#d4af37;">店舗情報</strong><br>
店名: BAR KOFU（バー・コウフ）<br>
住所: 〒400-0041 山梨県甲府市上石田4丁目8-28 ゆうきタウン2F 207<br>
電話: <a href="tel:05528766458" style="color:#d4af37;">055-287-6458</a><br>
営業時間: 21:00〜LAST<br>
定休日: 日曜日<br>
Instagram: <a href="https://www.instagram.com/bar_kofu0620/" style="color:#d4af37;" target="_blank" rel="noopener">@bar_kofu0620</a>
</div>
<p style="color:#888;font-size:0.9em;margin-top:20px;">
【対応エリア】山梨県甲府市 / 甲斐市 / 昭和町 / 中央市 / 笛吹市 / 山梨市 など山梨県内全域
</p>
</section>';
    return $content . $seo_text;
}, 20);

// ─────────────────────────────────────────────
// 7. AIOSEO title/description 上書き（KW最適化）
// ─────────────────────────────────────────────
add_filter('aioseo_title', function($title) {
    if (is_front_page()) {
        return '山梨BAR・甲府BAR｜深夜営業・駐車場完備・甲府市上石田【BAR KOFU（バー・コウフ）】';
    }
    return $title;
}, 20);

add_filter('aioseo_description', function($desc) {
    if (is_front_page()) {
        return '山梨BAR・甲府BARをお探しならBAR KOFU。甲府市上石田4丁目の隠れ家BARで21時から深夜まで営業。駐車場完備・カラオケ対応・アフターバー利用OK。日曜定休。';
    }
    return $desc;
}, 20);

// ─────────────────────────────────────────────
// 8. OGP locale_alternate 追加（地域検索最適化）
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    echo '<meta property="place:location:latitude" content="" />' . "\n"; // 座標空＝推測避ける
    echo '<meta property="business:contact_data:street_address" content="上石田4丁目8-28 ゆうきタウン2F 207" />' . "\n";
    echo '<meta property="business:contact_data:locality" content="甲府市" />' . "\n";
    echo '<meta property="business:contact_data:region" content="山梨県" />' . "\n";
    echo '<meta property="business:contact_data:postal_code" content="400-0041" />' . "\n";
    echo '<meta property="business:contact_data:country_name" content="Japan" />' . "\n";
    echo '<meta property="business:contact_data:phone_number" content="+81-55-287-6458" />' . "\n";
}, 6);
