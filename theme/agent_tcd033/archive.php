<?php
$showBorder = true;
$options = get_desing_plus_option();

get_header(); ?>

	<div class="main-content">
		<div class="container archive_wrap">
			<?php get_template_part('breadcrumb'); ?>
			<div class="row">
				<div class="col-xs-120 hidden-xs"><h2 class="archive_h2 headline smaller-mobile-h2 mobile-mt-0"><?php echo $options['archive_headline']; ?></h2></div>
			</div>
			<div class="row<?php if(!is_mobile()){ echo ' mt70'; }; ?>">
				<div class="main-content-inner col-sm-80 ">
					<?php if ( have_posts() ) : ?>

						<?php /* Start the Loop */ ?>
						<div class="row">
							<?php while ( have_posts() ) : the_post(); ?>

								<div class="col-sm-60 archive_post">
									<?php get_template_part('content', 'archive'); ?>
								</div>

							<?php endwhile; ?>
						</div>

						<?php include('navigation.php'); ?>

					<?php else : ?>

						<?php get_template_part( 'no-results', 'index' ); ?>

					<?php endif; ?>
			</div>
			<div class="col-sm-37 col-sm-offset-3">
				<?php get_sidebar(); ?>
			</div>
		</div>
	</div>
</div>

<?php get_footer(); ?>
