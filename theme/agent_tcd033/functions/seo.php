<?php

$prefix = 'tcd-w_';

$meta_box = array(
 'id' => 'my-meta-box',
 'title' => __('Meta title and description', 'tcd-w'),
 'context' => 'normal',
 'priority' => 'high',
 'fields' => array(
    array(
      'name' => __('Meta title', 'tcd-w'),
      'desc' => __('Enter meta title here.', 'tcd-w'),
      'id' => $prefix . 'meta_title',
      'type' => 'text',
      'std' => ''
    ),
    array(
      'name' => __('Meta description', 'tcd-w'),
      'desc' => __('Enter meta description here.', 'tcd-w'),
      'id' => $prefix . 'meta_description',
      'type' => 'textarea',
      'std' => ''
    ),
  )
);



add_action('admin_menu', 'mytheme_add_box');
// Add meta box
function mytheme_add_box() {
  global $meta_box;
  add_meta_box($meta_box['id'], $meta_box['title'], 'mytheme_show_box', 'post', $meta_box['context'], $meta_box['priority']);
  add_meta_box($meta_box['id'], $meta_box['title'], 'mytheme_show_box', 'page', $meta_box['context'], $meta_box['priority']);
}



// Callback function to show fields in meta box
function mytheme_show_box() {
  global $meta_box, $post;

?>
<script type="text/javascript">
jQuery(document).ready(function($){
  countField("#tcd-w_meta_description");
});
 
function countField(target) {
  jQuery(target).after("<span class=\"word_counter\" style='display:block; margin:0 15px 0 0; font-weight:bold;'></span>");
  jQuery(target).bind({
    keyup: function() {
      setCounter();
    },
    change: function() {
      setCounter();
    }
  });
  setCounter();
  function setCounter(){
    jQuery("span.word_counter").text("<?php _e('word count:', 'tcd-w'); ?>"+jQuery(target).val().length);
  };
}
</script>
<?php
  // Use nonce for verification
  echo '<input type="hidden" name="mytheme_meta_box_nonce" value="', wp_create_nonce(basename(__FILE__)), '" />';
  echo '<table class="form-table">';

  foreach ($meta_box['fields'] as $field) {

    // get current post meta data
    $meta = get_post_meta($post->ID, $field['id'], true);

    echo '<tr>',
      '<th style="width:20%"><label for="', $field['id'], '">', $field['name'], '</label></th>',
      '<td>';
    switch ($field['type']) {
      case 'text':
        echo '<input type="text" name="', $field['id'], '" id="', $field['id'], '" value="', $meta ? $meta : $field['std'], '" size="30" style="width:97%" />', '<p>', $field['desc'], '</p>';
        break;
      case 'textarea':
        echo '<textarea name="', $field['id'], '" id="', $field['id'], '" cols="60" rows="4" style="width:97%">', $meta ? $meta : $field['std'], '</textarea>', '<p>', $field['desc'] , '</p>';
        break;
    }
    echo '</td><td>',
      '</td></tr>';
  }

  echo '</table>';

}



add_action('save_post', 'mytheme_save_data');
// Save data from meta box

function mytheme_save_data($post_id) {
  global $meta_box;

  // verify nonce
  if (!isset($_POST['mytheme_meta_box_nonce']) || !wp_verify_nonce($_POST['mytheme_meta_box_nonce'], basename(__FILE__))) {
    return $post_id;
  }

  // check autosave
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
    return $post_id;
  }

  // check permissions
  if ('page' == $_POST['post_type']) {
    if (!current_user_can('edit_page', $post_id)) {
      return $post_id;
    }
  } elseif (!current_user_can('edit_post', $post_id)) {
      return $post_id;
  }

  foreach ($meta_box['fields'] as $field) {
    $old = get_post_meta($post_id, $field['id'], true);
    $new = $_POST[$field['id']];

    if ($new && $new != $old) {
      update_post_meta($post_id, $field['id'], $new);
    } elseif ('' == $new && $old) {
      delete_post_meta($post_id, $field['id'], $old);
    }
  }

}



// titleタグ --------------------------------------------------------------------------------
// 統一フォーマット: 「ページ名 | オフィスVONDS 山梨」
function seo_title($title, $sep) {

 global $post, $page, $paged;
 $site_suffix = 'オフィスVONDS 山梨';

 if (is_feed()) {
   return $title;
 }

 // カスタムフィールドにmeta titleがある場合はそれを使用
 if ((is_single() || is_page()) && get_post_meta($post->ID, 'tcd-w_meta_title', true)) {
   $page_title = get_post_meta($post->ID, 'tcd-w_meta_title', true);
   return esc_html($page_title) . ' | ' . $site_suffix;
 }

 // トップページ
 if (is_front_page() || is_home()) {
   $site_description = get_bloginfo('description', 'display');
   $page_title = $site_description ? $site_description : get_bloginfo('name');
   if ($paged >= 2 || $page >= 2) {
     $page_title .= ' - ' . sprintf(__('Page %s', 'tcd-w'), max($paged, $page));
   }
   return $page_title . ' | ' . $site_suffix;
 }

 // カテゴリページ
 if (is_category()) {
   return single_cat_title('', false) . ' | ' . $site_suffix;
 }

 // タグページ
 if (is_tag()) {
   return single_tag_title('', false) . ' | ' . $site_suffix;
 }

 // 検索結果ページ
 if (is_search()) {
   return '「' . get_search_query() . '」の検索結果 | ' . $site_suffix;
 }

 // 日別アーカイブ
 if (is_day()) {
   return get_the_time(__('Y年n月j日', 'tcd-w')) . 'の記事 | ' . $site_suffix;
 }

 // 月別アーカイブ
 if (is_month()) {
   return get_the_time(__('Y年n月', 'tcd-w')) . 'の記事 | ' . $site_suffix;
 }

 // 年別アーカイブ
 if (is_year()) {
   return get_the_time(__('Y年', 'tcd-w')) . 'の記事 | ' . $site_suffix;
 }

 // 著者アーカイブ
 if (is_author()) {
   global $wp_query;
   $curauth = $wp_query->get_queried_object();
   return $curauth->display_name . ' | ' . $site_suffix;
 }

 // 404ページ
 if (is_404()) {
   return 'ページが見つかりません | ' . $site_suffix;
 }

 // 投稿・固定ページ（カスタムフィールドなし）
 if (is_single() || is_page()) {
   return get_the_title() . ' | ' . $site_suffix;
 }

 // その他
 return $title . ' | ' . $site_suffix;

}
add_filter('wp_title', 'seo_title', 10, 2);



// meta descriptionタグ --------------------------------------------------------------------------------
function seo_description() {

 global $post;
 $default_desc = '山梨県甲府市のSEO対策・Webマーケティング会社オフィスVONDS。データドリブンな施策で集客と売上アップを実現します。';

 // カスタムフィールドがある場合
 if ((is_single() || is_page()) && get_post_meta($post->ID, 'tcd-w_meta_description', true)) {
  $trim_content = post_custom('tcd-w_meta_description');
  $trim_content = str_replace(array("\r\n", "\r", "\n"), "", $trim_content);
  $trim_content = htmlspecialchars($trim_content);
  echo $trim_content;

 // トップページの場合
 } elseif (is_front_page()) {
    echo $default_desc;

 // 抜粋記事が登録されている場合は出力
 } elseif ((is_single() || is_page()) && has_excerpt()) {
  $trim_content = get_the_excerpt();
  $trim_content = str_replace(array("\r\n", "\r", "\n"), "", $trim_content);
  echo $trim_content;

 // 上記が無い場合は本文から120文字を抜粋
 } elseif (is_single() || is_page()) {

   $base_content = $post->post_content;
   $base_content = preg_replace('!<style.*?>.*?</style.*?>!is', '', $base_content);
   $base_content = preg_replace('!<script.*?>.*?</script.*?>!is', '', $base_content);
   $base_content = preg_replace('/\[.+\]/','', $base_content);
   $base_content = strip_tags($base_content);
   $trim_content = mb_substr($base_content, 0, 120, "utf-8");
   $trim_content = str_replace(']]>', ']]&gt;', $trim_content);
   $trim_content = str_replace(array("\r\n", "\r", "\n"), "", $trim_content);
   $trim_content = htmlspecialchars($trim_content);
   $trim_content = preg_replace('/( |　)/', '', $trim_content);

   if ($trim_content == "") {
      echo $default_desc;
   } else {
     if (preg_match("/。/", $trim_content)) {
       mb_regex_encoding("UTF-8");
       $trim_content = mb_ereg_replace('。[^。]*$', '。', $trim_content);
       echo $trim_content;
     } else {
       echo $trim_content . '...';
     };
   }

 // カテゴリページ
 } elseif (is_category()) {
  if (category_description()) {
    $category_desc = strip_tags(category_description());
    $category_desc = str_replace(array("\r\n", "\r", "\n"), "", $category_desc);
    echo esc_html($category_desc);
  } else {
    echo 'オフィスVONDSの「' . single_cat_title('', false) . '」に関する記事一覧です。山梨のSEO・Web集客の最新情報をお届けします。';
  };

 // タグページ
 } elseif (is_tag()) {
    echo '「' . single_tag_title('', false) . '」タグの記事一覧。オフィスVONDSが発信するSEO・Webマーケティング情報です。';

 // 日別アーカイブ
 } elseif (is_day()) {
    echo get_the_time('Y年n月j日') . 'に公開されたオフィスVONDSの記事一覧です。';

 // 月別アーカイブ
 } elseif (is_month()) {
    echo get_the_time('Y年n月') . 'に公開されたオフィスVONDSの記事一覧です。';

 // 年別アーカイブ
 } elseif (is_year()) {
    echo get_the_time('Y年') . 'に公開されたオフィスVONDSの記事一覧です。';

 // 著者アーカイブ
 } elseif (is_author()) {
    global $wp_query;
    $curauth = $wp_query->get_queried_object();
    echo $curauth->display_name . 'が執筆したオフィスVONDSの記事一覧です。';

 // 検索結果
 } elseif (is_search()) {
    echo '「' . get_search_query() . '」の検索結果一覧 - オフィスVONDS';

 // 404
 } elseif (is_404()) {
    echo 'お探しのページは見つかりませんでした。オフィスVONDS - 山梨県甲府市のSEO対策・Webマーケティング会社。';

 // その他
 } else {
    echo $default_desc;
 };

};



// JSON-LD 構造化データ --------------------------------------------------------------------------------

// LocalBusiness 構造化データ
function vonds_jsonld_local_business() {
?>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://vonds.co.jp/#localbusiness",
  "name": "オフィスVONDS",
  "alternateName": "Office VONDS",
  "description": "山梨県甲府市のSEO対策・Webマーケティング会社。データドリブンな施策で地域ビジネスの集客と売上アップを実現します。",
  "url": "https://vonds.co.jp/",
  "telephone": "",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "",
    "addressLocality": "甲府市",
    "addressRegion": "山梨県",
    "postalCode": "",
    "addressCountry": "JP"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 35.6642,
    "longitude": 138.5684
  },
  "areaServed": {
    "@type": "AdministrativeArea",
    "name": "山梨県"
  },
  "serviceType": ["SEO対策", "Webマーケティング", "Web集客コンサルティング", "ホームページ制作"],
  "priceRange": "$$",
  "sameAs": []
}
</script>
<?php
}

// BreadcrumbList 構造化データ
function vonds_jsonld_breadcrumb() {
  global $post;
  $items = array();
  $position = 1;

  // ホームは常に最初
  $items[] = array(
    '@type' => 'ListItem',
    'position' => $position++,
    'name' => 'ホーム',
    'item' => esc_url(home_url('/'))
  );

  if (is_category()) {
    $cat = get_queried_object();
    // 親カテゴリがある場合
    if ($cat->parent != 0) {
      $ancestors = array_reverse(get_ancestors($cat->cat_ID, 'category'));
      foreach ($ancestors as $ancestor) {
        $items[] = array(
          '@type' => 'ListItem',
          'position' => $position++,
          'name' => get_cat_name($ancestor),
          'item' => esc_url(get_category_link($ancestor))
        );
      }
    }
    $items[] = array(
      '@type' => 'ListItem',
      'position' => $position++,
      'name' => $cat->cat_name
    );

  } elseif (is_single()) {
    $categories = get_the_category();
    if ($categories) {
      $items[] = array(
        '@type' => 'ListItem',
        'position' => $position++,
        'name' => $categories[0]->name,
        'item' => esc_url(get_category_link($categories[0]->term_id))
      );
    }
    $items[] = array(
      '@type' => 'ListItem',
      'position' => $position++,
      'name' => get_the_title()
    );

  } elseif (is_page() && !is_front_page()) {
    // 親ページがある場合
    if ($post->post_parent) {
      $ancestors = array_reverse(get_post_ancestors($post->ID));
      foreach ($ancestors as $ancestor) {
        $items[] = array(
          '@type' => 'ListItem',
          'position' => $position++,
          'name' => get_the_title($ancestor),
          'item' => esc_url(get_permalink($ancestor))
        );
      }
    }
    $items[] = array(
      '@type' => 'ListItem',
      'position' => $position++,
      'name' => get_the_title()
    );

  } elseif (is_tag()) {
    $items[] = array(
      '@type' => 'ListItem',
      'position' => $position++,
      'name' => single_tag_title('', false)
    );

  } elseif (is_search()) {
    $items[] = array(
      '@type' => 'ListItem',
      'position' => $position++,
      'name' => '「' . get_search_query() . '」の検索結果'
    );

  } elseif (is_404()) {
    $items[] = array(
      '@type' => 'ListItem',
      'position' => $position++,
      'name' => 'ページが見つかりません'
    );

  } elseif (is_archive()) {
    if (is_day()) {
      $items[] = array('@type' => 'ListItem', 'position' => $position++, 'name' => get_the_time('Y年n月j日') . 'の記事');
    } elseif (is_month()) {
      $items[] = array('@type' => 'ListItem', 'position' => $position++, 'name' => get_the_time('Y年n月') . 'の記事');
    } elseif (is_year()) {
      $items[] = array('@type' => 'ListItem', 'position' => $position++, 'name' => get_the_time('Y年') . 'の記事');
    }
  }

  // トップページのみの場合はパンくずを出力しない
  if (count($items) <= 1) return;

  $jsonld = array(
    '@context' => 'https://schema.org',
    '@type' => 'BreadcrumbList',
    'itemListElement' => $items
  );

  echo '<script type="application/ld+json">' . "\n";
  echo json_encode($jsonld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
  echo "\n</script>\n";
}

// JSON-LDをwp_headに出力
function vonds_output_jsonld() {
  vonds_jsonld_local_business();
  if (!is_front_page()) {
    vonds_jsonld_breadcrumb();
  }
}
add_action('wp_head', 'vonds_output_jsonld', 99);



// コロナ関連記事にnoindexを追加 --------------------------------------------------------------------------------
function vonds_noindex_corona() {
  global $post;
  if (!is_single()) return;

  $title = get_the_title();
  $content = $post->post_content;
  $categories = get_the_category();
  $cat_names = array_map(function($c) { return $c->name; }, $categories);
  $cat_string = implode(' ', $cat_names);

  // コロナ関連キーワードを判定
  $corona_keywords = array('コロナ', 'COVID', 'covid', 'corona', 'Corona', '新型ウイルス', '緊急事態宣言', 'ワクチン');
  foreach ($corona_keywords as $keyword) {
    if (mb_strpos($title, $keyword) !== false || mb_strpos($cat_string, $keyword) !== false) {
      echo '<meta name="robots" content="noindex, follow">' . "\n";
      return;
    }
  }
}
add_action('wp_head', 'vonds_noindex_corona', 1);


?>