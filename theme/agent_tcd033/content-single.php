<?php
	$options = get_desing_plus_option();
	$categories = get_the_category_list('、');
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header>
		<?php if($options['show_date']||$options['show_category']||$options['show_author']||$options['show_tag']): ?>
		<ul class="entry-meta clearfix">
			<?php if($options['show_date']){ echo "<li><span class='fa fa-clock-o fa-lg mr5'></span><span class='timestamp'>&nbsp;" . get_the_date('Y') . '.' . get_the_date('m') . '.' . get_post_time('j') . "</span></li>"; }; ?>
			<?php if($options['show_category']){ ?><li><i class="fa fa-folder-open-o fa-lg mr5" aria-hidden="true"></i><?php echo $categories; ?></li><?php }; ?>
			<?php if($options['show_author']){ ?><li><span class="fa fa-pencil-square-o fa-lg mr5"></span><?php if (function_exists('coauthors_posts_links')) { coauthors_posts_links(', ',', ','','',true); } else { the_author_posts_link(); }; ?></li><?php }; ?>
			<?php if($options['show_tag']){ the_tags('<li><span class="fa fa-tags fa-lg mr5"></span>', ', ', '</li>'); }; ?>
		</ul>
		<?php endif; ?>

		<h2 class="page-title"><?php the_title(); ?></h2>
	</header><!-- .entry-header -->

  <!-- sns button top -->
  <?php if ($options['show_sns_top']) { ?>
  <?php get_template_part('sns_btn_top'); ?>
  <?php }; ?>
  <!-- /sns button top -->

	<div class="entry-content mb30">
		<?php if ( has_post_thumbnail() ) { if ($options['show_thumbnail']) : ?>
		<div class="entry-content-thumbnail"><?php the_post_thumbnail('full'); ?></div>
		<?php endif; }; ?>
		<?php the_content(); ?>
		<?php custom_wp_link_pages(); ?>
	</div><!-- .entry-content -->

  <!-- sns button bottom -->
  <?php if ($options['show_sns_btm']) { ?>
  <div class="clearfix">
  <?php get_template_part('sns_btn_btm'); ?>
  </div>
  <?php }; ?>
  <!-- /sns button bottom -->

	<?php if($options['show_next_post']): ?>
	<footer class="entry-nav">
		<?php if(!is_mobile()){ ?>
		<div class="row">
			<div class="col-xs-60 text-center">
				<p class="prev_link"><?php previous_post_link('%link', __('Prev', 'tcd-w'), true) ?></p>
			</div>
			<div class="col-xs-60 text-center">
				<p class="next_link"><?php next_post_link('%link', __('Next', 'tcd-w'), true) ?></p>
			</div>
		</div>
		<?php }else{ ?>
		<div id="previous_next_post" class="clearfix">
		   <p id="previous_post"><?php previous_post_link('%link', __('Prev', 'tcd-w')) ?></p>
		   <p id="next_post"><?php next_post_link('%link', __('Next', 'tcd-w')) ?></p>
		</div>
		<?php }; ?>
	</footer><!-- .entry-meta -->
	<?php endif; ?>

</article><!-- #post-## -->
