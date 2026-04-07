<?php
$showBorder = true;
$options = get_desing_plus_option();
get_header(); ?>


<?php $blog_header_image = wp_get_attachment_image_src($options['blog_header_image'], 'full'); ?>

  <?php if($options['blog_header_image']): ?>
  <div class="container-fluid blog_header_image">
    <div class="row">
      <div class="col-xs-120 page-splash hidden-xs" data-parallax="scroll" data-image-src="<?php echo $blog_header_image[0]; ?>"></div>
      <div class="col-xs-120 visible-xs" style="padding:0; height:300px; background-image:url(<?php echo $blog_header_image[0]; ?>); background-size:cover; background-repeat: no-repeat; background-position:center center;"></div>
    </div>
  </div>
  <?php endif; ?>

  <div class="container <?php if($options['blog_header_image']){ echo 'single_wrap2'; }else{echo 'single_wrap'; }; ?>">
    <?php get_template_part('breadcrumb'); ?>
    <div class="row">

      <div class="col-sm-80 no-left-padding">
      <?php while ( have_posts() ) : the_post(); ?>

        <?php get_template_part( 'content', 'single' ); ?>

        <?php /* _tk_content_nav( 'nav-below' ); */ ?>

      <?php endwhile; // end of the loop. ?>

        <?php
          $cat = get_the_category();
          $cat = $cat[0];
          $cat_id = $cat->cat_ID;
          $args = array('posts_per_page' => 6, 'orderby' => 'date', 'order' => 'DESC', 'cat' => $cat_id, 'post__not_in' => array($post->ID));
          $related_post = get_posts($args);
          $counter = 0;
          if ($related_post&&$options['show_related_post']) :
        ?>
        <div id="related-posts">
          <h3 class="related-posts-title"><?php _e('Related posts', 'tcd-w'); ?></h3>
          <?php
            //$the_query = new WP_Query("post_type=post&posts_per_page=6&orderby=date&order=DESC");
            $the_query = new WP_Query($args);
            if(!is_mobile()):
          ?>
          <div class="row">
            <?php while ( $the_query->have_posts() ) : $the_query->the_post(); ?>
              <div class="col-xs-60">
                <div class="related_post clearfix">
                  <?php if ($options['show_thumbnail']) : ?>
                  <div class="related_post_img"><a href="<?php the_permalink(); ?>"><?php if(has_post_thumbnail()){the_post_thumbnail('widget_thumb'); }else{echo '<img src="'; bloginfo('template_url'); echo '/img/common/no_image8.gif" alt="" title="" />';}; ?></a></div>
                  <?php endif; ?>
                  <div class="related_post_meta">
                    <?php if ($options['show_date']) : ?>
                      <?php if ($options['show_date']){ ?><p class="post_date"><i class='fa fa-clock-o fa-lg mr5'></i><time class="entry-date updated" datetime="<?php the_modified_time('c'); ?>"><?php the_time('Y.n.j'); ?></time></p><?php }; ?>
                    <?php endif; ?>
                    <h3 class="title"><a href="<?php the_permalink() ?>"><?php trim_title(32); ?></a></h3>
                  </div>
                </div>
              </div>
              <?php
                $counter++;
                if ($counter % 2 == 0) {
                  echo '</div><div class="row" style="margin-top:15px;">';
                }
              ?>
            <?php endwhile; ?>
          </div>
          <?php else: ?>
          <div class="related-posts-inner">
            <?php while ( $the_query->have_posts() ) : $the_query->the_post(); ?>
            <div class="related_post clearfix">
              <?php if ($options['show_thumbnail']) : ?>
              <div class="related_post_img"><a href="<?php the_permalink(); ?>"><?php if(has_post_thumbnail()){the_post_thumbnail('size1'); }else{echo '<img src="'; bloginfo('template_url'); echo '/img/common/no_image8.gif" alt="" title="" />';}; ?></a></div>
              <?php endif; ?>
              <div class="related_post_meta">
                <?php if ($options['show_date']) : ?>
                  <?php if ($options['show_date']){ ?><p class="post_date"><i class='fa fa-clock-o fa-lg mr5'></i><time class="entry-date updated" datetime="<?php the_modified_time('c'); ?>"><?php the_time('Y.n.j'); ?></time></p><?php }; ?>
                <?php endif; ?>
                <h3 class="title"><a href="<?php the_permalink() ?>"><?php if($i ==1) { the_title(); } else { trim_title(32); }; ?></a></h3>
              </div>
            </div>
            <?php endwhile; ?>
          </div>
          <?php endif; ?>
        </div>
        <?php endif; wp_reset_postdata(); ?>

    <!-- comments -->
    <?php if ($options['show_comment']) :
      if (function_exists('wp_list_comments')) { comments_template('', true); } else { comments_template(); };
    endif; ?>
    <!-- /comments -->

      </div>

      <div class="col-sm-37 col-sm-offset-3 no-right-padding">
        <?php get_sidebar(); ?>
      </div>

    </div>
  </div>


<?php get_footer(); ?>
