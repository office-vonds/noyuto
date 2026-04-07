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
   $type1_headline1_fontsize = get_post_meta($post->ID,'type1_headline1_fontsize',true);
   $type1_desc1_fontsize = get_post_meta($post->ID,'type1_desc1_fontsize',true);
   $type1_headline1 = get_post_meta($post->ID,'type1_headline1',true);
   $type1_headline2 = get_post_meta($post->ID,'type1_headline2',true);
   $type1_headline3 = get_post_meta($post->ID,'type1_headline3',true);
   $type1_headline4 = get_post_meta($post->ID,'type1_headline4',true);
   $type1_headline5 = get_post_meta($post->ID,'type1_headline5',true);
   $type1_headline6 = get_post_meta($post->ID,'type1_headline6',true);
   $type1_headline7 = get_post_meta($post->ID,'type1_headline7',true);
   $type1_headline8 = get_post_meta($post->ID,'type1_headline8',true);
   $type1_headline9 = get_post_meta($post->ID,'type1_headline9',true);
   $type1_desc1 = get_post_meta($post->ID,'type1_desc1',true);
   $type1_desc2 = get_post_meta($post->ID,'type1_desc2',true);
   $type1_desc3 = get_post_meta($post->ID,'type1_desc3',true);
   $type1_desc4 = get_post_meta($post->ID,'type1_desc4',true);
   $type1_desc5 = get_post_meta($post->ID,'type1_desc5',true);
   $type1_desc6 = get_post_meta($post->ID,'type1_desc6',true);
   $type1_desc7 = get_post_meta($post->ID,'type1_desc7',true);
   $type1_desc8 = get_post_meta($post->ID,'type1_desc8',true);
   $type1_desc9 = get_post_meta($post->ID,'type1_desc9',true);
   $value1 = get_post_meta($post->ID, 'type1_image1', true);
   $value2 = get_post_meta($post->ID, 'type1_image2', true);
   $value3 = get_post_meta($post->ID, 'type1_image3', true);
   $value4 = get_post_meta($post->ID, 'type1_image4', true);
   $value5 = get_post_meta($post->ID, 'type1_image5', true);
   $value6 = get_post_meta($post->ID, 'type1_image6', true);
   $value7 = get_post_meta($post->ID, 'type1_image7', true);
   $value8 = get_post_meta($post->ID, 'type1_image8', true);
   $value9 = get_post_meta($post->ID, 'type1_image9', true);
   if(!empty($value1)) { $image1 = wp_get_attachment_image_src($value1, 'full'); };
   if(!empty($value2)) { $image2 = wp_get_attachment_image_src($value2, 'full'); };
   if(!empty($value3)) { $image3 = wp_get_attachment_image_src($value3, 'full'); };
   if(!empty($value4)) { $image4 = wp_get_attachment_image_src($value4, 'full'); };
   if(!empty($value5)) { $image5 = wp_get_attachment_image_src($value5, 'full'); };
   if(!empty($value6)) { $image6 = wp_get_attachment_image_src($value6, 'full'); };
   if(!empty($value7)) { $image7 = wp_get_attachment_image_src($value7, 'full'); };
   if(!empty($value8)) { $image8 = wp_get_attachment_image_src($value8, 'full'); };
   if(!empty($value9)) { $image9 = wp_get_attachment_image_src($value9, 'full'); };
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
  <?php if($type1_headline1 || $type1_desc1 || $value1) { ?>
  <div class="row mt40 mb40">
    <div class="col-sm-120 nm30">
      <?php if(!empty($type1_headline1)) { ?>
      <h2 class="headline text-center page_headline"<?php if(!empty($type1_headline1_fontsize)) { echo ' style="font-size:', $type1_headline1_fontsize, 'px;"'; }; ?>><?php echo $type1_headline1; ?></h2>
      <?php }; ?>
      <?php if(!empty($type1_desc1)) { ?>
      <div class="desc1 page_desc"<?php if(!empty($type1_desc1_fontsize)) { echo ' style="font-size:', $type1_desc1_fontsize, 'px;"'; }; ?>><?php echo wpautop( $type1_desc1 ); ?></div>
      <?php }; ?>
    </div>
  </div>
  <?php }; ?>

  <?php if($type1_headline2 || $type1_desc2 || $value2) { ?>
  <div class="row mb80 mobile-mb-30 nm20">
    <div class="col-sm-60 mobile-mb-20 mobile-text-align-center">
      <?php if(!empty($value2)) { ?>
      <img class="image" src="<?php echo $image2[0]; ?>" alt="" title="" />
      <?php }; ?>
    </div>
    <div class="col-sm-60">
      <?php if(!empty($type1_headline2)) { ?>
      <h3 class="catch"><?php echo $type1_headline2; ?></h3>
      <?php }; ?>
      <?php if(!empty($type1_desc2)) { ?>
      <div class="desc1"><?php echo wpautop( $type1_desc2 ); ?></div>
      <?php }; ?>
    </div>
  </div>
  <?php }; ?>

  <?php if($type1_headline3 || $type1_desc3 || $value3) { ?>
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-60">
      <?php if(!empty($type1_headline3)) { ?>
      <h3 class="catch"><?php echo $type1_headline3; ?></h3>
      <?php }; ?>
      <?php if(!empty($type1_desc3)) { ?>
      <div class="desc1"><?php echo wpautop( $type1_desc3 ); ?></div>
      <?php }; ?>
    </div>
    <div class="col-sm-60 mobile-text-align-center">
      <?php if(!empty($value3)) { ?>
      <img class="image" src="<?php echo $image3[0]; ?>" alt="" title="" />
      <?php }; ?>
    </div>
  </div>
  <?php }; ?>
</section>


<section>
<?php if($type1_headline4 || $value4) { ?>
<div class="mb80 mobile-mb-30 separator"<?php if($value4){ echo ' data-parallax="scroll" data-speed="0.6" data-image-src="'.$image4[0].'"'; }; ?>>
  <div class="title">
    <div class="container">
      <div class="row">
        <div class="col-xs-120">
          <h2 class="liner"><?php echo $type1_headline4; ?></h2>
          <span class="lead romaji"><?php echo wpautop( $type1_desc4 ); ?></span>
        </div>
      </div>
    </div>
  </div>
</div>
<?php }; ?>

<div class="container">
  <?php if($type1_headline5 || $type1_desc5 || $value5) { ?>
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-60 mobile-text-align-center mobile-mb-20">
      <?php if(!empty($value5)) { ?>
      <img class="image" src="<?php echo $image5[0]; ?>" alt="" title="" />
      <?php }; ?>
    </div>
    <div class="col-sm-60">
      <?php if(!empty($type1_headline5)) { ?>
      <h3 class="catch"><?php echo $type1_headline5; ?></h3>
      <?php }; ?>
      <?php if(!empty($type1_desc5)) { ?>
      <div class="desc1"><?php echo wpautop( $type1_desc5 ); ?></div>
      <?php }; ?>
    </div>
  </div>
  <?php }; ?>

  <?php if($type1_headline6 || $type1_desc6 || $value6) { ?>
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-60">
      <?php if(!empty($type1_headline6)) { ?>
      <h3 class="catch"><?php echo $type1_headline6; ?></h3>
      <?php }; ?>
      <?php if(!empty($type1_desc6)) { ?>
      <div class="desc1"><?php echo wpautop( $type1_desc6 ); ?></div>
      <?php }; ?>
    </div>
    <div class="col-sm-60 mobile-text-align-center">
      <?php if(!empty($value6)) { ?>
      <img class="image" src="<?php echo $image6[0]; ?>" alt="" title="" />
      <?php }; ?>
    </div>
  </div>
  <?php }; ?>
</div>
</section>


<section>
<?php if($type1_headline7 || $value7) { ?>
<div class="mb80 mobile-mb-30 separator"<?php if($value7){ echo ' data-parallax="scroll" data-speed="0.6" data-image-src="'.$image7[0].'"'; }; ?>>
  <div class="title">
    <div class="container">
      <div class="row">
        <div class="col-xs-120">
          <h2 class="liner"><?php echo $type1_headline7; ?></h2>
          <span class="lead romaji"><?php echo wpautop( $type1_desc7 ); ?></span>
        </div>
      </div>
    </div>
  </div>
</div>
<?php }; ?>

<div class="container">
  <?php if($type1_headline8 || $type1_desc8 || $value8) { ?>
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-60 mobile-text-align-center mobile-mb-20">
      <?php if(!empty($value8)) { ?>
      <img class="image" src="<?php echo $image8[0]; ?>" alt="" title="" />
      <?php }; ?>
    </div>
    <div class="col-sm-60">
      <?php if(!empty($type1_headline8)) { ?>
      <h3 class="catch"><?php echo $type1_headline8; ?></h3>
      <?php }; ?>
      <?php if(!empty($type1_desc8)) { ?>
      <div class="desc1"><?php echo wpautop( $type1_desc8 ); ?></div>
      <?php }; ?>
    </div>
  </div>
  <?php }; ?>

  <?php if($type1_headline9 || $type1_desc9 || $value9) { ?>
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-60">
      <?php if(!empty($type1_headline9)) { ?>
      <h3 class="catch"><?php echo $type1_headline9; ?></h3>
      <?php }; ?>
      <?php if(!empty($type1_desc9)) { ?>
      <div class="desc1"><?php echo wpautop( $type1_desc9 ); ?></div>
      <?php }; ?>
    </div>
    <div class="col-sm-60 mobile-text-align-center">
      <?php if(!empty($value9)) { ?>
      <img class="image" src="<?php echo $image9[0]; ?>" alt="" title="" />
      <?php }; ?>
    </div>
  </div>
  <?php }; ?>
</div>
</section>
