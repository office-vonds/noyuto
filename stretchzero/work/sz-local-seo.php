<?php
/**
 * Plugin Name: ストレッチゼロ Local SEO Enhancement
 * Description: Google Maps上位表示のための構造化データ・地図埋め込み
 * Version: 1.0.0
 * Author: VONDS
 */

if (!defined('ABSPATH')) exit;

// 店舗データ定義
function sz_get_stores() {
    return [
        'shop-kofu' => [
            'name' => 'ストレッチゼロ 甲府上石田店',
            'street' => '山梨県甲府市上石田3丁目12-12',
            'postal' => '400-0041',
            'region' => '山梨県',
            'locality' => '甲府市',
            'tel' => '055-242-7011',
            'lat' => 35.6544,
            'lng' => 138.5575,
            'rating' => '4.52',
            'reviews' => '65',
            'place_id' => '0x601bf9aeca86c77b:0x230d8915de86dbf7',
            'maps_url' => 'https://maps.app.goo.gl/hkqec9MjHfqLgBnU8',
            'page_url' => 'https://stretchzero.jp/shop/shop-kofu/',
        ],
        'shop-kai-hibikigaoka' => [
            'name' => 'ストレッチゼロ 甲斐響が丘店',
            'street' => '山梨県甲斐市龍地3579-9',
            'postal' => '400-0104',
            'region' => '山梨県',
            'locality' => '甲斐市',
            'tel' => '050-8887-2377',
            'lat' => 35.6784,
            'lng' => 138.5142,
            'rating' => '5.00',
            'reviews' => '2',
            'place_id' => '0x601c09aab0b3f25b:0xfac011d5d27576f6',
            'maps_url' => 'https://maps.app.goo.gl/eTmK4dt7KomDw4zK7',
            'page_url' => 'https://stretchzero.jp/shop/shop-kai-hibikigaoka/',
        ],
        'shop-nirasaki' => [
            'name' => 'ストレッチゼロ 韮崎店',
            'street' => '山梨県韮崎市藤井町南下條241-1',
            'postal' => '407-0004',
            'region' => '山梨県',
            'locality' => '韮崎市',
            'tel' => '050-8887-6260',
            'lat' => 35.7190313,
            'lng' => 138.4512251,
            'rating' => '4.65',
            'reviews' => '26',
            'place_id' => '0x601c0b02ea043493:0xf102ea736379490a',
            'maps_url' => 'https://maps.app.goo.gl/LhyN1NY7iqmMehj27',
            'page_url' => 'https://stretchzero.jp/shop/shop-nirasaki/',
        ],
        'shop-minami-alps' => [
            'name' => 'ストレッチゼロ 南アルプス店',
            'street' => '山梨県南アルプス市十五所700-1',
            'postal' => '400-0305',
            'region' => '山梨県',
            'locality' => '南アルプス市',
            'tel' => '050-8884-3492',
            'lat' => 35.6181061,
            'lng' => 138.4688872,
            'rating' => '4.50',
            'reviews' => '27',
            'place_id' => '0x601bf5a56a07138f:0x529aae63fceb0fbc',
            'maps_url' => 'https://maps.app.goo.gl/9sKWfmy1fksaX6Zg8',
            'page_url' => 'https://stretchzero.jp/shop/shop-minami-alps/',
        ],
    ];
}

// 既存の簡易JSON-LDを除去し、強化版を出力
add_action('wp_head', 'sz_enhanced_jsonld', 5);
function sz_enhanced_jsonld() {
    if (is_front_page() || is_page('elementor-11')) {
        sz_output_organization_schema();
    }

    $stores = sz_get_stores();
    $slug = get_post_field('post_name', get_the_ID());

    if (isset($stores[$slug])) {
        sz_output_store_schema($stores[$slug]);
    }
}

// 既存の手動JSON-LDを除去するフィルター
add_filter('the_content', 'sz_remove_old_jsonld', 999);
function sz_remove_old_jsonld($content) {
    $stores = sz_get_stores();
    $slug = get_post_field('post_name', get_the_ID());
    if (isset($stores[$slug]) || is_front_page()) {
        $content = preg_replace(
            '/<script\s+type=["\']application\/ld\+json["\'][^>]*>.*?<\/script>/is',
            '',
            $content
        );
    }
    return $content;
}

// 組織スキーマ（トップページ用）
function sz_output_organization_schema() {
    $stores = sz_get_stores();
    $departments = [];
    foreach ($stores as $store) {
        $departments[] = [
            '@type' => 'HealthAndBeautyBusiness',
            'name' => $store['name'],
            'telephone' => $store['tel'],
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => $store['street'],
                'addressLocality' => $store['locality'],
                'addressRegion' => $store['region'],
                'postalCode' => $store['postal'],
                'addressCountry' => 'JP',
            ],
            'geo' => [
                '@type' => 'GeoCoordinates',
                'latitude' => $store['lat'],
                'longitude' => $store['lng'],
            ],
            'url' => $store['page_url'],
            'hasMap' => $store['maps_url'],
        ];
    }

    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
        'name' => 'ストレッチゼロ',
        'alternateName' => 'Stretch Zero',
        'url' => 'https://stretchzero.jp/',
        'logo' => 'https://stretchzero.jp/wp-content/uploads/2023/12/logo.png',
        'description' => '山梨県で肩こり・腰痛・姿勢改善なら「ストレッチゼロ」。甲府・甲斐・南アルプス・韮崎に4店舗。理学療法士在籍のパーソナルストレッチ専門店。',
        'parentOrganization' => [
            '@type' => 'Organization',
            'name' => 'SANKEN株式会社',
            'url' => 'https://stretchzero.jp/company/',
        ],
        'numberOfEmployees' => [
            '@type' => 'QuantitativeValue',
            'minValue' => 10,
        ],
        'areaServed' => [
            '@type' => 'State',
            'name' => '山梨県',
        ],
        'department' => $departments,
        'sameAs' => [],
    ];

    echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>' . "\n";
}

// 店舗スキーマ（各店舗ページ用）
function sz_output_store_schema($store) {
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'HealthAndBeautyBusiness',
        'name' => $store['name'],
        'description' => $store['locality'] . 'のストレッチ・整体・マッサージ専門店。理学療法士在籍。肩こり・腰痛・姿勢改善にパーソナルストレッチで根本アプローチ。',
        'image' => 'https://stretchzero.jp/wp-content/uploads/2023/12/logo.png',
        'address' => [
            '@type' => 'PostalAddress',
            'streetAddress' => $store['street'],
            'addressLocality' => $store['locality'],
            'addressRegion' => $store['region'],
            'postalCode' => $store['postal'],
            'addressCountry' => 'JP',
        ],
        'geo' => [
            '@type' => 'GeoCoordinates',
            'latitude' => $store['lat'],
            'longitude' => $store['lng'],
        ],
        'telephone' => $store['tel'],
        'url' => $store['page_url'],
        'hasMap' => $store['maps_url'],
        'openingHoursSpecification' => [
            [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
                'opens' => '09:00',
                'closes' => '22:00',
            ],
        ],
        'priceRange' => '¥3,000〜¥15,000',
        'paymentAccepted' => '現金, クレジットカード',
        'aggregateRating' => [
            '@type' => 'AggregateRating',
            'ratingValue' => $store['rating'],
            'reviewCount' => $store['reviews'],
            'bestRating' => '5',
            'worstRating' => '1',
        ],
        'parentOrganization' => [
            '@type' => 'Organization',
            'name' => 'SANKEN株式会社',
        ],
        'isAcceptingNewPatients' => true,
    ];

    echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>' . "\n";
}

// Google Maps iframe埋め込み（各店舗ページのコンテンツ末尾）
add_filter('the_content', 'sz_add_google_map', 998);
function sz_add_google_map($content) {
    $stores = sz_get_stores();
    $slug = get_post_field('post_name', get_the_ID());

    if (!isset($stores[$slug])) return $content;

    $store = $stores[$slug];
    $q = urlencode($store['name'] . ' ' . $store['street']);

    $map_html = '<div class="sz-google-map" style="margin-top:40px;">';
    $map_html .= '<h3 style="font-size:1.2em;margin-bottom:12px;">アクセス・地図</h3>';
    $map_html .= '<iframe src="https://www.google.com/maps?q=' . $q . '&output=embed" ';
    $map_html .= 'width="100%" height="400" style="border:0;border-radius:8px;" ';
    $map_html .= 'allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">';
    $map_html .= '</iframe>';
    $map_html .= '<p style="margin-top:8px;font-size:0.9em;"><a href="' . $store['maps_url'] . '" target="_blank" rel="noopener">Googleマップで見る</a></p>';
    $map_html .= '</div>';

    return $content . $map_html;
}
