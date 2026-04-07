<?php /* Template Name: Page no sidebar */ ?>

<?php

get_header('no-sidebar'); ?>

<?php while ( have_posts() ) : the_post(); ?>
<?php get_template_part( 'content', 'pagenoside' ); ?>
<?php endwhile; // end of the loop. ?>
<?php get_footer(); ?>