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
   $type4_headline1_fontsize = get_post_meta($post->ID,'type4_headline1_fontsize',true);
   $type4_desc1_fontsize = get_post_meta($post->ID,'type4_desc1_fontsize',true);
   $type4_headline1 = get_post_meta($post->ID,'type4_headline1',true);
   $type4_headline2 = get_post_meta($post->ID,'type4_headline2',true);
   $type4_headline3 = get_post_meta($post->ID,'type4_headline3',true);
   $type4_headline4 = get_post_meta($post->ID,'type4_headline4',true);
   $type4_headline5 = get_post_meta($post->ID,'type4_headline5',true);
   $type4_desc1 = get_post_meta($post->ID,'type4_desc1',true);
   $type4_desc2 = get_post_meta($post->ID,'type4_desc2',true);
   $type4_desc22 = get_post_meta($post->ID,'type4_desc22',true);
   $type4_desc3 = get_post_meta($post->ID,'type4_desc3',true);
   $type4_desc32 = get_post_meta($post->ID,'type4_desc32',true);
   $type4_desc4 = get_post_meta($post->ID,'type4_desc4',true);
   $type4_desc5 = get_post_meta($post->ID,'type4_desc5',true);
   $value2 = get_post_meta($post->ID, 'type4_image2', true);
   $value3 = get_post_meta($post->ID, 'type4_image3', true);
   $type4_shortcode1 = get_post_meta($post->ID,'type4_shortcode1',true);
   $type4_shortcode2 = get_post_meta($post->ID,'type4_shortcode2',true);
   $type4_shortcode3 = get_post_meta($post->ID,'type4_shortcode3',true);
   $type4_shortcode4 = get_post_meta($post->ID,'type4_shortcode4',true);
   if(!empty($value2)) { $image2 = wp_get_attachment_image_src($value2, 'full'); };
   if(!empty($value3)) { $image3 = wp_get_attachment_image_src($value3, 'full'); };
?>

<?php if($value): ?>
<div class="container-fluid">
	<div class="row">
		<div class="col-xs-120 page-splash hidden-xs" data-parallax="scroll" data-image-src="<?php echo $image[0]; ?>"></div>
		<div class="col-xs-120 visible-xs" style="padding:0; height:300px; background-image:url(<?php echo $image[0]; ?>); background-size:cover; background-repeat: no-repeat; background-position:center center;"></div>
	</div>
</div>
<?php endif; ?>

<div class="container" style="<?php if(!$value){ echo ' margin-top:215px;'; } ?> background:white">
  <?php get_template_part('breadcrumb'); ?>
	<?php if($type4_headline1 || $type4_desc1) { ?>
	<div class="row mt40 mb40">
		<div class="col-sm-120 nm30">
			<?php if(!empty($type4_headline1)) { ?>
			<h2 class="headline text-center page_headline"<?php if(!empty($type4_headline1_fontsize)) { echo ' style="font-size:', $type4_headline1_fontsize, 'px;"'; }; ?>><?php echo $type4_headline1; ?></h2>
			<?php }; ?>
			<?php if(!empty($type4_desc1)) { ?>
			<div class="desc1 page_desc"<?php if(!empty($type4_desc1_fontsize)) { echo ' style="font-size:', $type4_desc1_fontsize, 'px;"'; }; ?>><?php echo wpautop( $type4_desc1 ); ?></div>
			<?php }; ?>
		</div>
	</div>
	<?php }; ?>
</div>

<div class="container nm30">
	<?php if(!empty($value2)) { ?>
	<div class="row mb15">
		<div class="col-sm-120">
			<img class="image" src="<?php echo $image2[0]; ?>" alt="" title="" />
		</div>
	</div>
	<?php }; ?>
	<?php if(!empty($type4_headline2)||!empty($type4_desc2)){ ?>
	<div class="row mb10">
		<div class="col-sm-120">
			<?php if(!empty($type4_headline2)) { ?>
			<h3 class="catch mb0"><?php echo $type4_headline2; ?></h3>
			<?php }; ?>
			<?php if(!empty($type4_desc2)) { ?>
			<div class="desc1 mb0"><?php echo wpautop( $type4_desc2 ); ?></div>
			<?php }; ?>
		</div>
	</div>
	<?php }; ?>
	<?php if(!empty($type4_desc22)||!empty($type4_shortcode1)){ ?>
	<div class="row mb80 mobile-mb-30">
		<?php if(empty($type4_shortcode1)){ ?>
		<div class="col-sm-120"><?php echo wpautop( $type4_desc22 ); ?></div>
		<?php }else{ ?>
		<div class="col-sm-120"><?php echo apply_filters('the_content', $type4_shortcode1); ?></div>
		<?php }; ?>
	</div>
	<?php }; ?>
</div>

<div class="container">
	<?php if(!empty($value3)) { ?>
	<div class="row mb15">
		<div class="col-sm-120">
			<img class="image" src="<?php echo $image3[0]; ?>" alt="" title="" />
		</div>
	</div>
	<?php }; ?>
	<?php if(!empty($type4_headline3)||!empty($type4_desc3)){ ?>
	<div class="row mb10">
		<div class="col-sm-120">
			<?php if(!empty($type4_headline3)) { ?>
			<h3 class="catch mb0"><?php echo $type4_headline3; ?></h3>
			<?php }; ?>
			<?php if(!empty($type4_desc3)) { ?>
			<div class="desc1 mb0"><?php echo wpautop( $type4_desc3 ); ?></div>
			<?php }; ?>
		</div>
	</div>
	<?php }; ?>
	<?php if(!empty($type4_desc32)||!empty($type4_shortcode2)){ ?>
	<div class="row mb80 mobile-mb-30">
		<?php if(empty($type4_shortcode2)){ ?>
		<div class="col-sm-120"><?php echo wpautop( $type4_desc32 ); ?></div>
		<?php }else{ ?>
		<div class="col-sm-120"><?php echo apply_filters('the_content', $type4_shortcode2); ?></div>
		<?php }; ?>
	</div>
	<?php }; ?>
</div>

<div class="container">
	<?php if(!empty($type4_headline4)) { ?>
	<div class="row">
	    <div class="col-sm-120">
			<h2 class="form_page_h2"><?php echo $type4_headline4; ?></h2>
	    </div>
	</div>
	<?php }; ?>

	<?php
		$options = get_desing_plus_option();
		$top_content5_banner_image1 = wp_get_attachment_image_src($options['top_content5_banner_image1'], 'size2');
		$top_content5_banner_image2 = wp_get_attachment_image_src($options['top_content5_banner_image2'], 'size2');
		$top_content5_banner_image3 = wp_get_attachment_image_src($options['top_content5_banner_image3'], 'size2');
	?>

	<div class="row mb80 mobile-mb-30">
		<div class="col-sm-40 mobile-mb-30">
			<div class="text-left staff-interview">
				<a href="<?php echo $options['top_content5_banner_url1']; ?>">
				<?php if($top_content5_banner_image1[0]){ ?><img style="border-radius:0; padding-bottom:15px" src="<?php echo $top_content5_banner_image1[0]; ?>"><?php }; ?>
				<p class="read_copy"><span style="color:#<?php echo $options['pickedcolor3']; ?>"><?php echo $options['top_content5_banner_headline1']; ?></span></p>
				<?php if($options['top_content5_banner_url1']): ?>
					<div class="text-left staff" style="background:#<?php echo $options['pickedcolor3']; ?>; color:white">
						<span class="department"><?php echo $options['top_content5_banner_btnlabel_sub1']; ?></span><br/>
						<span class="name"><?php echo $options['top_content5_banner_btnlabel1']; ?></span><span class="arrow_ico1"></span>
					</div>
				<?php endif; ?>
				</a>
			</div>
		</div>
		<div class="col-sm-40 mobile-mb-30">
			<div class="text-left staff-interview">
				<a href="<?php echo $options['top_content5_banner_url2']; ?>">
				<?php if($top_content5_banner_image2[0]){ ?><img style="border-radius:0; padding-bottom:15px" src="<?php echo $top_content5_banner_image2[0]; ?>"><?php }; ?>
				<p class="read_copy"><span style="color:#<?php echo $options['pickedcolor4']; ?>"><?php echo $options['top_content5_banner_headline2']; ?></span></p>
				<?php if($options['top_content5_banner_url2']): ?>
					<div class="text-left staff" style="background:#<?php echo $options['pickedcolor4']; ?>; color:white">
						<span class="department"><?php echo $options['top_content5_banner_btnlabel_sub2']; ?></span><br/>
						<span class="name"><?php echo $options['top_content5_banner_btnlabel2']; ?></span><span class="arrow_ico1"></span>
					</div>
				<?php endif; ?>
				</a>
			</div>
		</div>
		<div class="col-sm-40">
			<div class="text-left staff-interview">
				<a href="<?php echo $options['top_content5_banner_url3']; ?>">
				<?php if($top_content5_banner_image3[0]){ ?><img style="border-radius:0; padding-bottom:15px" src="<?php echo $top_content5_banner_image3[0]; ?>"><?php }; ?>
				<p class="read_copy"><span style="color:#<?php echo $options['pickedcolor5']; ?>"><?php echo $options['top_content5_banner_headline3']; ?></span></p>
				<?php if($options['top_content5_banner_url3']): ?>
					<div class="text-left staff" style="background:#<?php echo $options['pickedcolor5']; ?>; color:white">
						<span class="department"><?php echo $options['top_content5_banner_btnlabel_sub3']; ?></span><br/>
						<span class="name"><?php echo $options['top_content5_banner_btnlabel3']; ?></span><span class="arrow_ico1"></span>
					</div>
				<?php endif; ?>
				</a>
			</div>
		</div>
	</div>
</div>

<?php if(!empty($type4_shortcode3)){ ?>
<div class="container">
	<div class="row mb80 mobile-mb-30">
		<div class="col-sm-120">
			<?php echo apply_filters('the_content', $type4_shortcode3); ?>
		</div>
	</div>
</div>
<?php }elseif(!empty($type4_desc4)){ ?>
<div class="container">
	<?php if(!empty($type4_headline5)) { ?>
	<div class="row">
	    <div class="col-sm-120">
			<h2 class="form_page_h2 mb0"><?php echo $type4_headline5; ?></h2>
	    </div>
	</div>
	<?php }; ?>
	<div class="row mb80 mobile-mb-30">
		<div class="col-sm-120">
			<div class="form_page_container"><?php echo wpautop( $type4_desc4 ); ?></div>
		</div>
	</div>
</div>
<?php }; ?>


<?php if($type4_shortcode4){ ?>
<div class="container-fluid form_wrapper">
	<div class="container">
		<div class="row">
			<div class="col-sm-120">
				<?php echo apply_filters('the_content', $type4_shortcode4); ?>
			</div>
		</div>
	</div>
</div>
<?php }elseif($type4_desc5){ ?>
<div class="container-fluid form_wrapper">
	<div class="container">
		<div class="row">
			<div class="col-sm-120">
				<?php echo wpautop( $type4_desc5 ); ?>
			</div>
		</div>
	</div>
</div>
<?php }; ?>
