<?php
require_once 'basiclib.php';

add_theme_support(‘post-thumbnails’);

function custom_aioseop_title( $title ) {
	if(is_post_type_archive('ucar')) {
		return "中古トラック（冷凍車・ウイング車・大型車）販売車両一覧";
	}
	return $title;
}
add_filter('aioseop_title', 'custom_aioseop_title');

function fc_theme_setup() {
  add_theme_support('post-thumbnails', array( 'offices' ));
  add_theme_support( 'html5', array( 'comment-list', 'comment-form', 'search-form', 'gallery', 'caption', 'style', 'script' ) );
  add_image_size('thumbnail-car',440,330,true);
  add_image_size('thumbnail-truck',850,654,true);

  add_editor_style( 'editor-style.css' );
  add_theme_support( 'editor-styles' );
}
add_action( 'after_setup_theme', 'fc_theme_setup' );

function fc_scripts()
{
  if(!is_admin()) {
    wp_deregister_script('jquery-core');
    wp_enqueue_script('jquery-core', '//cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js', array(), '3.5.1');
    wp_deregister_script('jquery-migrate');
    wp_enqueue_script('jquery-migrate', '//cdnjs.cloudflare.com/ajax/libs/jquery-migrate/3.3.1/jquery-migrate.min.js', array(), '3.3.1');
    wp_enqueue_script('jquery-cookie', '//cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js', array('jquery-core'), '1.4.1',true);
    wp_enqueue_script('polyfill','//polyfill.io/v3/polyfill.min.js?features=Array.prototype.includes',array(),null);
	wp_enqueue_script('iframeapi', '//www.youtube.com/iframe_api',array(),null);

    $slug = get_post_field( 'post_name', get_the_ID() );
    if (is_home() || is_front_page()) $slug = 'top'; 
    else if(is_post_type_archive('post')) $slug = 'news';
	/*　カレンダーのイベント一覧ページをNEWのArchiveと同じにする　*/
	else if(is_post_type_archive('office_news')) $slug = 'news';
	else if(is_tax('office_news_category')) $slug = 'news';
    else if(is_singular('post')) $slug = 'news-detail';
	/*　カレンダーのイベント個別ページをNEWのSingleと同じにする　*/
	else if(is_singular('office_news')) $slug = 'news-detail';
    else if(is_post_type_archive('offices')) $slug = 'offices';
    else if(is_singular('offices')) $slug = 'offices-detail';
    else if(is_post_type_archive('rcar')) $slug = 'rental-list';
    else if(is_singular('rcar')) $slug = 'rental-detail';
	else if(is_page('winter-entry-guidance')) $slug = 'rental';
    else if(is_post_type_archive('ucar')) $slug = 'used-list';
    else if(is_singular('ucar')) $slug = 'used-detail';
    else if(is_post_type_archive('examples')) $slug = 'examples';
    else if(is_singular('examples')) $slug = 'examples-detail';
	else if(is_page('entry-form_2024')) $slug = 'entry-form';
	else if(is_page('2025entry_form')) $slug = 'entry-form';
	else if(is_page('customer_information_registration_test')) $slug = 'contact';
	else if(is_page('individual_reservation_guidance')) $slug = 'rental';
	else if(is_page('rental/test')) $slug = 'rental';
	else if(is_page('winter-entry-guidance_testat001')) $slug = 'rental';
	else if(is_page('azcom_form_test20251110')) $slug = 'entry-form';
	else if(is_page('contact_test20251016')) $slug = 'contact';
	else if(is_page('new_page_test_初めてのご利用')) $slug = 'rental';
	
	//var_dump(get_queried_object());
    wp_enqueue_style('fc-'.$slug, get_template_directory_uri().'/css/'.$slug.'.css', array(), '1.0.0');

    wp_enqueue_script('slick','//cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js',array('jquery-core'),'1.8.1',true);
    wp_enqueue_script('fc-scripts',get_template_directory_uri().'/js/scripts.js',array('jquery-core','polyfill'),'1.0.3',true);
  }
}
add_action('wp_enqueue_scripts', 'fc_scripts');

function wpcf7_custom_email_validation_filter( $result, $tag ) {
  if ( 'your-email-confirm' == $tag->name ) {
    $your_email = isset( $_POST['your-email'] ) ? trim( $_POST['your-email'] ) : '';
    $your_email_confirm = isset( $_POST['your-email-confirm'] ) ? trim( $_POST['your-email-confirm'] ) : '';
    if ( $your_email != $your_email_confirm ) {
      $result->invalidate( $tag, "メールアドレスが一致しません" );
    }
  }
  return $result;
}
add_filter( 'wpcf7_validate_email', 'wpcf7_custom_email_validation_filter', 20, 2 );
add_filter( 'wpcf7_validate_email*', 'wpcf7_custom_email_validation_filter', 20, 2 );

function fc_the_blank_field($name,$return = false) {
  global $post;
  
  $obj = get_field_object($name);
  if(get_field($name)) {
    if($obj['type'] == 'number') if($return) return number_format(get_field($name)); else echo number_format(get_field($name));
    else if($return) return get_field($name); else the_field($name);
  } else if($return) return '-'; else echo '-';
}

function fc_get_blank_field($name) {
  return fc_the_blank_field($name,true);
}

function fc_the_post_thumbnail($size = 'thumbnail',$return = false) {
  global $post;
  
  $imgs = get_field('imgs');
  if($return) return wp_get_attachment_image($imgs[0],$size);
  else echo wp_get_attachment_image($imgs[0],$size);
}

function fc_get_the_post_thumbnail($size) {
  return fc_the_post_thumbnail($size,true);
}

function fc_query_list(){
	$arr = array(
		'type',
    'body_length',
    'maker',
    'power_gate',
    'price_min',
    'price_max',
    'gear',
    'model_year_min',
    'model_year_max',
    'cooling_system',
    'size',
    'other',
    'body_width',
    'other4',
    'keyword',
    'model'
	);
	return $arr;
}
function fc_add_query_vars( $public_query_vars ) {
	foreach(fc_query_list() as $val){
		$public_query_vars[] = $val;
	}
	return $public_query_vars;
}
add_filter( 'query_vars', 'fc_add_query_vars' );

/* used car */

if( function_exists('acf_add_options_page') ) {
  acf_add_options_page(array(
    'page_title'  => 'サイトオプション',
    'menu_title'  => 'サイトオプション',
    'menu_slug'   => 'theme-general-settings',
    'capability'  => 'edit_posts',
    'redirect'    => false
  ));
}

function fc_ucar_search($query) {
  /* 管理画面,メインクエリに干渉しないために必須 */
  if ( is_admin() || ! $query->is_main_query() ){
    return;
  }

  if ( $query->is_main_query() && $query->is_post_type_archive('ucar') ) {
	global $wp_query;
	$wp_query->query_vars['post_status'] = 'publish';
    // search
    foreach(fc_query_list() as $val) {
      if(get_query_var($val) == '') continue;

      if($val == 'price_min') {
        if(get_query_var('price_min') != '' && get_query_var('price_max') != '')
          $meta_query[] = array(
            'key' => 'price',
            'value' => array(get_query_var('price_min'),get_query_var('price_max')),
            'type' => 'SIGNED',
            'compare' => 'BETWEEN'
          );
        else if(get_query_var('price_min') != '')
          $meta_query[] = array(
            'key' => 'price',
            'value' => get_query_var('price_min'),
            'type' => 'SIGNED',
            'compare' => '>='
          );
        else if(get_query_var('price_max') != '')
          $meta_query[] = array(
            'key' => 'price',
            'value' => get_query_var('price_max'),
            'type' => 'SIGNED',
            'compare' => '<='
          );
      } else if($val == 'model_year_min') {
        if(get_query_var('model_year_min') != '' && get_query_var('model_year_max') != '')
          $meta_query[] = array(
            'key' => 'model_year',
			'value' => array(get_query_var('model_year_min') . '-01-01', get_query_var('model_year_max') . '-12-31'),
			'type' => 'DATE',
            'compare' => 'BETWEEN'
          );
        else if(get_query_var('model_year_min') != '')
          $meta_query[] = array(
            'key' => 'model_year',
            'value' => get_query_var('model_year_min') . '-01-01',
			'type' => 'DATE',
            'compare' => '>='
          );
        else if(get_query_var('model_year_max') != '')
          $meta_query[] = array(
            'key' => 'model_year',
            'value' => get_query_var('model_year_max') . '-12-31',
            'type' => 'DATE',
            'compare' => '<='
          );
		/*
        if(get_query_var('model_year_min') != '' && get_query_var('model_year_max') != '')
          $meta_query[] = array(
            'key' => 'model_year',			
            'value' => array(get_query_var('model_year_min'),get_query_var('model_year_max')),
            'type' => 'SIGNED',
            'compare' => 'BETWEEN'
          );
        else if(get_query_var('model_year_min') != '')
          $meta_query[] = array(
            'key' => 'model_year',
            'value' => get_query_var('model_year_min'),
            'type' => 'SIGNED',
            'compare' => '>='
          );
        else if(get_query_var('model_year_max') != '')
          $meta_query[] = array(
            'key' => 'model_year',
            'value' => get_query_var('model_year_max'),
            'type' => 'SIGNED',
            'compare' => '<='
          );
	  */
      } else if($val == 'model') {
        $tax_query = array(
          array(
            'taxonomy' => 'models',
            'terms' => get_query_var($val),
            'operator' => 'IN'
          )
        );
        
        $query->set('tax_query',$tax_query);
      } else if($val == 'model_year_max' || $val == 'price_max') ; // nothing
      else if($val == 'keyword') {
        $meta_query2 = array('relation' => 'OR');
        $arr = array('other1','other2','other3','other5','other6','other7','other8','other9','other10','other11','other12','other13','other14','other15','other_note');
        foreach($arr as $a) {
          $meta_query2[] = array(
            'key' => $a,
            'value' => get_query_var('keyword'),
            'compare' => 'LIKE'
          );
        }
        $meta_query[] = $meta_query2;
        //$query->set('_meta_or_title',get_query_var('keyword'));
      } else {
        $meta_query[] = array(
          'key' => $val,
          'value' => get_query_var($val)
        );
      }
    }
    
    $meta_query[] = array(
      'relation' => 'OR',
      array(
        'key' => 'is_future',
        'value' => true,
        'compare' => '!=',
      ),
      array(
        'key' => 'is_future',
        'compare' => 'NOT EXISTS'
      )
    );
    $query->set('meta_query',$meta_query);

    $query->set( 'posts_per_page', -1 );

    return;
  }
}
add_action( 'pre_get_posts', 'fc_ucar_search' );

/* offices */
function fc_offices_posts_count($query) {
  /* 管理画面,メインクエリに干渉しないために必須 */
  if ( is_admin() || ! $query->is_main_query() ){
    return;
  }

  if ( $query->is_main_query() && $query->is_post_type_archive('offices') ) {
    $query->set( 'posts_per_page', -1 );
    return;
  }
}
add_action( 'pre_get_posts', 'fc_offices_posts_count' );

/* news */

/*
*
* 通常投稿
*
*/
function fc_post_archive($args, $post_type) {
  if ('post' == $post_type) {
    global $wp_rewrite;
    $archive_slug        = 'news';
    $args['label']       = 'トピックス';
    $args['has_archive'] = $archive_slug;
    $archive_slug        = $wp_rewrite->root.$archive_slug;
    $feeds               = '(' . trim(implode('|', $wp_rewrite->feeds)) . ')';
    add_rewrite_rule("{$archive_slug}/?$", "index.php?post_type={$post_type}", 'top');
    add_rewrite_rule("{$archive_slug}/feed/{$feeds}/?$", "index.php?post_type={$post_type}".'&feed=$matches[1]', 'top');
    add_rewrite_rule("{$archive_slug}/{$feeds}/?$", "index.php?post_type={$post_type}".'&feed=$matches[1]', 'top');
    add_rewrite_rule("{$archive_slug}/{$wp_rewrite->pagination_base}/([0-9]{1,})/?$", "index.php?post_type={$post_type}".'&paged=$matches[1]', 'top');
  }

  return $args;
}
add_filter('register_post_type_args', 'fc_post_archive', 10, 2);

function fc_unregister_taxonomies() {
  global $wp_taxonomies;

  if (!empty($wp_taxonomies['post_tag']->object_type)) {
    foreach ($wp_taxonomies['post_tag']->object_type as $i => $object_type) {
      if ($object_type == 'post') {
        unset($wp_taxonomies['post_tag']->object_type[$i]);
      }
    }
  }
  
  return true;
}
add_action('init', 'fc_unregister_taxonomies');


/* tinymce */
function fc_custom_editor_settings($initArray) {
  $style_formats = array(
    array(
      'title'   => '見出し',
      'block'   => 'h2',
    ),
    array(
      'title'   => '小見出し',
      'block'   => 'h3',
    )
  );
  $initArray['style_formats'] = json_encode($style_formats);

  return $initArray;
}
add_filter('tiny_mce_before_init', 'fc_custom_editor_settings', 10000);

/* ajax */
function fc_ajaxurl() {?>
<script>
var _ajaxUrl = '<?php echo admin_url( 'admin-ajax.php'); ?>';
</script>
<?php }
add_action( 'wp_head', 'fc_ajaxurl');

function fc_ajax_load() {
	header("Content-type: application/json; charset=UTF-8");
  $paged = $_POST['paged'];
  $args = array(
    'post_type' => 'ucar',
    'post_status' => 'publish',
    'posts_per_page' => -1
  );
  if(isset($_POST['pids']) && trim($_POST['pids']) != '') {
    $args['post__in'] = explode(',',$_POST['pids']);
  }
  
  $my_query = new WP_Query;
  $list = $my_query->query( $args );
  
  $results = array();
  foreach($list as $p) {
    
    $results[] = (object)array(
      'ID' => $p->ID,
      'title' => get_the_title($p),
      'permalink' => get_the_permalink($p),
      'date' => get_the_date('',$p),
      'date_time' => get_the_date('Y-m-d',$p),
      'template_uri' => get_template_directory_uri(),
      'home_url' => home_url(),
      'title2' => get_field('title2',$p) ? '<br>'.get_field('title2',$p) : '',
      'new' => get_field('is_new',$p) ? '<span class="tag-new">NEW</span>' : '',
      'thumbnail' => wp_get_attachment_image(get_field('imgs',$p)[0],'thumbnail-car'),
      'inquiry_number' => get_field('inquiry_number',$p),
      'price' => get_field('price',$p) ? number_format(floor(get_field('price',$p)/10000)).'<span>万円</span>' : '-',
      'maker' => get_field('maker',$r) ? get_field('maker',$r) : '-',
      'katashiki' => get_field('katashiki',$r) ? get_field('katashiki',$r) : '-',
      'model_year' => get_field('model_year',$r) ? number_format(get_field('model_year',$r)).'年' : '-',
      'distance' => get_field('distance',$r) ? number_format(get_field('distance',$r)) : '-',
      'power_gate' => get_field('power_gate',$r) ? get_field('power_gate',$r) : '-'
    );
  }

	echo json_encode(array('list' => $results,'paged' => $paged, 'max_num_pages' => $my_query->max_num_pages));
	wp_die();
}
add_action( 'wp_ajax_fc_ajax_load', 'fc_ajax_load' );
add_action( 'wp_ajax_nopriv_fc_ajax_load', 'fc_ajax_load' );

/*　カスタム投稿タイプ各支店のお知らせラジオボタンにする　*/
add_action( 'admin_print_footer_scripts', 'select_to_radio_office_news_category' );
function select_to_radio_office_news_category() {
    ?>
    <script type="text/javascript">
    jQuery( function( $ ) {
        // 投稿画面
        $( '#taxonomy-office_news_category input[type=checkbox]' ).each( function() {
            $( this ).replaceWith( $( this ).clone().attr( 'type', 'radio' ) );
        } );

        // 一覧画面
        var office_news_category_checklist = $( '.office_news_category-checklist input[type=checkbox]' );
        office_news_category_checklist.click( function() {
          $( this ).closest( '.office_news_category-checklist' ).find( ' input[type=checkbox]' ).not(this).prop( 'checked', false );
        } );
    } );
    </script>
    <?php
}

add_theme_support('post-thumbnails');

/*　管理画面カスタム投稿タイプにターム名を追加　*/
function add_custom_columns($columns) {
	$columns['custom_term'] = '支店・営業所名';
    return $columns;
}
add_filter('manage_office_news_posts_columns', 'add_custom_columns');
function display_custom_column_content($column_name, $post_id) {
    if ($column_name === 'custom_term') {
        // 投稿に紐付けられたタームを取得します。
        $terms = get_the_terms($post_id, 'office_news_category'); // your_taxonomy_slug をタクソノミースラッグに置き換えます。
        
        if (!empty($terms) && !is_wp_error($terms)) {
            // 複数のタームがある場合は、カンマで区切って表示します。
            $term_names = array_map(function($term) {
                return $term->name;
            }, $terms);
            
            echo implode(', ', $term_names);
        }
    }
}
add_action('manage_office_news_posts_custom_column', 'display_custom_column_content', 10, 2);

add_action('init', function() {
    add_theme_support('block-templates'); // Gutenbergのテンプレート対応
});

// ============================================================
// A-TRUCK SEO改善 v2（2026-04-06 VONDS）
// 軽量版: 構造化データ+noindexのみ。パフォーマンス影響ゼロ
// ============================================================

// 1. LocalBusinessスキーマ（全10営業所）
function atruck_localbusiness_schema() {
    if (!is_front_page() && !is_home() && !is_post_type_archive('offices') && !is_singular('offices')) return;
    $offices = array(
        array('name'=>'A-TRUCK サテライト東北','street'=>'上愛子字街道42-3','city'=>'仙台市青葉区','region'=>'宮城県','postal'=>'989-3124','tel'=>'+81-22-369-3995','lat'=>38.2876,'lng'=>140.7938),
        array('name'=>'A-TRUCK サテライト長岡','street'=>'下条町79-2','city'=>'長岡市','region'=>'新潟県','postal'=>'940-1146','tel'=>'+81-258-23-2600','lat'=>37.4345,'lng'=>138.8499),
        array('name'=>'A-TRUCK 首都圏支店','street'=>'高根町1706','city'=>'船橋市','region'=>'千葉県','postal'=>'274-0817','tel'=>'+81-47-407-1552','lat'=>35.7217,'lng'=>140.0269),
        array('name'=>'A-TRUCK 北関東支店','street'=>'坂之下687-1','city'=>'所沢市','region'=>'埼玉県','postal'=>'359-0012','tel'=>'+81-4-2946-9830','lat'=>35.7884,'lng'=>139.4610),
        array('name'=>'A-TRUCK 神奈川支店','street'=>'下溝307-7','city'=>'相模原市南区','region'=>'神奈川県','postal'=>'252-0335','tel'=>'+81-42-711-9682','lat'=>35.5238,'lng'=>139.3677),
        array('name'=>'A-TRUCK 名古屋支店','street'=>'西末広4-57','city'=>'弥富市','region'=>'愛知県','postal'=>'498-0064','tel'=>'+81-567-68-1970','lat'=>35.1153,'lng'=>136.7266),
        array('name'=>'A-TRUCK 大阪支店','street'=>'野口875-1','city'=>'門真市','region'=>'大阪府','postal'=>'571-0024','tel'=>'+81-72-886-1301','lat'=>34.7406,'lng'=>135.5937),
        array('name'=>'A-TRUCK 九州支店','street'=>'曽根4370-1','city'=>'北九州市小倉南区','region'=>'福岡県','postal'=>'800-0212','tel'=>'+81-93-482-2091','lat'=>33.8326,'lng'=>130.8808),
        array('name'=>'A-TRUCK 沖縄支店','street'=>'潮平787-6','city'=>'糸満市','region'=>'沖縄県','postal'=>'901-0302','tel'=>'+81-98-851-7810','lat'=>26.1320,'lng'=>127.6630),
        array('name'=>'A-TRUCK 市川R&Cセンター','street'=>'原木3-18-6','city'=>'市川市','region'=>'千葉県','postal'=>'272-0004','tel'=>'+81-47-303-3902','lat'=>35.7068,'lng'=>139.9384),
    );
    $items = array();
    foreach ($offices as $o) {
        $items[] = array(
            '@type'=>'LocalBusiness','name'=>$o['name'],'telephone'=>$o['tel'],
            'url'=>'https://www.a-truck.jp/offices/',
            'address'=>array('@type'=>'PostalAddress','streetAddress'=>$o['street'],'addressLocality'=>$o['city'],'addressRegion'=>$o['region'],'postalCode'=>$o['postal'],'addressCountry'=>'JP'),
            'geo'=>array('@type'=>'GeoCoordinates','latitude'=>$o['lat'],'longitude'=>$o['lng']),
            'openingHoursSpecification'=>array('@type'=>'OpeningHoursSpecification','dayOfWeek'=>array('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),'opens'=>'09:00','closes'=>'18:00'),
            'parentOrganization'=>array('@type'=>'Organization','name'=>'株式会社A-TRUCK','url'=>'https://www.a-truck.jp'),
        );
    }
    echo '<script type="application/ld+json">';
    echo wp_json_encode(array('@context'=>'https://schema.org','@graph'=>$items), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    echo '</script>' . "\n";
}
add_action('wp_head', 'atruck_localbusiness_schema', 5);

// 2. Serviceスキーマ（TOPページのみ）
function atruck_service_schema() {
    if (!is_front_page() && !is_home()) return;
    $schemas = array(
        array('@type'=>'Service','name'=>'冷凍車・トラックレンタル','description'=>'冷凍車・冷凍ウイング車・保冷車・ウイング車のレンタル。全国24時間対応。','provider'=>array('@type'=>'Organization','name'=>'株式会社A-TRUCK','url'=>'https://www.a-truck.jp'),'areaServed'=>array('@type'=>'Country','name'=>'Japan'),'serviceType'=>'トラックレンタル'),
        array('@type'=>'Service','name'=>'トラック鈑金塗装・修理','description'=>'トラック専門の鈑金塗装・修理・架装サービス。','provider'=>array('@type'=>'Organization','name'=>'株式会社A-TRUCK','url'=>'https://www.a-truck.jp'),'areaServed'=>array('@type'=>'Country','name'=>'Japan'),'serviceType'=>'鈑金塗装・修理'),
        array('@type'=>'Service','name'=>'中古トラック販売・買取','description'=>'冷凍車・ウイング車等の中古トラック販売・買取・下取り。','provider'=>array('@type'=>'Organization','name'=>'株式会社A-TRUCK','url'=>'https://www.a-truck.jp'),'areaServed'=>array('@type'=>'Country','name'=>'Japan'),'serviceType'=>'中古トラック販売'),
    );
    echo '<script type="application/ld+json">';
    echo wp_json_encode(array('@context'=>'https://schema.org','@graph'=>$schemas), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    echo '</script>' . "\n";
}
add_action('wp_head', 'atruck_service_schema', 5);

// 3. テストページnoindex
function atruck_noindex_test_pages() {
    if (!is_page()) return;
    $slug = get_post_field('post_name', get_the_ID());
    if (in_array($slug, array('azcom_form_test20251110','customer_information_registration_test','contact_test20251016'))) {
        echo '<meta name="robots" content="noindex, nofollow">' . "\n";
    }
}
add_action('wp_head', 'atruck_noindex_test_pages', 1);

// 4. AIOSEOのtitle/descriptionをページ別に上書き（未設定・不備のあるページのみ）
//    AIOSEOフィルタを使用するため重複タグは発生しない
function atruck_fix_aioseo_title($title) {
    // /offices/ — 「支店・営業所」だけでブランド名なし
    if (is_post_type_archive('offices')) {
        return '営業所一覧｜冷凍車レンタル A-TRUCK 全国11拠点';
    }
    // /rental/list/ — ブランド名なし
    if (is_post_type_archive('rcar')) {
        return 'レンタルトラック車両一覧｜冷凍車・ウイング車 A-TRUCK';
    }
    // /news/ — TOPタイトルとほぼ重複
    if (is_post_type_archive('post')) {
        return 'お知らせ・トピックス｜A-TRUCK';
    }
    return $title;
}
add_filter('aioseo_title', 'atruck_fix_aioseo_title');

function atruck_fix_aioseo_description($description) {
    // /offices/ — description未設定
    if (is_post_type_archive('offices')) {
        return 'A-TRUCKの営業所一覧。東北・関東・神奈川・名古屋・大阪・九州・沖縄の全国11拠点で冷凍車レンタル・中古トラック売買・鈑金塗装に対応。24時間全国対応。';
    }
    // /news/ — description未設定
    if (is_post_type_archive('post')) {
        return 'A-TRUCKからのお知らせ。新車種追加・キャンペーン・メディア掲載・営業情報など最新トピックスをご案内。';
    }
    return $description;
}
add_filter('aioseo_description', 'atruck_fix_aioseo_description');

// 5. og:titleもAIOSEOフィルタで同期
function atruck_fix_aioseo_og_title($title) {
    if (is_post_type_archive('offices')) {
        return '営業所一覧｜冷凍車レンタル A-TRUCK 全国11拠点';
    }
    if (is_post_type_archive('rcar')) {
        return 'レンタルトラック車両一覧｜冷凍車・ウイング車 A-TRUCK';
    }
    if (is_post_type_archive('post')) {
        return 'お知らせ・トピックス｜A-TRUCK';
    }
    return $title;
}
add_filter('aioseo_og_title', 'atruck_fix_aioseo_og_title');

function atruck_fix_aioseo_og_description($description) {
    if (is_post_type_archive('offices')) {
        return 'A-TRUCKの営業所一覧。東北・関東・神奈川・名古屋・大阪・九州・沖縄の全国11拠点。24時間全国対応。';
    }
    if (is_post_type_archive('post')) {
        return 'A-TRUCKからのお知らせ・最新トピックス。';
    }
    return $description;
}
add_filter('aioseo_og_description', 'atruck_fix_aioseo_og_description');

// ============================================================
// 6. FAQPage構造化データ（レンタルページ・TOPページ）
//    Google検索のFAQリッチリザルト対応
// ============================================================
function atruck_faq_schema() {
    $faqs = array();

    if (is_front_page() || is_home() || is_page('rental')) {
        $faqs = array(
            array(
                'q' => 'トラックのレンタルに必要な免許は？',
                'a' => '車両総重量によって異なります。2t車は準中型免許（5t限定含む）、4t車は中型免許、大型車は大型免許が必要です。普通免許で運転できる車両（軽バン・1BOXバン等）もご用意しています。'
            ),
            array(
                'q' => 'レンタル料金はいくらですか？',
                'a' => '車種・期間によって異なります。例えば2t冷凍車のデイリーレンタルは約15,000円〜、マンスリーは約200,000円〜です。詳細はレンタルトラック一覧ページまたはお電話（047-407-1552）でご確認ください。'
            ),
            array(
                'q' => '土日祝日もレンタルできますか？',
                'a' => 'はい、A-TRUCKは土日祝日も営業しています。車両トラブル時の緊急対応も24時間全国で対応可能です。'
            ),
            array(
                'q' => '営業ナンバー（緑ナンバー）のトラックはレンタルできますか？',
                'a' => 'はい、A-TRUCKでは営業ナンバーレンタル™に対応しています。運送事業者様向けに緑ナンバー付きのトラックをレンタルいたします。'
            ),
            array(
                'q' => '対応エリアはどこですか？',
                'a' => '全国対応です。東北（仙台）・関東（千葉・埼玉・神奈川）・中部（名古屋）・関西（大阪）・九州（北九州）・沖縄の全国11拠点から配車いたします。遠方への陸送も対応可能です。'
            ),
            array(
                'q' => '冷凍車の温度帯は何度まで対応していますか？',
                'a' => '当社の冷凍車は-25℃〜+20℃まで幅広い温度帯に対応しています。冷凍食品の輸送から常温管理まで、用途に応じた車両をご用意します。'
            ),
            array(
                'q' => '短期（1日）から長期までレンタルできますか？',
                'a' => 'はい、デイリー（1日単位）・ウィークリー（1週間単位）・マンスリー（月単位）でご利用いただけます。6ヶ月以上の長期利用にはマッチングリース®もご用意しています。'
            ),
            array(
                'q' => '事故や故障時のサポートはありますか？',
                'a' => '24時間365日の事故・故障サポート体制を整えています。代車手配も迅速に対応いたします。任意保険は全車両に付帯済みです。'
            ),
        );
    }

    if (is_page('repair')) {
        $faqs = array(
            array(
                'q' => 'トラックの鈑金塗装の修理期間はどのくらいですか？',
                'a' => '修理内容により異なりますが、軽微な鈑金で3〜5日、全塗装で1〜2週間が目安です。修理期間中の代車もご用意可能です。'
            ),
            array(
                'q' => 'どのメーカーのトラックでも修理できますか？',
                'a' => 'はい、いすゞ・日野・ふそう・UD等の国内全メーカーに対応しています。大型車・バスの鈑金塗装にも対応可能です。'
            ),
        );
    }

    if (empty($faqs)) return;

    $faq_items = array();
    foreach ($faqs as $faq) {
        $faq_items[] = array(
            '@type' => 'Question',
            'name' => $faq['q'],
            'acceptedAnswer' => array(
                '@type' => 'Answer',
                'text' => $faq['a']
            )
        );
    }

    echo '<script type="application/ld+json">';
    echo wp_json_encode(array(
        '@context' => 'https://schema.org',
        '@type' => 'FAQPage',
        'mainEntity' => $faq_items
    ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    echo '</script>' . "\n";
}
add_action('wp_head', 'atruck_faq_schema', 5);
