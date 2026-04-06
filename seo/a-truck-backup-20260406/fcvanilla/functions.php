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
