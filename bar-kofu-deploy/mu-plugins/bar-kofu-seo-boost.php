<?php
/**
 * Plugin Name: BAR KOFU SEO & World-Class UI
 * Description: バー甲府・甲府カラオケバー KW上位 + Awwwards水準UIリデザイン v1.4
 * Version: 1.4.0
 * Author: office VONDS
 * Design Refs: Connaught Bar (London), Dante NYC, Death & Co, Bar High Five Tokyo
 * NOYUTOの意思: 1万人が1万人素晴らしいと言えるデザイン性能・UI
 */

if (!defined('ABSPATH')) exit;

// ─────────── Schema LocalBusiness ───────────
add_action('wp_head', function() {
    if (!is_front_page()) return;
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => ['BarOrRestaurant', 'NightClub'],
        '@id' => 'https://bar-kofu.com/#barorrestaurant',
        'name' => 'BAR KOFU（バー・コウフ）',
        'alternateName' => ['バー甲府','バー・コウフ','BAR KOFU 甲府','甲府カラオケバー'],
        'description' => '山梨県甲府市上石田の隠れ家BAR。バー甲府で深夜まで営業・駐車場完備・カラオケOK。',
        'url' => 'https://bar-kofu.com/',
        'telephone' => '+81-55-287-6458',
        'image' => [
            'https://bar-kofu.com/wp-content/uploads/2025/07/main2000-900.jpg',
            'https://bar-kofu.com/wp-content/uploads/2025/07/00-29-1-scaled.jpg',
        ],
        'priceRange' => '¥¥',
        'servesCuisine' => ['BAR','カクテル','ウイスキー','スープカレー'],
        'acceptsReservations' => true,
        'address' => ['@type'=>'PostalAddress','addressCountry'=>'JP','postalCode'=>'400-0041','addressRegion'=>'山梨県','addressLocality'=>'甲府市','streetAddress'=>'上石田4丁目8-28 ゆうきタウン2F 207'],
        'hasMap' => 'https://maps.google.com/?q=' . rawurlencode('山梨県甲府市上石田4-8-28 ゆうきタウン'),
        'areaServed' => [['@type'=>'City','name'=>'甲府市'],['@type'=>'AdministrativeArea','name'=>'山梨県']],
        'openingHoursSpecification' => [['@type'=>'OpeningHoursSpecification','dayOfWeek'=>['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],'opens'=>'21:00','closes'=>'03:00']],
        'specialOpeningHoursSpecification' => [['@type'=>'OpeningHoursSpecification','dayOfWeek'=>['Sunday'],'opens'=>'00:00','closes'=>'00:00','validFrom'=>'2026-01-01','validThrough'=>'2099-12-31']],
        'amenityFeature' => [
            ['@type'=>'LocationFeatureSpecification','name'=>'駐車場完備','value'=>true],
            ['@type'=>'LocationFeatureSpecification','name'=>'深夜営業','value'=>true],
            ['@type'=>'LocationFeatureSpecification','name'=>'カラオケあり','value'=>true],
        ],
        'sameAs' => ['https://www.instagram.com/bar_kofu0620/'],
        'knowsAbout' => ['バー甲府','甲府BAR','甲府カラオケバー','山梨BAR','甲府 bar','アフターバー','深夜営業BAR'],
    ];
    echo "\n<script type=\"application/ld+json\" id=\"bar-kofu-localbusiness\">".wp_json_encode($schema,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)."</script>\n";
}, 30);

// ─────────── Schema FAQ ───────────
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
    echo "\n<script type=\"application/ld+json\" id=\"bar-kofu-faqpage\">".wp_json_encode(['@context'=>'https://schema.org','@type'=>'FAQPage','mainEntity'=>$items],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)."</script>\n";
}, 31);

add_filter('the_content', function($c) {
    if (!is_front_page() || is_admin()) return $c;
    return '<h1 class="bar-kofu-seo-h1" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">バー甲府・甲府カラオケバーならBAR KOFU — 甲府市上石田・深夜営業・駐車場完備</h1>'.$c;
}, 5);
add_filter('wp_get_attachment_image_attributes', function($a,$att) {
    if (empty($a['alt'])) $a['alt']='BAR KOFU バー甲府・甲府カラオケバー';
    return $a;
}, 10, 2);
add_action('wp_head', function() { if (is_front_page()) echo "<meta name=\"keywords\" content=\"バー甲府,甲府BAR,甲府バー,甲府 bar,甲府 カラオケバー,カラオケバー 甲府,山梨BAR,BAR KOFU,バーコウフ,甲府市上石田 BAR,甲府 深夜 BAR,甲府 アフターバー,ゆうきタウン BAR\">\n"; }, 5);
add_filter('aioseo_title', function($t){ return is_front_page() ? 'バー甲府・甲府カラオケバー｜深夜営業・駐車場完備【BAR KOFU 甲府市上石田】' : $t; }, 20);
add_filter('aioseo_description', function($d){ return is_front_page() ? 'バー甲府ならBAR KOFU。甲府カラオケバーとしても使える甲府市上石田の隠れ家BAR。21時〜深夜営業・駐車場完備・日曜定休。ゆうきタウン2F。' : $d; }, 20);
add_action('wp_head', function(){
    if (!is_front_page()) return;
    echo '<meta property="business:contact_data:street_address" content="上石田4丁目8-28 ゆうきタウン2F 207" />'."\n";
    echo '<meta property="business:contact_data:locality" content="甲府市" />'."\n";
    echo '<meta property="business:contact_data:region" content="山梨県" />'."\n";
    echo '<meta property="business:contact_data:postal_code" content="400-0041" />'."\n";
    echo '<meta property="business:contact_data:country_name" content="Japan" />'."\n";
    echo '<meta property="business:contact_data:phone_number" content="+81-55-287-6458" />'."\n";
}, 6);

// ─────────── World-Class UI CSS (v1.4) ───────────
// Design language: luxury speakeasy × 和モダン × cinematic
add_action('wp_head', function(){
    if (!is_front_page()) return;
    ?>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Noto+Serif+JP:wght@200;300;400;500;700&family=Noto+Sans+JP:wght@300;400;500&display=swap" rel="stylesheet">
<style id="bar-kofu-v14-ui">
/* ═══════════════════════════════════════════════
   BAR KOFU v1.4 — 1万人が1万人素晴らしいと言うUI
   refs: Connaught Bar / Dante NYC / Death&Co / Bar High Five Tokyo
   ═══════════════════════════════════════════════ */

:root {
  --bk-black: #08080a;
  --bk-black-2: #111114;
  --bk-black-3: #18181c;
  --bk-gold: #c9a961;
  --bk-gold-bright: #e8c878;
  --bk-gold-dim: #8a7340;
  --bk-cream: #f3eedf;
  --bk-muted: #807a6f;
  --bk-line: rgba(201,169,97,0.2);
  --bk-line-strong: rgba(201,169,97,0.5);
  --bk-cinzel: "Cinzel", serif;
  --bk-serif-jp: "Noto Serif JP", "Yu Mincho", serif;
  --bk-serif-en: "Cormorant Garamond", "Playfair Display", serif;
  --bk-sans: "Noto Sans JP", -apple-system, sans-serif;
}

/* Selection */
::selection { background: var(--bk-gold); color: var(--bk-black); }

/* Theme override */
body.home, body.page-id-9, .home .site-content, body.home main { background: var(--bk-black) !important; color: var(--bk-cream) !important; }
body.home h1 { display: none; }
body.home .entry-header, body.home .post-date, body.home .breadcrumb { display: none; }
body.home .site-footer { background: var(--bk-black) !important; color: var(--bk-cream) !important; border-top: 1px solid var(--bk-line); }
body.home .site-footer a { color: var(--bk-gold) !important; }

/* Full-bleed sections */
.bk-hero, .bk-info-band, .bk-scenes, .bk-gallery, .bk-features, .bk-menu-preview, .bk-access, .bk-faq, .bk-final-cta, .bk-news {
  margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); width: 100vw;
}

/* ─── HERO — cinematic multi-layer carousel ─── */
.bk-hero {
  position: relative; min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  text-align: center; background: #000; overflow: hidden;
}
.bk-hero-slides { position: absolute; inset: 0; }
.bk-hero-slide {
  position: absolute; inset: 0; opacity: 0;
  background-size: cover; background-position: center;
  animation: bkHeroRotate 24s infinite;
}
.bk-hero-slide:nth-child(1) { background-image: url('https://bar-kofu.com/wp-content/uploads/2025/07/main2000-900.jpg'); animation-delay: 0s; }
.bk-hero-slide:nth-child(2) { background-image: url('https://bar-kofu.com/wp-content/uploads/2025/07/main32000-900.jpg'); animation-delay: 8s; }
.bk-hero-slide:nth-child(3) { background-image: url('https://bar-kofu.com/wp-content/uploads/2025/07/main4-2000-900.jpg'); animation-delay: 16s; }
@keyframes bkHeroRotate {
  0%,28% { opacity: 0; transform: scale(1.08); }
  33%,60% { opacity: 1; transform: scale(1); }
  65%,100% { opacity: 0; transform: scale(1.12); }
}
.bk-hero-overlay {
  position: absolute; inset: 0; z-index: 3;
  background: linear-gradient(180deg, rgba(8,8,10,0.5) 0%, rgba(8,8,10,0.75) 50%, rgba(8,8,10,0.95) 100%);
}
.bk-hero::before {
  content: ""; position: absolute; inset: 0; z-index: 4; pointer-events: none; opacity: 0.4;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.12'/></svg>");
}
.bk-hero-inner { position: relative; z-index: 5; padding: 0 30px; max-width: 880px; opacity: 0; animation: bkFadeIn 1.6s 0.8s forwards; }

.bk-hero-crest {
  display: inline-block; margin-bottom: 40px;
  font-family: var(--bk-cinzel); font-size: 0.7em; letter-spacing: 0.8em;
  text-transform: uppercase; color: var(--bk-gold); padding: 10px 0;
  border-top: 1px solid var(--bk-gold); border-bottom: 1px solid var(--bk-gold);
}
.bk-hero-title {
  font-family: var(--bk-serif-jp); font-weight: 200;
  font-size: clamp(2.4em, 7vw, 5em); line-height: 1.3; color: #fff;
  margin: 0 0 36px; letter-spacing: 0.1em;
}
.bk-hero-title .bk-accent { color: var(--bk-gold-bright); font-weight: 300; }
.bk-hero-sub {
  font-family: var(--bk-serif-en); font-size: 1.15em; line-height: 2.2;
  color: rgba(243,238,223,0.9); margin-bottom: 56px; font-style: italic;
}
.bk-hero-sub-jp {
  font-family: var(--bk-serif-jp); font-size: 0.92em; font-weight: 300;
  color: rgba(243,238,223,0.75); margin-bottom: 56px; letter-spacing: 0.15em;
}
.bk-ornament {
  display: flex; align-items: center; justify-content: center; gap: 18px;
  margin: 0 auto 52px; width: 140px;
}
.bk-ornament::before, .bk-ornament::after {
  content: ""; flex: 1; height: 1px; background: var(--bk-gold);
}
.bk-ornament-diamond {
  width: 8px; height: 8px; background: var(--bk-gold); transform: rotate(45deg);
}
.bk-hero-cta { display: flex; flex-wrap: wrap; gap: 18px; justify-content: center; }

/* Scroll indicator */
.bk-scroll-hint {
  position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 5;
  color: var(--bk-gold); font-family: var(--bk-cinzel); font-size: 0.65em;
  letter-spacing: 0.5em; text-transform: uppercase; opacity: 0.7;
  animation: bkBounce 2s infinite;
}
.bk-scroll-hint::after {
  content: ""; display: block; width: 1px; height: 50px; margin: 12px auto 0;
  background: linear-gradient(180deg, var(--bk-gold), transparent);
}
@keyframes bkBounce { 0%,100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, 10px); } }
@keyframes bkFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* ─── Buttons ─── */
.bk-btn {
  display: inline-flex; align-items: center; gap: 12px;
  padding: 20px 44px; font-family: var(--bk-cinzel);
  font-size: 0.82em; letter-spacing: 0.35em; text-transform: uppercase;
  text-decoration: none !important; border: 1px solid var(--bk-gold);
  transition: all 0.5s cubic-bezier(.25,.8,.25,1); cursor: pointer;
  position: relative; overflow: hidden; font-weight: 500;
}
.bk-btn::before {
  content: ""; position: absolute; inset: 0; background: var(--bk-gold);
  transform: translateX(-101%); transition: transform 0.5s cubic-bezier(.25,.8,.25,1); z-index: 1;
}
.bk-btn > * { position: relative; z-index: 2; }
.bk-btn-primary { background: var(--bk-gold); color: var(--bk-black) !important; }
.bk-btn-primary:hover { background: transparent; color: var(--bk-gold) !important; }
.bk-btn-primary:hover::before { transform: translateX(0); background: transparent; }
.bk-btn-ghost { background: transparent; color: var(--bk-gold) !important; }
.bk-btn-ghost:hover { color: var(--bk-black) !important; }
.bk-btn-ghost:hover::before { transform: translateX(0); }

/* ─── Section commons (big breath) ─── */
.bk-info-band, .bk-scenes, .bk-gallery, .bk-features, .bk-menu-preview, .bk-access, .bk-faq, .bk-final-cta, .bk-news {
  padding: 140px 30px; background: var(--bk-black);
}

/* ─── Info band (luxury horizontal strip) ─── */
.bk-info-band { padding: 56px 30px !important; background: linear-gradient(180deg, #000 0%, var(--bk-black-2) 100%); border-top: 1px solid var(--bk-line); border-bottom: 1px solid var(--bk-line); }
.bk-info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; max-width: 1100px; margin: 0 auto; text-align: center; }
.bk-info-grid > div { position: relative; }
.bk-info-grid > div:not(:last-child)::after { content: ""; position: absolute; right: -20px; top: 20%; height: 60%; width: 1px; background: var(--bk-line); }
.bk-label { display: block; font-family: var(--bk-cinzel); font-size: 0.68em; letter-spacing: 0.4em; text-transform: uppercase; color: var(--bk-muted); margin-bottom: 12px; }
.bk-value { display: block; font-family: var(--bk-serif-jp); font-size: 1.3em; color: var(--bk-gold); font-weight: 300; }

/* ─── Section titles (cinematic) ─── */
.bk-section-eyebrow {
  display: block; text-align: center; margin-bottom: 20px;
  font-family: var(--bk-cinzel); font-size: 0.78em; letter-spacing: 0.5em;
  text-transform: uppercase; color: var(--bk-muted);
}
.bk-section-title {
  font-family: var(--bk-serif-jp); font-weight: 200;
  font-size: clamp(1.8em, 4vw, 2.8em);
  color: var(--bk-gold); text-align: center; margin: 0 0 40px;
  letter-spacing: 0.15em; line-height: 1.6;
}
.bk-section-ornament {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  margin: 0 auto 80px; width: 120px;
}
.bk-section-ornament::before, .bk-section-ornament::after { content: ""; flex: 1; height: 1px; background: var(--bk-line-strong); }
.bk-section-ornament svg { width: 20px; height: 20px; color: var(--bk-gold); }

/* ─── Scene cards ─── */
.bk-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 48px; max-width: 1200px; margin: 0 auto; }
.bk-card {
  padding: 56px 36px; text-align: center; background: transparent;
  border: 1px solid var(--bk-line); transition: all 0.6s cubic-bezier(.25,.8,.25,1);
  position: relative;
}
.bk-card::before {
  content: ""; position: absolute; inset: 0; background: var(--bk-black-2);
  transform: scaleY(0); transform-origin: bottom; transition: transform 0.6s; z-index: -1;
}
.bk-card:hover { border-color: var(--bk-gold); transform: translateY(-6px); }
.bk-card:hover::before { transform: scaleY(1); }
.bk-card-num {
  display: block; font-family: var(--bk-cinzel); font-style: italic;
  font-size: 1.1em; color: var(--bk-gold-dim); letter-spacing: 0.35em; margin-bottom: 20px;
}
.bk-card h3 { font-family: var(--bk-serif-jp); font-weight: 300; font-size: 1.35em; color: var(--bk-gold); margin: 0 0 22px; letter-spacing: 0.1em; }
.bk-card p { font-family: var(--bk-sans); font-weight: 300; font-size: 0.95em; line-height: 2.2; color: rgba(243,238,223,0.7); margin: 0; }

/* ─── Gallery staggered (Dante-inspired) ─── */
.bk-gallery-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
  max-width: 1400px; margin: 0 auto;
}
.bk-gallery-item {
  position: relative; overflow: hidden; cursor: pointer;
  aspect-ratio: 4/5;
}
.bk-gallery-item:nth-child(2) { margin-top: 60px; }
.bk-gallery-item:nth-child(5) { margin-top: 60px; }
.bk-gallery-item img {
  width: 100%; height: 100%; object-fit: cover;
  filter: grayscale(0.3) brightness(0.8); transition: all 1s cubic-bezier(.25,.8,.25,1);
}
.bk-gallery-item:hover img { filter: grayscale(0) brightness(1); transform: scale(1.06); }
.bk-gallery-item::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(8,8,10,0.7)); transition: opacity 0.5s; opacity: 0.75;
}
.bk-gallery-item:hover::after { opacity: 0.3; }

/* ─── Features list ─── */
.bk-feature-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 40px; max-width: 1100px; margin: 0 auto; }
.bk-feature {
  padding: 50px 36px; border-top: 1px solid var(--bk-line); position: relative;
  transition: all 0.5s;
}
.bk-feature::before {
  content: ""; position: absolute; top: -1px; left: 0; width: 48px; height: 1px;
  background: var(--bk-gold); transition: width 0.6s cubic-bezier(.25,.8,.25,1);
}
.bk-feature:hover::before { width: 100%; }
.bk-feature-num {
  display: block; font-family: var(--bk-cinzel); font-size: 0.7em; letter-spacing: 0.4em;
  color: var(--bk-gold-dim); margin-bottom: 14px;
}
.bk-feature h3 { font-family: var(--bk-serif-jp); font-weight: 300; font-size: 1.25em; color: var(--bk-gold); margin: 0 0 20px; letter-spacing: 0.12em; }
.bk-feature p { font-family: var(--bk-sans); font-weight: 300; font-size: 0.95em; line-height: 2.1; color: rgba(243,238,223,0.7); margin: 0; }

/* ─── Menu preview (cocktail-style) ─── */
.bk-menu-preview { background: linear-gradient(180deg, var(--bk-black) 0%, var(--bk-black-2) 100%); }
.bk-menu-list { max-width: 760px; margin: 0 auto; }
.bk-menu-item {
  display: flex; align-items: baseline; padding: 22px 0;
  border-bottom: 1px dashed var(--bk-line);
}
.bk-menu-item:last-child { border-bottom: none; }
.bk-menu-name { font-family: var(--bk-serif-jp); font-weight: 300; font-size: 1.1em; color: var(--bk-cream); letter-spacing: 0.08em; }
.bk-menu-name small { display: block; font-family: var(--bk-serif-en); font-style: italic; color: var(--bk-muted); font-size: 0.85em; margin-top: 4px; }
.bk-menu-dots { flex: 1; border-bottom: 1px dotted var(--bk-line); margin: 0 20px; transform: translateY(-4px); }
.bk-menu-price { font-family: var(--bk-cinzel); color: var(--bk-gold); letter-spacing: 0.1em; }

/* ─── Access ─── */
.bk-access-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; max-width: 1200px; margin: 0 auto; align-items: stretch; }
.bk-access-info { padding: 56px 48px; background: var(--bk-black-2); border: 1px solid var(--bk-line); }
.bk-access-info p { margin: 0 0 24px; padding-bottom: 22px; border-bottom: 1px dashed var(--bk-line); color: var(--bk-cream); font-family: var(--bk-sans); font-weight: 300; font-size: 0.95em; line-height: 2.1; }
.bk-access-info p:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
.bk-access-info strong { color: var(--bk-muted); font-family: var(--bk-cinzel); font-weight: 400; font-size: 0.75em; letter-spacing: 0.3em; text-transform: uppercase; display: block; margin-bottom: 10px; }
.bk-access-info a { color: var(--bk-gold); text-decoration: none; border-bottom: 1px solid var(--bk-line); transition: border-color 0.3s; }
.bk-access-info a:hover { border-bottom-color: var(--bk-gold); }
.bk-access-map { position: relative; overflow: hidden; }
.bk-access-map iframe { width: 100%; height: 100%; min-height: 480px; border: 1px solid var(--bk-line); filter: invert(0.92) hue-rotate(180deg) saturate(0.5); }

/* ─── FAQ ─── */
.bk-faq-list { max-width: 880px; margin: 0 auto; }
.bk-faq-item { border-top: 1px solid var(--bk-line); padding: 28px 0; cursor: pointer; }
.bk-faq-item:last-child { border-bottom: 1px solid var(--bk-line); }
.bk-faq-item summary { color: var(--bk-gold); font-family: var(--bk-serif-jp); font-weight: 300; font-size: 1.1em; list-style: none; position: relative; padding-right: 44px; letter-spacing: 0.1em; transition: color 0.3s; }
.bk-faq-item summary::-webkit-details-marker { display: none; }
.bk-faq-item summary::after { content: "＋"; position: absolute; right: 0; top: 50%; transform: translateY(-50%); font-size: 1.4em; color: var(--bk-gold); transition: transform 0.4s; font-weight: 200; }
.bk-faq-item[open] summary::after { transform: translateY(-50%) rotate(135deg); }
.bk-faq-item summary:hover { color: var(--bk-gold-bright); }
.bk-faq-item p { color: rgba(243,238,223,0.72); font-family: var(--bk-sans); font-weight: 300; font-size: 0.95em; line-height: 2.2; margin: 22px 0 0; padding-right: 44px; }

/* ─── Final CTA ─── */
.bk-final-cta {
  text-align: center; padding: 180px 30px !important;
  background:
    linear-gradient(rgba(8,8,10,0.82), rgba(8,8,10,0.92)),
    url('https://bar-kofu.com/wp-content/uploads/2025/07/00-29-1-scaled.jpg') center/cover fixed;
}
.bk-final-cta h2 { font-family: var(--bk-serif-jp); font-weight: 200; font-size: clamp(2em, 5vw, 3.5em); color: var(--bk-gold); margin: 0 0 28px; letter-spacing: 0.15em; }
.bk-final-cta p { font-family: var(--bk-serif-en); font-style: italic; font-size: 1.2em; color: rgba(243,238,223,0.9); margin: 0 0 56px; letter-spacing: 0.1em; }
.bk-final-cta .bk-btn { margin: 8px; }

/* ─── News ─── */
.bk-news-list { list-style: none !important; padding: 0 !important; max-width: 880px; margin: 0 auto !important; }
.bk-news-list li {
  background: transparent !important; border: none !important;
  border-top: 1px solid var(--bk-line) !important;
  padding: 26px 0 !important; margin-bottom: 0 !important; border-radius: 0 !important;
  transition: all 0.4s;
}
.bk-news-list li:last-child { border-bottom: 1px solid var(--bk-line); }
.bk-news-list li:hover { background: var(--bk-black-2) !important; padding-left: 20px !important; padding-right: 20px !important; }
.bk-news-list a { color: var(--bk-cream) !important; text-decoration: none !important; display: block; font-family: var(--bk-sans); font-weight: 300; font-size: 0.98em; letter-spacing: 0.05em; }
.bk-news-list time { display: inline-block; font-family: var(--bk-cinzel) !important; color: var(--bk-gold-dim) !important; font-size: 0.85em !important; letter-spacing: 0.2em; margin-right: 24px !important; min-width: 110px; }

/* ─── Reveal animations (scroll-triggered) ─── */
.bk-reveal { opacity: 0; transform: translateY(30px); transition: opacity 1s, transform 1s; }
.bk-reveal.is-visible { opacity: 1; transform: translateY(0); }

/* ─── Mobile ─── */
@media (max-width: 768px) {
  .bk-info-grid { grid-template-columns: repeat(2, 1fr); gap: 30px; }
  .bk-info-grid > div:not(:last-child)::after { display: none; }
  .bk-access-inner { grid-template-columns: 1fr; gap: 40px; }
  .bk-gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .bk-gallery-item:nth-child(2), .bk-gallery-item:nth-child(5) { margin-top: 0; }
  .bk-hero { min-height: 90vh; }
  .bk-info-band, .bk-scenes, .bk-gallery, .bk-features, .bk-menu-preview, .bk-access, .bk-faq, .bk-final-cta, .bk-news { padding: 100px 22px; }
  .bk-section-ornament { margin-bottom: 60px; }
  .bk-btn { padding: 18px 32px; font-size: 0.75em; letter-spacing: 0.25em; }
  .bk-final-cta { background-attachment: scroll !important; padding: 120px 22px !important; }
  .bk-scroll-hint { bottom: 24px; font-size: 0.58em; }
}

@media (prefers-reduced-motion: reduce) {
  .bk-hero-slide { animation: none; opacity: 1; }
  * { animation-duration: 0.01s !important; transition-duration: 0.01s !important; }
}
</style>

<script>
/* Reveal on scroll */
document.addEventListener('DOMContentLoaded', function() {
  const els = document.querySelectorAll('.bk-reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });
  els.forEach(e => io.observe(e));
});
</script>
    <?php
}, 8);
