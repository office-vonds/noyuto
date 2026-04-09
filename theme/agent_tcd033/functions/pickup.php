<?php

function add_custom_meta_boxes2() {
 add_meta_box(
  'wp_pickup_post',//ID of meta box
  __('Pickup post', 'tcd-w'),//label
  'pickup_post',//callback function
  'post',// post type
  'side'
 );
}
add_action('add_meta_boxes', 'add_custom_meta_boxes2');

function pickup_post(){

    global $post;
    $pickup_post = get_post_meta($post->ID,'pickup_post',true);

    echo '<input type="hidden" name="pickup_post_meta_box_nonce" value="', wp_create_nonce(basename(__FILE__)), '" />';

?>
<p><?php _e('Check if you wan\'t to show this post for pickup post.', 'tcd-w');  ?></p>
<label><input type="checkbox" name="pickup_post" value="on" <?php if( $pickup_post == 'on' ) { ?>checked="checked"<?php } ?> />  <?php _e('Show this post for pickup post.', 'tcd-w');  ?></label>
<?php
}

// Save data from meta box
add_action('save_post', 'save_pickup_post_meta_box');
function save_pickup_post_meta_box( $post_id ) {

  // verify nonce
  if (!isset($_POST['pickup_post_meta_box_nonce']) || !wp_verify_nonce($_POST['pickup_post_meta_box_nonce'], basename(__FILE__))) {
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

  // save or delete
  if (isset($_POST['pickup_post']) ) {
   update_post_meta($post_id, 'pickup_post', $_POST['pickup_post'] );
  } else {
   delete_post_meta( $post_id, 'pickup_post') ;
  };

}






// 管理画面の記事一覧に「カスタムフィールド」のフィルタを追加する
add_filter( 'parse_query', 'ba_admin_posts_filter2' );
add_action( 'restrict_manage_posts', 'ba_admin_posts_filter_restrict_manage_posts2' );
function ba_admin_posts_filter2( $query )
{
    global $pagenow;
    if ( is_admin() && $pagenow=='edit.php' && isset($_GET['ADMIN_FILTER_FIELD_NAME']) && $_GET['ADMIN_FILTER_FIELD_NAME'] != '') {
        $query->query_vars['meta_key'] = $_GET['ADMIN_FILTER_FIELD_NAME'];
    if (isset($_GET['ADMIN_FILTER_FIELD_VALUE']) && $_GET['ADMIN_FILTER_FIELD_VALUE'] != '')
        $query->query_vars['meta_value'] = $_GET['ADMIN_FILTER_FIELD_VALUE'];
    }
}
function ba_admin_posts_filter_restrict_manage_posts2()
{
    global $wpdb;
    $sql = 'SELECT DISTINCT meta_key FROM '.$wpdb->postmeta.' ORDER BY 1';
    $fields = $wpdb->get_results($sql, ARRAY_N);
    $current = isset($_GET['ADMIN_FILTER_FIELD_NAME'])? $_GET['ADMIN_FILTER_FIELD_NAME']:'';
?>
<select name="ADMIN_FILTER_FIELD_NAME">
<option value=""><?php _e('All post', 'tcd-w');  ?></option>
<option value="recommend_post"<?php if($current){ echo ' selected="selected"'; }; ?>><?php _e('Recommend post', 'tcd-w');  ?></option>
<option value="recommend_post2"<?php if($current){ echo ' selected="selected"'; }; ?>><?php _e('Recommend post2', 'tcd-w');  ?></option>
<option value="recommend_post3"<?php if($current){ echo ' selected="selected"'; }; ?>><?php _e('Recommend post3', 'tcd-w');  ?></option>
<option value="pickup_post"<?php if($current){ echo ' selected="selected"'; }; ?>><?php _e('Pickup post', 'tcd-w');  ?></option>
</select>
<?php
}






// 投稿一覧にカスタムフィールドを表示する
function add_new_post_columns2($post_columns){
    $post_columns = array(
        "cb" => '<input type="checkbox"/>',
        "title" => __('Title', 'tcd-w'),
        'recommend_post' => __('Recommend post', 'tcd-w'),
        'recommend_post2' => __('Recommend post2', 'tcd-w'),
        'recommend_post3' => __('Recommend post3', 'tcd-w'),
        'pickup_post' => __('Pickup post', 'tcd-w'),
        'categories' => __('Category', 'tcd-w'),
        "author" => __('Author', 'tcd-w'),
        "comments" => __('Comments', 'tcd-w'),
        "date" => __('Date', 'tcd-w'),
    );
    return $post_columns;
}
add_filter("manage_edit-post_columns", "add_new_post_columns2");

function manage_post_columns($column_name, $id) {
    global $post;
    switch ($column_name) {
      case 'recommend_post':
        if(get_post_meta($post->ID, 'recommend_post', true)) { _e('Show', 'tcd-w'); };
      default:
      break;
    } // end switch
};
add_action('manage_post_posts_custom_column', 'manage_post_columns', 10, 2);

function manage_post_columns2($column_name, $id) {
    global $post;
    switch ($column_name) {
      case 'recommend_post2':
        if(get_post_meta($post->ID, 'recommend_post2', true)) { _e('Show', 'tcd-w'); };
      default:
      break;
    } // end switch
};
add_action('manage_post_posts_custom_column', 'manage_post_columns2', 10, 2);

function manage_post_columns3($column_name, $id) {
    global $post;
    switch ($column_name) {
      case 'recommend_post3':
        if(get_post_meta($post->ID, 'recommend_post3', true)) { _e('Show', 'tcd-w'); };
      default:
      break;
    } // end switch
};
add_action('manage_post_posts_custom_column', 'manage_post_columns3', 10, 2);

function manage_post_columns4($column_name, $id) {
    global $post;
    switch ($column_name) {
      case 'pickup_post':
        if(get_post_meta($post->ID, 'pickup_post', true)) { _e('Show', 'tcd-w'); };
      default:
      break;
    } // end switch
};
add_action('manage_post_posts_custom_column', 'manage_post_columns4', 10, 2);

?>