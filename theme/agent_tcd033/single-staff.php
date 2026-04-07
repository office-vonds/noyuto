<?php get_header(); $options = get_desing_plus_option(); ?>

	<?php while ( have_posts() ) : the_post(); ?>

	<?php
		if(get_post_meta($post->ID,'page_main_image',true)) {
			if(is_mobile()){
				$value = get_post_meta($post->ID, 'page_main_image_mobile', true);
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
		$staff_name = get_post_meta($post->ID,'staff_name',true);
		$staff_post = get_post_meta($post->ID,'staff_post',true);
		$staff_color = get_post_meta($post->ID,'staff_color',true);
		$staff_headline1 = get_post_meta($post->ID,'staff_headline1',true);
		$staff_headline2 = get_post_meta($post->ID,'staff_headline2',true);
		$staff_headline3 = get_post_meta($post->ID,'staff_headline3',true);
		$staff_headline4 = get_post_meta($post->ID,'staff_headline4',true);
		$staff_headline5 = get_post_meta($post->ID,'staff_headline5',true);
		$staff_headline52 = get_post_meta($post->ID,'staff_headline52',true);
		$staff_headline6 = get_post_meta($post->ID,'staff_headline6',true);
		$staff_headline7 = get_post_meta($post->ID,'staff_headline7',true);
		$staff_headline8 = get_post_meta($post->ID,'staff_headline8',true);
		$staff_desc1 = get_post_meta($post->ID,'staff_desc1',true);
		$staff_desc2 = get_post_meta($post->ID,'staff_desc2',true);
		$staff_desc3 = get_post_meta($post->ID,'staff_desc3',true);
		$staff_desc5 = get_post_meta($post->ID,'staff_desc5',true);
		$staff_desc52 = get_post_meta($post->ID,'staff_desc52',true);
		$staff_desc7 = get_post_meta($post->ID,'staff_desc7',true);
		$staff_desc8 = get_post_meta($post->ID,'staff_desc8',true);
		$value1 = get_post_meta($post->ID, 'staff_image1', true);
		$value2 = get_post_meta($post->ID, 'staff_image2', true);
		$value3 = get_post_meta($post->ID, 'staff_image3', true);
		$value4 = get_post_meta($post->ID, 'staff_image4', true);
		$value5 = get_post_meta($post->ID, 'staff_image5', true);
		$value6 = get_post_meta($post->ID, 'staff_image6', true);
		$value7 = get_post_meta($post->ID, 'staff_image7', true);
		$value8 = get_post_meta($post->ID, 'staff_image8', true);
		if(!empty($value1)) { $image1 = wp_get_attachment_image_src($value1, 'full'); };
		if(!empty($value2)) { $image2 = wp_get_attachment_image_src($value2, 'full'); };
		if(!empty($value3)) { $image3 = wp_get_attachment_image_src($value3, 'full'); };
		if(!empty($value4)) { $image4 = wp_get_attachment_image_src($value4, 'full'); };
		if(!empty($value5)) { $image5 = wp_get_attachment_image_src($value5, 'full'); };
		if(!empty($value6)) { $image6 = wp_get_attachment_image_src($value6, 'full'); };
		if(!empty($value7)) { $image7 = wp_get_attachment_image_src($value7, 'full'); };
		if(!empty($value8)) { $image8 = wp_get_attachment_image_src($value8, 'full'); };
	?>

<!-- staff common -->
<?php if($value): ?>
<div class="container-fluid">
	<div class="row">
		<div class="col-xs-120 page-splash hidden-xs" data-parallax="scroll" data-image-src="<?php echo $image[0]; ?>"></div>
		<div class="col-xs-120 visible-xs" style="padding:0; height:300px; background-image:url(<?php echo $image[0]; ?>); background-size:cover; background-repeat: no-repeat; background-position:center center;"></div>
	</div>
</div>
<?php endif; ?>

<section class="container" style="<?php if(!$value){ echo 'margin-top:110px;'; } ?> background:white;">
	<?php get_template_part('breadcrumb'); ?>
	<div class="row mt40 mb40 mobile-mb-10">
		<div class="col-sm-120">
			<h2 class="headline text-center staff_headline"><?php echo $options['staff_headline']; ?></h2>
			<div class="desc1 staff_desc"><?php echo $options['staff_desc']; ?></div>
		</div>
	</div>

	<?php
		$top_content5_banner_image1 = wp_get_attachment_image_src($options['top_content5_banner_image1'], 'size2');
		$top_content5_banner_image2 = wp_get_attachment_image_src($options['top_content5_banner_image2'], 'size2');
		$top_content5_banner_image3 = wp_get_attachment_image_src($options['top_content5_banner_image3'], 'size2');
	?>

	<div class="row" style="display:none;">
		<div class="col-sm-40 mobile-mb-60">
			<div class="text-left staff-interview">
				<a href="<?php echo $options['top_content5_banner_url1']; ?>">
				<?php if($top_content5_banner_image1[0]){ ?><img style="border-radius:0; padding-bottom:15px" class="full-width" src="<?php echo $top_content5_banner_image1[0]; ?>"><?php }; ?>
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
		<div class="col-sm-40 mobile-mb-60">
			<div class="text-left staff-interview">
				<a href="<?php echo $options['top_content5_banner_url2']; ?>">
				<?php if($top_content5_banner_image2[0]){ ?><img style="border-radius:0; padding-bottom:15px" class="full-width" src="<?php echo $top_content5_banner_image2[0]; ?>"><?php }; ?>
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
				<?php if($top_content5_banner_image3[0]){ ?><img style="border-radius:0; padding-bottom:15px" class="full-width" src="<?php echo $top_content5_banner_image3[0]; ?>"><?php }; ?>
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
</section>
<!-- /staff common -->

<!-- /staff sigle -->
<section>
<?php if($staff_headline1 || $value1) { ?>
<div class="separator2 mobile-mt-0 mobile-mb-30"<?php if($value1){ echo ' data-parallax="scroll" data-speed="0.6" data-image-src="'.$image1[0].'"'; }; ?>>
	<div class="title">
		<div class="container">
			<div class="row">
				<div class="col-xs-120">
					<h2 class="liner"><?php echo $staff_headline1; ?></h2>
					<span class="lead romaji"><?php echo wpautop( $staff_desc1 ); ?></span>
				</div>
			</div>
		</div>
	</div>
		<div class="container">
			<div class="row">
				<div class="col-xs-60 col-sm-40">
				<div class="staff_name">
				 <p class="staff_info"><span><?php echo $staff_post; ?></span><?php echo $staff_name; ?></p>
				</div>
				</div>
			</div>
		</div>
</div>
<?php }; ?>

<div class="container">
	<div class="row staff_column_margin">
		<div class="col-sm-60 text-center mobile-mb-30">
			<?php if(!empty($value2)) { ?>
			<img class="image" src="<?php echo $image2[0]; ?>" alt="" title="" />
			<?php }; ?>
		</div>
		<div class="col-sm-60">
			<?php if(!empty($staff_headline2)) { ?>
			<h3 class="catch2"><span style="color:#<?php if(!empty($staff_color)){echo $staff_color;}else{echo '3FA5F5';}; ?>"><?php echo wpautop( $staff_headline2 ); ?></span></h3>
			<?php }; ?>
			<?php if(!empty($staff_desc2)) { ?>
			<div class="desc1 mobile-mb-0"><?php echo wpautop( $staff_desc2 ); ?></div>
			<?php }; ?>
		</div>
	</div>

	<div class="row mb80 mobile-mb-30">
		<div class="col-sm-60">
			<?php if(!empty($staff_headline3)) { ?>
			<h3 class="catch2"><span style="color:#<?php if(!empty($staff_color)){echo $staff_color;}else{echo '3FA5F5';}; ?>"><?php echo wpautop( $staff_headline3 ); ?></span></h3>
			<?php }; ?>
			<?php if(!empty($staff_desc3)) { ?>
			<div class="desc1"><?php echo wpautop( $staff_desc3 ); ?></div>
			<?php }; ?>
		</div>
		<div class="col-sm-60 text-center">
			<?php if(!empty($value3)) { ?>
			<img class="image" src="<?php echo $image3[0]; ?>" alt="" title="" />
			<?php }; ?>
		</div>
	</div>

	<div class="row mb80 mobile-mb-30">
		<div class="col-sm-28 mb30">
			<?php if(!empty($value4)) { ?>
			<img class="image img-circle center-block" src="<?php echo $image4[0]; ?>" alt="" title="" />
			<?php }; ?>
		</div>
		<div class="col-sm-90 col-sm-offset-2 mt15">
			<?php if(!empty($staff_headline4)) { ?>
			<p class="headline2 staff_headline4"><?php echo $staff_headline4 ?></p>
			<?php }; ?>
		</div>
	</div>

	<div class="row mb80 mobile-mb-10">
		<div class="col-sm-60">
			<?php if(!empty($staff_headline5)) { ?>
			<h3 class="catch2"><span style="color:#<?php if(!empty($staff_color)){echo $staff_color;}else{echo '3FA5F5';}; ?>"><?php echo wpautop( $staff_headline5 ); ?></span></h3>
			<?php }; ?>
			<?php if(!empty($staff_desc5)) { ?>
			<div class="desc1"><?php echo wpautop( $staff_desc5 ); ?></div>
			<?php }; ?>
		</div>
		<div class="col-sm-60">
			<?php if(!empty($staff_headline52)) { ?>
			<h3 class="catch2"><span style="color:#<?php if(!empty($staff_color)){echo $staff_color;}else{echo '3FA5F5';}; ?>"><?php echo wpautop( $staff_headline52 ); ?></span></h3>
			<?php }; ?>
			<?php if(!empty($staff_desc52)) { ?>
			<div class="desc1"><?php echo wpautop( $staff_desc52 ); ?></div>
			<?php }; ?>
		</div>
	</div>
</div>
</section>

<section>
<?php if($staff_headline6 || $value6) { ?>
<div class="mb80 separator3 mobile-mb-40"<?php if($value6){ echo ' data-parallax="scroll" data-speed="0.6" data-image-src="'.$image6[0].'"'; }; ?>>
	<div class="title">
		<div class="container">
			<div class="row">
				<div class="col-xs-120">
					<h2 class="liner"><?php echo $staff_headline6; ?></h2>
				</div>
			</div>
		</div>
	</div>
</div>
<?php }; ?>

<div class="container">
	<div class="row staff_column_margin">
		<div class="col-sm-60 text-center mobile-mb-30">
			<?php if(!empty($value7)) { ?>
			<img class="image" src="<?php echo $image7[0]; ?>" alt="" title="" />
			<?php }; ?>
		</div>
		<div class="col-sm-60">
			<?php if(!empty($staff_headline7)) { ?>
			<h3 class="catch2"><span style="color:#<?php if(!empty($staff_color)){echo $staff_color;}else{echo '3FA5F5';}; ?>"><?php echo wpautop( $staff_headline7 ); ?></span></h3>
			<?php }; ?>
			<?php if(!empty($staff_desc7)) { ?>
			<div class="desc1 mobile-mb-0"><?php echo wpautop( $staff_desc7 ); ?></div>
			<?php }; ?>
		</div>
	</div>

	<div class="row mb80 mobile-mb-30">
		<div class="col-sm-60">
			<?php if(!empty($staff_headline8)) { ?>
			<h3 class="catch2"><span style="color:#<?php if(!empty($staff_color)){echo $staff_color;}else{echo '3FA5F5';}; ?>"><?php echo wpautop( $staff_headline8 ); ?></span></h3>
			<?php }; ?>
			<?php if(!empty($staff_desc8)) { ?>
			<div class="desc1"><?php echo wpautop( $staff_desc8 ); ?></div>
			<?php }; ?>
		</div>
		<div class="col-sm-60 text-center">
			<?php if(!empty($value8)) { ?>
			<img class="image" src="<?php echo $image8[0]; ?>" alt="" title="" />
			<?php }; ?>
		</div>
	</div>
</div>
</section>
<!-- /staff single -->

	<?php endwhile; // end of the loop. ?>

<?php get_footer(); ?>
