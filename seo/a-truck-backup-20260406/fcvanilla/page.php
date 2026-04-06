<?php
remove_filter('the_content', 'wpautop');
remove_filter('the_excerpt', 'wpautop');
?>
<?php get_header() ?>
<?php if (have_posts()) : while (have_posts()) : the_post() ?>
    <?php the_content() ?>
<?php endwhile; endif ?>
<?php get_footer() ?>