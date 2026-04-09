<?php
$categories = get_the_category(get_the_ID());
if(!$categories) {
  $categories = @array_values(get_the_terms(get_the_ID()));
}
$options = get_desing_plus_option();
?>

  <article id="post-<?php the_ID(); ?>" class="blog-item">
    <div class="post-image">
      <a class="post_image blog-item-featured" href="<?php the_permalink() ?>">
	<?php if ( has_post_thumbnail()) { echo the_post_thumbnail('size2');
  	} else { echo '<img src="'; bloginfo('template_url'); echo '/img/common/no_image7.gif" alt="" title="" />'; }; ?>
      </a>
    </div>

    <div class="post-meta">
     <ul>
      <?php if ($options['show_date']){ ?><li class="post_date"><i class='fa fa-clock-o fa-lg'></i><time class="entry-date updated" datetime="<?php the_modified_time('c'); ?>"><?php the_time('Y.n.j'); ?></time></li><?php }; ?>
      <?php if ($options['show_category']){ ?><?php if (!is_post_type_archive('news')) { ?><li class="post_category"><?php the_category(', '); ?></li><?php }; ?><?php }; ?>
     </ul>
     <h3 class="title"><a href="<?php the_permalink() ?>"><?php trim_title(32); ?></a></h3>
    </div>
  </article>