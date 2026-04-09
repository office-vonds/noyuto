<?php
	if(get_post_meta($post->ID,'page_main_image',true)) {
		if(is_mobile()){
			if(get_post_meta($post->ID, 'page_main_image_mobile', true)){
				$value = get_post_meta($post->ID, 'page_main_image_mobile', true);
			}else{
				$value = get_post_meta($post->ID, 'page_main_image', true);
			}
			$image = wp_get_attachment_image_src($value, 'full');
		}else{
			$value = get_post_meta($post->ID, 'page_main_image', true);
			$image = wp_get_attachment_image_src($value, 'full');
		};
	}else{
		if(has_post_thumbnail()){
			$value = get_post_thumbnail_id($post->ID);
			$image = wp_get_attachment_image_src($value, 'full');
		}else{
			$image = false;
		};
	};
?>

<?php if($image): ?>
<div class="container-fluid">
  <div class="row">
		<div class="col-xs-120 page-splash hidden-xs" data-parallax="scroll" data-image-src="<?php echo $image[0]; ?>"></div>
		<div class="col-xs-120 visible-xs" style="padding:0; height:300px; background-image:url(<?php echo $image[0]; ?>); background-size:cover; background-repeat: no-repeat; background-position:center center;"></div>
  </div>
</div>
<?php endif; ?>

<div class="container"<?php if(!$image){ echo ' style="margin-top:215px;"'; }else{ echo ' style="margin-top:50px;"'; }; ?>>
  <?php get_template_part('breadcrumb'); ?>
	<div class="row">
		<div class="col-sm-120">
			<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
				<header>
					<h2 class="page-title"><?php the_title(); ?></h2>
				</header><!-- .entry-header -->

				<div class="entry-content">
					<div class="entry-content-thumbnail">
						<?php the_post_thumbnail(); ?>
					</div>
					<?php the_content(); ?>
					<?php custom_wp_link_pages(); ?>
				</div><!-- .entry-content -->
			</article><!-- #post-## -->
		</div>
	</div>
</div>
