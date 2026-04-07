<?php

// カテゴリー用入力欄を出力 -------------------------------------------------------
add_action ( 'edit_category_form_fields', 'extra_category_fields');
function extra_category_fields( $tag ) {
    $t_id = $tag->term_id;
    $cat_meta = get_option( "cat_$t_id");
?>
<tr class="form-field">
 <th><label for="category_image"><?php _e("Main image","tcd-w"); ?></label></th>
 <td>
  <p><?php _e('Recommend image size. Width:1160px, Height:300px', 'tcd-w'); ?></p>
  <div class="image_box cf">
   <div class="cf cf_media_field hide-if-no-js category_image">
    <input type="hidden" value="<?php if(isset ( $cat_meta['category_image'])) echo esc_html($cat_meta['category_image']) ?>" id="category_image" name="Cat_meta[category_image]" class="cf_media_id">
    <div class="preview_field"><?php if(isset ( $cat_meta['category_image'])) { echo wp_get_attachment_image($cat_meta['category_image'], 'medium'); }; ?></div>
    <div class="buttton_area">
     <input type="button" value="<?php _e('Select Image', 'tcd-w'); ?>" class="cfmf-select-img button">
     <input type="button" value="<?php _e('Remove Image', 'tcd-w'); ?>" class="cfmf-delete-img button <?php if(empty ( $cat_meta['category_image'])){ echo 'hidden'; }; ?>">
    </div>
   </div>
  </div>
 </td>
</tr>
<tr class="form-field">
 <th><label for="category_image"><?php _e("Main image for mobile device","tcd-w"); ?></label></th>
 <td>
  <p><?php _e("If this image is not registered, images that were previously registered will be displayed.<br />Recommend image size. Width:800px Height:Free size","tcd-w"); ?></p>
  <div class="image_box cf">
   <div class="cf cf_media_field hide-if-no-js category_image_mobile">
    <input type="hidden" value="<?php if(isset ( $cat_meta['category_image_mobile'])) echo esc_html($cat_meta['category_image_mobile']) ?>" id="category_image_mobile" name="Cat_meta[category_image_mobile]" class="cf_media_id">
    <div class="preview_field"><?php if(isset ( $cat_meta['category_image_mobile'])) { echo wp_get_attachment_image($cat_meta['category_image_mobile'], 'medium'); }; ?></div>
    <div class="buttton_area">
     <input type="button" value="<?php _e('Select Image', 'tcd-w'); ?>" class="cfmf-select-img button">
     <input type="button" value="<?php _e('Remove Image', 'tcd-w'); ?>" class="cfmf-delete-img button <?php if(empty ( $cat_meta['category_image_mobile'])){ echo 'hidden'; }; ?>">
    </div>
   </div>
  </div>
 </td>
</tr>
<?php
}


// データを保存 -------------------------------------------------------
add_action ( 'edited_term', 'save_extra_category_fileds');
function save_extra_category_fileds( $term_id ) {
    if ( isset( $_POST['Cat_meta'] ) ) {
	   $t_id = $term_id;
	   $cat_meta = get_option( "cat_$t_id");
	   $cat_keys = array_keys($_POST['Cat_meta']);
		  foreach ($cat_keys as $key){
		  if (isset($_POST['Cat_meta'][$key])){
			 $cat_meta[$key] = $_POST['Cat_meta'][$key];
		  }
	   }
	   update_option( "cat_$t_id", $cat_meta );
    }
}



// タクソノミー「商品カテゴリー」用入力欄を出力 -------------------------------------------------------
add_action ( 'menu_category_edit_form_fields', 'menu_category_extra_category_fields');
function menu_category_extra_category_fields( $tag ) {
    $t_id = $tag->term_id;
    $term_meta = get_option( "taxonomy_$t_id");
?>
<tr class="form-field">
 <th><label for="sub_title"><?php _e("Sub Title","tcd-w"); ?></label></th>
 <td><input id="sub_title" type="text" size="36" name="term_meta[sub_title]" value="<?php if(isset ( $term_meta['sub_title'])) echo esc_html($term_meta['sub_title']) ?>" /><br /><?php _e("Sub title for Product list","tcd-w"); ?></td>
</tr>
<tr class="form-field">
 <th><label for="menu_category_headline"><?php _e("Catchphrase","tcd-w"); ?></label></th>
 <td><textarea id="menu_category_headline" cols="50" rows="4" name="term_meta[menu_category_headline]"><?php if(isset ( $term_meta['menu_category_headline'])) echo esc_html($term_meta['menu_category_headline']) ?></textarea><br /><?php _e("Catchphrase for Product category page","tcd-w"); ?></td>
</tr>
<tr class="form-field">
 <th><label for="menu_category_image"><?php _e("Main image","tcd-w"); ?></label></th>
 <td>
  <p><?php _e('Recommend image size. Width:1450px, Height:400px', 'tcd-w'); ?></p>
  <div class="image_box cf">
   <div class="cf cf_media_field hide-if-no-js menu_category_image">
    <input type="hidden" value="<?php if(isset ( $term_meta['menu_category_image'])) echo esc_html($term_meta['menu_category_image']) ?>" id="menu_category_image" name="term_meta[menu_category_image]" class="cf_media_id">
    <div class="preview_field"><?php if(isset ( $term_meta['menu_category_image'])) { echo wp_get_attachment_image($term_meta['menu_category_image'], 'medium'); }; ?></div>
    <div class="buttton_area">
     <input type="button" value="<?php _e('Select Image', 'tcd-w'); ?>" class="cfmf-select-img button">
     <input type="button" value="<?php _e('Remove Image', 'tcd-w'); ?>" class="cfmf-delete-img button <?php if(empty ( $term_meta['menu_category_image'])){ echo 'hidden'; }; ?>">
    </div>
   </div>
  </div>
 </td>
</tr>
<tr class="form-field">
 <th><label for="menu_category_image"><?php _e("Main image for mobile device","tcd-w"); ?></label></th>
 <td>
  <p><?php _e("If this image is not registered, images that were previously registered will be displayed.<br />Recommend image size. Width:800px Height:Free size","tcd-w"); ?></p>
  <div class="image_box cf">
   <div class="cf cf_media_field hide-if-no-js menu_category_image_mobile">
    <input type="hidden" value="<?php if(isset ( $term_meta['menu_category_image_mobile'])) echo esc_html($term_meta['menu_category_image_mobile']) ?>" id="menu_category_image_mobile" name="term_meta[menu_category_image_mobile]" class="cf_media_id">
    <div class="preview_field"><?php if(isset ( $term_meta['menu_category_image_mobile'])) { echo wp_get_attachment_image($term_meta['menu_category_image_mobile'], 'medium'); }; ?></div>
    <div class="buttton_area">
     <input type="button" value="<?php _e('Select Image', 'tcd-w'); ?>" class="cfmf-select-img button">
     <input type="button" value="<?php _e('Remove Image', 'tcd-w'); ?>" class="cfmf-delete-img button <?php if(empty ( $term_meta['menu_category_image_mobile'])){ echo 'hidden'; }; ?>">
    </div>
   </div>
  </div>
 </td>
</tr>
<?php
}


// データを保存 -------------------------------------------------------
add_action ( 'edited_menu_category', 'menu_category_save_extra_category_fileds');
function menu_category_save_extra_category_fileds( $term_id ) {
    if ( isset( $_POST['term_meta'] ) ) {
	   $t_id = $term_id;
	   $term_meta = get_option( "taxonomy_$t_id");
	   $cat_keys = array_keys($_POST['term_meta']);
		  foreach ($cat_keys as $key){
		  if (isset($_POST['term_meta'][$key])){
			 $term_meta[$key] = $_POST['term_meta'][$key];
		  }
	   }
	   update_option( "taxonomy_$t_id", $term_meta );
    }
}



?>