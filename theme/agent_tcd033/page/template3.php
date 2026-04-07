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
   $type3_headline1_fontsize = get_post_meta($post->ID,'type3_headline1_fontsize',true);
   $type3_desc1_fontsize = get_post_meta($post->ID,'type3_desc1_fontsize',true);
   $type3_headline1 = get_post_meta($post->ID,'type3_headline1',true);
   $type3_headline2 = get_post_meta($post->ID,'type3_headline2',true);
   $type3_headline3 = get_post_meta($post->ID,'type3_headline3',true);
   $type3_headline4 = get_post_meta($post->ID,'type3_headline4',true);
   $type3_headline5 = get_post_meta($post->ID,'type3_headline5',true);
   $type3_headline6 = get_post_meta($post->ID,'type3_headline6',true);
   $type3_headline7 = get_post_meta($post->ID,'type3_headline7',true);
   $type3_headline8 = get_post_meta($post->ID,'type3_headline8',true);
   $type3_headline9 = get_post_meta($post->ID,'type3_headline9',true);
   $type3_headline10 = get_post_meta($post->ID,'type3_headline10',true);
   $type3_desc1 = get_post_meta($post->ID,'type3_desc1',true);
   $type3_desc2 = get_post_meta($post->ID,'type3_desc2',true);
   $type3_desc3 = get_post_meta($post->ID,'type3_desc3',true);
   $type3_desc4 = get_post_meta($post->ID,'type3_desc4',true);
   $type3_desc5 = get_post_meta($post->ID,'type3_desc5',true);
   $type3_desc6 = get_post_meta($post->ID,'type3_desc6',true);
   $type3_desc7 = get_post_meta($post->ID,'type3_desc7',true);
   $type3_desc8 = get_post_meta($post->ID,'type3_desc8',true);
   $type3_desc9 = get_post_meta($post->ID,'type3_desc9',true);
   $type3_desc10 = get_post_meta($post->ID,'type3_desc10',true);
   $type3_desc11 = get_post_meta($post->ID,'type3_desc11',true);
   $type3_desc12 = get_post_meta($post->ID,'type3_desc12',true);
   $type3_desc13 = get_post_meta($post->ID,'type3_desc13',true);
   $type3_desc14 = get_post_meta($post->ID,'type3_desc14',true);
   $type3_desc15 = get_post_meta($post->ID,'type3_desc15',true);
   $value1 = get_post_meta($post->ID, 'type3_image1', true);
   $value2 = get_post_meta($post->ID, 'type3_image2', true);
   $value3 = get_post_meta($post->ID, 'type3_image3', true);
   $value4 = get_post_meta($post->ID, 'type3_image4', true);
   $value5 = get_post_meta($post->ID, 'type3_image5', true);
   $value6 = get_post_meta($post->ID, 'type3_image6', true);
   $value7 = get_post_meta($post->ID, 'type3_image7', true);
   $value8 = get_post_meta($post->ID, 'type3_image8', true);
   $value9 = get_post_meta($post->ID, 'type3_image9', true);
   $value10 = get_post_meta($post->ID, 'type3_image10', true);
   $value11 = get_post_meta($post->ID, 'type3_image11', true);
   $value12 = get_post_meta($post->ID, 'type3_image12', true);
   if(!empty($value1)) { $image1 = wp_get_attachment_image_src($value1, 'full'); };
   if(!empty($value2)) { $image2 = wp_get_attachment_image_src($value2, 'full'); };
   if(!empty($value3)) { $image3 = wp_get_attachment_image_src($value3, 'full'); };
   if(!empty($value4)) { $image4 = wp_get_attachment_image_src($value4, 'full'); };
   if(!empty($value5)) { $image5 = wp_get_attachment_image_src($value5, 'full'); };
   if(!empty($value6)) { $image6 = wp_get_attachment_image_src($value6, 'full'); };
   if(!empty($value7)) { $image7 = wp_get_attachment_image_src($value7, 'full'); };
   if(!empty($value8)) { $image8 = wp_get_attachment_image_src($value8, 'full'); };
   if(!empty($value9)) { $image9 = wp_get_attachment_image_src($value9, 'full'); };
   if(!empty($value10)) { $image10 = wp_get_attachment_image_src($value10, 'full'); };
   if(!empty($value11)) { $image11 = wp_get_attachment_image_src($value11, 'full'); };
   if(!empty($value12)) { $image12 = wp_get_attachment_image_src($value12, 'full'); };
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
  <?php if($type3_headline1 || $type3_desc1) { ?>
  <div class="row mt40 mb40">
    <div class="col-sm-120 nm30">
      <?php if(!empty($type3_headline1)) { ?>
      <h2 class="headline text-center page_headline"<?php if(!empty($type3_headline1_fontsize)) { echo ' style="font-size:', $type3_headline1_fontsize, 'px;"'; }; ?>><?php echo $type3_headline1; ?></h2>
      <?php }; ?>
      <?php if(!empty($type3_desc1)) { ?>
      <div class="desc1 page_desc"<?php if(!empty($type3_desc1_fontsize)) { echo ' style="font-size:', $type3_desc1_fontsize, 'px;"'; }; ?>><?php echo wpautop( $type3_desc1 ); ?></div>
      <?php }; ?>
    </div>
  </div>
  <?php }; ?>

  <?php if($type3_headline2 || $type3_desc2 || $value2 || $type3_headline3 || $type3_desc3 || $value3) { ?>
  <div class="row mb80 mobile-mb-30 nm30">
    <div class="col-sm-60 mobile-mb-20">
      <?php if(!empty($type3_headline2)) { ?>
      <h3 class="catch"><?php echo $type3_headline2; ?></h3>
      <?php }; ?>
      <?php if(!empty($type3_desc2)) { ?>
      <div class="desc1"><?php echo wpautop( $type3_desc2 ); ?></div>
      <?php }; ?>
      <?php if(!empty($value2)) { ?>
      <img class="image" src="<?php echo $image2[0]; ?>" alt="" title="" />
      <?php }; ?>
    </div>
    <div class="col-sm-60">
      <?php if(!empty($type3_headline3)) { ?>
      <h3 class="catch"><?php echo $type3_headline3; ?></h3>
      <?php }; ?>
      <?php if(!empty($type3_desc3)) { ?>
      <div class="desc1"><?php echo wpautop( $type3_desc3 ); ?></div>
      <?php }; ?>
      <?php if(!empty($value3)) { ?>
      <img class="image" src="<?php echo $image3[0]; ?>" alt="" title="" />
      <?php }; ?>
    </div>
  </div>
  <?php }; ?>
</section>

<section>
<?php if($type3_headline4 || $value4) { ?>
<div class="mb80 mobile-mb-30 separator" <?php if($value4){ echo ' data-parallax="scroll" data-speed="0.6" data-image-src="'.$image4[0].'"'; }; ?>>
  <div class="title">
    <div class="container">
      <div class="row">
        <div class="col-xs-120">
          <h2 class="liner"><?php echo $type3_headline4; ?></h2>
          <span class="lead romaji"><?php echo wpautop( $type3_desc4 ); ?></span>
        </div>
      </div>
    </div>
  </div>
</div>
<?php }; ?>

<?php if($value5 || $type3_desc5 || $value6 || $type3_desc6 || $value7 || $type3_desc7 || $value8 || $type3_desc8 || $value9 || $type3_desc9) { ?>
<div class="container">
  <div class="row mb80 mobile-mb-20">
    <div class="col-sm-40 mobile-mb-20 mobile-text-align-center">
      <?php if(!empty($value5)) { ?>
      <img class="image mb30 mobile-mb-0" src="<?php echo $image5[0]; ?>" alt="" title="" />
      <?php }; ?>
      <?php if(!empty($type3_desc5)) { ?>
      <div class="desc1"><?php echo wpautop( $type3_desc5 ); ?></div>
      <?php }; ?>
    </div>
    <div class="col-sm-40 mobile-mb-20 mobile-text-align-center">
      <?php if(!empty($value6)) { ?>
      <img class="image mb30 mobile-mb-0" src="<?php echo $image6[0]; ?>" alt="" title="" />
      <?php }; ?>
      <?php if(!empty($type3_desc6)) { ?>
      <div class="desc1"><?php echo wpautop( $type3_desc6 ); ?></div>
      <?php }; ?>
    </div>
    <div class="col-sm-40 mobile-text-align-center">
      <?php if(!empty($value7)) { ?>
      <img class="image mb30 mobile-mb-0" src="<?php echo $image7[0]; ?>" alt="" title="" />
      <?php }; ?>
      <?php if(!empty($type3_desc7)) { ?>
      <div class="desc1"><?php echo wpautop( $type3_desc7 ); ?></div>
      <?php }; ?>
    </div>
  </div>

  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-60 mobile-mb-30">
      <?php if(!empty($value8)) { ?>
      <img class="image mb30 mobile-mb-10" src="<?php echo $image8[0]; ?>" alt="" title="" />
      <?php }; ?>
      <?php if(!empty($type3_desc8)) { ?>
      <div class="desc1"><?php echo wpautop( $type3_desc8 ); ?></div>
      <?php }; ?>
    </div>
    <div class="col-sm-60 mobile-mb-10">
      <?php if(!empty($value9)) { ?>
      <img class="image mb30 mobile-mb-10" src="<?php echo $image9[0]; ?>" alt="" title="" />
      <?php }; ?>
      <?php if(!empty($type3_desc9)) { ?>
      <div class="desc1"><?php echo wpautop( $type3_desc9 ); ?></div>
      <?php }; ?>
    </div>
  </div>
</div>
<?php }; ?>
</section>

<section>
<?php if($type3_headline5 || $value10) { ?>
<div class="mb80 mobile-mb-30 separator nm30"<?php if($value4){ echo ' data-parallax="scroll" data-speed="0.6" data-image-src="'.$image10[0].'"'; }; ?>>
  <div class="title">
    <div class="container">
      <div class="row">
        <div class="col-xs-120">
          <h2 class="liner"><?php echo $type3_headline5; ?></h2>
          <span class="lead romaji"><?php echo wpautop( $type3_desc10 ); ?></span>
        </div>
      </div>
    </div>
  </div>
</div>
<?php }; ?>

<?php if($type3_headline6 || $type3_desc11 || $type3_headline7 || $type3_desc12 ) { ?>
<div class="container">
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-60">
      <?php if(!empty($type3_headline6)) { ?>
      <h3 class="catch"><?php echo $type3_headline6; ?></h3>
      <?php }; ?>
      <?php if(!empty($type3_desc11)) { ?>
      <div class="desc1"><?php echo wpautop( $type3_desc11 ); ?></div>
      <?php }; ?>
    </div>
    <div class="col-sm-60">
      <?php if(!empty($type3_headline7)) { ?>
      <h3 class="catch"><?php echo $type3_headline7; ?></h3>
      <?php }; ?>
      <?php if(!empty($type3_desc12)) { ?>
      <div class="desc1"><?php echo wpautop( $type3_desc12 ); ?></div>
      <?php }; ?>
    </div>
  </div>
</div>
<?php }; ?>

<?php if($value12) { ?>
<div class="container nm30">
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-120">
      <?php if(!empty($value12)) { ?>
      <img class="image mb30" src="<?php echo $image12[0]; ?>" alt="" title="" />
      <?php }; ?>
    </div>
  </div>
</div>
<?php }; ?>

<?php if($type3_headline8 || $type3_desc13 || $type3_headline9 || $type3_desc14 || $type3_headline10 || $type3_desc15) { ?>
<div class="container nm30">
  <div class="row mb80 mobile-mb-30">
    <div class="col-sm-40 mobile-mb-40">
      <?php if(!empty($type3_headline8)) { ?>
      <h3 class="catch text-center"><?php echo $type3_headline8; ?></h3>
      <?php }; ?>
      <?php if(!empty($type3_desc13)) { ?>
      <div class="desc1"><?php echo wpautop( $type3_desc13 ); ?></div>
      <?php }; ?>
    </div>
    <div class="col-sm-40 mobile-mb-40">
      <?php if(!empty($type3_headline9)) { ?>
      <h3 class="catch text-center"><?php echo $type3_headline9; ?></h3>
      <?php }; ?>
      <?php if(!empty($type3_desc14)) { ?>
      <div class="desc1"><?php echo wpautop( $type3_desc14 ); ?></div>
      <?php }; ?>
    </div>
    <div class="col-sm-40">
      <?php if(!empty($type3_headline10)) { ?>
      <h3 class="catch text-center"><?php echo $type3_headline10; ?></h3>
      <?php }; ?>
      <?php if(!empty($type3_desc15)) { ?>
      <div class="desc1"><?php echo wpautop( $type3_desc15 ); ?></div>
      <?php }; ?>
    </div>
  </div>
</div>
<?php }; ?>
</section>
