<?php
/**
 * Plugin Name: BAR KOFU SEO & MEO Boost
 * Description: バー甲府・甲府カラオケバー・甲府BAR KW上位獲得（GSC実データ反映 v1.2）
 * Version: 1.2.0
 * Author: office VONDS
 * Updated: 2026-04-17 KIRYU (GSC実データベースでKW優先順位再設計＋全面リニューアルCSS)
 */

if (!defined('ABSPATH')) exit;

// ─────────────────────────────────────────────
// 1. LocalBusinessスキーマ（BarOrRestaurant + NightClub）
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => ['BarOrRestaurant', 'NightClub'],
        '@id' => 'https://bar-kofu.com/#barorrestaurant',
        'name' => 'BAR KOFU（バー・コウフ）',
        'alternateName' => ['バー甲府', 'バー・コウフ', 'BAR KOFU 甲府', '甲府カラオケバー', 'BARコウフ'],
        'description' => '山梨県甲府市上石田の隠れ家BAR。バー甲府で深夜まで営業・駐車場完備・カラオケOK。ゆうきタウン2F。',
        'url' => 'https://bar-kofu.com/',
        'telephone' => '+81-55-287-6458',
        'image' => [
            'https://bar-kofu.com/wp-content/uploads/2025/07/main2000-900.jpg',
            'https://bar-kofu.com/wp-content/uploads/2025/07/00-29-1-scaled.jpg',
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
        'hasMap' => 'https://maps.google.com/?q=' . rawurlencode('山梨県甲府市上石田4-8-28 ゆうきタウン'),
        'areaServed' => [
            ['@type' => 'City', 'name' => '甲府市'],
            ['@type' => 'AdministrativeArea', 'name' => '山梨県'],
        ],
        'openingHoursSpecification' => [
            [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
                'opens' => '21:00',
                'closes' => '03:00',
            ],
        ],
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
        ],
        'sameAs' => [
            'https://www.instagram.com/bar_kofu0620/',
        ],
        'knowsAbout' => ['バー甲府', '甲府BAR', '甲府カラオケバー', '山梨BAR', '甲府 bar', 'アフターバー', '深夜営業BAR', '甲府市上石田 BAR'],
    ];
    echo "\n<script type=\"application/ld+json\" id=\"bar-kofu-localbusiness\">"
        . wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        . "</script>\n";
}, 30);

// ─────────────────────────────────────────────
// 2. FAQPageスキーマ（GSC実データKW反映）
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    $faqs = [
        ['バー甲府ならどこ？BAR KOFUの特徴は？', 'バー甲府でお探しならBAR KOFU（バー・コウフ）。甲府市上石田の隠れ家BARで、駐車場完備・深夜まで営業・カラオケ対応。落ち着いた大人の空間です。'],
        ['甲府カラオケバーを探している', 'BAR KOFUは甲府でカラオケもできるBARです。二軒目利用・アフターバー利用にも最適。甲府市上石田ゆうきタウン2Fにあります。'],
        ['BAR KOFUの営業時間と定休日は？', '営業時間は夜21:00から深夜LASTまで。定休日は日曜日です。平日・土曜は深夜まで営業しています。'],
        ['住所と最寄りエリアは？', '山梨県甲府市上石田4丁目8-28 ゆうきタウン2F 207号室です。甲府駅から車で約10分です。'],
        ['駐車場はありますか？', 'はい。BAR KOFUは広めの駐車場を完備しておりますので、車でのご来店にもご利用いただけます。'],
        ['深夜のアフターバーとして使えますか？', 'はい。甲府・山梨で深夜も営業している貴重なBARです。一軒目のお店が閉まった後の二軒目・アフターバーとしてご利用いただけます。'],
        ['予約は必要ですか？', '混雑時や団体ご利用の場合は事前予約をおすすめします。お電話（055-287-6458）またはCONTACTページから。'],
        ['どんな年齢層が利用していますか？', '20代後半〜50代の大人の男女にご利用いただいております。落ち着いた隠れ家的BARとして、デートや接待にも最適です。'],
    ];
    $items = [];
    foreach ($faqs as $f) {
        $items[] = ['@type' => 'Question', 'name' => $f[0], 'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f[1]]];
    }
    $schema = ['@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => $items];
    echo "\n<script type=\"application/ld+json\" id=\"bar-kofu-faqpage\">"
        . wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        . "</script>\n";
}, 31);

// ─────────────────────────────────────────────
// 3. h1補強
// ─────────────────────────────────────────────
add_filter('the_content', function($content) {
    if (!is_front_page() || is_admin()) return $content;
    $seo_h1 = '<h1 class="bar-kofu-seo-h1" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">バー甲府・甲府カラオケバーならBAR KOFU（バー・コウフ） — 甲府市上石田・深夜営業・駐車場完備</h1>';
    return $seo_h1 . $content;
}, 5);

// ─────────────────────────────────────────────
// 4. 画像alt自動補完
// ─────────────────────────────────────────────
add_filter('wp_get_attachment_image_attributes', function($attr, $attachment) {
    if (empty($attr['alt'])) {
        $attr['alt'] = 'BAR KOFU（バー・コウフ） バー甲府・甲府カラオケバー・甲府市上石田';
    }
    return $attr;
}, 10, 2);

// ─────────────────────────────────────────────
// 5. メタキーワード
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    $kw = 'バー甲府,甲府BAR,甲府バー,甲府 bar,甲府 カラオケバー,カラオケバー 甲府,山梨BAR,BAR KOFU,バーコウフ,甲府市上石田 BAR,甲府 深夜 BAR,甲府 アフターバー,甲府 駐車場ありBAR,ゆうきタウン BAR';
    echo "<meta name=\"keywords\" content=\"$kw\">\n";
}, 5);

// ─────────────────────────────────────────────
// 6. AIOSEO title/description 上書き（GSC実データKW反映）
// ─────────────────────────────────────────────
add_filter('aioseo_title', function($title) {
    if (is_front_page()) {
        return 'バー甲府・甲府カラオケバー｜深夜営業・駐車場完備【BAR KOFU（バー・コウフ）甲府市上石田】';
    }
    return $title;
}, 20);

add_filter('aioseo_description', function($desc) {
    if (is_front_page()) {
        return 'バー甲府ならBAR KOFU。甲府カラオケバーとしても使える甲府市上石田の隠れ家BAR。21時〜深夜営業・駐車場完備・日曜定休。ゆうきタウン2F。';
    }
    return $desc;
}, 20);

// ─────────────────────────────────────────────
// 7. OGP business:contact_data
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    echo '<meta property="business:contact_data:street_address" content="上石田4丁目8-28 ゆうきタウン2F 207" />' . "\n";
    echo '<meta property="business:contact_data:locality" content="甲府市" />' . "\n";
    echo '<meta property="business:contact_data:region" content="山梨県" />' . "\n";
    echo '<meta property="business:contact_data:postal_code" content="400-0041" />' . "\n";
    echo '<meta property="business:contact_data:country_name" content="Japan" />' . "\n";
    echo '<meta property="business:contact_data:phone_number" content="+81-55-287-6458" />' . "\n";
}, 6);

// ─────────────────────────────────────────────
// 8. 全面リニューアル用CSS（HOME content style）
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    ?>
<style id="bar-kofu-renewal-css">
:root{--bk-gold:#d4af37;--bk-dark:#0f0f0f;--bk-dark2:#1a1a1a;--bk-light:#e8e6df;--bk-muted:#888;}
.bk-hero,.bk-info-band,.bk-scenes,.bk-gallery,.bk-features,.bk-access,.bk-faq,.bk-final-cta,.bk-news{font-family:"Noto Sans JP","Hiragino Sans",sans-serif;color:var(--bk-light);}
.bk-hero{position:relative;min-height:520px;display:flex;align-items:center;justify-content:center;text-align:center;background:url('https://bar-kofu.com/wp-content/uploads/2025/07/main2000-900.jpg') center/cover;margin:0 -20px 0;overflow:hidden;}
.bk-hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.75) 100%);}
.bk-hero-inner{position:relative;z-index:2;padding:80px 20px;max-width:760px;}
.bk-eyebrow{color:var(--bk-gold);letter-spacing:2px;font-size:.85em;margin-bottom:16px;opacity:.9;}
.bk-hero-title{color:#fff;font-size:clamp(1.8em,5vw,3em);font-weight:900;line-height:1.3;margin:0 0 20px;text-shadow:0 2px 12px rgba(0,0,0,.5);}
.bk-hero-sub{color:var(--bk-light);font-size:1.05em;line-height:1.9;margin-bottom:32px;opacity:.9;}
.bk-hero-cta{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;}
.bk-btn{display:inline-block;padding:14px 26px;border-radius:4px;font-weight:700;text-decoration:none!important;transition:all .25s;font-size:.95em;}
.bk-btn-primary{background:var(--bk-gold);color:#000!important;}
.bk-btn-primary:hover{background:#f0c24b;transform:translateY(-2px);}
.bk-btn-secondary{background:linear-gradient(135deg,#E1306C 0%,#F77737 100%);color:#fff!important;}
.bk-btn-ghost{background:transparent;color:#fff!important;border:1px solid rgba(255,255,255,.4);}
.bk-btn-lg{padding:18px 36px;font-size:1.05em;}
.bk-info-band{background:var(--bk-dark);padding:28px 20px;margin:0 -20px;}
.bk-info-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:900px;margin:0 auto;text-align:center;}
.bk-info-grid>div{display:flex;flex-direction:column;gap:6px;}
.bk-label{color:var(--bk-muted);font-size:.75em;letter-spacing:1px;}
.bk-value{color:var(--bk-gold);font-size:1.15em;font-weight:700;}
.bk-section-title{text-align:center;color:var(--bk-gold);margin:60px 0 32px;font-size:1.6em;font-weight:800;}
.bk-section-title small{display:block;color:var(--bk-muted);font-size:.65em;font-weight:400;margin-top:8px;letter-spacing:2px;}
.bk-scenes,.bk-gallery,.bk-features,.bk-access,.bk-faq,.bk-final-cta,.bk-news{background:var(--bk-dark2);padding:20px;margin:0 -20px;}
.bk-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;max-width:1000px;margin:0 auto 50px;}
.bk-card{background:var(--bk-dark);padding:30px 22px;border-radius:8px;text-align:center;border:1px solid rgba(212,175,55,.15);}
.bk-card-icon{font-size:2em;margin-bottom:12px;}
.bk-card h3{color:var(--bk-gold);margin:0 0 10px;font-size:1.1em;}
.bk-card p{color:var(--bk-light);font-size:.9em;line-height:1.7;margin:0;}
.bk-gallery-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;max-width:1100px;margin:0 auto 50px;}
.bk-gallery-item img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:4px;transition:transform .3s;}
.bk-gallery-item img:hover{transform:scale(1.05);}
.bk-feature-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;max-width:1000px;margin:0 auto 50px;}
.bk-feature{background:var(--bk-dark);padding:24px;border-left:3px solid var(--bk-gold);border-radius:4px;}
.bk-feature h3{color:var(--bk-gold);font-size:1.05em;margin:0 0 10px;}
.bk-feature p{color:var(--bk-light);font-size:.92em;margin:0;line-height:1.7;}
.bk-access-inner{display:grid;grid-template-columns:1fr 1fr;gap:30px;max-width:1000px;margin:0 auto 50px;align-items:start;}
.bk-access-info{background:var(--bk-dark);padding:28px;border-radius:8px;line-height:2;}
.bk-access-info p{margin:0 0 10px;color:var(--bk-light);}
.bk-access-info strong{color:var(--bk-gold);display:inline-block;min-width:90px;}
.bk-access-info a{color:var(--bk-gold);}
.bk-faq-item{max-width:800px;margin:0 auto 8px;background:var(--bk-dark);padding:14px 20px;border-radius:4px;cursor:pointer;}
.bk-faq-item summary{color:var(--bk-gold);font-weight:700;list-style:none;position:relative;padding-right:30px;}
.bk-faq-item summary::after{content:"＋";position:absolute;right:0;top:0;}
.bk-faq-item[open] summary::after{content:"−";}
.bk-faq-item p{color:var(--bk-light);margin:10px 0 0;font-size:.95em;line-height:1.8;}
.bk-final-cta{text-align:center;padding:60px 20px!important;}
.bk-final-cta h2{color:var(--bk-gold);font-size:1.5em;margin:0 0 14px;}
.bk-final-cta p{color:var(--bk-light);margin:0 0 26px;}
.bk-final-cta .bk-btn{margin:6px;}
.bk-news{padding:40px 20px 60px!important;}
.bk-news ol{list-style:none;padding:0;max-width:800px;margin:0 auto;}
.bk-news li{background:var(--bk-dark);padding:14px 20px;margin-bottom:8px;border-radius:4px;border-left:3px solid var(--bk-gold);}
.bk-news a{color:var(--bk-gold);text-decoration:none;}
@media (max-width:640px){
  .bk-info-grid{grid-template-columns:repeat(2,1fr);}
  .bk-access-inner{grid-template-columns:1fr;}
  .bk-hero{min-height:420px;}
}
</style>
    <?php
}, 8);
