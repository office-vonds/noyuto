<?php
get_header(); ?>

	<?php while ( have_posts() ) : the_post(); ?>

<?php
     $options = get_desing_plus_option();
     $page_tcd_template_type = get_post_meta($post->ID,'page_tcd_template_type',true);
     if($page_tcd_template_type == 'type2') { get_template_part('page/template1'); }
     elseif($page_tcd_template_type == 'type3') { get_template_part('page/template2'); }
     elseif($page_tcd_template_type == 'type4') { get_template_part('page/template3'); }
     elseif($page_tcd_template_type == 'type5') { get_template_part('page/template4'); }
     else { get_template_part( 'content', 'page' ); }; ?>

	<?php endwhile; // end of the loop. ?>
<?php if($page_tcd_template_type == 'type5'){get_footer('contact');}else{get_footer();}; ?>