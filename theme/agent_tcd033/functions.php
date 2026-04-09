<?php

add_filter('show_admin_bar', '__return_false');


/**
 * Set the content width based on the theme's design and stylesheet.
 */
if ( ! isset( $content_width ) )
	$content_width = 750; /* pixels */

if ( ! function_exists( '_tk_setup' ) ) :
/**
 * Set up theme defaults and register support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which runs
 * before the init hook. The init hook is too late for some features, such as indicating
 * support post thumbnails.
 */
function _tk_setup() {
	global $cap, $content_width;

	// This theme styles the visual editor with editor-style.css to match the theme style.
	add_editor_style();

	/**
	 * Add default posts and comments RSS feed links to head
	*/
	add_theme_support( 'automatic-feed-links' );

	/**
	 * Enable support for Post Thumbnails on posts and pages
	 *
	 * @link http://codex.wordpress.org/Function_Reference/add_theme_support#Post_Thumbnails
	*/
	add_theme_support( 'post-thumbnails' );

	/**
	 * Enable support for Post Formats
	*/
	//add_theme_support( 'post-formats', array( 'aside', 'image', 'video', 'quote', 'link' ) );

	/**
	 * Setup the WordPress core custom background feature.
	*/
	add_theme_support( 'custom-background', apply_filters( '_tk_custom_background_args', array(
		'default-color' => 'ffffff',
		'default-image' => '',
	) ) );

	/**
	 * Make theme available for translation
	 * Translations can be filed in the /languages/ directory
	 * If you're building a theme based on _tk, use a find and replace
	 * to change '_tk' to the name of your theme in all the template files
	*/
	load_theme_textdomain( '_tk', get_template_directory() . '/languages' );

	/**
	 * This theme uses wp_nav_menu() in one location.
	*/
	register_nav_menus( array(
		'primary'  => __( 'Header menu', '_tk' ),
	) );

}
endif; // _tk_setup
add_action( 'after_setup_theme', '_tk_setup' );

/**
 * Register widgetized area and update sidebar with default widgets
 */
function _tk_widgets_init() {
	register_sidebar( array(
		'name'          => __( 'Single page sidebar', '_tk' ),
		'id'            => 'sidebar-1',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	) );
  register_sidebar( array(
    'name'          => __( 'Archive page sidebar', '_tk' ),
    'id'            => 'sidebar-2',
    'before_widget' => '<aside id="%1$s" class="widget %2$s">',
    'after_widget'  => '</aside>',
    'before_title'  => '<h3 class="widget-title">',
    'after_title'   => '</h3>',
  ) );
    register_sidebar(array(
        'before_widget' => '<div class="footer_widget %2$s" id="%1$s">'."\n",
        'after_widget' => "</div>\n",
        'before_title' => '<h3 class="footer_headline">',
        'after_title' => "</h3>",
        'name' => __('Footer widget (mobile)', 'tcd-w'),
        'id' => 'mobile_footer_widget'
    ));
}
add_action( 'widgets_init', '_tk_widgets_init' );

/**
 * Enqueue scripts and styles
 */
function _tk_scripts() {

	// Import the necessary TK Bootstrap WP CSS additions
	wp_enqueue_style( '_tk-bootstrap-wp', get_template_directory_uri() . '/includes/css/bootstrap-wp.css' );

	// load bootstrap css
	wp_enqueue_style( '_tk-bootstrap', get_template_directory_uri() . '/includes/resources/bootstrap/css/bootstrap.min.css' );

	// load Font Awesome css
	wp_enqueue_style( '_tk-font-awesome', get_template_directory_uri() . '/includes/css/font-awesome.min.css', false, '4.1.0' );

	// load _tk styles
	//wp_enqueue_style( '_tk-style', get_stylesheet_uri() );

	// load bootstrap js
	wp_enqueue_script('_tk-bootstrapjs', get_template_directory_uri().'/includes/resources/bootstrap/js/bootstrap.js', array('jquery') );

	// load bootstrap wp js
	wp_enqueue_script( '_tk-bootstrapwp', get_template_directory_uri() . '/includes/js/bootstrap-wp.js', array('jquery') );

	wp_enqueue_script( '_tk-skip-link-focus-fix', get_template_directory_uri() . '/includes/js/skip-link-focus-fix.js', array(), '20130115', true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}

	if ( is_singular() && wp_attachment_is_image() ) {
		wp_enqueue_script( '_tk-keyboard-image-navigation', get_template_directory_uri() . '/includes/js/keyboard-image-navigation.js', array( 'jquery' ), '20120202' );
	}

}
add_action( 'wp_enqueue_scripts', '_tk_scripts' );

/**
 * Implement the Custom Header feature.
 */
require get_template_directory() . '/includes/custom-header.php';

/**
 * Custom template tags for this theme.
 */
require get_template_directory() . '/includes/template-tags.php';

/**
 * Custom functions that act independently of the theme templates.
 */
require get_template_directory() . '/includes/extras.php';

/**
 * Customizer additions.
 */
require get_template_directory() . '/includes/customizer.php';

/**
 * Load Jetpack compatibility file.
 */
require get_template_directory() . '/includes/jetpack.php';

/**
 * Load custom WordPress nav walker.
 */
require get_template_directory() . '/includes/bootstrap-wp-navwalker.php';

if (function_exists('add_theme_support')) {
  add_theme_support( 'post-thumbnails' );
  add_image_size( 'square-small', 100, 100, true); // name, width, height, crop
  add_filter('image_size_names_choose', 'custom_image_sizes');
}

function custom_image_sizes($sizes) {
  $addsizes = array(
    "square-small" => __( "Small square image")
  );
  $newsizes = array_merge($sizes, $addsizes);
  return $newsizes;
}

/* use this code ONLY ONCE to resize all thumbnails */

// include_once( ABSPATH . 'wp-admin/includes/image.php' );
// function regenerate_all_attachment_sizes() {
//     $args = array( 'post_type' => 'attachment', 'numberposts' => 100, 'post_status' => null, 'post_parent' => null, 'post_mime_type' => 'image' );
//     $attachments = get_posts( $args );
//     if ($attachments) {
//         foreach ( $attachments as $post ) {
//             $file = get_attached_file( $post->ID );
//             wp_update_attachment_metadata( $post->ID, wp_generate_attachment_metadata( $post->ID, $file ) );
//         }
//     }
// }
// regenerate_all_attachment_sizes();


/*class dp_recent_posts extends WP_Widget {
	function __construct() {
	parent::__construct(
	// Base ID of your widget
	'dp_recent_posts',

	// Widget name will appear in UI
	__('DP Recent posts', 'dp_recent_posts_domain'),

	// Widget description
	array( 'description' => __( 'Shows recent posts with a thumbnail too', 'dp_recent_posts_domain' ), )
	);
	}


	public function widget( $args, $instance ) {
		$the_query = new WP_Query("post_type=post&posts_per_page=5&orderby=date&order=DESC"); ?>

			<?php while ( $the_query->have_posts() ) : $the_query->the_post(); ?>
					<a href="<?php the_permalink(); ?>">
						<div class="row" style="margin-top:15px;">
							<div class="col-xs-40">
								<?php
									if (has_post_thumbnail()) {
										the_post_thumbnail('square-small', array("style" => "width:100%"));
									} else {
										echo '<img src="'; bloginfo('template_url'); echo '/img/common/no_image1.gif" style="width:100%" />';
									}
								?>
							</div>
							<div class="col-xs-70 no-padding-left text-left" style="color:rgb(100,100,100)">
								<span class='fa fa-clock-o'></span>
								<b><?php echo get_the_date('Y') . '.' . get_the_date('m') . '.' . get_the_date('d'); ?></b><br/>
								<span><?php the_title();?></span>
							</div>
						</div>
					</a>
			<?php endwhile; ?>
		<?php wp_reset_postdata(); ?>
	<?php }

	// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		return $instance;
	}
}

function wpb_load_widget() {
  register_widget( 'dp_recent_posts' );
}
add_action( 'widgets_init', 'wpb_load_widget' );*/








function submit_form_callback() {
  wp_mail(get_option( 'admin_email' ), "Contact form message", $_REQUEST['data']);
  $options = get_desing_plus_option();
  echo $options["contact_form_conversion"];
  wp_die();
}

add_action( 'wp_ajax_submit_form', 'submit_form_callback' );
add_action( 'wp_ajax_nopriv_submit_form', 'submit_form_callback' );






// 言語ファイル --------------------------------------------------------------------------------
load_textdomain('tcd-w', dirname(__FILE__).'/languages/' . get_locale() . '.mo');


// テーマオプション --------------------------------------------------------------------------------
require_once ( dirname(__FILE__) . '/admin/theme-options.php' );


// 更新通知 --------------------------------------------------------------------------------
require_once ( dirname(__FILE__) . '/functions/update_notifier.php' );


// Javascriptの読み込み -----------------------------------------------------------------------
function widget_admin_scripts() {
  wp_enqueue_script('thickbox');
  wp_enqueue_script('media-upload');
  wp_enqueue_style('imgareaselect');
  wp_enqueue_script('ml-widget-js', get_template_directory_uri().'/widget/js/script.js', '', '1', true);
  wp_enqueue_script('dp-image-manager', get_template_directory_uri().'/admin/js/image-manager.js', array('jquery', 'jquery-ui-draggable', 'imgareaselect'));
  wp_enqueue_script('jscolor', get_template_directory_uri().'/admin/js/jscolor.js');
  wp_enqueue_script('jquery.cookieTab', get_template_directory_uri().'/admin/js/jquery.cookieTab.js');
  wp_enqueue_script('my_script', get_template_directory_uri().'/admin/js/my_script.js');
  wp_enqueue_script('ml-fancybox-js', get_template_directory_uri().'/admin/js/fancybox/jquery.fancybox.pack.js', '', '1', true);
	wp_enqueue_media();//画像アップロード用
?>
<script type="text/javascript">
  var cfmf_text = { title:'<?php _e('Please Select Image', 'tcd-w'); ?>', button:'<?php _e('Use this Image', 'tcd-w'); ?>' };
</script>
<?php
  wp_enqueue_script('cf-media-field', get_template_directory_uri().'/admin/js/cf-media-field.js'); //画像アップロード用
}
add_action('admin_print_scripts', 'widget_admin_scripts');


// スタイルシートの読み込み -----------------------------------------------------------------------
function my_admin_styles() {
  wp_enqueue_style('thickbox');
  wp_enqueue_style('my_widget_css', get_template_directory_uri() . '/widget/css/style.css','','1.0');
  wp_enqueue_style('my_admin_css', get_template_directory_uri() .'/admin/css/my_admin.css','','1.0');
  wp_enqueue_style('ml-fancybox-style', get_template_directory_uri() . '/admin/js/fancybox/jquery.fancybox.css');
}
add_action('admin_print_styles', 'my_admin_styles');


// ビジュアルエディタ用スタイルシートの読み込み --------------------------------------------------------------------------------
add_editor_style('editor-style-01.css');//管理画面用のスタイルシートを変更した場合は、ファイルの名前と番号を変える

// 管理画面のクイック編集 --------------------------------------------------------------------------------
require get_template_directory() . '/functions/quick_edit.php';

// ページ用カスタムフィールド --------------------------------------------------------------------------------
require get_template_directory() . '/functions/page_cf.php';
require get_template_directory() . '/functions/staff_cf.php';
//require get_template_directory() . '/functions/menu_cf.php';


// おすすめ記事 PICKUP記事 --------------------------------------------------------------------------------
require_once ( dirname(__FILE__) . '/functions/recommend.php' );
require_once ( dirname(__FILE__) . '/functions/recommend2.php' );
require_once ( dirname(__FILE__) . '/functions/recommend3.php' );
require_once ( dirname(__FILE__) . '/functions/pickup.php' );


// カスタムCSS --------------------------------------------------------------------------------
require get_template_directory() . '/functions/custom_css.php';


// カテゴリーの設定 --------------------------------------------------------------------------------
//require get_template_directory() . '/functions/category.php';


// カスタム投稿の並び順を日付順に変更 --------------------------------------------------------------------------------
function my_post_types_admin_order( $wp_query ) {
  if ( is_admin() && !isset( $_GET['orderby'] ) ) {
    $post_type = $wp_query->query['post_type'];
    if ( in_array( $post_type, array('news') ) ) {
      $wp_query->set('orderby', 'date');
      $wp_query->set('order', 'DESC');
    }
  };
}
add_filter('pre_get_posts', 'my_post_types_admin_order');


// ウィジェット ------------------------------------------------------------------------
require_once ( dirname(__FILE__) . '/widget/ad.php' );
require_once ( dirname(__FILE__) . '/widget/styled_post_list1.php' );
require_once ( dirname(__FILE__) . '/widget/styled_post_list2.php' );
//require_once ( dirname(__FILE__) . '/widget/recent.php' );
//require_once ( dirname(__FILE__) . '/widget/menu_category_list.php' );
require_once ( dirname(__FILE__) . '/widget/google_search.php' );


// meta title meta description  --------------------------------------------------------------------------------
require_once ( dirname(__FILE__) . '/functions/seo.php' );


// カスタムページリンク  --------------------------------------------------------------------------------
require_once ( dirname(__FILE__) . '/functions/custom_page_link.php' );


// OGP tag  --------------------------------------------------------------------------------
require get_template_directory() . '/functions/ogp.php';


//ロゴ画像用関数 --------------------------------------------------------------------------------
require_once ( dirname(__FILE__) . '/functions/header-logo.php' );


// ユーザーエージェントを判定するための関数---------------------------------------------------------------------
function is_mobile() {
 $match = 0;

 $ua = array(
   'iPhone', // iPhone
   'iPod', // iPod touch
   'iPad',
   'Android.*Mobile', // 1.5+ Android *** Only mobile
   'Windows.*Phone', // *** Windows Phone
   'dream', // Pre 1.5 Android
   'CUPCAKE', // 1.5+ Android
   'BlackBerry', // BlackBerry
   'BB10', // BlackBerry10
   'webOS', // Palm Pre Experimental
   'incognito', // Other iPhone browser
   'webmate' // Other iPhone browser
 );

 $pattern = '/' . implode( '|', $ua ) . '/i';
 $match   = preg_match( $pattern, $_SERVER['HTTP_USER_AGENT'] );

 if ( $match === 1 ) {
   return TRUE;
 } else {
   return FALSE;
 }

}


// スクリプトのバージョン管理 ----------------------------------------------------------------------------------------------
function version_num() {

 if (function_exists('wp_get_theme')) {
  $theme_data = wp_get_theme();
 } else {
  $theme_data = get_theme_data(TEMPLATEPATH . '/style.css');
 };

 $current_version = $theme_data['Version'];

 echo "?ver=" . $current_version;

};


// ウィジェットの設定 ------------------------------------------------------------------------------
/*if ( function_exists('register_sidebar') ) {
    register_sidebar(array(
        'before_widget' => '<div class="side_widget clearfix %2$s" id="%1$s">'."\n",
        'after_widget' => "</div>\n",
        'before_title' => '<h3 class="side_headline"><span>',
        'after_title' => "</span></h3>",
        'name' => __('Archive side widget', 'tcd-w'),
        'id' => 'archive_side_widget'
    ));
    register_sidebar(array(
        'before_widget' => '<div class="side_widget clearfix %2$s" id="%1$s">'."\n",
        'after_widget' => "</div>\n",
        'before_title' => '<h3 class="side_headline"><span>',
        'after_title' => "</span></h3>",
        'name' => __('Single side widget', 'tcd-w'),
        'id' => 'single_side_widget'
    ));
    register_sidebar(array(
        'before_widget' => '<div class="side_widget clearfix %2$s" id="%1$s">'."\n",
        'after_widget' => "</div>\n",
        'before_title' => '<h3 class="side_headline"><span>',
        'after_title' => "</span></h3>",
        'name' => __('Page side widget', 'tcd-w'),
        'id' => 'page_side_widget'
    ));
    register_sidebar(array(
        'before_widget' => '<div class="side_widget clearfix %2$s" id="%1$s">'."\n",
        'after_widget' => "</div>\n",
        'before_title' => '<h3 class="side_headline"><span>',
        'after_title' => "</span></h3>",
        'name' => __('Front page widget (mobile)', 'tcd-w'),
        'description' => __('This widget will be replaced with normal widget when a user accesses the site by smartphone.', 'tcd-w'),
        'id' => 'mobile_widget_index'
    ));
    register_sidebar(array(
        'before_widget' => '<div class="side_widget clearfix %2$s" id="%1$s">'."\n",
        'after_widget' => "</div>\n",
        'before_title' => '<h3 class="side_headline"><span>',
        'after_title' => "</span></h3>",
        'name' => __('Archive widget (mobile)', 'tcd-w'),
        'description' => __('This widget will be replaced with normal widget when a user accesses the site by smartphone.', 'tcd-w'),
        'id' => 'mobile_widget_archive'
    ));
    register_sidebar(array(
        'before_widget' => '<div class="side_widget clearfix %2$s" id="%1$s">'."\n",
        'after_widget' => "</div>\n",
        'before_title' => '<h3 class="side_headline"><span>',
        'after_title' => "</span></h3>",
        'name' => __('Single page widget (mobile)', 'tcd-w'),
        'description' => __('This widget will be replaced with normal widget when a user accesses the site by smartphone.', 'tcd-w'),
        'id' => 'mobile_widget_single'
    ));
    register_sidebar(array(
        'before_widget' => '<div class="side_widget clearfix %2$s" id="%1$s">'."\n",
        'after_widget' => "</div>\n",
        'before_title' => '<h3 class="side_headline"><span>',
        'after_title' => "</span></h3>",
        'name' => __('Page side widget (mobile)', 'tcd-w'),
        'description' => __('This widget will be replaced with normal widget when a user accesses the site by smartphone.', 'tcd-w'),
        'id' => 'mobile_widget_page'
    ));
}*/

// オリジナルの抜粋記事 --------------------------------------------------------------------------------
function new_excerpt($a) {

 if(has_excerpt()) {

   $base_content = get_the_excerpt();
   $base_content = str_replace(array("\r\n", "\r", "\n"), "", $base_content);
   $trim_content = mb_substr($base_content, 0, $a ,"utf-8");

 } else {

   $base_content = get_the_content();
   $base_content = preg_replace('!<style.*?>.*?</style.*?>!is', '', $base_content);
   $base_content = preg_replace('!<script.*?>.*?</script.*?>!is', '', $base_content);
   $base_content = preg_replace('/\[.+\]/','', $base_content);
   $base_content = strip_tags($base_content);
   $trim_content = mb_substr($base_content, 0, $a,"utf-8");
   $trim_content = str_replace(']]>', ']]&gt;', $trim_content);
   $trim_content = str_replace(array("\r\n", "\r", "\n" , "&nbsp;"), "", $trim_content);
   $trim_content = htmlspecialchars($trim_content);

 };

 echo $trim_content . '…';

};

//抜粋からPタグを取り除く
remove_filter( 'the_excerpt', 'wpautop' );


// 記事タイトルの文字数制限 --------------------------------------------------------------------------------
function trim_title($num) {
 $base_title = get_the_title();
 $trim_title = mb_substr($base_title, 0, $num ,"utf-8");
 $count_title = mb_strlen($trim_title,"utf-8");
 if($count_title > $num-1) {
  echo $trim_title . '…';
 } else {
  echo $trim_title;
 };
};


// タイトルをエンコード --------------------------------------------------------------------------------
function get_encoded_title($title){
  return urlencode(mb_convert_encoding($title, "UTF-8"));
}


// セルフピンバックを禁止する -------------------------------------------------------------------------------------
function no_self_ping( &$links ) {
  $home = home_url();
  foreach ( $links as $l => $link )
  if ( 0 === strpos( $link, $home ) )
  unset($links[$l]);
}
add_action( 'pre_ping', 'no_self_ping' );


// RSS用のフィードを追加 ---------------------------------------------------------------------------------------------------
add_theme_support( 'automatic-feed-links' );


//　ヘッダーから余分なMETA情報を削除 --------------------------------------------------------------------
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'index_rel_link' );
remove_action( 'wp_head', 'parent_post_rel_link', 10, 0 );
remove_action( 'wp_head', 'start_post_rel_link', 10, 0 );
remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10, 0 );


// RGBをHEXに変換 ------------------------------------------------------------------
function hex2rgb($hex) {
   $hex = str_replace("#", "", $hex);

   if(strlen($hex) == 3) {
      $r = hexdec(substr($hex,0,1).substr($hex,0,1));
      $g = hexdec(substr($hex,1,1).substr($hex,1,1));
      $b = hexdec(substr($hex,2,1).substr($hex,2,1));
   } else {
      $r = hexdec(substr($hex,0,2));
      $g = hexdec(substr($hex,2,2));
      $b = hexdec(substr($hex,4,2));
   }
   $rgb = array($r, $g, $b);
   return $rgb;
}


// インラインスタイルを取り除く --------------------------------------------------------------------------------
function remove_recent_comments_style() {
  global $wp_widget_factory;
  remove_action( 'wp_head', array( $wp_widget_factory->widgets['WP_Widget_Recent_Comments'], 'recent_comments_style' ) );
}
add_action( 'widgets_init', 'remove_recent_comments_style' );

function remove_adminbar_inline_style() {
  remove_action('wp_head', '_admin_bar_bump_cb');
}
add_action('get_header', 'remove_adminbar_inline_style');


//　サムネイルの設定 --------------------------------------------------------------------------------
if (function_exists('add_theme_support')) {
  add_theme_support('post-thumbnails');
  add_image_size( 'size1', 660, 400, true );
  add_image_size( 'size2', 330, 200, true );
  add_image_size( 'circle1', 450, 450, true );
  add_image_size( 'circle2', 760, 760, true );
  add_image_size( 'circle3', 223, 223, true );
  add_image_size( 'staff_thumb', 224, 224, true );
  add_image_size( 'widget_thumb', 90, 90, true );
}


// カスタムメニューの設定 --------------------------------------------------------------------------------
if(function_exists('register_nav_menu')) {
  //register_nav_menu( 'global-menu', __( 'Global menu', 'tcd-w' ) );
  register_nav_menu( 'footer-menu', __( 'Footer menu', 'tcd-w' ) );
}


// bodyのclassにカテゴリーIDを追加 ------------------------------------------------------------------------------
/*function ml_body_classes($classes) {
		if (is_404() ) { $classes[] = 'page-template-page-noside'; };
		return array_unique($classes);
};
add_filter('body_class','ml_body_classes');*/


// ページナビ用 --------------------------------------------------------------------------------
function show_posts_nav() {
	global $wp_query;
	return ($wp_query->max_num_pages > 1);
};


// カスタム投稿　「スタッフ」を追加 ----------------------------------------------------------------

if ( function_exists('register_post_type') ) {
 $labels = array(
  'name' => __('Staff', 'tcd-w'),
  'singular_name' => __('Staff', 'tcd-w'),
  'add_new' => __('Add New', 'tcd-w'),
  'add_new_item' => __('Add New Item', 'tcd-w'),
  'edit_item' => __('Edit', 'tcd-w'),
  'new_item' => __('New item', 'tcd-w'),
  'view_item' => __('View Item', 'tcd-w'),
  'search_items' => __('Search Items', 'tcd-w'),
  'not_found' => __('Not Found', 'tcd-w'),
  'not_found_in_trash' => __('Not found in trash', 'tcd-w'),
  'parent_item_colon' => ''
 );

 register_post_type('staff', array(
  'label' => __('Staff', 'tcd-w'),
  'labels' => $labels,
  'public' => true,
  'publicly_queryable' => true,
  'menu_position' => 5,
  'show_ui' => true,
  'query_var' => true,
  'rewrite' => array('slug' => 'staff'),
  'capability_type' => 'post',
  'has_archive' => true,
  'hierarchical' => true,
  'supports' => array('title','editor','thumbnail')
 ));
};


// アーカイブページのページングを変更 --------------------------------------------------------------------------------
/*add_filter('pre_get_posts', 'limit_posts_per_home_page');
function limit_posts_per_home_page($wp_query) {

  $options = get_desing_plus_option();

  if(!is_admin() && $wp_query->is_main_query() ){
    $paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
    $first_page_limit = $options['index_blog_num'];
    $limit = get_option('posts_per_page');

    if (is_front_page()) {
      if ($paged == 1) {
        $limit = $first_page_limit;
      } else {
        $offset = $first_page_limit + (($paged - 2) * $limit);
        set_query_var('offset', $offset);
      }
    }
    set_query_var('posts_per_archive_page', $limit);
    set_query_var('posts_per_page', $limit);
  };

};*/

// カードリンクパーツ --------------------------------------------------------------------------------------
add_image_size( 'size-card', 120, 120, true );

function get_the_custom_excerpt($content, $length) {
  $length = ($length ? $length : 70);//デフォルトの長さを指定する
  $content =  preg_replace('/<!--more-->.+/is',"",$content); //moreタグ以降削除
  $content =  strip_shortcodes($content);//ショートコード削除
  $content =  strip_tags($content);//タグの除去
  $content =  str_replace("&nbsp;","",$content);//特殊文字の削除（今回はスペースのみ）
  $content =  mb_substr($content,0,$length);//文字列を指定した長さで切り取る
  return $content.'...';
}

//カードリンクショートコード
function clink_scode($atts) {
  extract(shortcode_atts(array(
    'url'=>"",
    'title'=>"",
    'excerpt'=>""
    ),$atts));

  $id = url_to_postid($url);//URLから投稿IDを取得
  $post = get_post($id);//IDから投稿情報の取得
  $date = mysql2date('Y.m.d', $post->post_date);//投稿日の取得

  $img_width ="120";//画像サイズの幅指定
  $img_height = "120";//画像サイズの高さ指定
  $no_image = get_template_directory_uri().'/img/common/no_image_card.gif';

  //抜粋を取得
  if(empty($excerpt)){
  if($post->post_excerpt){
      $excerpt = get_the_custom_excerpt($post->post_excerpt , 140);

  }else{
      $excerpt = get_the_custom_excerpt($post->post_content , 140);
  }
  }

  //タイトルを取得
  if(empty($title)){
        $title = esc_html(get_the_title($id));
    }

  //アイキャッチ画像を取得
  if(has_post_thumbnail($id)) {
        $img = wp_get_attachment_image_src(get_post_thumbnail_id($id),'size-card');
        $img_tag = "<img src='" . $img[0] . "' alt='{$title}' width=" . $img[1] . " height=" . $img[2] . " />";
        } else { $img_tag ='<img src="'.$no_image.'" alt="" width="'.$img_width.'" height="'.$img_height.'" />';
    }

        $clink ='<div class="cardlink"><a href="'. $url .'"><div class="cardlink_thumbnail">'. $img_tag .'</a></div><div class="cardlink_content"><span class="timestamp">'.$date.'</span><div class="cardlink_title"><a href="'. $url .'">'. $title .' </a></div><div class="cardlink_excerpt">' . $excerpt . '</div></div><div class="cardlink_footer"></div></div>';

        return $clink;
      }

add_shortcode("clink", "clink_scode");

// カスタムコメント --------------------------------------------------------------------------------------

if (function_exists('wp_list_comments')) {
	// comment count
	if (!is_admin()) add_filter('get_comments_number', 'comment_count', 0);
	function comment_count( $commentcount ) {
		global $id;
		$_commnets = get_comments('post_id=' . $id);
		$comments_by_type = &separate_comments($_commnets);
		return count($comments_by_type['comment']);
	}
}


function custom_comments($comment, $args, $depth) {
	$GLOBALS['comment'] = $comment;
	global $commentcount;
	if(!$commentcount) {
		$commentcount = 0;
	}
?>

 <li class="comment <?php if($comment->comment_author_email == get_the_author_meta('email')) {echo 'admin-comment';} else {echo 'guest-comment';} ?>" id="comment-<?php comment_ID() ?>">
  <div class="comment-meta clearfix">
   <div class="comment-meta-left">
  <?php if (function_exists('get_avatar') && get_option('show_avatars')) { echo get_avatar($comment, 35); } ?>

    <ul class="comment-name-date">
     <li class="comment-name">
<?php if (get_comment_author_url()) : ?>
<a id="commentauthor-<?php comment_ID() ?>" class="url <?php if($comment->comment_author_email == get_the_author_meta('email')) {echo 'admin-url';} else {echo 'guest-url';} ?>" href="<?php comment_author_url() ?>" rel="nofollow">
<?php else : ?>
<span id="commentauthor-<?php comment_ID() ?>">
<?php endif; ?>

<?php comment_author(); ?>

<?php if(get_comment_author_url()) : ?>
</a>
<?php else : ?>
</span>
<?php endif;  $options = get_option('tcd-w_options'); ?>
     </li>
     <li class="comment-date"><?php echo get_comment_time(__('F jS, Y', 'tcd-w')); if ($options['time_stamp']) : echo get_comment_time(__(' g:ia', 'tcd-w')); endif; ?></li>
    </ul>
   </div>

   <ul class="comment-act">
<?php if (function_exists('comment_reply_link')) {
        if ( get_option('thread_comments') == '1' ) { ?>
    <li class="comment-reply"><?php comment_reply_link(array_merge( $args, array('add_below' => 'comment-content', 'depth' => $depth, 'max_depth' => $args['max_depth'], 'reply_text' => '<span><span>'.__('REPLY','tcd-w').'</span></span>'))) ?></li>
<?php   } else { ?>
    <li class="comment-reply"><a href="javascript:void(0);" onclick="MGJS_CMT.reply('commentauthor-<?php comment_ID() ?>', 'comment-<?php comment_ID() ?>', 'comment');"><?php _e('REPLY', 'tcd-w'); ?></a></li>
<?php   }
      } else { ?>
    <li class="comment-reply"><a href="javascript:void(0);" onclick="MGJS_CMT.reply('commentauthor-<?php comment_ID() ?>', 'comment-<?php comment_ID() ?>', 'comment');"><?php _e('REPLY', 'tcd-w'); ?></a></li>
<?php } ?>
    <li class="comment-quote"><a href="javascript:void(0);" onclick="MGJS_CMT.quote('commentauthor-<?php comment_ID() ?>', 'comment-<?php comment_ID() ?>', 'comment-content-<?php comment_ID() ?>', 'comment');"><?php _e('QUOTE', 'tcd-w'); ?></a></li>
    <?php edit_comment_link(__('EDIT', 'tcd-w'), '<li class="comment-edit">', '</li>'); ?>
   </ul>

  </div>
  <div class="comment-content post_content" id="comment-content-<?php comment_ID() ?>">
  <?php if ($comment->comment_approved == '0') : ?>
   <span class="comment-note"><?php _e('Your comment is awaiting moderation.', 'tcd-w'); ?></span>
  <?php endif; ?>
  <?php comment_text(); ?>
  </div>

<?php } ?>
