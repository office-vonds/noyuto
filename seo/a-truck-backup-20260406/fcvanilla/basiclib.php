<?php
/*
 * Basic functions
 */

/*
 * fc_is_child_page
 *
 * Return true if one's parent is $slug
 *
 * @param string: slug that you guess your parent
 * @return bool
 */
function fc_is_child_page( $slug, $include_myself = true ) {
  global $post;

  if(is_page()) {
    if($include_myself && basename(get_permalink($parent_id)) == $slug) return true;
    $parents = get_post_ancestors( $post->ID );
    foreach($parents as $parent_id) {
      if(basename(get_permalink($parent_id)) == $slug) return true;
    }
  }
  
  return false;
}

/*
 * Misc functions
 */

/*
 * Display Permalink & ID at list of pages.
 */
function fc_add_page_columns_name($columns)
{
    $columns['slug'] = "URL";
    $columns['id'] = "ID";
    return $columns;
}
function fc_add_page_column($column_name, $post_id)
{
    if ($column_name == 'slug') {
        $permalink = get_permalink($post_id);
        echo "<a href='" . $permalink . "' target='_blank'>" . $permalink . "</a>";
    }
    if ($column_name == 'id') {
        $permalink = get_permalink($post_id);
        echo "<span>$post_id</span>";
    }
}
add_filter('manage_pages_columns', 'fc_add_page_columns_name');
add_action('manage_pages_custom_column', 'fc_add_page_column', 10, 2);

/*
 * Clean up wp_head
 */
remove_action('wp_head', 'feed_links_extra', 3);
remove_action('wp_head', 'feed_links', 2);
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'index_rel_link');
remove_action('wp_head', 'parent_post_rel_link', 10, 0);
remove_action('wp_head', 'start_post_rel_link', 10, 0);
remove_action('wp_head', 'adjacent_posts_rel_link_wp_head', 10, 0);
remove_action('wp_head', 'wp_generator');

/*
 * text short
 */
function fc_text_short($string, $l = 100)
{
    $string = html_entity_decode($string);
    return mb_strimwidth($string, 0, $l, "...", "utf8");
}

/**
 * shortcodes
 */
function fc_template_part($attr){
  ob_start();
  if(isset($attr[0]) && isset($attr[1])) get_template_part('partials/'.$attr[0],$attr[1]);
  elseif(isset($attr[0])) get_template_part('partials/'.$attr[0]);
  return ob_get_clean();
}
add_shortcode('template_part','fc_template_part');

function fc_template_url(){
	ob_start();
	echo get_template_directory_uri();
	return ob_get_clean();
}
add_shortcode('template_url','fc_template_url');

function fc_home_url(){
	ob_start();
	echo home_url();
	return ob_get_clean();
}
add_shortcode('home_url','fc_home_url');

function fc_attr($params = array()) {
    ob_start();
    $para_key = key($params);
    $src = $params[$para_key] ? $params[$para_key] : '';
    $src = preg_replace('/(\..\/){1,}|(\.\/){1,}/U','',$src);
    if(strpos($src, '.') !== false){
        if(strpos($src, '.php') !== false || strpos($src, '.html') !== false ){
            $src =  home_url().'/'. $src;
        }else{
            $src = get_template_directory_uri().'/'. $src;
        }
    }else{
        $src = home_url().'/'. $src;
    }
    echo key($params).'="'.$src.'"';
    return ob_get_clean();
}
add_shortcode('fc_attr', 'fc_attr');

/*
 * remove unnecessary attributes
 */
function fc_remove_type_attr($tag, $handle)
{
    return preg_replace("/type=['\"]text\/(javascript|css)['\"]/", '', $tag);
}
add_filter('script_loader_tag', 'fc_remove_type_attr', 10, 2);

/*
 * disabled visual editor for pages and mwform
 */
function fc_disable_visual_editor_in_page($ret)
{
  if (in_array(get_current_screen()->id, array('page','mw-wp-form'))) {
    return false;
  }
  return $ret;
}
add_filter('user_can_richedit', 'fc_disable_visual_editor_in_page');

/*
 * remove unnecessary attributes from img
 */
function fc_remove_thumbnail_attribute($html) {
  $html = preg_replace('/(width|height)="\d*"\s/', '', $html);

  return $html;
}
add_filter('post_thumbnail_html', 'fc_remove_thumbnail_attribute');

/*
 * add fontsize settings into tinymce
 */
function fc_tinymce_custom_fonts($setting){
  $setting['fontsize_formats'] = "50% 75% 100% 110% 120% 130% 140% 150% 200% 250% 300%";
  return $setting;
}
add_filter('tiny_mce_before_init','fc_tinymce_custom_fonts',5);

/* remove type attribute from <script> */
function fc_replace_script_tag ( $tag ) {
  return str_replace( "type='text/javascript'", '', $tag );
}
add_filter( 'script_loader_tag', 'fc_replace_script_tag' );

/**
 * 西暦→和暦変換
 *
 * @param string $format 'K':元号
 *                       'k':元号略称
 *                       'Q':元号(英語表記)
 *                       'q':元号略称(英語表記)
 *                       'X':和暦年(前ゼロ表記)
 *                       'x':和暦年
 * @param string $time 変換対象となる日付(西暦)‎
 *
 * @return string $result 変換後の日付(和暦)‎
 */
function fc_to_wareki($format, $time='now')
{
    // 元号一覧
    $era_list = [
        // 令和(2019年5月1日〜)
        [
            'jp' => '令和', 'jp_abbr' => '令',
            'en' => 'Reiwa', 'en_abbr' => 'R',
            'time' => '20190501'
        ],
        // 平成(1989年1月8日〜)
        [
            'jp' => '平成', 'jp_abbr' => '平',
            'en' => 'Heisei', 'en_abbr' => 'H',
            'time' => '19890108'
        ],
        // 昭和(1926年12月25日〜)
        [
            'jp' => '昭和', 'jp_abbr' => '昭',
            'en' => 'Showa', 'en_abbr' => 'S',
            'time' => '19261225'
        ],
        // 大正(1912年7月30日〜)
        [
            'jp' => '大正', 'jp_abbr' => '大',
            'en' => 'Taisho', 'en_abbr' => 'T',
            'time' => '19120730'
        ],
        // 明治(1873年1月1日〜)
        // ※明治5年以前は旧暦を使用していたため、明治6年以降から対応
        [
            'jp' => '明治', 'jp_abbr' => '明',
            'en' => 'Meiji', 'en_abbr' => 'M',
            'time' => '18730101'
        ],
    ];

    $dt = new DateTime($time);

    $format_K = '';
    $format_k = '';
    $format_Q = '';
    $format_q = '';
    $format_X = $dt->format('Y');
    $format_x = $dt->format('y');

    foreach ($era_list as $era) {
        $dt_era = new DateTime($era['time']);
        if ($dt->format('Ymd') >= $dt_era->format('Ymd')) {
            $format_K = $era['jp'];
            $format_k = $era['jp_abbr'];
            $format_Q = $era['en'];
            $format_q = $era['en_abbr'];
            $format_X = sprintf('%02d', $format_x = $dt->format('Y') - $dt_era->format('Y') + 1);
            break;
        }
    }

    $result = '';

    foreach (str_split($format) as $val) {
        // フォーマットが指定されていれば置換する
        if (isset(${"format_{$val}"})) {
            $result .= ${"format_{$val}"};
        } else {
            $result .= $dt->format($val);
        }
    }

    return $result;
}