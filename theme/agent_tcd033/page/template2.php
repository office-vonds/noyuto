<?php
  if(get_post_meta($post->ID,'page_main_image',true)) {
  if(is_mobile()){
    if(get_post_meta($post->ID, 'page_main_image_mobile', true)){
      $value = get_post_meta($post->ID, 'page_main_image_mobile', true);
    }else{
      $value = get_post_meta($post->ID, 'page_main_image', true);
    }
  }else{
    $value = get_post_meta($post->ID, 'page_main_image', true);
  };
  }else{
  if(has_post_thumbnail()){
    $value = get_post_thumbnail_id($post->ID);
  };
  };
  $image = wp_get_attachment_image_src($value, 'full');
?>


<?php
   $type2_headline1_fontsize = get_post_meta($post->ID,'type2_headline1_fontsize',true);
   $type2_desc1_fontsize = get_post_meta($post->ID,'type2_desc1_fontsize',true);
   $type2_headline1 = get_post_meta($post->ID,'type2_headline1',true);
   $type2_headline2 = get_post_meta($post->ID,'type2_headline2',true);
   $type2_headline3 = get_post_meta($post->ID,'type2_headline3',true);
   $type2_headline4 = get_post_meta($post->ID,'type2_headline4',true);
   $type2_headline5 = get_post_meta($post->ID,'type2_headline5',true);
   $type2_headline6 = get_post_meta($post->ID,'type2_headline6',true);
   $type2_headline7 = get_post_meta($post->ID,'type2_headline7',true);
   $type2_desc1 = get_post_meta($post->ID,'type2_desc1',true);
   $type2_desc2 = get_post_meta($post->ID,'type2_desc2',true);
   $type2_desc3 = get_post_meta($post->ID,'type2_desc3',true);
   $type2_desc4 = get_post_meta($post->ID,'type2_desc4',true);
   $type2_desc5 = get_post_meta($post->ID,'type2_desc5',true);
   $type2_desc52 = get_post_meta($post->ID,'type2_desc52',true);
   $type2_desc6 = get_post_meta($post->ID,'type2_desc6',true);
   $type2_desc62 = get_post_meta($post->ID,'type2_desc62',true);
   $type2_desc7 = get_post_meta($post->ID,'type2_desc7',true);
   $type2_desc8 = get_post_meta($post->ID,'type2_desc8',true);
   $value1 = get_post_meta($post->ID, 'type2_image1', true);
   $value2 = get_post_meta($post->ID, 'type2_image2', true);
   $value3 = get_post_meta($post->ID, 'type2_image3', true);
   $value4 = get_post_meta($post->ID, 'type2_image4', true);
   $value5 = get_post_meta($post->ID, 'type2_image5', true);
   $value6 = get_post_meta($post->ID, 'type2_image6', true);
   if(!empty($value1)) { $image1 = wp_get_attachment_image_src($value1, 'full'); };
   if(!empty($value2)) { $image2 = wp_get_attachment_image_src($value2, 'full'); };
   if(!empty($value3)) { $image3 = wp_get_attachment_image_src($value3, 'full'); };
   if(!empty($value4)) { $image4 = wp_get_attachment_image_src($value4, 'full'); };
   if(!empty($value5)) { $image5 = wp_get_attachment_image_src($value5, 'full'); };
   if(!empty($value6)) { $image6 = wp_get_attachment_image_src($value6, 'full'); };
   $type2_google_map = get_post_meta($post->ID,'type2_google_map',true);
   $type2_shortcode1 = get_post_meta($post->ID,'type2_shortcode1',true);
   $type2_shortcode2 = get_post_meta($post->ID,'type2_shortcode2',true);
   $type2_shortcode3 = get_post_meta($post->ID,'type2_shortcode3',true);
   $type2_shortcode4 = get_post_meta($post->ID,'type2_shortcode4',true);
?>

<?php if($value): ?>
<div class="container-fluid">
  <div class="row">
		<div class="col-xs-120 page-splash hidden-xs" data-parallax="scroll" data-image-src="<?php echo $image[0]; ?>"></div>
		<div class="col-xs-120 visible-xs" style="padding:0; height:300px; background-image:url(<?php echo $image[0]; ?>); background-size:cover; background-repeat: no-repeat; background-position:center center;"></div>
  </div>
</div>
<?php endif; ?>

<section class="container" style="<?php if(!$value){ echo 'margin-top:215px;'; } ?> background:white">
  <?php get_template_part('breadcrumb'); ?>
  <?php if($type2_headline1 || $type2_desc1) { ?>
  <div class="row mt40 mb40 mobile-mb-20">
    <div class="col-sm-120 nm30">
      <?php if(!empty($type2_headline1)) { ?>
      <h2 class="headline text-center page_headline"<?php if(!empty($type2_headline1_fontsize)) { echo ' style="font-size:', $type2_headline1_fontsize, 'px;"'; }; ?>><?php echo $type2_headline1; ?></h2>
      <?php }; ?>
      <?php if(!empty($type2_desc1)) { ?>
      <div class="desc1 page_desc"<?php if(!empty($type2_desc1_fontsize)) { echo ' style="font-size:', $type2_desc1_fontsize, 'px;"'; }; ?>><?php echo wpautop( $type2_desc1 ); ?></div>
      <?php }; ?>
    </div>
  </div>
  <?php }; ?>

  <?php if($type2_headline2 || $type2_desc2 || $value2) { ?>
  <div class="row nm30">
    <div class="col-sm-64 col-sm-offset-46 col-xs-120 mobile-mb-20">
      <?php if(!empty($type2_headline2)) { ?>
      <h3 class="headline mobile-text-align-center"><?php echo $type2_headline2; ?></h3>
      <?php }; ?>
    </div>
  </div>
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-33 col-sm-offset-13 col-xs-120 mobile-text-align-center mobile-mb-20">
      <?php if(!empty($value2)) { ?>
      <img style="width:225px; height:auto;" class="image img-circle" src="<?php echo $image2[0]; ?>" alt="" title="" />
      <?php }; ?>
    </div>
    <div class="col-sm-64">
      <?php if(!empty($type2_desc2)) { ?>
      <div class="desc1"><?php echo wpautop( $type2_desc2 ); ?></div>
      <?php }; ?>
    </div>
  </div>
  <?php }; ?>
</section>

<section>
<?php if($type2_headline3 || $value3) { ?>
<div class="mb80 mobile-mb-30 separator"<?php if($value3){ echo ' data-parallax="scroll" data-speed="0.6" data-image-src="'.$image3[0].'"'; }; ?>>
  <div class="title">
    <div class="container">
      <div class="row">
        <div class="col-xs-120">
          <h2 class="liner"><?php echo $type2_headline3; ?></h2>
          <span class="lead romaji"><?php echo $type2_desc3; ?></span>
        </div>
      </div>
    </div>
  </div>
</div>
<?php }; ?>

<div class="container">
  <?php
    $args = array('post_type' => 'staff', 'numberposts' => -1);
    $staff_post=get_posts($args);
    if ($staff_post) :
    $i=1;
    foreach ($staff_post as $post) : setup_postdata ($post);

    $staff_name = get_post_meta($post->ID,'staff_name',true);
    $staff_post = get_post_meta($post->ID,'staff_post',true);
  ?>
    <?php if($i%3==1){ ?>
    <div class="row">
    <?php }; ?>
      <div class="col-sm-40 mb80 mobile-mb-30">
        <?php if(has_post_thumbnail()){ ?><div class="staff_archive_thumbnail"><a href="<?php the_permalink() ?>"><?php the_post_thumbnail('staff_thumb', array('class' => 'image img-circle center-block')); ?></a></div><?php }; ?>
        <div class="staff_archive_contents">
          <h3 class="staff_archive_name"><?php echo $staff_name; ?></h3>
          <p class="staff_archive_post"><?php echo $staff_post; ?></p>
          <div class="staff_archive_text"><?php the_content(); ?></div>
        </div>
      </div>
    <?php if($i%3==0){ ?>
    </div>
    <?php }; ?>
  <?php $i++; endforeach; ?>
    <?php if($i%3!=1){ echo '</div>'; }; ?>
  <?php else: ?>
    </div>
    <div class="row mb40">
      <div class="col-sm-120"><?php _e("There is no registered post.","tcd-w"); ?></div>
    </div>
  <?php endif; ?>
</div>
</section>

<section>
<?php if($type2_headline4 || $value4) { ?>
<div class="mb80 mobile-mb-30 separator"<?php if($value4){ echo ' data-parallax="scroll" data-speed="0.6" data-image-src="'.$image4[0].'"'; }; ?>>
  <div class="title">
    <div class="container">
      <div class="row">
        <div class="col-xs-120">
          <h2 class="liner"><?php echo $type2_headline4; ?></h2>
          <span class="lead romaji"><?php echo $type2_desc4; ?></span>
        </div>
      </div>
    </div>
  </div>
</div>
<?php }; ?>

<?php if($type2_headline5 || $type2_desc5) { ?>
<div class="container">
  <div class="row<?php if(!is_mobile()){ echo ' mb40'; }; ?>">
    <div class="col-sm-120">
      <?php if(!empty($type2_headline5)) { ?>
      <h3 class="catch"<?php if(is_mobile()){ echo ' style="margin:0 0 10px; font-size:16px;"'; }; ?>><?php echo $type2_headline5; ?></h3>
      <?php }; ?>
    </div>
  </div>
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-60">
      <?php if(!empty($type2_desc5)||!empty($type2_shortcode1)) { ?>
        <?php if(empty($type2_shortcode1)){ ?>
        <div class="desc1"><?php echo wpautop( $type2_desc5 ); ?></div>
        <?php }else{ ?>
        <div class="desc1"><?php echo apply_filters('the_content', $type2_shortcode1); ?></div>
        <?php }; ?>
      <?php }; ?>
    </div>
    <div class="col-sm-60">
      <?php if(!empty($type2_desc52)||!empty($type2_shortcode2)) { ?>
        <?php if(empty($type2_shortcode2)){ ?>
        <div class="desc1"><?php echo wpautop( $type2_desc52 ); ?></div>
        <?php }else{ ?>
        <div class="desc1"><?php echo apply_filters('the_content', $type2_shortcode2); ?></div>
        <?php }; ?>
      <?php }; ?>
    </div>
  </div>
</div>
<?php }; ?>

<?php if($type2_headline6 || $type2_desc6) { ?>
<div class="container">
  <div class="row<?php if(!is_mobile()){ echo ' mb40'; }; ?>">
    <div class="col-sm-120">
      <?php if(!empty($type2_headline6)) { ?>
      <h3 class="catch"<?php if(is_mobile()){ echo ' style="margin:0 0 10px; font-size:16px;"'; }; ?>><?php echo $type2_headline6; ?></h3>
      <?php }; ?>
    </div>
  </div>
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-60">
      <?php if(!empty($type2_desc6)||!empty($type2_shortcode3)) { ?>
        <?php if(empty($type2_shortcode3)){ ?>
        <div class="desc1"><?php echo wpautop( $type2_desc6 ); ?></div>
        <?php }else{ ?>
        <div class="desc1"><?php echo apply_filters('the_content', $type2_shortcode3); ?></div>
        <?php }; ?>
      <?php }; ?>
    </div>
    <div class="col-sm-60">
      <?php if(!empty($type2_desc62)||!empty($type2_shortcode3)) { ?>
        <?php if(empty($type2_shortcode4)){ ?>
        <div class="desc1"><?php echo wpautop( $type2_desc62 ); ?></div>
        <?php }else{ ?>
        <div class="desc1"><?php echo apply_filters('the_content', $type2_shortcode4); ?></div>
        <?php }; ?>
      <?php }; ?>
    </div>
  </div>
</div>
<?php }; ?>
</section>

<section>
  <?php if($type2_google_map) { ?>
  <div class="pt_google_map mb80 mobile-mb-30">
   <?php echo apply_filters('the_content', $type2_google_map); ?>
  </div>
  <?php }; ?>

<?php if($type2_headline7 || $type2_desc7 || $value5 || $value6 || $type2_desc8) { ?>
<div class="container">
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-40">
      <?php if(!empty($type2_headline7)) { ?>
      <h2 class="catch"<?php if(is_mobile()){ echo ' style="margin:0 0 10px; font-size:16px;"'; }; ?>><?php echo $type2_headline7; ?></h2>
      <?php }; ?>
      <?php if(!empty($type2_desc7)) { ?>
      <div class="desc1"><?php echo wpautop( $type2_desc7 ); ?></div>
      <?php }; ?>
    </div>
    <div class="col-sm-40  mobile-mb-20 mobile-text-align-center">
      <?php if(!empty($value5)) { ?>
      <img class="image" src="<?php echo $image5[0]; ?>" alt="" title="" />
      <?php }; ?>
    </div>
    <div class="col-sm-40 mobile-text-align-center">
      <?php if(!empty($value6)) { ?>
      <img class="image" src="<?php echo $image6[0]; ?>" alt="" title="" />
      <?php }; ?>
    </div>
  </div>
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-120 text-center">
      <?php if(!empty($type2_desc8)) { ?>
      <div class="desc1"><?php echo wpautop( $type2_desc8 ); ?></div>
      <?php }; ?>
    </div>
  </div>
</div>
<?php }; ?>
</section>
