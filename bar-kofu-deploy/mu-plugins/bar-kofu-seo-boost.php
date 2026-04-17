<?php
/**
 * Plugin Name: BAR KOFU SEO & MEO Boost
 * Description: バー甲府・甲府カラオケバー KW上位 + 世界クラスBAR UIリデザイン v1.3
 * Version: 1.3.0
 * Author: office VONDS
 * Design References: Connaught Bar (London), Dante NYC, Bar High Five (Tokyo), Death & Co
 */

if (!defined('ABSPATH')) exit;

// ─────────────────────────────────────────────
// 1. LocalBusiness Schema
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => ['BarOrRestaurant', 'NightClub'],
        '@id' => 'https://bar-kofu.com/#barorrestaurant',
        'name' => 'BAR KOFU（バー・コウフ）',
        'alternateName' => ['バー甲府', 'バー・コウフ', 'BAR KOFU 甲府', '甲府カラオケバー'],
        'description' => '山梨県甲府市上石田の隠れ家BAR。バー甲府で深夜まで営業・駐車場完備・カラオケOK。',
        'url' => 'https://bar-kofu.com/',
        'telephone' => '+81-55-287-6458',
        'image' => [
            'https://bar-kofu.com/wp-content/uploads/2025/07/main2000-900.jpg',
            'https://bar-kofu.com/wp-content/uploads/2025/07/00-29-1-scaled.jpg',
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
        'areaServed' => [['@type'=>'City','name'=>'甲府市'],['@type'=>'AdministrativeArea','name'=>'山梨県']],
        'openingHoursSpecification' => [[
            '@type'=>'OpeningHoursSpecification',
            'dayOfWeek'=>['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            'opens'=>'21:00','closes'=>'03:00',
        ]],
        'specialOpeningHoursSpecification' => [[
            '@type'=>'OpeningHoursSpecification','dayOfWeek'=>['Sunday'],
            'opens'=>'00:00','closes'=>'00:00',
            'validFrom'=>'2026-01-01','validThrough'=>'2099-12-31',
        ]],
        'amenityFeature' => [
            ['@type'=>'LocationFeatureSpecification','name'=>'駐車場完備','value'=>true],
            ['@type'=>'LocationFeatureSpecification','name'=>'深夜営業','value'=>true],
            ['@type'=>'LocationFeatureSpecification','name'=>'カラオケあり','value'=>true],
        ],
        'sameAs' => ['https://www.instagram.com/bar_kofu0620/'],
        'knowsAbout' => ['バー甲府','甲府BAR','甲府カラオケバー','山梨BAR','甲府 bar','アフターバー','深夜営業BAR'],
    ];
    echo "\n<script type=\"application/ld+json\" id=\"bar-kofu-localbusiness\">"
        . wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        . "</script>\n";
}, 30);

// ─────────────────────────────────────────────
// 2. FAQPage
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    $faqs = [
        ['バー甲府ならどこ？BAR KOFUの特徴は？','バー甲府でお探しならBAR KOFU。甲府市上石田の隠れ家BARで駐車場完備・深夜営業・カラオケ対応。'],
        ['甲府カラオケバーを探している','BAR KOFUは甲府でカラオケもできるBAR。二軒目利用・アフターバーに最適。'],
        ['BAR KOFUの営業時間と定休日は？','21:00〜LAST／定休日は日曜日。平日・土曜は深夜まで営業。'],
        ['住所は？','山梨県甲府市上石田4丁目8-28 ゆうきタウン2F 207。甲府駅から車で約10分。'],
        ['駐車場はありますか？','はい、広めの駐車場を完備しています。'],
        ['深夜のアフターバーで使えますか？','甲府で深夜営業している貴重なBAR。一軒目の後の二軒目に最適。'],
        ['予約は必要ですか？','混雑時・団体利用は055-287-6458への事前予約推奨。'],
        ['どんな年齢層？','20代後半〜50代。デート・接待にも適した隠れ家的な雰囲気。'],
    ];
    $items = [];
    foreach ($faqs as $f) $items[] = ['@type'=>'Question','name'=>$f[0],'acceptedAnswer'=>['@type'=>'Answer','text'=>$f[1]]];
    echo "\n<script type=\"application/ld+json\" id=\"bar-kofu-faqpage\">"
        . wp_json_encode(['@context'=>'https://schema.org','@type'=>'FAQPage','mainEntity'=>$items], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)
        . "</script>\n";
}, 31);

// ─────────────────────────────────────────────
// 3. h1 SEO
// ─────────────────────────────────────────────
add_filter('the_content', function($content) {
    if (!is_front_page() || is_admin()) return $content;
    return '<h1 class="bar-kofu-seo-h1" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">バー甲府・甲府カラオケバーならBAR KOFU — 甲府市上石田・深夜営業・駐車場完備</h1>' . $content;
}, 5);

// ─────────────────────────────────────────────
// 4. 画像alt
// ─────────────────────────────────────────────
add_filter('wp_get_attachment_image_attributes', function($attr, $att) {
    if (empty($attr['alt'])) $attr['alt'] = 'BAR KOFU バー甲府・甲府カラオケバー';
    return $attr;
}, 10, 2);

// ─────────────────────────────────────────────
// 5. Meta keywords
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    echo "<meta name=\"keywords\" content=\"バー甲府,甲府BAR,甲府バー,甲府 bar,甲府 カラオケバー,カラオケバー 甲府,山梨BAR,BAR KOFU,バーコウフ,甲府市上石田 BAR,甲府 深夜 BAR,甲府 アフターバー,ゆうきタウン BAR\">\n";
}, 5);

// ─────────────────────────────────────────────
// 6. AIOSEO title/description
// ─────────────────────────────────────────────
add_filter('aioseo_title', function($t) {
    return is_front_page() ? 'バー甲府・甲府カラオケバー｜深夜営業・駐車場完備【BAR KOFU 甲府市上石田】' : $t;
}, 20);
add_filter('aioseo_description', function($d) {
    return is_front_page() ? 'バー甲府ならBAR KOFU。甲府カラオケバーとしても使える甲府市上石田の隠れ家BAR。21時〜深夜営業・駐車場完備・日曜定休。ゆうきタウン2F。' : $d;
}, 20);

// ─────────────────────────────────────────────
// 7. OGP business
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
// 8. 世界クラスBAR UI — CSS
// Reference: Connaught Bar / Dante NYC / Bar High Five Tokyo / Death & Co
// ─────────────────────────────────────────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    ?>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Noto+Serif+JP:wght@300;400;500;700;900&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
<style id="bar-kofu-world-class-ui">
/* ═══════════════════════════════════════════════
   BAR KOFU v1.3 — World-Class Premium Hidden Bar UI
   Design Language: Luxury Speakeasy / Film Noir / 和モダン
   ═══════════════════════════════════════════════ */

:root {
  --bk-black: #0a0a0a;
  --bk-black-2: #141414;
  --bk-black-3: #1c1c1c;
  --bk-gold: #c9a961;
  --bk-gold-bright: #e8c878;
  --bk-gold-dim: #8a7340;
  --bk-cream: #f5f0e1;
  --bk-muted: #888077;
  --bk-line: rgba(201,169,97,0.25);
  --bk-serif-jp: "Noto Serif JP", "Yu Mincho", serif;
  --bk-serif-en: "Cormorant Garamond", "Playfair Display", serif;
  --bk-sans: "Noto Sans JP", -apple-system, sans-serif;
}

/* Override theme for full-bleed hero */
body.home main, body.page-id-9 main, .home .site-content { background: var(--bk-black) !important; color: var(--bk-cream) !important; }

/* Hero — フルブリード・Ken-Burns */
.bk-hero {
  position: relative; min-height: 90vh;
  display: flex; align-items: center; justify-content: center; text-align: center;
  background: #000; margin: 0 calc(50% - 50vw) 0; width: 100vw; overflow: hidden;
}
.bk-hero::before {
  content: ""; position: absolute; inset: 0;
  background-image: url('https://bar-kofu.com/wp-content/uploads/2025/07/main2000-900.jpg');
  background-size: cover; background-position: center;
  animation: bkKenBurns 24s ease-in-out infinite alternate;
}
@keyframes bkKenBurns {
  from { transform: scale(1) translate(0,0); } to { transform: scale(1.15) translate(-3%, 2%); }
}
.bk-hero-overlay {
  position: absolute; inset: 0; z-index: 2;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.85) 100%);
}
/* フィルムグレイン */
.bk-hero::after {
  content: ""; position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='3'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.12'/></svg>");
  opacity: 0.35;
}
.bk-hero-inner { position: relative; z-index: 5; padding: 0 30px; max-width: 820px; }
.bk-eyebrow {
  font-family: var(--bk-serif-en); font-size: 0.85em; letter-spacing: 0.5em; text-transform: uppercase;
  color: var(--bk-gold); margin-bottom: 28px; opacity: 0; animation: bkFadeUp 1s 0.3s forwards;
}
.bk-hero-title {
  font-family: var(--bk-serif-jp); font-weight: 300;
  font-size: clamp(2.2em, 6.5vw, 4.5em); line-height: 1.3; color: #fff;
  margin: 0 0 32px; letter-spacing: 0.08em; opacity: 0; animation: bkFadeUp 1.2s 0.6s forwards;
}
.bk-hero-title .bk-ruby { color: var(--bk-gold-bright); font-weight: 400; }
.bk-hero-sub {
  font-family: var(--bk-serif-en); font-size: 1.1em; line-height: 2.2;
  color: rgba(245,240,225,0.85); margin-bottom: 48px; font-style: italic;
  opacity: 0; animation: bkFadeUp 1.2s 0.9s forwards;
}
.bk-hero-divider {
  width: 60px; height: 1px; background: var(--bk-gold); margin: 0 auto 48px;
  opacity: 0; animation: bkFadeIn 1s 1.1s forwards;
}
.bk-hero-cta { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; opacity: 0; animation: bkFadeUp 1.2s 1.3s forwards; }
@keyframes bkFadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
@keyframes bkFadeIn { from{opacity:0;} to{opacity:1;} }

/* Buttons — luxury style */
.bk-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 18px 36px; font-family: var(--bk-serif-en);
  font-size: 0.95em; letter-spacing: 0.25em; text-transform: uppercase;
  text-decoration: none !important; border: 1px solid var(--bk-gold);
  transition: all 0.4s cubic-bezier(.25,.8,.25,1); cursor: pointer;
  position: relative; overflow: hidden;
}
.bk-btn::before {
  content:""; position: absolute; inset: 0; background: var(--bk-gold);
  transform: translateX(-101%); transition: transform 0.4s cubic-bezier(.25,.8,.25,1); z-index: 1;
}
.bk-btn > * { position: relative; z-index: 2; }
.bk-btn-primary { background: var(--bk-gold); color: var(--bk-black) !important; }
.bk-btn-primary:hover { background: transparent; color: var(--bk-gold) !important; }
.bk-btn-primary:hover::before { transform: translateX(0); background: transparent; }
.bk-btn-ghost { background: transparent; color: var(--bk-gold) !important; }
.bk-btn-ghost:hover { color: var(--bk-black) !important; }
.bk-btn-ghost:hover::before { transform: translateX(0); }

/* Section common */
.bk-hero, .bk-info-band, .bk-scenes, .bk-gallery, .bk-features, .bk-access, .bk-faq, .bk-final-cta, .bk-news {
  margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); width: 100vw;
}
.bk-info-band, .bk-scenes, .bk-gallery, .bk-features, .bk-access, .bk-faq, .bk-final-cta, .bk-news {
  padding: 120px 30px; background: var(--bk-black);
}

/* Info band — horizontal luxury strip */
.bk-info-band {
  padding: 48px 30px !important;
  background: linear-gradient(180deg, #000 0%, var(--bk-black-2) 100%);
  border-top: 1px solid var(--bk-line); border-bottom: 1px solid var(--bk-line);
}
.bk-info-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px;
  max-width: 1000px; margin: 0 auto; text-align: center;
}
.bk-info-grid > div { display: flex; flex-direction: column; gap: 10px; position: relative; }
.bk-info-grid > div:not(:last-child)::after {
  content: ""; position: absolute; right: -20px; top: 20%; height: 60%; width: 1px; background: var(--bk-line);
}
.bk-label {
  font-family: var(--bk-serif-en); font-size: 0.7em; letter-spacing: 0.35em;
  text-transform: uppercase; color: var(--bk-muted);
}
.bk-value {
  font-family: var(--bk-serif-jp); font-size: 1.25em; color: var(--bk-gold); font-weight: 400;
}

/* Section titles — luxury serif */
.bk-section-title {
  font-family: var(--bk-serif-jp); font-weight: 300;
  font-size: clamp(1.6em, 3.5vw, 2.4em);
  color: var(--bk-gold); text-align: center; margin: 0 0 16px;
  letter-spacing: 0.12em; line-height: 1.6;
}
.bk-section-eyebrow {
  font-family: var(--bk-serif-en); font-size: 0.8em; letter-spacing: 0.4em;
  text-transform: uppercase; color: var(--bk-muted); text-align: center;
  display: block; margin-bottom: 16px;
}
.bk-section-divider {
  width: 40px; height: 1px; background: var(--bk-gold); margin: 0 auto 70px;
}

/* Scene cards */
.bk-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px; max-width: 1200px; margin: 0 auto;
}
.bk-card {
  padding: 48px 32px; text-align: center; background: var(--bk-black-2);
  border: 1px solid var(--bk-line); transition: all 0.5s;
}
.bk-card:hover { border-color: var(--bk-gold); transform: translateY(-4px); }
.bk-card-num {
  font-family: var(--bk-serif-en); font-style: italic; font-size: 1.1em;
  color: var(--bk-gold-dim); letter-spacing: 0.3em; margin-bottom: 16px; display: block;
}
.bk-card h3 {
  font-family: var(--bk-serif-jp); font-weight: 400; font-size: 1.3em;
  color: var(--bk-gold); margin: 0 0 20px; letter-spacing: 0.08em;
}
.bk-card p {
  font-family: var(--bk-sans); font-size: 0.95em; line-height: 2.1;
  color: rgba(245,240,225,0.75); margin: 0;
}

/* Gallery — film noir mosaic */
.bk-gallery-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 4px; max-width: 1400px; margin: 0 auto;
}
.bk-gallery-item { position: relative; overflow: hidden; aspect-ratio: 4/5; cursor: pointer; }
.bk-gallery-item img {
  width: 100%; height: 100%; object-fit: cover;
  filter: grayscale(0.25) brightness(0.85); transition: all 0.8s cubic-bezier(.25,.8,.25,1);
}
.bk-gallery-item:hover img { filter: grayscale(0) brightness(1); transform: scale(1.05); }
.bk-gallery-item::after {
  content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6));
  transition: opacity 0.4s; opacity: 0.7;
}
.bk-gallery-item:hover::after { opacity: 0.3; }

/* Features */
.bk-feature-list {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px; max-width: 1100px; margin: 0 auto;
}
.bk-feature {
  padding: 40px 32px; border-top: 1px solid var(--bk-line);
  position: relative; transition: all 0.4s;
}
.bk-feature::before {
  content: ""; position: absolute; top: -1px; left: 0; width: 40px; height: 1px;
  background: var(--bk-gold); transition: width 0.4s cubic-bezier(.25,.8,.25,1);
}
.bk-feature:hover::before { width: 100%; }
.bk-feature h3 {
  font-family: var(--bk-serif-jp); font-weight: 400;
  font-size: 1.2em; color: var(--bk-gold); margin: 0 0 18px; letter-spacing: 0.1em;
}
.bk-feature p {
  font-family: var(--bk-sans); font-size: 0.95em; line-height: 2;
  color: rgba(245,240,225,0.75); margin: 0;
}

/* Access */
.bk-access-inner {
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
  max-width: 1100px; margin: 0 auto; align-items: stretch;
}
.bk-access-info { padding: 48px; background: var(--bk-black-2); border: 1px solid var(--bk-line); }
.bk-access-info p {
  margin: 0 0 20px; padding-bottom: 18px; border-bottom: 1px solid var(--bk-line);
  color: var(--bk-cream); font-family: var(--bk-sans); font-size: 0.95em; line-height: 2;
}
.bk-access-info p:last-child { border-bottom: none; }
.bk-access-info strong {
  color: var(--bk-muted); font-family: var(--bk-serif-en); font-weight: 400;
  font-size: 0.85em; letter-spacing: 0.2em; text-transform: uppercase; display: block; margin-bottom: 6px;
}
.bk-access-info a { color: var(--bk-gold); text-decoration: none; border-bottom: 1px solid var(--bk-line); padding-bottom: 2px; }
.bk-access-info a:hover { border-bottom-color: var(--bk-gold); }
.bk-access-map iframe { width: 100%; height: 100%; min-height: 420px; border: 1px solid var(--bk-line); filter: invert(0.92) hue-rotate(180deg); }

/* FAQ — minimal */
.bk-faq-list { max-width: 860px; margin: 0 auto; }
.bk-faq-item {
  border-top: 1px solid var(--bk-line); padding: 24px 0; cursor: pointer;
}
.bk-faq-item:last-child { border-bottom: 1px solid var(--bk-line); }
.bk-faq-item summary {
  color: var(--bk-gold); font-family: var(--bk-serif-jp); font-weight: 400;
  font-size: 1.05em; list-style: none; position: relative; padding-right: 40px;
  letter-spacing: 0.08em; transition: color 0.3s;
}
.bk-faq-item summary::-webkit-details-marker { display: none; }
.bk-faq-item summary::after {
  content: "+"; position: absolute; right: 0; top: 50%;
  transform: translateY(-50%); font-size: 1.5em; color: var(--bk-gold); transition: transform 0.3s;
}
.bk-faq-item[open] summary::after { transform: translateY(-50%) rotate(45deg); }
.bk-faq-item summary:hover { color: var(--bk-gold-bright); }
.bk-faq-item p {
  color: rgba(245,240,225,0.75); font-family: var(--bk-sans); font-size: 0.95em;
  line-height: 2.1; margin: 20px 0 0; padding-right: 40px;
}

/* Final CTA — grand */
.bk-final-cta {
  text-align: center;
  background:
    linear-gradient(rgba(0,0,0,0.78), rgba(0,0,0,0.88)),
    url('https://bar-kofu.com/wp-content/uploads/2025/07/00-29-1-scaled.jpg') center/cover;
  padding: 140px 30px !important;
}
.bk-final-cta h2 {
  font-family: var(--bk-serif-jp); font-weight: 300;
  font-size: clamp(1.8em, 4vw, 3em); color: var(--bk-gold);
  margin: 0 0 24px; letter-spacing: 0.1em;
}
.bk-final-cta p {
  font-family: var(--bk-serif-en); font-style: italic; font-size: 1.1em;
  color: rgba(245,240,225,0.85); margin: 0 0 48px; letter-spacing: 0.05em;
}
.bk-final-cta .bk-btn { margin: 8px; }

/* News */
.bk-news-list { list-style: none !important; padding: 0 !important; max-width: 860px; margin: 0 auto !important; }
.bk-news-list li {
  background: var(--bk-black-2) !important; border: none !important;
  border-left: 1px solid var(--bk-gold) !important;
  padding: 20px 28px !important; margin-bottom: 6px !important; border-radius: 0 !important;
  transition: all 0.3s;
}
.bk-news-list li:hover { background: var(--bk-black-3) !important; border-left-width: 3px !important; }
.bk-news-list a {
  color: var(--bk-cream) !important; text-decoration: none !important; display: block;
  font-family: var(--bk-sans); font-size: 0.95em;
}
.bk-news-list time {
  font-family: var(--bk-serif-en) !important; font-style: italic;
  color: var(--bk-gold-dim) !important; font-size: 0.9em !important;
  margin-right: 16px !important; display: inline-block; min-width: 100px;
}

/* Mobile */
@media (max-width: 768px) {
  .bk-info-grid { grid-template-columns: repeat(2, 1fr); gap: 28px; }
  .bk-info-grid > div:not(:last-child)::after { display: none; }
  .bk-access-inner { grid-template-columns: 1fr; gap: 30px; }
  .bk-hero { min-height: 80vh; }
  .bk-info-band, .bk-scenes, .bk-gallery, .bk-features, .bk-access, .bk-faq, .bk-final-cta, .bk-news { padding: 80px 20px; }
  .bk-section-divider { margin-bottom: 50px; }
  .bk-btn { padding: 16px 28px; font-size: 0.85em; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .bk-hero::before { animation: none; }
  * { animation-duration: 0.01s !important; transition-duration: 0.01s !important; }
}

/* Theme override - hide Lightning default content shell if any */
body.home h1 { display: none; } /* We use SEO h1 only */
body.home .entry-header { display: none; }
body.home .post-date { display: none; }
body.home .breadcrumb { display: none; }
body.home .site-footer { background: var(--bk-black) !important; color: var(--bk-cream) !important; }
body.home .site-footer a { color: var(--bk-gold) !important; }
</style>
    <?php
}, 8);
