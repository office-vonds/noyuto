<?php

function tcd_template_meta_box() {
  add_meta_box(
    'add_custom_fields',//ID of meta box
    __('Page template setting', 'tcd-w'),//label
    'show_tcd_template_meta_box',//callback function
    'page',// post type
    'normal',// context
    'high'// priority
  );
}
add_action('add_meta_boxes', 'tcd_template_meta_box');

function show_tcd_template_meta_box() {
  global $post;
  $options =  get_desing_plus_option();

  //テンプレートのタイプ
  $page_tcd_template_type =
    array(
      'name' => __('Page template type', 'tcd-w'),
      'id' => 'page_tcd_template_type',
      'type' => 'radio',
      'std' => 'type1',
      'options' => array(
        array('name' => __('Normal template', 'tcd-w'), 'value' => 'type1', 'img' => 'template_type1.jpg'),
        array('name' => __('Template1', 'tcd-w'), 'value' => 'type2', 'img' => 'template_type2.jpg'),
        array('name' => __('Template2', 'tcd-w'), 'value' => 'type3', 'img' => 'template_type3.jpg'),
        array('name' => __('Template3', 'tcd-w'), 'value' => 'type4', 'img' => 'template_type4.jpg'),
        array('name' => __('Template4', 'tcd-w'), 'value' => 'type5', 'img' => 'template_type5.jpg'),
      )
    );
  $page_tcd_template_type_meta = get_post_meta($post->ID, 'page_tcd_template_type', true);

  // テンプレート1---------------------------------------------------------------------

  //テンプレートのタイプ1 見出し1
  $type1_headline1 = array( 'name' => __('Catchphrase for first row', 'tcd-w'), 'desc' => __('Enter catchphrase for first row.', 'tcd-w'), 'id' => 'type1_headline1', 'type' => 'textarea', 'std' => '' );
  $type1_headline1_meta = esc_html(get_post_meta($post->ID, 'type1_headline1', true));

  $type1_headline1_fontsize = array( 'name' => __('Font size of Catchphrase of first row', 'tcd-w'), 'desc' => __('Enter the number for catchphrase font size. Default size:48px', 'tcd-w'), 'id' => 'type1_headline1_fontsize', 'type' => 'textarea', 'std' => '' );
  $type1_headline1_fontsize_meta = esc_html(get_post_meta($post->ID, 'type1_headline1_fontsize', true));

  //テンプレートのタイプ1 説明文1
  $type1_desc1 = array( 'name' => __('Description for first row', 'tcd-w'), 'desc' => __('Enter description for first row.', 'tcd-w'), 'id' => 'type1_desc1', 'type' => 'textarea', 'std' => '' );
  $type1_desc1_meta = esc_html(get_post_meta($post->ID, 'type1_desc1', true));

  $type1_desc1_fontsize = array( 'name' => __('Font size of Description of first row', 'tcd-w'), 'desc' => __('Enter the number for description font size. Default size:14px', 'tcd-w'), 'id' => 'type1_desc1_fontsize', 'type' => 'textarea', 'std' => '' );
  $type1_desc1_fontsize_meta = esc_html(get_post_meta($post->ID, 'type1_desc1_fontsize', true));

  //テンプレートのタイプ1 見出し2
  $type1_headline2 = array( 'name' => __('Catchphrase for second row', 'tcd-w'), 'desc' => __('Enter catchphrase for second row.', 'tcd-w'), 'id' => 'type1_headline2', 'type' => 'textarea', 'std' => '' );
  $type1_headline2_meta = esc_html(get_post_meta($post->ID, 'type1_headline2', true));

  //テンプレートのタイプ1 説明文2
  $type1_desc2 = array( 'name' => __('Description for second row', 'tcd-w'), 'desc' => __('Enter description for second row.', 'tcd-w'), 'id' => 'type1_desc2', 'type' => 'textarea', 'std' => '' );
  $type1_desc2_meta = esc_html(get_post_meta($post->ID, 'type1_desc2', true));

  //テンプレートのタイプ1 見出し3
  $type1_headline3 = array( 'name' => __('Catchphrase for third row', 'tcd-w'), 'desc' => __('Enter catchphrase for third row.', 'tcd-w'), 'id' => 'type1_headline3', 'type' => 'textarea', 'std' => '' );
  $type1_headline3_meta = esc_html(get_post_meta($post->ID, 'type1_headline3', true));

  //テンプレートのタイプ1 説明文3
  $type1_desc3 = array( 'name' => __('Description for third row', 'tcd-w'), 'desc' => __('Enter description for third row.', 'tcd-w'), 'id' => 'type1_desc3', 'type' => 'textarea', 'std' => '' );
  $type1_desc3_meta = esc_html(get_post_meta($post->ID, 'type1_desc3', true));

  //テンプレートのタイプ1 見出し4
  $type1_headline4 = array( 'name' => __('Catchphrase for fourth row', 'tcd-w'), 'desc' => __('Enter catchphrase for fourth row.', 'tcd-w'), 'id' => 'type1_headline4', 'type' => 'textarea', 'std' => '' );
  $type1_headline4_meta = esc_html(get_post_meta($post->ID, 'type1_headline4', true));

  //テンプレートのタイプ1 説明文4
  $type1_desc4 = array( 'name' => __('Description for fouth row', 'tcd-w'), 'desc' => __('Enter description for fouth row.', 'tcd-w'), 'id' => 'type1_desc4', 'type' => 'textarea', 'std' => '' );
  $type1_desc4_meta = esc_html(get_post_meta($post->ID, 'type1_desc4', true));

  //テンプレートのタイプ1 見出し5
  $type1_headline5 = array( 'name' => __('Catchphrase for fifth row', 'tcd-w'), 'desc' => __('Enter catchphrase for fifth row.', 'tcd-w'), 'id' => 'type1_headline5', 'type' => 'textarea', 'std' => '' );
  $type1_headline5_meta = esc_html(get_post_meta($post->ID, 'type1_headline5', true));

  //テンプレートのタイプ1 説明文5
  $type1_desc5 = array( 'name' => __('Description for fifth row', 'tcd-w'), 'desc' => __('Enter description for fifth row.', 'tcd-w'), 'id' => 'type1_desc5', 'type' => 'textarea', 'std' => '' );
  $type1_desc5_meta = esc_html(get_post_meta($post->ID, 'type1_desc5', true));

  //テンプレートのタイプ1 見出し6
  $type1_headline6 = array( 'name' => __('Catchphrase for sixth row', 'tcd-w'), 'desc' => __('Enter catchphrase for sixth row.', 'tcd-w'), 'id' => 'type1_headline6', 'type' => 'textarea', 'std' => '' );
  $type1_headline6_meta = esc_html(get_post_meta($post->ID, 'type1_headline6', true));

  //テンプレートのタイプ1 説明文6
  $type1_desc6 = array( 'name' => __('Description for sixth row', 'tcd-w'), 'desc' => __('Enter description for sixth row.', 'tcd-w'), 'id' => 'type1_desc6', 'type' => 'textarea', 'std' => '' );
  $type1_desc6_meta = esc_html(get_post_meta($post->ID, 'type1_desc6', true));

  //テンプレートのタイプ1 見出し7
  $type1_headline7 = array( 'name' => __('Catchphrase for seventh row', 'tcd-w'), 'desc' => __('Enter catchphrase for seventh row.', 'tcd-w'), 'id' => 'type1_headline7', 'type' => 'textarea', 'std' => '' );
  $type1_headline7_meta = esc_html(get_post_meta($post->ID, 'type1_headline7', true));

  //テンプレートのタイプ1 説明文7
  $type1_desc7 = array( 'name' => __('Description for seventh row', 'tcd-w'), 'desc' => __('Enter description for seventh row.', 'tcd-w'), 'id' => 'type1_desc7', 'type' => 'textarea', 'std' => '' );
  $type1_desc7_meta = esc_html(get_post_meta($post->ID, 'type1_desc7', true));

  //テンプレートのタイプ1 見出し8
  $type1_headline8 = array( 'name' => __('Catchphrase for eighth row', 'tcd-w'), 'desc' => __('Enter catchphrase for eighth row.', 'tcd-w'), 'id' => 'type1_headline8', 'type' => 'textarea', 'std' => '' );
  $type1_headline8_meta = esc_html(get_post_meta($post->ID, 'type1_headline8', true));

  //テンプレートのタイプ1 説明文8
  $type1_desc8 = array( 'name' => __('Description for eighth row', 'tcd-w'), 'desc' => __('Enter description for eighth row.', 'tcd-w'), 'id' => 'type1_desc8', 'type' => 'textarea', 'std' => '' );
  $type1_desc8_meta = esc_html(get_post_meta($post->ID, 'type1_desc8', true));

  //テンプレートのタイプ1 見出し9
  $type1_headline9 = array( 'name' => __('Catchphrase for nineth row', 'tcd-w'), 'desc' => __('Enter catchphrase for nineth row.', 'tcd-w'), 'id' => 'type1_headline9', 'type' => 'textarea', 'std' => '' );
  $type1_headline9_meta = esc_html(get_post_meta($post->ID, 'type1_headline9', true));

  //テンプレートのタイプ1 説明文9
  $type1_desc9 = array( 'name' => __('Description for nineth row', 'tcd-w'), 'desc' => __('Enter description for nineth row.', 'tcd-w'), 'id' => 'type1_desc9', 'type' => 'textarea', 'std' => '' );
  $type1_desc9_meta = esc_html(get_post_meta($post->ID, 'type1_desc9', true));

  // テンプレート2---------------------------------------------------------------------

  //テンプレートのタイプ2 見出し1
  $type2_headline1 = array( 'name' => __('Catchphrase for first row', 'tcd-w'), 'desc' => __('Enter catchphrase for third row.', 'tcd-w'), 'id' => 'type2_headline1', 'type' => 'textarea', 'std' => '' );
  $type2_headline1_meta = esc_html(get_post_meta($post->ID, 'type2_headline1', true));

  $type2_headline1_fontsize = array( 'name' => __('Font size of Catchphrase of first row', 'tcd-w'), 'desc' => __('Enter the number for catchphrase font size. Default size:48px', 'tcd-w'), 'id' => 'type2_headline1_fontsize', 'type' => 'textarea', 'std' => '' );
  $type2_headline1_fontsize_meta = esc_html(get_post_meta($post->ID, 'type2_headline1_fontsize', true));

  //テンプレートのタイプ2 説明文1
  $type2_desc1 = array( 'name' => __('Description for first row', 'tcd-w'), 'desc' => __('Enter description for first row. Left column.', 'tcd-w'), 'id' => 'type2_desc1', 'type' => 'textarea', 'std' => '' );
  $type2_desc1_meta = esc_html(get_post_meta($post->ID, 'type2_desc1', true));

  $type2_desc1_fontsize = array( 'name' => __('Font size of Description of first row', 'tcd-w'), 'desc' => __('Enter the number for description font size. Default size:14px', 'tcd-w'), 'id' => 'type2_desc1_fontsize', 'type' => 'textarea', 'std' => '' );
  $type2_desc1_fontsize_meta = esc_html(get_post_meta($post->ID, 'type2_desc1_fontsize', true));

  //テンプレートのタイプ2 見出し2
  $type2_headline2 = array( 'name' => __('Catchphrase for second row', 'tcd-w'), 'desc' => __('Enter catchphrase for second row.', 'tcd-w'), 'id' => 'type2_headline2', 'type' => 'textarea', 'std' => '' );
  $type2_headline2_meta = esc_html(get_post_meta($post->ID, 'type2_headline2', true));

  //テンプレートのタイプ2 説明文2
  $type2_desc2 = array( 'name' => __('Description for second row', 'tcd-w'), 'desc' => __('Enter description for second row.', 'tcd-w'), 'id' => 'type2_desc2', 'type' => 'textarea', 'std' => '' );
  $type2_desc2_meta = esc_html(get_post_meta($post->ID, 'type2_desc2', true));

  //テンプレートのタイプ2 見出し3
  $type2_headline3 = array( 'name' => __('Catchphrase for third row', 'tcd-w'), 'desc' => __('Enter catchphrase for third row.', 'tcd-w'), 'id' => 'type2_headline3', 'type' => 'textarea', 'std' => '' );
  $type2_headline3_meta = esc_html(get_post_meta($post->ID, 'type2_headline3', true));

  //テンプレートのタイプ2 説明文3
  $type2_desc3 = array( 'name' => __('Description for third row', 'tcd-w'), 'desc' => __('Enter description for third row.', 'tcd-w'), 'id' => 'type2_desc3', 'type' => 'textarea', 'std' => '' );
  $type2_desc3_meta = esc_html(get_post_meta($post->ID, 'type2_desc3', true));

  //テンプレートのタイプ2 見出し4
  $type2_headline4 = array( 'name' => __('Catchphrase for fourth row', 'tcd-w'), 'desc' => __('Enter catchphrase for fourth row.', 'tcd-w'), 'id' => 'type2_headline4', 'type' => 'textarea', 'std' => '' );
  $type2_headline4_meta = esc_html(get_post_meta($post->ID, 'type2_headline4', true));

  //テンプレートのタイプ2 説明文4
  $type2_desc4 = array( 'name' => __('Description for fourth row', 'tcd-w'), 'desc' => __('Enter description for fourth row.', 'tcd-w'), 'id' => 'type2_desc4', 'type' => 'textarea', 'std' => '' );
  $type2_desc4_meta = esc_html(get_post_meta($post->ID, 'type2_desc4', true));

  //テンプレートのタイプ2 見出し5
  $type2_headline5 = array( 'name' => __('Catchphrase for fifth row', 'tcd-w'), 'desc' => __('Enter catchphrase for fifth row.', 'tcd-w'), 'id' => 'type2_headline5', 'type' => 'textarea', 'std' => '' );
  $type2_headline5_meta = esc_html(get_post_meta($post->ID, 'type2_headline5', true));

  //テンプレートのタイプ2 説明文5
  $type2_desc5 = array( 'name' => __('Contents for fifth row left column', 'tcd-w'), 'desc' => __('Enter description for fifth row left column.', 'tcd-w'), 'id' => 'type2_desc5', 'type' => 'textarea', 'std' => '' );
  $type2_desc5_meta = esc_html(get_post_meta($post->ID, 'type2_desc5', true));

  //テンプレートのタイプ2 説明文5-2
  $type2_desc52 = array( 'name' => __('Contents for fifth row right column', 'tcd-w'), 'desc' => __('Enter description for fifth row right column.', 'tcd-w'), 'id' => 'type2_desc52', 'type' => 'textarea', 'std' => '' );
  $type2_desc52_meta = esc_html(get_post_meta($post->ID, 'type2_desc52', true));

  //テンプレートのタイプ2 見出し6
  $type2_headline6 = array( 'name' => __('Catchphrase for sixth row', 'tcd-w'), 'desc' => __('Enter catchphrase for sixth row.', 'tcd-w'), 'id' => 'type2_headline6', 'type' => 'textarea', 'std' => '' );
  $type2_headline6_meta = esc_html(get_post_meta($post->ID, 'type2_headline6', true));

  //テンプレートのタイプ2 説明文6
  $type2_desc6 = array( 'name' => __('Contents for sixth row left column', 'tcd-w'), 'desc' => __('Enter description for sixth row left column.', 'tcd-w'), 'id' => 'type2_desc6', 'type' => 'textarea', 'std' => '' );
  $type2_desc6_meta = esc_html(get_post_meta($post->ID, 'type2_desc6', true));

  //テンプレートのタイプ2 説明文6-2
  $type2_desc62 = array( 'name' => __('Contents for sixth row right column', 'tcd-w'), 'desc' => __('Enter description for sixth row right column.', 'tcd-w'), 'id' => 'type2_desc62', 'type' => 'textarea', 'std' => '' );
  $type2_desc62_meta = esc_html(get_post_meta($post->ID, 'type2_desc62', true));

  //テンプレートのタイプ2 見出し7
  $type2_headline7 = array( 'name' => __('Catchphrase for seventh row', 'tcd-w'), 'desc' => __('Enter catchphrase for seventh row.', 'tcd-w'), 'id' => 'type2_headline7', 'type' => 'textarea', 'std' => '' );
  $type2_headline7_meta = esc_html(get_post_meta($post->ID, 'type2_headline7', true));

  //テンプレートのタイプ2 説明文7
  $type2_desc7 = array( 'name' => __('Description for seventh row', 'tcd-w'), 'desc' => __('Enter description for seventh row.', 'tcd-w'), 'id' => 'type2_desc7', 'type' => 'textarea', 'std' => '' );
  $type2_desc7_meta = esc_html(get_post_meta($post->ID, 'type2_desc7', true));

  //テンプレートのタイプ2 説明文8
  $type2_desc8 = array( 'name' => __('Description for eighth row', 'tcd-w'), 'desc' => __('Enter description for eighth row.', 'tcd-w'), 'id' => 'type2_desc8', 'type' => 'textarea', 'std' => '' );
  $type2_desc8_meta = esc_html(get_post_meta($post->ID, 'type2_desc8', true));

  //google map
  $type2_google_map = array( 'name' => __('Google map', 'tcd-w'), 'desc' => __('Enter the shortcode provided by TCD Google Maps.', 'tcd-w'), 'id' => 'type2_google_map', 'type' => 'textarea', 'std' => '' );
  $type2_google_map_meta = esc_html(get_post_meta($post->ID, 'type2_google_map', true));

  //テンプレートのタイプ2 shortcode1
  $type2_shortcode1 = array( 'name' => __('Shortcode', 'tcd-w'), 'desc' => __('Enter the shortcode provided by TCD Workflow. The shortcode is output preferentially than upper field.', 'tcd-w'), 'id' => 'type2_shortcode1', 'type' => 'textarea', 'std' => '' );
  $type2_shortcode1_meta = esc_html(get_post_meta($post->ID, 'type2_shortcode1', true));

  //テンプレートのタイプ2 shortcode2
  $type2_shortcode2 = array( 'name' => __('Shortcode', 'tcd-w'), 'desc' => __('Enter the shortcode provided by TCD Workflow. The shortcode is output preferentially than upper field.', 'tcd-w'), 'id' => 'type2_shortcode2', 'type' => 'textarea', 'std' => '' );
  $type2_shortcode2_meta = esc_html(get_post_meta($post->ID, 'type2_shortcode2', true));

  //テンプレートのタイプ2 shortcode3
  $type2_shortcode3 = array( 'name' => __('Shortcode', 'tcd-w'), 'desc' => __('Enter the shortcode provided by TCD Workflow. The shortcode is output preferentially than upper field.', 'tcd-w'), 'id' => 'type2_shortcode3', 'type' => 'textarea', 'std' => '' );
  $type2_shortcode3_meta = esc_html(get_post_meta($post->ID, 'type2_shortcode3', true));

  //テンプレートのタイプ2 shortcode4
  $type2_shortcode4 = array( 'name' => __('Shortcode', 'tcd-w'), 'desc' => __('Enter the shortcode provided by TCD Workflow. The shortcode is output preferentially than upper field.', 'tcd-w'), 'id' => 'type2_shortcode4', 'type' => 'textarea', 'std' => '' );
  $type2_shortcode4_meta = esc_html(get_post_meta($post->ID, 'type2_shortcode4', true));

  // テンプレート3---------------------------------------------------------------------

  //テンプレートのタイプ3 見出し1
  $type3_headline1 = array( 'name' => __('Catchphrase for first row', 'tcd-w'), 'desc' => __('Enter catchphrase for first row.', 'tcd-w'), 'id' => 'type3_headline1', 'type' => 'textarea', 'std' => '' );
  $type3_headline1_meta = esc_html(get_post_meta($post->ID, 'type3_headline1', true));

  $type3_headline1_fontsize = array( 'name' => __('Font size of Catchphrase of first row', 'tcd-w'), 'desc' => __('Enter the number for catchphrase font size. Default size:48px', 'tcd-w'), 'id' => 'type3_headline1_fontsize', 'type' => 'textarea', 'std' => '' );
  $type3_headline1_fontsize_meta = esc_html(get_post_meta($post->ID, 'type3_headline1_fontsize', true));

  //テンプレートのタイプ3 説明文1
  $type3_desc1 = array( 'name' => __('Description for first row.', 'tcd-w'), 'desc' => __('Enter description for first row.', 'tcd-w'), 'id' => 'type3_desc1', 'type' => 'textarea', 'std' => '' );
  $type3_desc1_meta = esc_html(get_post_meta($post->ID, 'type3_desc1', true));

  $type3_desc1_fontsize = array( 'name' => __('Font size of Description of first row', 'tcd-w'), 'desc' => __('Enter the number for description font size. Default size:14px', 'tcd-w'), 'id' => 'type3_desc1_fontsize', 'type' => 'textarea', 'std' => '' );
  $type3_desc1_fontsize_meta = esc_html(get_post_meta($post->ID, 'type3_desc1_fontsize', true));

  //テンプレートのタイプ3 見出し2
  $type3_headline2 = array( 'name' => __('Catchphrase for second row. Left column', 'tcd-w'), 'desc' => __('Enter catchphrase for second row. Left column.', 'tcd-w'), 'id' => 'type3_headline2', 'type' => 'textarea', 'std' => '' );
  $type3_headline2_meta = esc_html(get_post_meta($post->ID, 'type3_headline2', true));

  //テンプレートのタイプ3 説明文2
  $type3_desc2 = array( 'name' => __('Description for second row. Left column', 'tcd-w'), 'desc' => __('Enter description for second row. Left column.', 'tcd-w'), 'id' => 'type3_desc2', 'type' => 'textarea', 'std' => '' );
  $type3_desc2_meta = esc_html(get_post_meta($post->ID, 'type3_desc2', true));

  //テンプレートのタイプ3 見出し3
  $type3_headline3 = array( 'name' => __('Catchphrase for second row. Right column', 'tcd-w'), 'desc' => __('Enter catchphrase for second row. Right column.', 'tcd-w'), 'id' => 'type3_headline3', 'type' => 'textarea', 'std' => '' );
  $type3_headline3_meta = esc_html(get_post_meta($post->ID, 'type3_headline3', true));

  //テンプレートのタイプ3 説明文3
  $type3_desc3 = array( 'name' => __('Description for second row. Right column', 'tcd-w'), 'desc' => __('Enter description for second row. Right column.', 'tcd-w'), 'id' => 'type3_desc3', 'type' => 'textarea', 'std' => '' );
  $type3_desc3_meta = esc_html(get_post_meta($post->ID, 'type3_desc3', true));

  //テンプレートのタイプ3 見出し4
  $type3_headline4 = array( 'name' => __('Catchphrase for third row', 'tcd-w'), 'desc' => __('Enter catchphrase for third row.', 'tcd-w'), 'id' => 'type3_headline4', 'type' => 'textarea', 'std' => '' );
  $type3_headline4_meta = esc_html(get_post_meta($post->ID, 'type3_headline4', true));

  //テンプレートのタイプ3 説明文4
  $type3_desc4 = array( 'name' => __('Description for third row', 'tcd-w'), 'desc' => __('Enter description for third row.', 'tcd-w'), 'id' => 'type3_desc4', 'type' => 'textarea', 'std' => '' );
  $type3_desc4_meta = esc_html(get_post_meta($post->ID, 'type3_desc4', true));

  //テンプレートのタイプ3 説明文5
  $type3_desc5 = array( 'name' => __('Description for fourth row. Left column', 'tcd-w'), 'desc' => __('Enter description for fourth row. Left column.', 'tcd-w'), 'id' => 'type3_desc5', 'type' => 'textarea', 'std' => '' );
  $type3_desc5_meta = esc_html(get_post_meta($post->ID, 'type3_desc5', true));

  //テンプレートのタイプ3 説明文6
  $type3_desc6 = array( 'name' => __('Description for fourth row. Center column', 'tcd-w'), 'desc' => __('Enter description for fourth row. Center column.', 'tcd-w'), 'id' => 'type3_desc6', 'type' => 'textarea', 'std' => '' );
  $type3_desc6_meta = esc_html(get_post_meta($post->ID, 'type3_desc6', true));

  //テンプレートのタイプ3 説明文7
  $type3_desc7 = array( 'name' => __('Description for fourth row. Right column', 'tcd-w'), 'desc' => __('Enter description for fourth row. Right column.', 'tcd-w'), 'id' => 'type3_desc7', 'type' => 'textarea', 'std' => '' );
  $type3_desc7_meta = esc_html(get_post_meta($post->ID, 'type3_desc7', true));

  //テンプレートのタイプ3 説明文8
  $type3_desc8 = array( 'name' => __('Description for fifth row. Left column', 'tcd-w'), 'desc' => __('Enter description for fifth row. Left column.', 'tcd-w'), 'id' => 'type3_desc8', 'type' => 'textarea', 'std' => '' );
  $type3_desc8_meta = esc_html(get_post_meta($post->ID, 'type3_desc8', true));

  //テンプレートのタイプ3 説明文9
  $type3_desc9 = array( 'name' => __('Description for fifth row. Right column', 'tcd-w'), 'desc' => __('Enter description for fifth row. Right column.', 'tcd-w'), 'id' => 'type3_desc9', 'type' => 'textarea', 'std' => '' );
  $type3_desc9_meta = esc_html(get_post_meta($post->ID, 'type3_desc9', true));

  //テンプレートのタイプ3 見出し5
  $type3_headline5 = array( 'name' => __('Catchphrase for sixth row', 'tcd-w'), 'desc' => __('Enter catchphrase for sixth row.', 'tcd-w'), 'id' => 'type3_headline5', 'type' => 'textarea', 'std' => '' );
  $type3_headline5_meta = esc_html(get_post_meta($post->ID, 'type3_headline5', true));

  //テンプレートのタイプ3 説明文10
  $type3_desc10 = array( 'name' => __('Description for sixth row', 'tcd-w'), 'desc' => __('Enter description for sixth row.', 'tcd-w'), 'id' => 'type3_desc10', 'type' => 'textarea', 'std' => '' );
  $type3_desc10_meta = esc_html(get_post_meta($post->ID, 'type3_desc10', true));

  //テンプレートのタイプ3 見出し6
  $type3_headline6 = array( 'name' => __('Catchphrase for seventh row. Left column', 'tcd-w'), 'desc' => __('Enter catchphrase for seventh row. Left column.', 'tcd-w'), 'id' => 'type3_headline6', 'type' => 'textarea', 'std' => '' );
  $type3_headline6_meta = esc_html(get_post_meta($post->ID, 'type3_headline6', true));

  //テンプレートのタイプ3 説明文11
  $type3_desc11 = array( 'name' => __('Description for seventh row. Left column', 'tcd-w'), 'desc' => __('Enter description for seventh row. Left column.', 'tcd-w'), 'id' => 'type3_desc11', 'type' => 'textarea', 'std' => '' );
  $type3_desc11_meta = esc_html(get_post_meta($post->ID, 'type3_desc11', true));

  //テンプレートのタイプ3 見出し7
  $type3_headline7 = array( 'name' => __('Catchphrase for seventh row. Right column', 'tcd-w'), 'desc' => __('Enter catchphrase for seventh row. Right column.', 'tcd-w'), 'id' => 'type3_headline7', 'type' => 'textarea', 'std' => '' );
  $type3_headline7_meta = esc_html(get_post_meta($post->ID, 'type3_headline7', true));

  //テンプレートのタイプ3 説明文12
  $type3_desc12 = array( 'name' => __('Description for seventh row. Right column', 'tcd-w'), 'desc' => __('Enter description for seventh row. Right column.', 'tcd-w'), 'id' => 'type3_desc12', 'type' => 'textarea', 'std' => '' );
  $type3_desc12_meta = esc_html(get_post_meta($post->ID, 'type3_desc12', true));

  //テンプレートのタイプ3 見出し8
  $type3_headline8 = array( 'name' => __('Catchphrase for nineth row. Left column', 'tcd-w'), 'desc' => __('Enter catchphrase for nineth row. Left column.', 'tcd-w'), 'id' => 'type3_headline8', 'type' => 'textarea', 'std' => '' );
  $type3_headline8_meta = esc_html(get_post_meta($post->ID, 'type3_headline8', true));

  //テンプレートのタイプ3 説明文13
  $type3_desc13 = array( 'name' => __('Description for nineth row. Left column', 'tcd-w'), 'desc' => __('Enter description for nineth row. Left column.', 'tcd-w'), 'id' => 'type3_desc13', 'type' => 'textarea', 'std' => '' );
  $type3_desc13_meta = esc_html(get_post_meta($post->ID, 'type3_desc13', true));

  //テンプレートのタイプ3 見出し9
  $type3_headline9 = array( 'name' => __('Catchphrase for nineth row. Center column', 'tcd-w'), 'desc' => __('Enter catchphrase for nineth row. Center column.', 'tcd-w'), 'id' => 'type3_headline9', 'type' => 'textarea', 'std' => '' );
  $type3_headline9_meta = esc_html(get_post_meta($post->ID, 'type3_headline9', true));

  //テンプレートのタイプ3 説明文14
  $type3_desc14 = array( 'name' => __('Description for nineth row. Center column', 'tcd-w'), 'desc' => __('Enter description for nineth row. Center column.', 'tcd-w'), 'id' => 'type3_desc14', 'type' => 'textarea', 'std' => '' );
  $type3_desc14_meta = esc_html(get_post_meta($post->ID, 'type3_desc14', true));

  //テンプレートのタイプ3 見出し10
  $type3_headline10 = array( 'name' => __('Catchphrase for nineth row. Right column', 'tcd-w'), 'desc' => __('Enter catchphrase for nineth row. Right column.', 'tcd-w'), 'id' => 'type3_headline10', 'type' => 'textarea', 'std' => '' );
  $type3_headline10_meta = esc_html(get_post_meta($post->ID, 'type3_headline10', true));

  //テンプレートのタイプ3 説明文15
  $type3_desc15 = array( 'name' => __('Description for nineth row. Right column', 'tcd-w'), 'desc' => __('Enter description for nineth row. Right column.', 'tcd-w'), 'id' => 'type3_desc15', 'type' => 'textarea', 'std' => '' );
  $type3_desc15_meta = esc_html(get_post_meta($post->ID, 'type3_desc15', true));


  // テンプレート4---------------------------------------------------------------------

  //テンプレートのタイプ4 見出し1
  $type4_headline1 = array( 'name' => __('Catchphrase for first row', 'tcd-w'), 'desc' => __('Enter catchphrase for first row.', 'tcd-w'), 'id' => 'type4_headline1', 'type' => 'textarea', 'std' => '' );
  $type4_headline1_meta = esc_html(get_post_meta($post->ID, 'type4_headline1', true));

  $type4_headline1_fontsize = array( 'name' => __('Font size of Catchphrase of first row', 'tcd-w'), 'desc' => __('Enter the number for catchphrase font size. Default size:48px', 'tcd-w'), 'id' => 'type4_headline1_fontsize', 'type' => 'textarea', 'std' => '' );
  $type4_headline1_fontsize_meta = esc_html(get_post_meta($post->ID, 'type4_headline1_fontsize', true));

  //テンプレートのタイプ4 説明文1
  $type4_desc1 = array( 'name' => __('Description for first row.', 'tcd-w'), 'desc' => __('Enter description for first row.', 'tcd-w'), 'id' => 'type4_desc1', 'type' => 'textarea', 'std' => '' );
  $type4_desc1_meta = esc_html(get_post_meta($post->ID, 'type4_desc1', true));

  $type4_desc1_fontsize = array( 'name' => __('Font size of Description of first row', 'tcd-w'), 'desc' => __('Enter the number for description font size. Default size:14px', 'tcd-w'), 'id' => 'type4_desc1_fontsize', 'type' => 'textarea', 'std' => '' );
  $type4_desc1_fontsize_meta = esc_html(get_post_meta($post->ID, 'type4_desc1_fontsize', true));

  //テンプレートのタイプ4 見出し2
  $type4_headline2 = array( 'name' => __('Catchphrase for second row.', 'tcd-w'), 'desc' => __('Enter catchphrase for second row.', 'tcd-w'), 'id' => 'type4_headline2', 'type' => 'textarea', 'std' => '' );
  $type4_headline2_meta = esc_html(get_post_meta($post->ID, 'type4_headline2', true));

  //テンプレートのタイプ4 説明文2
  $type4_desc2 = array( 'name' => __('Description for second row.', 'tcd-w'), 'desc' => __('Enter description for second row.', 'tcd-w'), 'id' => 'type4_desc2', 'type' => 'textarea', 'std' => '' );
  $type4_desc2_meta = esc_html(get_post_meta($post->ID, 'type4_desc2', true));

  //テンプレートのタイプ4 自由記述1
  $type4_desc22 = array( 'name' => __('Free input area for second row.', 'tcd-w'), 'desc' => __('You can use HTML tags.', 'tcd-w'), 'id' => 'type4_desc22', 'type' => 'textarea', 'std' => '' );
  $type4_desc22_meta = esc_html(get_post_meta($post->ID, 'type4_desc22', true));

  //テンプレートのタイプ4 見出し3
  $type4_headline3 = array( 'name' => __('Catchphrase for third row.', 'tcd-w'), 'desc' => __('Enter catchphrase for third row.', 'tcd-w'), 'id' => 'type4_headline3', 'type' => 'textarea', 'std' => '' );
  $type4_headline3_meta = esc_html(get_post_meta($post->ID, 'type4_headline3', true));

  //テンプレートのタイプ4 説明文3
  $type4_desc3 = array( 'name' => __('Description for third row.', 'tcd-w'), 'desc' => __('Enter description for third row.', 'tcd-w'), 'id' => 'type4_desc3', 'type' => 'textarea', 'std' => '' );
  $type4_desc3_meta = esc_html(get_post_meta($post->ID, 'type4_desc3', true));

  //テンプレートのタイプ4 自由記述2
  $type4_desc32 = array( 'name' => __('Free input area for third row.', 'tcd-w'), 'desc' => __('You can use HTML tags.', 'tcd-w'), 'id' => 'type4_desc32', 'type' => 'textarea', 'std' => '' );
  $type4_desc32_meta = esc_html(get_post_meta($post->ID, 'type4_desc32', true));

  //テンプレートのタイプ4 見出し4
  $type4_headline4 = array( 'name' => __('Catchphrase for fourth row', 'tcd-w'), 'desc' => __('Enter catchphrase for fourth row.', 'tcd-w'), 'id' => 'type4_headline4', 'type' => 'textarea', 'std' => '' );
  $type4_headline4_meta = esc_html(get_post_meta($post->ID, 'type4_headline4', true));

  //テンプレートのタイプ4 見出し5
  $type4_headline5 = array( 'name' => __('Catchphrase for fifth row', 'tcd-w'), 'desc' => __('Enter catchphrase for fifth row.', 'tcd-w'), 'id' => 'type4_headline5', 'type' => 'textarea', 'std' => '' );
  $type4_headline5_meta = esc_html(get_post_meta($post->ID, 'type4_headline5', true));

  //テンプレートのタイプ4 自由記述3
  $type4_desc4 = array( 'name' => __('Free input area for fifth row.', 'tcd-w'), 'desc' => __('You can use HTML tags.', 'tcd-w'), 'id' => 'type4_desc4', 'type' => 'textarea', 'std' => '' );
  $type4_desc4_meta = esc_html(get_post_meta($post->ID, 'type4_desc4', true));

  //テンプレートのタイプ4 自由記述4
  $type4_desc5 = array( 'name' => __('Free input area for sixth row.', 'tcd-w'), 'desc' => __('You can use HTML tags.', 'tcd-w'), 'id' => 'type4_desc5', 'type' => 'textarea', 'std' => '' );
  $type4_desc5_meta = esc_html(get_post_meta($post->ID, 'type4_desc5', true));

  //テンプレートのタイプ4 shortcode1
  $type4_shortcode1 = array( 'name' => __('Shortcode', 'tcd-w'), 'desc' => __('Enter the shortcode provided by TCD Workflow. The shortcode is output preferentially than upper field.', 'tcd-w'), 'id' => 'type4_shortcode1', 'type' => 'textarea', 'std' => '' );
  $type4_shortcode1_meta = esc_html(get_post_meta($post->ID, 'type4_shortcode1', true));

  //テンプレートのタイプ4 shortcode2
  $type4_shortcode2 = array( 'name' => __('Shortcode', 'tcd-w'), 'desc' => __('Enter the shortcode provided by TCD Workflow. The shortcode is output preferentially than upper field.', 'tcd-w'), 'id' => 'type4_shortcode2', 'type' => 'textarea', 'std' => '' );
  $type4_shortcode2_meta = esc_html(get_post_meta($post->ID, 'type4_shortcode2', true));

  //テンプレートのタイプ4 shortcode3
  $type4_shortcode3 = array( 'name' => __('Shortcode', 'tcd-w'), 'desc' => __('Enter the shortcode provided by TCD Workflow. The shortcode is output preferentially than upper field.', 'tcd-w'), 'id' => 'type4_shortcode3', 'type' => 'textarea', 'std' => '' );
  $type4_shortcode3_meta = esc_html(get_post_meta($post->ID, 'type4_shortcode3', true));

  //テンプレートのタイプ4 shortcode4
  $type4_shortcode4 = array( 'name' => __('Shortcode', 'tcd-w'), 'desc' => __('Enter the shortcode provided by TCD Workflow. The shortcode is output preferentially than upper field.', 'tcd-w'), 'id' => 'type4_shortcode4', 'type' => 'textarea', 'std' => '' );
  $type4_shortcode4_meta = esc_html(get_post_meta($post->ID, 'type4_shortcode4', true));

  // ---------------------------------------------------------------------

  echo '<input type="hidden" name="custom_fields_meta_box_nonce" value="', wp_create_nonce(basename(__FILE__)), '" />';

  //テンプレートの選択 ***********************************************************************************************************************************************************************************
  echo '<dl class="ml_custom_fields" id="ml_custom_fields_box1">';

  echo '<dt><label for="' , $page_tcd_template_type['id'] , '">' , $page_tcd_template_type['name'] , '</label></dt>';
  echo '<dd><ul class="radio template cf">';
  foreach ($page_tcd_template_type['options'] as $page_tcd_template_type_option) {
    if($page_tcd_template_type_option['value'] == 'type1') {
      echo '<li><label', ( ( empty($page_tcd_template_type_meta) && $page_tcd_template_type_option['value'] == 'type1' ) || $page_tcd_template_type_meta == $page_tcd_template_type_option['value'] ) ? ' class="active"' : '' ,'><input type="radio" id ="template_', $page_tcd_template_type_option['value'], '" name="', $page_tcd_template_type['id'], '" value="', $page_tcd_template_type_option['value'], '"', ($page_tcd_template_type_meta == $page_tcd_template_type_option['value'] || $page_tcd_template_type['std'] == $page_tcd_template_type_option['value']) ? ' checked="checked"' : '', ' />', $page_tcd_template_type_option['name'] , '</label></li>';
    } else {
      echo '<li><label', ( ( empty($page_tcd_template_type_meta) && $page_tcd_template_type_option['value'] == 'type1' ) || $page_tcd_template_type_meta == $page_tcd_template_type_option['value'] ) ? ' class="active"' : '' ,'><input type="radio" id ="template_', $page_tcd_template_type_option['value'], '" name="', $page_tcd_template_type['id'], '" value="', $page_tcd_template_type_option['value'], '"', ($page_tcd_template_type_meta == $page_tcd_template_type_option['value'] || $page_tcd_template_type['std'] == $page_tcd_template_type_option['value']) ? ' checked="checked"' : '', ' />', $page_tcd_template_type_option['name'] , '</label><a href="' , bloginfo('template_url') , '/admin/img/' ,  $page_tcd_template_type_option['img'] , '" class="fancybox" rel="group1" title="' , $page_tcd_template_type_option['name'] , '">' , __('View image', 'tcd-w') ,'</a></li>';
    }
  }
  echo '</ul></dd>';

  echo '</dl>';

  //メイン画像の登録 ***********************************************************************************************************************************************************************************
  echo '<dl class="ml_custom_fields" id="ml_custom_fields_box0">';

  echo '<dt><label>' , __('Main image', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for page header.<br />Recommend image size. Width:1600 Height:600px', 'tcd-w') , '</p>';
    mlcf_media_form('page_main_image', __('Image', 'tcd-w'));
  echo '</dd>';

  echo '<dt><label>' , __('Main image for mobile device', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('If this image is not registered, images that were previously registered will be displayed.<br />Recommend image size. Width:800px Height:Free size', 'tcd-w') , '</p>';
    mlcf_media_form('page_main_image_mobile', __('Image', 'tcd-w'));
  echo '</dd>';

  echo '</dl>';

  //テンプレート1 ***************************************************************************************************************************************************************************************

  echo '<dl class="ml_custom_fields" id="ml_custom_fields_box2"' , ( $page_tcd_template_type_meta == 'type2' ) ? ' style="display:block;"' : ' style="display:none;"' , '>';

  //１段目　見出し
  echo '<dt><label for="' , $type1_headline1['id'] , '">' , $type1_headline1['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_headline1['desc'] , '</p>';
  echo '<textarea name="', $type1_headline1['id'], '" id="', $type1_headline1['id'], '" cols="60" rows="4" style="width:97%">', $type1_headline1_meta ? $type1_headline1_meta : $type1_headline1['std'], '</textarea>';

  //１段目　見出しfontsize
  echo '<dt><label for="' , $type1_headline1_fontsize['id'] , '">' , $type1_headline1_fontsize['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_headline1_fontsize['desc'] , '</p>';
  echo '<input name="', $type1_headline1_fontsize['id'], '" id="', $type1_headline1_fontsize['id'], '" size="10" style="width:15%" value="', $type1_headline1_fontsize_meta ? $type1_headline1_fontsize_meta : $type1_headline1_fontsize['std'], '" type="text"> px';

  //１段目　説明文
  echo '<dt><label for="' , $type1_desc1['id'] , '">' , $type1_desc1['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_desc1['desc'] , '</p>';
  echo '<textarea name="', $type1_desc1['id'], '" id="', $type1_desc1['id'], '" cols="60" rows="4" style="width:97%">', $type1_desc1_meta ? $type1_desc1_meta : $type1_desc1['std'], '</textarea>';

  //１段目　説明文fontsize
  echo '<dt><label for="' , $type1_desc1_fontsize['id'] , '">' , $type1_desc1_fontsize['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_desc1_fontsize['desc'] , '</p>';
  echo '<input name="', $type1_desc1_fontsize['id'], '" id="', $type1_desc1_fontsize['id'], '" size="10" style="width:15%" value="', $type1_desc1_fontsize_meta ? $type1_desc1_fontsize_meta : $type1_desc1_fontsize['std'], '" type="text"> px';

  //１段目　画像
  // echo '<dt><label>' , __('Image for first row', 'tcd-w') ,'</label><dt>';
  // echo '<dd><p class="desc">' , __('Register image for first row.<br />Recommend image size. Width:550px Height:450px', 'tcd-w') , '</p>';
  //   mlcf_media_form('type1_image1', __('Image', 'tcd-w'));
  // echo '</dd>';

  //２段目　見出し
  echo '<dt><label for="' , $type1_headline2['id'] , '">' , $type1_headline2['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_headline2['desc'] , '</p>';
  echo '<textarea name="', $type1_headline2['id'], '" id="', $type1_headline2['id'], '" cols="60" rows="4" style="width:97%">', $type1_headline2_meta ? $type1_headline2_meta : $type1_headline2['std'], '</textarea>';

  //２段目　説明文
  echo '<dt><label for="' , $type1_desc2['id'] , '">' , $type1_desc2['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_desc2['desc'] , '</p>';
  echo '<textarea name="', $type1_desc2['id'], '" id="', $type1_desc2['id'], '" cols="60" rows="4" style="width:97%">', $type1_desc2_meta ? $type1_desc2_meta : $type1_desc2['std'], '</textarea>';

  //２段目　画像
  echo '<dt><label>' , __('Image for second row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for second row.<br />Recommend image size. Width:550px Height:450px', 'tcd-w') , '</p>';
    mlcf_media_form('type1_image2', __('Image', 'tcd-w'));
  echo '</dd>';

  //３段目　見出し
  echo '<dt><label for="' , $type1_headline3['id'] , '">' , $type1_headline3['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_headline3['desc'] , '</p>';
  echo '<textarea name="', $type1_headline3['id'], '" id="', $type1_headline3['id'], '" cols="60" rows="4" style="width:97%">', $type1_headline3_meta ? $type1_headline3_meta : $type1_headline3['std'], '</textarea>';

  //３段目　説明文
  echo '<dt><label for="' , $type1_desc3['id'] , '">' , $type1_desc3['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_desc3['desc'] , '</p>';
  echo '<textarea name="', $type1_desc3['id'], '" id="', $type1_desc3['id'], '" cols="60" rows="4" style="width:97%">', $type1_desc3_meta ? $type1_desc3_meta : $type1_desc3['std'], '</textarea>';

  //３段目　画像
  echo '<dt><label>' , __('Image for third row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for third row.<br />Recommend image size. Width:550px Height:450px', 'tcd-w') , '</p>';
    mlcf_media_form('type1_image3', __('Image', 'tcd-w'));
  echo '</dd>';

  //４段目　見出し
  echo '<dt><label for="' , $type1_headline4['id'] , '">' , $type1_headline4['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_headline4['desc'] , '</p>';
  echo '<textarea name="', $type1_headline4['id'], '" id="', $type1_headline4['id'], '" cols="60" rows="4" style="width:97%">', $type1_headline4_meta ? $type1_headline4_meta : $type1_headline4['std'], '</textarea>';

  //４段目　説明文
  echo '<dt><label for="' , $type1_desc4['id'] , '">' , $type1_desc4['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_desc4['desc'] , '</p>';
  echo '<textarea name="', $type1_desc4['id'], '" id="', $type1_desc4['id'], '" cols="60" rows="4" style="width:97%">', $type1_desc4_meta ? $type1_desc4_meta : $type1_desc4['std'], '</textarea>';

  //４段目　画像
  echo '<dt><label>' , __('Image for fourth row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for fourth row.<br />Recommend image size. Width:1400px Height:390px', 'tcd-w') , '</p>';
    mlcf_media_form('type1_image4', __('Image', 'tcd-w'));
  echo '</dd>';

  //5段目　見出し
  echo '<dt><label for="' , $type1_headline5['id'] , '">' , $type1_headline5['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_headline5['desc'] , '</p>';
  echo '<textarea name="', $type1_headline5['id'], '" id="', $type1_headline5['id'], '" cols="60" rows="4" style="width:97%">', $type1_headline5_meta ? $type1_headline5_meta : $type1_headline5['std'], '</textarea>';

  //5段目　説明文
  echo '<dt><label for="' , $type1_desc5['id'] , '">' , $type1_desc5['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_desc5['desc'] , '</p>';
  echo '<textarea name="', $type1_desc5['id'], '" id="', $type1_desc5['id'], '" cols="60" rows="4" style="width:97%">', $type1_desc5_meta ? $type1_desc5_meta : $type1_desc5['std'], '</textarea>';

  //5段目　画像
  echo '<dt><label>' , __('Image for fifth row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for fifth row.<br />Recommend image size. Width:550px Height:450px', 'tcd-w') , '</p>';
    mlcf_media_form('type1_image5', __('Image', 'tcd-w'));
  echo '</dd>';

  //6段目　見出し
  echo '<dt><label for="' , $type1_headline6['id'] , '">' , $type1_headline6['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_headline6['desc'] , '</p>';
  echo '<textarea name="', $type1_headline6['id'], '" id="', $type1_headline6['id'], '" cols="60" rows="4" style="width:97%">', $type1_headline6_meta ? $type1_headline6_meta : $type1_headline6['std'], '</textarea>';

  //6段目　説明文
  echo '<dt><label for="' , $type1_desc6['id'] , '">' , $type1_desc6['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_desc6['desc'] , '</p>';
  echo '<textarea name="', $type1_desc6['id'], '" id="', $type1_desc6['id'], '" cols="60" rows="4" style="width:97%">', $type1_desc6_meta ? $type1_desc6_meta : $type1_desc6['std'], '</textarea>';

  //6段目　画像
  echo '<dt><label>' , __('Image for sixth row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for sixth row.<br />Recommend image size. Width:550px Height:450px', 'tcd-w') , '</p>';
    mlcf_media_form('type1_image6', __('Image', 'tcd-w'));
  echo '</dd>';

  //7段目　見出し
  echo '<dt><label for="' , $type1_headline7['id'] , '">' , $type1_headline7['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_headline7['desc'] , '</p>';
  echo '<textarea name="', $type1_headline7['id'], '" id="', $type1_headline7['id'], '" cols="60" rows="4" style="width:97%">', $type1_headline7_meta ? $type1_headline7_meta : $type1_headline7['std'], '</textarea>';

  //7段目　説明文
  echo '<dt><label for="' , $type1_desc7['id'] , '">' , $type1_desc7['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_desc7['desc'] , '</p>';
  echo '<textarea name="', $type1_desc7['id'], '" id="', $type1_desc7['id'], '" cols="60" rows="4" style="width:97%">', $type1_desc7_meta ? $type1_desc7_meta : $type1_desc7['std'], '</textarea>';

  //7段目　画像
  echo '<dt><label>' , __('Image for seventh row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for seventh row.<br />Recommend image size. Width:1400px Height:390px', 'tcd-w') , '</p>';
    mlcf_media_form('type1_image7', __('Image', 'tcd-w'));
  echo '</dd>';

  //8段目　見出し
  echo '<dt><label for="' , $type1_headline8['id'] , '">' , $type1_headline8['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_headline8['desc'] , '</p>';
  echo '<textarea name="', $type1_headline8['id'], '" id="', $type1_headline8['id'], '" cols="60" rows="4" style="width:97%">', $type1_headline8_meta ? $type1_headline8_meta : $type1_headline8['std'], '</textarea>';

  //8段目　説明文
  echo '<dt><label for="' , $type1_desc8['id'] , '">' , $type1_desc8['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_desc8['desc'] , '</p>';
  echo '<textarea name="', $type1_desc8['id'], '" id="', $type1_desc8['id'], '" cols="60" rows="4" style="width:97%">', $type1_desc8_meta ? $type1_desc8_meta : $type1_desc8['std'], '</textarea>';

  //8段目　画像
  echo '<dt><label>' , __('Image for eighth row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for eighth row.<br />Recommend image size. Width:550px Height:450px', 'tcd-w') , '</p>';
    mlcf_media_form('type1_image8', __('Image', 'tcd-w'));
  echo '</dd>';

  //9段目　見出し
  echo '<dt><label for="' , $type1_headline9['id'] , '">' , $type1_headline9['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_headline9['desc'] , '</p>';
  echo '<textarea name="', $type1_headline9['id'], '" id="', $type1_headline9['id'], '" cols="60" rows="4" style="width:97%">', $type1_headline9_meta ? $type1_headline9_meta : $type1_headline9['std'], '</textarea>';

  //9段目　説明文
  echo '<dt><label for="' , $type1_desc9['id'] , '">' , $type1_desc9['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type1_desc9['desc'] , '</p>';
  echo '<textarea name="', $type1_desc9['id'], '" id="', $type1_desc9['id'], '" cols="60" rows="4" style="width:97%">', $type1_desc9_meta ? $type1_desc9_meta : $type1_desc9['std'], '</textarea>';

  //9段目　画像
  echo '<dt><label>' , __('Image for nineth row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for nineth row.<br />Recommend image size. Width:550px Height:450px', 'tcd-w') , '</p>';
    mlcf_media_form('type1_image9', __('Image', 'tcd-w'));
  echo '</dd>';

  echo '</dl>';

  //テンプレート2 ***************************************************************************************************************************************************************************************

  echo '<dl class="ml_custom_fields" id="ml_custom_fields_box3"' , ( $page_tcd_template_type_meta == 'type3' ) ? ' style="display:block;"' : ' style="display:none;"' , '>';

  //１段目　左　画像
  // echo '<dt><label>' , __('Image for first row. Left column', 'tcd-w') ,'</label><dt>';
  // echo '<dd><p class="desc">' , __('Register image for first row. Left column.<br />Recommend image size. Width:360px Height:360px', 'tcd-w') , '</p>';
  //   mlcf_media_form('type2_image1', __('Image', 'tcd-w'));
  // echo '</dd>';

  //1段目　見出し
  echo '<dt><label for="' , $type2_headline1['id'] , '">' , $type2_headline1['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_headline1['desc'] , '</p>';
  echo '<textarea name="', $type2_headline1['id'], '" id="', $type2_headline1['id'], '" cols="60" rows="4" style="width:97%">', $type2_headline1_meta ? $type2_headline1_meta : $type2_headline1['std'], '</textarea>';

  //１段目　見出しfontsize
  echo '<dt><label for="' , $type2_headline1_fontsize['id'] , '">' , $type2_headline1_fontsize['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_headline1_fontsize['desc'] , '</p>';
  echo '<input name="', $type2_headline1_fontsize['id'], '" id="', $type2_headline1_fontsize['id'], '" size="10" style="width:15%" value="', $type2_headline1_fontsize_meta ? $type2_headline1_fontsize_meta : $type2_headline1_fontsize['std'], '" type="text"> px';

  //1段目　説明文
  echo '<dt><label for="' , $type2_desc1['id'] , '">' , $type2_desc1['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_desc1['desc'] , '</p>';
  echo '<textarea name="', $type2_desc1['id'], '" id="', $type2_desc1['id'], '" cols="60" rows="4" style="width:97%">', $type2_desc1_meta ? $type2_desc1_meta : $type2_desc1['std'], '</textarea>';

  //１段目　説明文fontsize
  echo '<dt><label for="' , $type2_desc1_fontsize['id'] , '">' , $type2_desc1_fontsize['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_desc1_fontsize['desc'] , '</p>';
  echo '<input name="', $type2_desc1_fontsize['id'], '" id="', $type2_desc1_fontsize['id'], '" size="10" style="width:15%" value="', $type2_desc1_fontsize_meta ? $type2_desc1_fontsize_meta : $type2_desc1_fontsize['std'], '" type="text"> px';

  //2段目　画像
  echo '<dt><label>' , __('Image for second row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for second row.<br />Recommend image size. Width:360px Height:360px', 'tcd-w') , '</p>';
    mlcf_media_form('type2_image2', __('Image', 'tcd-w'));
  echo '</dd>';

  //2段目　見出し
  echo '<dt><label for="' , $type2_headline2['id'] , '">' , $type2_headline2['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_headline2['desc'] , '</p>';
  echo '<textarea name="', $type2_headline2['id'], '" id="', $type2_headline2['id'], '" cols="60" rows="4" style="width:97%">', $type2_headline2_meta ? $type2_headline2_meta : $type2_headline2['std'], '</textarea>';

  //2段目　説明文
  echo '<dt><label for="' , $type2_desc2['id'] , '">' , $type2_desc2['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_desc2['desc'] , '</p>';
  echo '<textarea name="', $type2_desc2['id'], '" id="', $type2_desc2['id'], '" cols="60" rows="4" style="width:97%">', $type2_desc2_meta ? $type2_desc2_meta : $type2_desc2['std'], '</textarea>';

  //3段目　画像
  echo '<dt><label>' , __('Image for third row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for third row.<br />Recommend image size. Width:1400px Height:390px', 'tcd-w') , '</p>';
    mlcf_media_form('type2_image3', __('Image', 'tcd-w'));
  echo '</dd>';

  //3段目　見出し
  echo '<dt><label for="' , $type2_headline3['id'] , '">' , $type2_headline3['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_headline3['desc'] , '</p>';
  echo '<textarea name="', $type2_headline3['id'], '" id="', $type2_headline3['id'], '" cols="60" rows="4" style="width:97%">', $type2_headline3_meta ? $type2_headline3_meta : $type2_headline3['std'], '</textarea>';

  //3段目　説明文
  echo '<dt><label for="' , $type2_desc3['id'] , '">' , $type2_desc3['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_desc3['desc'] , '</p>';
  echo '<textarea name="', $type2_desc3['id'], '" id="', $type2_desc3['id'], '" cols="60" rows="4" style="width:97%">', $type2_desc3_meta ? $type2_desc3_meta : $type2_desc3['std'], '</textarea>';

  //4段目　 画像
  echo '<dt><label>' , __('Image for fourth row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for fourth row.<br />Recommend image size. Width:1400px Height:390px', 'tcd-w') , '</p>';
    mlcf_media_form('type2_image4', __('Image', 'tcd-w'));
  echo '</dd>';

  //4段目　見出し
  echo '<dt><label for="' , $type2_headline4['id'] , '">' , $type2_headline4['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_headline4['desc'] , '</p>';
  echo '<textarea name="', $type2_headline4['id'], '" id="', $type2_headline4['id'], '" cols="60" rows="4" style="width:97%">', $type2_headline4_meta ? $type2_headline4_meta : $type2_headline4['std'], '</textarea>';

  //4段目　説明文
  echo '<dt><label for="' , $type2_desc4['id'] , '">' , $type2_desc4['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_desc4['desc'] , '</p>';
  echo '<textarea name="', $type2_desc4['id'], '" id="', $type2_desc4['id'], '" cols="60" rows="4" style="width:97%">', $type2_desc4_meta ? $type2_desc4_meta : $type2_desc4['std'], '</textarea>';

  //5段目　見出し
  echo '<dt><label for="' , $type2_headline5['id'] , '">' , $type2_headline5['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_headline5['desc'] , '</p>';
  echo '<textarea name="', $type2_headline5['id'], '" id="', $type2_headline5['id'], '" cols="60" rows="4" style="width:97%">', $type2_headline5_meta ? $type2_headline5_meta : $type2_headline5['std'], '</textarea>';

  //5段目　説明文 左
  echo '<dt><label for="' , $type2_desc5['id'] , '">' , $type2_desc5['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_desc5['desc'] , '</p>';
  echo '<textarea name="', $type2_desc5['id'], '" id="', $type2_desc5['id'], '" cols="60" rows="4" style="width:97%">', $type2_desc5_meta ? $type2_desc5_meta : $type2_desc5['std'], '</textarea>';

  //5段目　説明文 左 shortcode
  echo '<dt><label for="' , $type2_shortcode1['id'] , '">' , $type2_shortcode1['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_shortcode1['desc'] , '</p>';
  echo '<input type="text" name="', $type2_shortcode1['id'], '" id="', $type2_shortcode1['id'], '" value="', $type2_shortcode1_meta ? $type2_shortcode1_meta : $type2_shortcode1['std'], '" size="30" style="width:100%" />';

  //5段目　説明文 右
  echo '<dt><label for="' , $type2_desc52['id'] , '">' , $type2_desc52['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_desc52['desc'] , '</p>';
  echo '<textarea name="', $type2_desc52['id'], '" id="', $type2_desc52['id'], '" cols="60" rows="4" style="width:97%">', $type2_desc52_meta ? $type2_desc52_meta : $type2_desc52['std'], '</textarea>';

  //5段目　説明文 右 shortcode
  echo '<dt><label for="' , $type2_shortcode2['id'] , '">' , $type2_shortcode2['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_shortcode2['desc'] , '</p>';
  echo '<input type="text" name="', $type2_shortcode2['id'], '" id="', $type2_shortcode2['id'], '" value="', $type2_shortcode2_meta ? $type2_shortcode2_meta : $type2_shortcode2['std'], '" size="30" style="width:100%" />';

  //6段目　見出し
  echo '<dt><label for="' , $type2_headline6['id'] , '">' , $type2_headline6['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_headline6['desc'] , '</p>';
  echo '<textarea name="', $type2_headline6['id'], '" id="', $type2_headline6['id'], '" cols="60" rows="4" style="width:97%">', $type2_headline6_meta ? $type2_headline6_meta : $type2_headline6['std'], '</textarea>';

  //6段目　説明文 左
  echo '<dt><label for="' , $type2_desc6['id'] , '">' , $type2_desc6['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_desc6['desc'] , '</p>';
  echo '<textarea name="', $type2_desc6['id'], '" id="', $type2_desc6['id'], '" cols="60" rows="4" style="width:97%">', $type2_desc6_meta ? $type2_desc6_meta : $type2_desc6['std'], '</textarea>';

  //6段目　説明文 左 shortcode
  echo '<dt><label for="' , $type2_shortcode3['id'] , '">' , $type2_shortcode3['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_shortcode3['desc'] , '</p>';
  echo '<input type="text" name="', $type2_shortcode3['id'], '" id="', $type2_shortcode3['id'], '" value="', $type2_shortcode3_meta ? $type2_shortcode3_meta : $type2_shortcode3['std'], '" size="30" style="width:100%" />';

  //6段目　説明文 右
  echo '<dt><label for="' , $type2_desc62['id'] , '">' , $type2_desc62['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_desc62['desc'] , '</p>';
  echo '<textarea name="', $type2_desc62['id'], '" id="', $type2_desc62['id'], '" cols="60" rows="4" style="width:97%">', $type2_desc62_meta ? $type2_desc62_meta : $type2_desc62['std'], '</textarea>';

  //6段目　説明文 右 shortcode
  echo '<dt><label for="' , $type2_shortcode4['id'] , '">' , $type2_shortcode4['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_shortcode4['desc'] , '</p>';
  echo '<input type="text" name="', $type2_shortcode4['id'], '" id="', $type2_shortcode4['id'], '" value="', $type2_shortcode4_meta ? $type2_shortcode4_meta : $type2_shortcode4['std'], '" size="30" style="width:100%" />';

  //google map
  echo '<dt><label for="' , $type2_google_map['id'] , '">' , $type2_google_map['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_google_map['desc'] , '</p>';
  echo '<input type="text" name="', $type2_google_map['id'], '" id="', $type2_google_map['id'], '" value="', $type2_google_map_meta ? $type2_google_map_meta : $type2_google_map['std'], '" size="30" style="width:100%" />';

  //7段目　見出し
  echo '<dt><label for="' , $type2_headline7['id'] , '">' , $type2_headline7['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_headline7['desc'] , '</p>';
  echo '<textarea name="', $type2_headline7['id'], '" id="', $type2_headline7['id'], '" cols="60" rows="4" style="width:97%">', $type2_headline7_meta ? $type2_headline7_meta : $type2_headline7['std'], '</textarea>';

  //7段目　説明文
  echo '<dt><label for="' , $type2_desc7['id'] , '">' , $type2_desc7['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_desc7['desc'] , '</p>';
  echo '<textarea name="', $type2_desc7['id'], '" id="', $type2_desc7['id'], '" cols="60" rows="4" style="width:97%">', $type2_desc7_meta ? $type2_desc7_meta : $type2_desc7['std'], '</textarea>';

  //7段目　 画像 左
  echo '<dt><label>' , __('Image for seventh row. center column.', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for seventh row.center column.<br />Recommend image size. Width:330px Height:220px', 'tcd-w') , '</p>';
    mlcf_media_form('type2_image5', __('Image', 'tcd-w'));
  echo '</dd>';

  //7段目　 画像　右
  echo '<dt><label>' , __('Image for seventh row. right column.', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for seventh row. right column.<br />Recommend image size. Width:330px Height:220px', 'tcd-w') , '</p>';
    mlcf_media_form('type2_image6', __('Image', 'tcd-w'));
  echo '</dd>';

  //8段目　説明文
  echo '<dt><label for="' , $type2_desc8['id'] , '">' , $type2_desc8['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type2_desc8['desc'] , '</p>';
  echo '<textarea name="', $type2_desc8['id'], '" id="', $type2_desc8['id'], '" cols="60" rows="4" style="width:97%">', $type2_desc8_meta ? $type2_desc8_meta : $type2_desc8['std'], '</textarea>';

  echo '</dl>';

  //テンプレート3 ***************************************************************************************************************************************************************************************

  echo '<dl class="ml_custom_fields" id="ml_custom_fields_box4"' , ( $page_tcd_template_type_meta == 'type4' ) ? ' style="display:block;"' : ' style="display:none;"' , '>';

  //１段目　見出し
  echo '<dt><label for="' , $type3_headline1['id'] , '">' , $type3_headline1['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_headline1['desc'] , '</p>';
  echo '<textarea name="', $type3_headline1['id'], '" id="', $type3_headline1['id'], '" cols="60" rows="4" style="width:97%">', $type3_headline1_meta ? $type3_headline1_meta : $type3_headline1['std'], '</textarea>';

  //１段目　見出しfontsize
  echo '<dt><label for="' , $type3_headline1_fontsize['id'] , '">' , $type3_headline1_fontsize['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_headline1_fontsize['desc'] , '</p>';
  echo '<input name="', $type3_headline1_fontsize['id'], '" id="', $type3_headline1_fontsize['id'], '" size="10" style="width:15%" value="', $type3_headline1_fontsize_meta ? $type3_headline1_fontsize_meta : $type3_headline1_fontsize['std'], '" type="text"> px';

  //１段目　説明文
  echo '<dt><label for="' , $type3_desc1['id'] , '">' , $type3_desc1['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc1['desc'] , '</p>';
  echo '<textarea name="', $type3_desc1['id'], '" id="', $type3_desc1['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc1_meta ? $type3_desc1_meta : $type3_desc1['std'], '</textarea>';

  //１段目　説明文fontsize
  echo '<dt><label for="' , $type3_desc1_fontsize['id'] , '">' , $type3_desc1_fontsize['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc1_fontsize['desc'] , '</p>';
  echo '<input name="', $type3_desc1_fontsize['id'], '" id="', $type3_desc1_fontsize['id'], '" size="10" style="width:15%" value="', $type3_desc1_fontsize_meta ? $type3_desc1_fontsize_meta : $type3_desc1_fontsize['std'], '" type="text"> px';

  //１段目　画像
  // echo '<dt><label>' , __('Image for first row', 'tcd-w') ,'</label><dt>';
  // echo '<dd><p class="desc">' , __('Register image for first row.<br />Recommend image size. Width:550px Height:450px', 'tcd-w') , '</p>';
  //   mlcf_media_form('type3_image1', __('Image', 'tcd-w'));
  // echo '</dd>';

  //2段目　見出し
  echo '<dt><label for="' , $type3_headline2['id'] , '">' , $type3_headline2['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_headline2['desc'] , '</p>';
  echo '<textarea name="', $type3_headline2['id'], '" id="', $type3_headline2['id'], '" cols="60" rows="4" style="width:97%">', $type3_headline2_meta ? $type3_headline2_meta : $type3_headline2['std'], '</textarea>';

  //２段目　左　説明文
  echo '<dt><label for="' , $type3_desc2['id'] , '">' , $type3_desc2['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc2['desc'] , '</p>';
  echo '<textarea name="', $type3_desc2['id'], '" id="', $type3_desc2['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc2_meta ? $type3_desc2_meta : $type3_desc2['std'], '</textarea>';

  //２段目　左　画像
  echo '<dt><label>' , __('Image for second row. Left column', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for second row. Left column.<br />Recommend image size. Width:510px Height:340px', 'tcd-w') , '</p>';
    mlcf_media_form('type3_image2', __('Image', 'tcd-w'));
  echo '</dd>';

  //2段目　見出し
  echo '<dt><label for="' , $type3_headline3['id'] , '">' , $type3_headline3['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_headline3['desc'] , '</p>';
  echo '<textarea name="', $type3_headline3['id'], '" id="', $type3_headline3['id'], '" cols="60" rows="4" style="width:97%">', $type3_headline3_meta ? $type3_headline3_meta : $type3_headline3['std'], '</textarea>';

  //２段目　右　 説明文
  echo '<dt><label for="' , $type3_desc3['id'] , '">' , $type3_desc3['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc3['desc'] , '</p>';
  echo '<textarea name="', $type3_desc3['id'], '" id="', $type3_desc3['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc3_meta ? $type3_desc3_meta : $type3_desc3['std'], '</textarea>';

  //２段目　右　画像
  echo '<dt><label>' , __('Image for second row. Right column', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for second row. Right column.<br />Recommend image size. Width:510px Height:340px', 'tcd-w') , '</p>';
    mlcf_media_form('type3_image3', __('Image', 'tcd-w'));
  echo '</dd>';

  //3段目　画像
  echo '<dt><label>' , __('Image for third row.', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for third row.<br />Recommend image size. Width:1400px Height:390px', 'tcd-w') , '</p>';
    mlcf_media_form('type3_image4', __('Image', 'tcd-w'));
  echo '</dd>';

  //3段目　見出し
  echo '<dt><label for="' , $type3_headline4['id'] , '">' , $type3_headline4['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_headline4['desc'] , '</p>';
  echo '<textarea name="', $type3_headline4['id'], '" id="', $type3_headline4['id'], '" cols="60" rows="4" style="width:97%">', $type3_headline4_meta ? $type3_headline4_meta : $type3_headline4['std'], '</textarea>';

  //3段目　説明文
  echo '<dt><label for="' , $type3_desc4['id'] , '">' , $type3_desc4['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc4['desc'] , '</p>';
  echo '<textarea name="', $type3_desc4['id'], '" id="', $type3_desc4['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc4_meta ? $type3_desc4_meta : $type3_desc4['std'], '</textarea>';

  //4段目　左 画像
  echo '<dt><label>' , __('Image for fourth row. Left column', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for fourth row. Left column.<br />Recommend image size. Width:330px Height:390px', 'tcd-w') , '</p>';
    mlcf_media_form('type3_image5', __('Image', 'tcd-w'));
  echo '</dd>';

  //４段目　左 説明文
  echo '<dt><label for="' , $type3_desc5['id'] , '">' , $type3_desc5['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc5['desc'] , '</p>';
  echo '<textarea name="', $type3_desc5['id'], '" id="', $type3_desc5['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc5_meta ? $type3_desc5_meta : $type3_desc5['std'], '</textarea>';

  //4段目　中央 画像
  echo '<dt><label>' , __('Image for fourth row. Center column', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for fourth row. Center column.<br />Recommend image size. Width:330px Height:390px', 'tcd-w') , '</p>';
    mlcf_media_form('type3_image6', __('Image', 'tcd-w'));
  echo '</dd>';

  //４段目　中央 説明文
  echo '<dt><label for="' , $type3_desc6['id'] , '">' , $type3_desc6['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc6['desc'] , '</p>';
  echo '<textarea name="', $type3_desc6['id'], '" id="', $type3_desc6['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc6_meta ? $type3_desc6_meta : $type3_desc6['std'], '</textarea>';

  //4段目　右 画像
  echo '<dt><label>' , __('Image for fourth row. Right column', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for fourth row. Right column.<br />Recommend image size. Width:330px Height:390px', 'tcd-w') , '</p>';
    mlcf_media_form('type3_image7', __('Image', 'tcd-w'));
  echo '</dd>';

  //４段目　右 説明文
  echo '<dt><label for="' , $type3_desc7['id'] , '">' , $type3_desc7['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc7['desc'] , '</p>';
  echo '<textarea name="', $type3_desc7['id'], '" id="', $type3_desc7['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc7_meta ? $type3_desc7_meta : $type3_desc7['std'], '</textarea>';

  //5段目　左 画像
  echo '<dt><label>' , __('Image for fifth row. Left column', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for fifth row. Left column.<br />Recommend image size. Width:510px Height:300px', 'tcd-w') , '</p>';
    mlcf_media_form('type3_image8', __('Image', 'tcd-w'));
  echo '</dd>';

  //5段目　左 説明文
  echo '<dt><label for="' , $type3_desc8['id'] , '">' , $type3_desc8['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc8['desc'] , '</p>';
  echo '<textarea name="', $type3_desc8['id'], '" id="', $type3_desc8['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc8_meta ? $type3_desc8_meta : $type3_desc8['std'], '</textarea>';

  //5段目　右 画像
  echo '<dt><label>' , __('Image for fifth row. Right column', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for fifth row. Right column.<br />Recommend image size. Width:510px Height:300px', 'tcd-w') , '</p>';
    mlcf_media_form('type3_image9', __('Image', 'tcd-w'));
  echo '</dd>';

  //5段目　右 説明文
  echo '<dt><label for="' , $type3_desc9['id'] , '">' , $type3_desc9['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc9['desc'] , '</p>';
  echo '<textarea name="', $type3_desc9['id'], '" id="', $type3_desc9['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc9_meta ? $type3_desc9_meta : $type3_desc9['std'], '</textarea>';

  //6段目　画像
  echo '<dt><label>' , __('Image for sixth row.', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for sixth row.<br />Recommend image size. Width:1400px Height:390px', 'tcd-w') , '</p>';
    mlcf_media_form('type3_image10', __('Image', 'tcd-w'));
  echo '</dd>';

  //6段目　見出し
  echo '<dt><label for="' , $type3_headline5['id'] , '">' , $type3_headline5['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_headline5['desc'] , '</p>';
  echo '<textarea name="', $type3_headline5['id'], '" id="', $type3_headline5['id'], '" cols="60" rows="4" style="width:97%">', $type3_headline5_meta ? $type3_headline5_meta : $type3_headline5['std'], '</textarea>';

  //6段目　説明文
  echo '<dt><label for="' , $type3_desc10['id'] , '">' , $type3_desc10['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc10['desc'] , '</p>';
  echo '<textarea name="', $type3_desc10['id'], '" id="', $type3_desc10['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc10_meta ? $type3_desc10_meta : $type3_desc10['std'], '</textarea>';

  //7段目　左 見出し
  echo '<dt><label for="' , $type3_headline6['id'] , '">' , $type3_headline6['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_headline6['desc'] , '</p>';
  echo '<textarea name="', $type3_headline6['id'], '" id="', $type3_headline6['id'], '" cols="60" rows="4" style="width:97%">', $type3_headline6_meta ? $type3_headline6_meta : $type3_headline6['std'], '</textarea>';

  //7段目　左 説明文
  echo '<dt><label for="' , $type3_desc11['id'] , '">' , $type3_desc11['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc11['desc'] , '</p>';
  echo '<textarea name="', $type3_desc11['id'], '" id="', $type3_desc11['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc11_meta ? $type3_desc11_meta : $type3_desc11['std'], '</textarea>';

  //7段目　右 見出し
  echo '<dt><label for="' , $type3_headline7['id'] , '">' , $type3_headline7['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_headline7['desc'] , '</p>';
  echo '<textarea name="', $type3_headline7['id'], '" id="', $type3_headline7['id'], '" cols="60" rows="4" style="width:97%">', $type3_headline7_meta ? $type3_headline7_meta : $type3_headline7['std'], '</textarea>';

  //7段目　右 説明文
  echo '<dt><label for="' , $type3_desc12['id'] , '">' , $type3_desc12['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc12['desc'] , '</p>';
  echo '<textarea name="', $type3_desc12['id'], '" id="', $type3_desc12['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc12_meta ? $type3_desc12_meta : $type3_desc12['std'], '</textarea>';

  //8段目　画像
  echo '<dt><label>' , __('Image for eighth row.', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for eighth row.<br />Recommend image size. Width:1050px Height:280px', 'tcd-w') , '</p>';
    mlcf_media_form('type3_image12', __('Image', 'tcd-w'));
  echo '</dd>';

  //9段目　左 見出し
  echo '<dt><label for="' , $type3_headline8['id'] , '">' , $type3_headline8['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_headline8['desc'] , '</p>';
  echo '<textarea name="', $type3_headline8['id'], '" id="', $type3_headline8['id'], '" cols="60" rows="4" style="width:97%">', $type3_headline8_meta ? $type3_headline8_meta : $type3_headline8['std'], '</textarea>';

  //9段目　左 説明文
  echo '<dt><label for="' , $type3_desc13['id'] , '">' , $type3_desc13['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc13['desc'] , '</p>';
  echo '<textarea name="', $type3_desc13['id'], '" id="', $type3_desc13['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc13_meta ? $type3_desc13_meta : $type3_desc13['std'], '</textarea>';

  //9段目　中央 見出し
  echo '<dt><label for="' , $type3_headline9['id'] , '">' , $type3_headline9['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_headline9['desc'] , '</p>';
  echo '<textarea name="', $type3_headline9['id'], '" id="', $type3_headline9['id'], '" cols="60" rows="4" style="width:97%">', $type3_headline9_meta ? $type3_headline9_meta : $type3_headline9['std'], '</textarea>';

  //9段目　中央 説明文
  echo '<dt><label for="' , $type3_desc14['id'] , '">' , $type3_desc14['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc14['desc'] , '</p>';
  echo '<textarea name="', $type3_desc14['id'], '" id="', $type3_desc14['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc14_meta ? $type3_desc14_meta : $type3_desc14['std'], '</textarea>';

  //9段目　右 見出し
  echo '<dt><label for="' , $type3_headline10['id'] , '">' , $type3_headline10['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_headline10['desc'] , '</p>';
  echo '<textarea name="', $type3_headline10['id'], '" id="', $type3_headline10['id'], '" cols="60" rows="4" style="width:97%">', $type3_headline10_meta ? $type3_headline10_meta : $type3_headline10['std'], '</textarea>';

  //9段目　右 説明文
  echo '<dt><label for="' , $type3_desc15['id'] , '">' , $type3_desc15['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type3_desc15['desc'] , '</p>';
  echo '<textarea name="', $type3_desc15['id'], '" id="', $type3_desc15['id'], '" cols="60" rows="4" style="width:97%">', $type3_desc15_meta ? $type3_desc15_meta : $type3_desc15['std'], '</textarea>';

  echo '</dl>';

  //テンプレート4 ***************************************************************************************************************************************************************************************

  echo '<dl class="ml_custom_fields" id="ml_custom_fields_box5"' , ( $page_tcd_template_type_meta == 'type5' ) ? ' style="display:block;"' : ' style="display:none;"' , '>';

  //１段目　見出し
  echo '<dt><label for="' , $type4_headline1['id'] , '">' , $type4_headline1['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_headline1['desc'] , '</p>';
  echo '<textarea name="', $type4_headline1['id'], '" id="', $type4_headline1['id'], '" cols="60" rows="4" style="width:97%">', $type4_headline1_meta ? $type4_headline1_meta : $type4_headline1['std'], '</textarea>';

  //１段目　見出しfontsize
  echo '<dt><label for="' , $type4_headline1_fontsize['id'] , '">' , $type4_headline1_fontsize['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_headline1_fontsize['desc'] , '</p>';
  echo '<input name="', $type4_headline1_fontsize['id'], '" id="', $type4_headline1_fontsize['id'], '" size="10" style="width:15%" value="', $type4_headline1_fontsize_meta ? $type4_headline1_fontsize_meta : $type4_headline1_fontsize['std'], '" type="text"> px';

  //１段目　説明文
  echo '<dt><label for="' , $type4_desc1['id'] , '">' , $type4_desc1['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_desc1['desc'] , '</p>';
  echo '<textarea name="', $type4_desc1['id'], '" id="', $type4_desc1['id'], '" cols="60" rows="4" style="width:97%">', $type4_desc1_meta ? $type4_desc1_meta : $type4_desc1['std'], '</textarea>';

  //１段目　説明文fontsize
  echo '<dt><label for="' , $type4_desc1_fontsize['id'] , '">' , $type4_desc1_fontsize['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_desc1_fontsize['desc'] , '</p>';
  echo '<input name="', $type4_desc1_fontsize['id'], '" id="', $type4_desc1_fontsize['id'], '" size="10" style="width:15%" value="', $type4_desc1_fontsize_meta ? $type4_desc1_fontsize_meta : $type4_desc1_fontsize['std'], '" type="text"> px';

  //２段目　画像
  echo '<dt><label>' , __('Image for second row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for second row.<br />Recommend image size. Width:1050px Height:280px', 'tcd-w') , '</p>';
    mlcf_media_form('type4_image2', __('Image', 'tcd-w'));
  echo '</dd>';

  //２段目　見出し
  echo '<dt><label for="' , $type4_headline2['id'] , '">' , $type4_headline2['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_headline2['desc'] , '</p>';
  echo '<textarea name="', $type4_headline2['id'], '" id="', $type4_headline2['id'], '" cols="60" rows="4" style="width:97%">', $type4_headline2_meta ? $type4_headline2_meta : $type4_headline2['std'], '</textarea>';

  //２段目　説明文
  echo '<dt><label for="' , $type4_desc2['id'] , '">' , $type4_desc2['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_desc2['desc'] , '</p>';
  echo '<textarea name="', $type4_desc2['id'], '" id="', $type4_desc2['id'], '" cols="60" rows="4" style="width:97%">', $type4_desc2_meta ? $type4_desc2_meta : $type4_desc2['std'], '</textarea>';

  //２段目　自由記述
  echo '<dt><label for="' , $type4_desc22['id'] , '">' , $type4_desc22['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_desc22['desc'] , '</p>';
  echo '<textarea name="', $type4_desc22['id'], '" id="', $type4_desc22['id'], '" cols="60" rows="10" style="width:97%">', $type4_desc22_meta ? $type4_desc22_meta : $type4_desc22['std'], '</textarea>';

  //２段目　shortcode
  echo '<dt><label for="' , $type4_shortcode1['id'] , '">' , $type4_shortcode1['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_shortcode1['desc'] , '</p>';
  echo '<input type="text" name="', $type4_shortcode1['id'], '" id="', $type4_shortcode1['id'], '" value="', $type4_shortcode1_meta ? $type4_shortcode1_meta : $type4_shortcode1['std'], '" size="30" style="width:100%" />';

  //３段目　画像
  echo '<dt><label>' , __('Image for third row', 'tcd-w') ,'</label><dt>';
  echo '<dd><p class="desc">' , __('Register image for third row.<br />Recommend image size. Width:1050px Height:280px', 'tcd-w') , '</p>';
    mlcf_media_form('type4_image3', __('Image', 'tcd-w'));
  echo '</dd>';

  //３段目　見出し
  echo '<dt><label for="' , $type4_headline3['id'] , '">' , $type4_headline3['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_headline3['desc'] , '</p>';
  echo '<textarea name="', $type4_headline3['id'], '" id="', $type4_headline3['id'], '" cols="60" rows="4" style="width:97%">', $type4_headline3_meta ? $type4_headline3_meta : $type4_headline3['std'], '</textarea>';

  //３段目　説明文
  echo '<dt><label for="' , $type4_desc3['id'] , '">' , $type4_desc3['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_desc3['desc'] , '</p>';
  echo '<textarea name="', $type4_desc3['id'], '" id="', $type4_desc3['id'], '" cols="60" rows="4" style="width:97%">', $type4_desc3_meta ? $type4_desc3_meta : $type4_desc3['std'], '</textarea>';

  //３段目　自由記述
  echo '<dt><label for="' , $type4_desc32['id'] , '">' , $type4_desc32['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_desc32['desc'] , '</p>';
  echo '<textarea name="', $type4_desc32['id'], '" id="', $type4_desc32['id'], '" cols="60" rows="10" style="width:97%">', $type4_desc32_meta ? $type4_desc32_meta : $type4_desc32['std'], '</textarea>';

  //３段目　shortcode
  echo '<dt><label for="' , $type4_shortcode2['id'] , '">' , $type4_shortcode2['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_shortcode2['desc'] , '</p>';
  echo '<input type="text" name="', $type4_shortcode2['id'], '" id="', $type4_shortcode2['id'], '" value="', $type4_shortcode2_meta ? $type4_shortcode2_meta : $type4_shortcode2['std'], '" size="30" style="width:100%" />';

  //４段目　見出し
  echo '<dt><label for="' , $type4_headline4['id'] , '">' , $type4_headline4['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_headline4['desc'] , '</p>';
  echo '<textarea name="', $type4_headline4['id'], '" id="', $type4_headline4['id'], '" cols="60" rows="4" style="width:97%">', $type4_headline4_meta ? $type4_headline4_meta : $type4_headline4['std'], '</textarea>';

  //5段目　見出し
  echo '<dt><label for="' , $type4_headline5['id'] , '">' , $type4_headline5['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_headline5['desc'] , '</p>';
  echo '<textarea name="', $type4_headline5['id'], '" id="', $type4_headline5['id'], '" cols="60" rows="4" style="width:97%">', $type4_headline5_meta ? $type4_headline5_meta : $type4_headline5['std'], '</textarea>';

  //5段目　自由記述
  echo '<dt><label for="' , $type4_desc4['id'] , '">' , $type4_desc4['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_desc4['desc'] , '</p>';
  echo '<textarea name="', $type4_desc4['id'], '" id="', $type4_desc4['id'], '" cols="60" rows="10" style="width:97%">', $type4_desc4_meta ? $type4_desc4_meta : $type4_desc4['std'], '</textarea>';

  //5段目　shortcode
  echo '<dt><label for="' , $type4_shortcode3['id'] , '">' , $type4_shortcode3['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_shortcode3['desc'] , '</p>';
  echo '<input type="text" name="', $type4_shortcode3['id'], '" id="', $type4_shortcode3['id'], '" value="', $type4_shortcode3_meta ? $type4_shortcode3_meta : $type4_shortcode3['std'], '" size="30" style="width:100%" />';

  //6段目　自由記述
  echo '<dt><label for="' , $type4_desc5['id'] , '">' , $type4_desc5['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_desc5['desc'] , '</p>';
  echo '<textarea name="', $type4_desc5['id'], '" id="', $type4_desc5['id'], '" cols="60" rows="10" style="width:97%">', $type4_desc5_meta ? $type4_desc5_meta : $type4_desc5['std'], '</textarea>';

  //contact form　shortcode
  echo '<dt><label for="' , $type4_shortcode4['id'] , '">' , $type4_shortcode4['name'] , '</label></dt>';
  echo '<dd><p class="desc">' , $type4_shortcode4['desc'] , '</p>';
  echo '<input type="text" name="', $type4_shortcode4['id'], '" id="', $type4_shortcode4['id'], '" value="', $type4_shortcode4_meta ? $type4_shortcode4_meta : $type4_shortcode4['std'], '" size="30" style="width:100%" />';

  echo '</dl>';

}

function save_custom_fields_meta_box( $post_id ) {

  // verify nonce
  if (!isset($_POST['custom_fields_meta_box_nonce']) || !wp_verify_nonce($_POST['custom_fields_meta_box_nonce'], basename(__FILE__))) {
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
  $cf_keys = array('page_tcd_template_type', 'page_main_image', 'page_main_image_mobile', 'type1_image1', 'type1_image2', 'type1_image3', 'type1_image4', 'type1_image5', 'type1_image6', 'type1_image7', 'type1_image8', 'type1_image9', 'type1_headline1_fontsize', 'type1_desc1_fontsize', 'type1_headline1', 'type1_headline2', 'type1_headline3', 'type1_headline4', 'type1_headline5', 'type1_headline6', 'type1_headline7', 'type1_headline8', 'type1_headline9', 'type1_desc1' , 'type1_desc2', 'type1_desc3', 'type1_desc4', 'type1_desc5', 'type1_desc6', 'type1_desc7', 'type1_desc8', 'type1_desc9', 'type2_image1', 'type2_image2', 'type2_image3', 'type2_image4', 'type2_image5', 'type2_image6', 'type2_headline1_fontsize', 'type2_desc1_fontsize', 'type2_desc1', 'type2_desc2', 'type2_desc3', 'type2_desc4', 'type2_desc5', 'type2_desc52', 'type2_desc6', 'type2_desc62', 'type2_desc7', 'type2_desc8', 'type2_google_map', 'type2_headline1', 'type2_headline2', 'type2_headline3', 'type2_headline4', 'type2_headline5', 'type2_headline6', 'type2_headline7', 'type2_shortcode1', 'type2_shortcode2', 'type2_shortcode3', 'type2_shortcode4', 'type3_image1', 'type3_image2', 'type3_image3', 'type3_image4', 'type3_image5', 'type3_image6', 'type3_image7', 'type3_image8', 'type3_image9', 'type3_image10', 'type3_image11', 'type3_image12', 'type3_headline1_fontsize', 'type3_desc1_fontsize', 'type3_desc1', 'type3_desc2', 'type3_desc3', 'type3_desc4', 'type3_desc5', 'type3_desc6', 'type3_desc7', 'type3_desc8', 'type3_desc9', 'type3_desc10', 'type3_desc11', 'type3_desc12', 'type3_desc13', 'type3_desc14', 'type3_desc15', 'type3_headline1', 'type3_headline2', 'type3_headline3', 'type3_headline4', 'type3_headline5', 'type3_headline6', 'type3_headline7', 'type3_headline8', 'type3_headline9', 'type3_headline10', 'type4_image2', 'type4_image3', 'type4_headline1', 'type4_headline2', 'type4_headline3', 'type4_headline4', 'type4_headline5', 'type4_desc1', 'type4_desc2', 'type4_desc22', 'type4_desc3', 'type4_desc32', 'type4_desc4', 'type4_desc5', 'type4_headline1_fontsize', 'type4_desc1_fontsize', 'type4_shortcode1', 'type4_shortcode2', 'type4_shortcode3', 'type4_shortcode4');
  foreach ($cf_keys as $cf_key) {
    $old = get_post_meta($post_id, $cf_key, true);

    if (isset($_POST[$cf_key])) {
      $new = $_POST[$cf_key];
    } else {
      $new = '';
    }

    if ($new && $new != $old) {
      update_post_meta($post_id, $cf_key, $new);
    } elseif ('' == $new && $old) {
      delete_post_meta($post_id, $cf_key, $old);
    }
  }

}
add_action('save_post', 'save_custom_fields_meta_box');


/* フォーム用 画像フィールド出力 */
function mlcf_media_form($cf_key, $label) {
  global $post;
  if (empty($cf_key)) return false;
  if (empty($label)) $label = $cf_key;

  $media_id = get_post_meta($post->ID, $cf_key, true);
?>
  <div class="cf cf_media_field hide-if-no-js <?php echo esc_attr($cf_key); ?>">
    <input type="hidden" class="cf_media_id" name="<?php echo esc_attr($cf_key); ?>" id="<?php echo esc_attr($cf_key); ?>" value="<?php echo esc_attr($media_id); ?>" />
    <div class="preview_field"><?php if ($media_id) the_mlcf_image($post->ID, $cf_key); ?></div>
    <div class="buttton_area">
     <input type="button" class="cfmf-select-img button" value="<?php _e('Select Image', 'tcd-w'); ?>" />
     <input type="button" class="cfmf-delete-img button<?php if (!$media_id) echo ' hidden'; ?>" value="<?php _e('Remove Image', 'tcd-w'); ?>" />
    </div>
  </div>
<?php
}




/* 画像フィールドで選択された画像をimgタグで出力 */
function the_mlcf_image($post_id, $cf_key, $image_size = 'medium') {
  echo get_mlcf_image($post_id, $cf_key, $image_size);
}

/* 画像フィールドで選択された画像をimgタグで返す */
function get_mlcf_image($post_id, $cf_key, $image_size = 'medium') {
  global $post;
  if (empty($cf_key)) return false;
  if (empty($post_id)) $post_id = $post->ID;

  $media_id = get_post_meta($post_id, $cf_key, true);
  if ($media_id) {
    return wp_get_attachment_image($media_id, $image_size, $image_size);
  }

  return false;
}

/* 画像フィールドで選択された画像urlを返す */
function get_mlcf_image_url($post_id, $cf_key, $image_size = 'medium') {
  global $post;
  if (empty($cf_key)) return false;
  if (empty($post_id)) $post_id = $post->ID;

  $media_id = get_post_meta($post_id, $cf_key, true);
  if ($media_id) {
    $img = wp_get_attachment_image_src($media_id, $image_size);
    if (!empty($img[0])) {
      return $img[0];
    }
  }

  return false;
}

/* 画像フィールドで選択されたメディアのURLを出力 */
function the_mlcf_media_url($post_id, $cf_key) {
  echo get_mlcf_media_url($post_id, $cf_key);
}

/* 画像フィールドで選択されたメディアのURLを返す */
function get_mlcf_media_url($post_id, $cf_key) {
  global $post;
  if (empty($cf_key)) return false;
  if (empty($post_id)) $post_id = $post->ID;

  $media_id = get_post_meta($post_id, $cf_key, true);
  if ($media_id) {
    return wp_get_attachment_url($media_id);
  }

  return false;
}


