<?php
/**
 * A-TRUCK SEO改善カスタムコード（fcvanillaテーマ用）
 * 作成: 2026-04-06 by VONDS
 * 対象: svw06.server-can.net / fcvanilla theme
 */

// ============================================================
// 1. OGPタグ出力（AIOSEOが出力しないページ用フォールバック）
// ============================================================
function atruck_ensure_ogp() {
    // AIOSEOが既にOGPを出力している場合はスキップ
    // (AIOSEOはwp_headで出力するため、ここではページ判定で補完)
    // header.phpでucarのOGPはハードコードされているのでそれ以外を補完

    if (is_post_type_archive('ucar') || is_singular('ucar')) return;

    global $post;
    $site_name = get_bloginfo('name');
    $default_image = 'https://www.a-truck.jp/wp/wp-content/uploads/og-default.jpg';

    if (is_front_page() || is_home()) {
        $title = '冷凍車のレンタル・リース・中古トラック売買ならA-TRUCK';
        $description = '冷凍車・冷蔵車・保冷車・ウイング車レンタカー・短期リース・中古トラックの売買・鈑金塗装。大型・増トンもご用意。千葉・埼玉・神奈川・大阪・名古屋・福岡・沖縄の各支店より24時間全国対応。';
        $url = home_url('/');
        $type = 'website';
    } elseif (is_singular()) {
        $title = get_the_title($post->ID) . ' | A-TRUCK';
        $excerpt = has_excerpt($post->ID) ? get_the_excerpt($post->ID) : wp_trim_words(strip_tags($post->post_content), 80, '...');
        $description = $excerpt;
        $url = get_permalink($post->ID);
        $type = 'article';
    } elseif (is_post_type_archive('offices')) {
        $title = '営業所一覧 | A-TRUCK 全国11拠点';
        $description = 'A-TRUCKの営業所一覧。東北・関東・神奈川・名古屋・大阪・九州・沖縄の全国11拠点で冷凍車レンタル・中古トラック売買に対応。';
        $url = home_url('/offices/');
        $type = 'website';
    } elseif (is_post_type_archive('rcar')) {
        $title = 'レンタルトラック一覧 | A-TRUCK';
        $description = '冷凍車・冷凍ウイング車・保冷車・ウイング車・平ボデー・クレーン車のレンタル。全国24時間対応、自社メンテナンス車両。';
        $url = home_url('/rental/list/');
        $type = 'website';
    } else {
        $title = wp_title('|', false, 'right') . 'A-TRUCK';
        $description = get_bloginfo('description');
        $url = home_url($_SERVER['REQUEST_URI']);
        $type = 'website';
    }

    $image = $default_image;
    if (is_singular() && has_post_thumbnail($post->ID)) {
        $thumb = wp_get_attachment_image_src(get_post_thumbnail_id($post->ID), 'large');
        if ($thumb) $image = $thumb[0];
    }

    $description = esc_attr(mb_substr(strip_tags($description), 0, 160));
    ?>
<!-- A-TRUCK OGP Tags -->
<meta property="og:title" content="<?php echo esc_attr($title); ?>">
<meta property="og:description" content="<?php echo $description; ?>">
<meta property="og:type" content="<?php echo $type; ?>">
<meta property="og:url" content="<?php echo esc_url($url); ?>">
<meta property="og:image" content="<?php echo esc_url($image); ?>">
<meta property="og:site_name" content="<?php echo esc_attr($site_name); ?>">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<?php echo esc_attr($title); ?>">
<meta name="twitter:description" content="<?php echo $description; ?>">
<meta name="twitter:image" content="<?php echo esc_url($image); ?>">
<!-- /A-TRUCK OGP Tags -->
    <?php
}
add_action('wp_head', 'atruck_ensure_ogp', 1);


// ============================================================
// 2. LocalBusinessスキーマ（全営業所）
// ============================================================
function atruck_localbusiness_schema() {
    if (!is_front_page() && !is_home() && !is_post_type_archive('offices') && !is_singular('offices')) return;

    $offices = array(
        array('name' => 'A-TRUCK サテライト東北', 'street' => '上愛子字街道42-3', 'city' => '仙台市青葉区', 'region' => '宮城県', 'postal' => '989-3124', 'tel' => '+81-22-369-3995', 'lat' => 38.2876, 'lng' => 140.7938),
        array('name' => 'A-TRUCK サテライト長岡', 'street' => '下条町79-2', 'city' => '長岡市', 'region' => '新潟県', 'postal' => '940-1146', 'tel' => '+81-258-23-2600', 'lat' => 37.4345, 'lng' => 138.8499),
        array('name' => 'A-TRUCK 首都圏支店', 'street' => '高根町1706', 'city' => '船橋市', 'region' => '千葉県', 'postal' => '274-0817', 'tel' => '+81-47-407-1552', 'lat' => 35.7217, 'lng' => 140.0269),
        array('name' => 'A-TRUCK 北関東支店', 'street' => '坂之下687-1', 'city' => '所沢市', 'region' => '埼玉県', 'postal' => '359-0012', 'tel' => '+81-4-2946-9830', 'lat' => 35.7884, 'lng' => 139.4610),
        array('name' => 'A-TRUCK 神奈川支店', 'street' => '下溝307-7', 'city' => '相模原市南区', 'region' => '神奈川県', 'postal' => '252-0335', 'tel' => '+81-42-711-9682', 'lat' => 35.5238, 'lng' => 139.3677),
        array('name' => 'A-TRUCK 名古屋支店', 'street' => '西末広4-57', 'city' => '弥富市', 'region' => '愛知県', 'postal' => '498-0064', 'tel' => '+81-567-68-1970', 'lat' => 35.1153, 'lng' => 136.7266),
        array('name' => 'A-TRUCK 大阪支店', 'street' => '野口875-1', 'city' => '門真市', 'region' => '大阪府', 'postal' => '571-0024', 'tel' => '+81-72-886-1301', 'lat' => 34.7406, 'lng' => 135.5937),
        array('name' => 'A-TRUCK 九州支店', 'street' => '曽根4370-1', 'city' => '北九州市小倉南区', 'region' => '福岡県', 'postal' => '800-0212', 'tel' => '+81-93-482-2091', 'lat' => 33.8326, 'lng' => 130.8808),
        array('name' => 'A-TRUCK 沖縄支店', 'street' => '潮平787-6', 'city' => '糸満市', 'region' => '沖縄県', 'postal' => '901-0302', 'tel' => '+81-98-851-7810', 'lat' => 26.1320, 'lng' => 127.6630),
        array('name' => 'A-TRUCK 市川R&Cセンター', 'street' => '原木3-18-6', 'city' => '市川市', 'region' => '千葉県', 'postal' => '272-0004', 'tel' => '+81-47-303-3902', 'lat' => 35.7068, 'lng' => 139.9384),
    );

    $schema_items = array();
    foreach ($offices as $office) {
        $schema_items[] = array(
            '@type' => 'LocalBusiness',
            '@id' => 'https://www.a-truck.jp/#' . sanitize_title($office['name']),
            'name' => $office['name'],
            'image' => 'https://www.a-truck.jp/wp/wp-content/themes/fcvanilla/img/common/header_logo.png',
            'telephone' => $office['tel'],
            'url' => 'https://www.a-truck.jp/offices/',
            'address' => array(
                '@type' => 'PostalAddress',
                'streetAddress' => $office['street'],
                'addressLocality' => $office['city'],
                'addressRegion' => $office['region'],
                'postalCode' => $office['postal'],
                'addressCountry' => 'JP',
            ),
            'geo' => array(
                '@type' => 'GeoCoordinates',
                'latitude' => $office['lat'],
                'longitude' => $office['lng'],
            ),
            'openingHoursSpecification' => array(
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => array('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
                'opens' => '09:00',
                'closes' => '18:00',
            ),
            'priceRange' => '$$',
            'parentOrganization' => array(
                '@type' => 'Organization',
                'name' => '株式会社A-TRUCK',
                'url' => 'https://www.a-truck.jp',
            ),
        );
    }

    echo "\n<!-- A-TRUCK LocalBusiness Schema -->\n";
    echo '<script type="application/ld+json">' . "\n";
    echo wp_json_encode(array(
        '@context' => 'https://schema.org',
        '@graph' => $schema_items,
    ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    echo "\n</script>\n";
    echo "<!-- /A-TRUCK LocalBusiness Schema -->\n";
}
add_action('wp_head', 'atruck_localbusiness_schema', 5);


// ============================================================
// 3. テストページに noindex 設定
// ============================================================
function atruck_noindex_test_pages() {
    if (!is_page()) return;

    $slug = get_post_field('post_name', get_the_ID());
    $test_slugs = array(
        'azcom_form_test20251110',
        'customer_information_registration_test',
        'contact_test20251016',
    );

    if (in_array($slug, $test_slugs)) {
        echo '<meta name="robots" content="noindex, nofollow">' . "\n";
    }
}
add_action('wp_head', 'atruck_noindex_test_pages', 1);


// ============================================================
// 4. Serviceスキーマ
// ============================================================
function atruck_service_schema() {
    if (!is_front_page() && !is_home() && !is_page('rental') && !is_page('repair') && !is_page('used')) return;

    $schemas = array();

    if (is_front_page() || is_home() || is_page('rental')) {
        $schemas[] = array(
            '@type' => 'Service',
            'name' => '冷凍車・トラックレンタル',
            'description' => '冷凍車・冷凍ウイング車・保冷車・ウイング車のレンタル。全国24時間対応、自社メンテナンス車両。土日祝日営業。',
            'provider' => array('@type' => 'Organization', 'name' => '株式会社A-TRUCK', 'url' => 'https://www.a-truck.jp'),
            'areaServed' => array('@type' => 'Country', 'name' => 'Japan'),
            'serviceType' => 'トラックレンタル',
        );
    }

    if (is_front_page() || is_home() || is_page('repair')) {
        $schemas[] = array(
            '@type' => 'Service',
            'name' => 'トラック鈑金塗装・修理',
            'description' => 'トラック専門の鈑金塗装・修理・架装サービス。キャビン修理、床張替、塗装に対応。',
            'provider' => array('@type' => 'Organization', 'name' => '株式会社A-TRUCK', 'url' => 'https://www.a-truck.jp'),
            'areaServed' => array('@type' => 'Country', 'name' => 'Japan'),
            'serviceType' => '鈑金塗装・修理',
        );
    }

    if (is_front_page() || is_home() || is_page('used')) {
        $schemas[] = array(
            '@type' => 'Service',
            'name' => '中古トラック販売・買取',
            'description' => '冷凍車・冷凍ウイング車、アルミウイング、アルミバン、平ボデー、クレーン車、ダンプ等の中古トラック販売・買取・下取り。',
            'provider' => array('@type' => 'Organization', 'name' => '株式会社A-TRUCK', 'url' => 'https://www.a-truck.jp'),
            'areaServed' => array('@type' => 'Country', 'name' => 'Japan'),
            'serviceType' => '中古トラック販売',
        );
    }

    if (!empty($schemas)) {
        echo "\n<!-- A-TRUCK Service Schema -->\n";
        echo '<script type="application/ld+json">' . "\n";
        echo wp_json_encode(array(
            '@context' => 'https://schema.org',
            '@graph' => $schemas,
        ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        echo "\n</script>\n";
        echo "<!-- /A-TRUCK Service Schema -->\n";
    }
}
add_action('wp_head', 'atruck_service_schema', 5);


// ============================================================
// 5. 画像alt属性の自動補完
// ============================================================
function atruck_auto_alt_attribute($content) {
    if (empty($content)) return $content;

    // alt=""（空）の画像にファイル名からaltを生成
    $content = preg_replace_callback(
        '/<img([^>]*?)alt\s*=\s*["\'][\s]*["\']([^>]*?)>/i',
        function($matches) {
            if (preg_match('/src\s*=\s*["\']([^"\']+)["\']/i', $matches[1] . $matches[2], $src_match)) {
                $filename = pathinfo(parse_url($src_match[1], PHP_URL_PATH), PATHINFO_FILENAME);
                $alt_text = str_replace(array('-', '_'), ' ', $filename);
                $alt_text = ucfirst(trim($alt_text));
                return '<img' . $matches[1] . 'alt="' . esc_attr($alt_text) . '"' . $matches[2] . '>';
            }
            return $matches[0];
        },
        $content
    );

    // alt属性がない画像にも追加
    $content = preg_replace_callback(
        '/<img(?![^>]*alt\s*=)([^>]*?)>/i',
        function($matches) {
            if (preg_match('/src\s*=\s*["\']([^"\']+)["\']/i', $matches[1], $src_match)) {
                $filename = pathinfo(parse_url($src_match[1], PHP_URL_PATH), PATHINFO_FILENAME);
                $alt_text = str_replace(array('-', '_'), ' ', $filename);
                $alt_text = ucfirst(trim($alt_text));
                return '<img alt="' . esc_attr($alt_text) . '"' . $matches[1] . '>';
            }
            return $matches[0];
        },
        $content
    );

    return $content;
}
add_filter('the_content', 'atruck_auto_alt_attribute', 99);
add_filter('post_thumbnail_html', 'atruck_auto_alt_attribute', 99);
add_filter('widget_text', 'atruck_auto_alt_attribute', 99);


// ============================================================
// 6. 日本語URL 301リダイレクト
// ============================================================
function atruck_redirect_japanese_urls() {
    if (is_admin()) return;

    $redirects = array(
        '/マッチングリース-冷凍車･ウイング車のレンタ/' => '/matching-lease/',
        '/news/北村製作所-指定サービス工場に認定されました！/' => '/news/kitamura-authorized-service/',
        '/news/物流ソリューション紹介サイト「ユアロジ」にて/' => '/news/yourlogi-introduction/',
        '/news/3tワイドロング積載車の取り扱いがスタートしまし/' => '/news/3t-wide-long-carrier-start/',
        '/news/「私の幸福しあわせ時間」テレビ出演/' => '/news/tv-shiawase-jikan/',
        '/news/一部サービス料金額変更のお知らせ/' => '/news/price-change-notice/',
        '/news/a-truckが取組んでいるsdgsレポートを紹介いたします/' => '/news/sdgs-report/',
        '/news/sdgsの取組みにおいて千葉銀行様より融資を受けま/' => '/news/sdgs-chibabank-loan/',
        '/news/船橋市小学校の2024年度版副教材に-a-truckが掲載されま/' => '/news/funabashi-school-textbook-2024/',
        '/news/軽平ボデーの取扱いがスタートしました！/' => '/news/light-flatbed-start/',
        '/news/タウンエーストラックの取扱いがスタートしまし/' => '/news/townace-truck-start/',
        '/news/4tダンプの取扱いがスタートしました！/' => '/news/4t-dump-start/',
        '/news/2tショートダブルキャブ平ボデー垂直ｹﾞｰﾄ付/' => '/news/2t-short-doublecab-flatbed-gate/',
        '/news/3tショート平ボデーの取扱いがスタートしました！/' => '/news/3t-short-flatbed-start/',
        '/news/3tワイド超ロング平ボデーの取扱いがスタートしま/' => '/news/3t-wide-superlong-flatbed-start/',
        '/news/コロナ禍応援キャンペーン、2月も引き続き実施中/' => '/news/covid-support-campaign-feb/',
        '/news/3月のトラックレンタルが早期予約でお得！！コロ/' => '/news/march-early-booking-discount/',
        '/news/3月限定！大型＆4t冷凍車のマンスリー料金が30オフ/' => '/news/march-freezer-monthly-30off/',
        '/news/1boxバンの取り扱いがスタートしました！/' => '/news/1box-van-start/',
        '/news/bayfmオリジナルポッドキャスト番組制作協力・cmのお/' => '/news/bayfm-podcast-cm/',
        '/news/船橋市小学校の副教材に-a-truckが掲載されました/' => '/news/funabashi-school-textbook/',
        '/news/中古トラックパーツ取り扱い始めました/' => '/news/used-truck-parts-start/',
        '/news/スモールワールズtokyoにa-truckミニカー/' => '/news/smallworlds-tokyo-minicar/',
    );

    $request_uri = urldecode($_SERVER['REQUEST_URI']);

    foreach ($redirects as $old => $new) {
        if ($request_uri === $old || $request_uri === rtrim($old, '/')) {
            wp_redirect(home_url($new), 301);
            exit;
        }
    }
}
add_action('template_redirect', 'atruck_redirect_japanese_urls', 1);
