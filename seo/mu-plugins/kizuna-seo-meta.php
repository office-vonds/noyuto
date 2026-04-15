<?php
/**
 * Plugin Name: Kizuna SEO Meta Complete
 * Description: meta description + canonical + OGP を全ページに出力
 * Version: 1.0
 */

// === テーマ側の重複meta出力を除去 ===
add_action("after_setup_theme", function() {
    // テーマが独自にdescription/OGPを出力している場合、それを除去
    remove_action("wp_head", "kizuna_meta_description", 5);
    remove_action("wp_head", "kizuna_ogp", 5);
    remove_action("wp_head", "kizuna_canonical", 5);
    remove_action("wp_head", "rel_canonical");
}, 20);

// 出力バッファでhead内の重複タグを除去
add_action("wp_head", function() {
    ob_start(function($html) {
        // 重複 meta description を除去（最初のものだけ残す）
        $count = substr_count($html, 'meta name="description"');
        if ($count > 1) {
            $first = true;
            $html = preg_replace_callback('/<meta name="description"[^>]*>/', function($m) use (&$first) {
                if ($first) { $first = false; return $m[0]; }
                return '';
            }, $html);
        }
        // 重複 og:title を除去
        $count = substr_count($html, 'og:title');
        if ($count > 1) {
            $first = true;
            $html = preg_replace_callback('/<meta property="og:title"[^>]*>/', function($m) use (&$first) {
                if ($first) { $first = false; return $m[0]; }
                return '';
            }, $html);
        }
        // 重複 twitter:card を除去
        $count = substr_count($html, 'twitter:card');
        if ($count > 1) {
            $first = true;
            $html = preg_replace_callback('/<meta name="twitter:card"[^>]*>/', function($m) use (&$first) {
                if ($first) { $first = false; return $m[0]; }
                return '';
            }, $html);
        }
        // 重複 og:description を除去
        $count = substr_count($html, 'og:description');
        if ($count > 1) {
            $first = true;
            $html = preg_replace_callback('/<meta property="og:description"[^>]*>/', function($m) use (&$first) {
                if ($first) { $first = false; return $m[0]; }
                return '';
            }, $html);
        }
        return $html;
    });
}, 0);

// === meta description 定義 ===
function kizuna_get_descriptions() {
    return [
        "home"      => "山梨・甲府エリアの高収入風俗求人。日給3万〜8万円、未経験歓迎、寮完備、保証制度あり。デリヘル絆なら即日体験入店OK。24時間LINE・電話受付中。",
        "salary"    => "山梨デリヘル絆の給料体系。日給3万〜8万円、完全日払い。指名料・オプション料は全額キャスト還元。月収50万〜100万円以上も可能。",
        "guarantee" => "デリヘル絆の保証制度。全キャスト対象の日給保証で未経験でも安心。出稼ぎ・体験入店の方も初日から保証適用。",
        "flow"      => "デリヘル絆の面接から入店までの流れ。LINE・電話で応募→面接→最短即日体験OK。服装自由、身分証1つで面接可能。",
        "security"  => "デリヘル絆の身バレ対策・安全対策。顔出しなし、源氏名使用、個人情報厳重管理、送迎ドライバー常駐。プライバシー完全保護。",
        "beginner"  => "風俗未経験でも安心。デリヘル絆は採用率90%以上、丁寧な講習制度あり。20代〜50代まで幅広く在籍。山梨で高収入バイトを始めるなら。",
        "mature"    => "30代・40代・50代歓迎の風俗求人。山梨デリヘル絆は熟女・人妻キャストが主力。年齢を理由に不採用にしません。高収入で安定して稼げます。",
        "dormitory" => "デリヘル絆の寮情報。即入寮OK、家具家電完備、個室。県外からの出稼ぎ大歓迎。生活費を抑えて効率よく稼げる環境。",
        "qa"        => "デリヘル絆のよくある質問。給料・身バレ対策・面接・入店の流れ・寮・保証制度について。初めての方の不安を全て解消。",
        "contact"   => "デリヘル絆への応募・お問い合わせ。24時間LINE・電話受付。面接は服装自由、最短即日。まずはお気軽にご連絡ください。",
        "privacy"   => "デリヘル絆のプライバシーポリシー。個人情報の取り扱いについて。",
        "blog"      => "デリヘル絆のスタッフブログ。実際に働くキャストのリアルな声、体験入店レポート、寮生活の実態など。山梨で風俗バイトを検討中の方へ。",
        "kofu"      => "甲府エリアの風俗求人情報。日給3万〜8万円、寮完備、即日体験OK。東京から特急90分。競争が少なく生活コストが安い甲府が稼げる理由を数字で解説。",
    ];
}

// === meta description 出力 ===
add_action("wp_head", function() {
    $descs = kizuna_get_descriptions();
    $desc = "";

    if (is_front_page()) {
        $desc = $descs["home"];
    } elseif (is_page()) {
        $slug = get_post_field("post_name", get_the_ID());
        if (isset($descs[$slug])) {
            $desc = $descs[$slug];
        }
    } elseif (is_post_type_archive("staff_blog")) {
        $desc = $descs["blog"];
    } elseif (is_singular("staff_blog")) {
        $post = get_post();
        $excerpt = wp_strip_all_tags($post->post_content);
        $desc = mb_substr($excerpt, 0, 120) . "…";
    }

    if ($desc) {
        echo '<meta name="description" content="' . esc_attr($desc) . '" />' . "\n";
    }
}, 1);

// === canonical 出力（既存kizuna-fix-canonical.phpを置換） ===
add_action("wp_head", function() {
    if (is_front_page()) {
        $url = home_url("/");
    } elseif (is_page()) {
        $url = get_permalink();
    } elseif (is_post_type_archive("staff_blog")) {
        $url = home_url("/blog/");
    } elseif (is_singular("staff_blog")) {
        $url = get_permalink();
    } else {
        return;
    }
    echo '<link rel="canonical" href="' . esc_url($url) . '" />' . "\n";
}, 1);

// === OGP 出力 ===
add_action("wp_head", function() {
    $descs = kizuna_get_descriptions();
    $site_name = "山梨風俗求人 絆 -きずな-";
    $default_image = home_url("/wp-content/themes/kizuna-job-theme/images/ogp.jpg");
    $title = "";
    $desc = "";
    $url = "";
    $type = "website";

    if (is_front_page()) {
        $title = "山梨 風俗求人｜甲府デリヘル絆 -きずな- 高収入・未経験歓迎・寮完備";
        $desc = $descs["home"];
        $url = home_url("/");
    } elseif (is_page()) {
        $title = get_the_title();
        $slug = get_post_field("post_name", get_the_ID());
        $desc = isset($descs[$slug]) ? $descs[$slug] : "";
        $url = get_permalink();
    } elseif (is_post_type_archive("staff_blog")) {
        $title = "スタッフブログ｜山梨風俗求人 絆";
        $desc = $descs["blog"];
        $url = home_url("/blog/");
    } elseif (is_singular("staff_blog")) {
        $title = get_the_title();
        $post = get_post();
        $desc = mb_substr(wp_strip_all_tags($post->post_content), 0, 120) . "…";
        $url = get_permalink();
        $type = "article";
    }

    if (!$title || !$url) return;

    echo '<meta property="og:site_name" content="' . esc_attr($site_name) . '" />' . "\n";
    echo '<meta property="og:title" content="' . esc_attr($title) . '" />' . "\n";
    echo '<meta property="og:type" content="' . esc_attr($type) . '" />' . "\n";
    echo '<meta property="og:url" content="' . esc_url($url) . '" />' . "\n";
    if ($desc) {
        echo '<meta property="og:description" content="' . esc_attr($desc) . '" />' . "\n";
    }
    echo '<meta property="og:image" content="' . esc_url($default_image) . '" />' . "\n";
    echo '<meta property="og:locale" content="ja_JP" />' . "\n";
    // Twitter Card
    echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";
    echo '<meta name="twitter:title" content="' . esc_attr($title) . '" />' . "\n";
    if ($desc) {
        echo '<meta name="twitter:description" content="' . esc_attr($desc) . '" />' . "\n";
    }
    echo '<meta name="twitter:image" content="' . esc_url($default_image) . '" />' . "\n";
}, 2);
