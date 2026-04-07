<?php /* Template Name: Welcome Screen */
get_header();
$options = get_desing_plus_option();
?>

  <?php $slider_image1 = wp_get_attachment_image_src($options['slider_image1'], 'full'); ?>
  <?php $slider_image2 = wp_get_attachment_image_src($options['slider_image2'], 'full'); ?>
  <?php $slider_image3 = wp_get_attachment_image_src($options['slider_image3'], 'full'); ?>
  <div id="top" class="heightasviewport">
    <?php if($slider_image1){ if($options['slider_url1']){ echo '<a href="'.$options['slider_url1'].'">'; }; ?><div class="heightasviewport splash-image" style="background-image:url(<?php echo $slider_image1[0]; ?>)"></div><?php if($options['slider_url1']){ echo '</a>'; }}; ?>
    <?php if($slider_image2){ if($options['slider_url2']){ echo '<a href="'.$options['slider_url2'].'">'; }; ?><div class="heightasviewport splash-image" style="background-image:url(<?php echo $slider_image2[0]; ?>)"></div><?php if($options['slider_url2']){ echo '</a>'; }}; ?>
    <?php if($slider_image3){ if($options['slider_url3']){ echo '<a href="'.$options['slider_url3'].'">'; }; ?><div class="heightasviewport splash-image" style="background-image:url(<?php echo $slider_image3[0]; ?>)"></div><?php if($options['slider_url3']){ echo '</a>'; }}; ?>

    <div class="heightasviewport no-pointer-events" style="position:relative">
      <div class="verticalcenter container">
        <div class="row">
          <div id="agent-splash-text" class="col-xs-120 translated-right serif animated">
            <h2 class="agent-splash-text-h2 smaller-mobile-h2"><?php echo nl2br($options['top_content1_headline']); ?></h2>
          </div>
        </div>
      </div>
    </div>

    <?php if($options['top_content1_btnsize']!='0'): ?>
    <a href="#section-two" class="next-button animated serif" style="width:<?php if(is_mobile()){echo $options['top_content1_btnsize_mobile'];}else{echo $options['top_content1_btnsize'];}; ?>px; height:<?php if(is_mobile()){echo $options['top_content1_btnsize_mobile'];}else{echo $options['top_content1_btnsize'];}; ?>px;">
        <span><?php echo nl2br($options['top_content1_btnlabel']); ?></span>
    </a>
    <?php endif; ?>
  </div>

  <?php $top_main_image2 = wp_get_attachment_image_src($options['top_main_image2'], 'circle2'); ?>
  <div class="section" id="section-two">
    <div class="container">
      <div class="row">
        <div class="col-xs-120 text-center">
          <h3 class="section-two-h3 smaller-mobile-h2"><?php echo nl2br($options['top_content2_headline']); ?></h3>
          <div class="desc1"><?php echo nl2br($options['top_content2_bodytext']); ?></div>
          <div class="text-center">
            <img src="<?php echo $top_main_image2[0]; ?>" class="section-two_circle_img">
          </div>
        </div>
      </div>
    </div>
  </div>

  <?php $top_main_image3 = wp_get_attachment_image_src($options['top_main_image3'], 'full'); ?>
  <div class="separator" data-parallax="scroll" data-speed="0.6" data-image-src="<?php echo $top_main_image3[0]; ?>">
    <div class="title">
      <div class="container">
        <div class="row">
          <div class="col-xs-120">
            <h4 class="liner"><?php echo $options['top_content3_headline']; ?></h4>
            <span class="lead romaji"><?php echo $options['top_content3_headline_sub']; ?></span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <?php
    $top_content3_banner_image1 = wp_get_attachment_image_src($options['top_content3_banner_image1'], 'circle2');
    $top_content3_banner_image2 = wp_get_attachment_image_src($options['top_content3_banner_image2'], 'circle2');
    $top_content3_banner_image3 = wp_get_attachment_image_src($options['top_content3_banner_image3'], 'circle2');
  ?>
  <div class="section container">
    <div class="row">
      <div class="col-xs-120 no-padding">
        <div class="row text-left">
          <div class="text-center col-sm-40 mobile-mb-30" style="padding-left:30px;padding-right:30px;">
            <?php if($options['top_content3_banner_url1']){ ?><div class="circleimages"><a href="<?php echo $options['top_content3_banner_url1']; ?>"><img src="<?php echo $top_content3_banner_image1[0]; ?>"/></a></div><?php }else{ ?><div class="circleimages"><img src="<?php echo $top_content3_banner_image1[0]; ?>"/></div><?php }; ?>
            <h5 class="text-center section3-h5"><?php echo nl2br($options['top_content3_banner_headline1']); ?></h5>
            <div class="text-justify desc2"><?php echo nl2br($options['top_content3_banner_body1']); ?></div>
            <?php if($options['top_content3_banner_url1']){ ?><a class="read-more romaji mobile-mt-0" href="<?php echo $options['top_content3_banner_url1']; ?>"><?php echo $options['top_content3_banner_btnlabel1']; ?></a><?php }; ?>
          </div>
          <div class="text-center col-sm-40 mobile-mb-30" style="padding-left:30px;padding-right:30px;">
            <?php if($options['top_content3_banner_url2']){ ?><div class="circleimages"><a href="<?php echo $options['top_content3_banner_url2']; ?>"><img src="<?php echo $top_content3_banner_image2[0]; ?>"/></a></div><?php }else{ ?><div class="circleimages"><img src="<?php echo $top_content3_banner_image2[0]; ?>" 
/></div><?php }; ?>
            <h5 class="text-center section3-h5"><?php echo nl2br($options['top_content3_banner_headline2']); ?></h5>
            <div class="text-justify desc2"><?php echo nl2br($options['top_content3_banner_body2']); ?></div>
            <?php if($options['top_content3_banner_url2']){ ?><a class="read-more romaji mobile-mt-0" href="<?php echo $options['top_content3_banner_url2']; ?>"><?php echo $options['top_content3_banner_btnlabel2']; ?></a><?php }; ?>
          </div>
          <div class="text-center col-sm-40" style="padding-left:30px;padding-right:30px;">
            <?php if($options['top_content3_banner_url3']){ ?><div class="circleimages"><a href="<?php echo $options['top_content3_banner_url3']; ?>"><img src="<?php echo $top_content3_banner_image3[0]; ?>"/></a></div><?php }else{ ?><div class="circleimages"><img src="<?php echo $top_content3_banner_image3[0]; ?>"/></div><?php }; ?>
            <h5 class="text-center section3-h5"><?php echo nl2br($options['top_content3_banner_headline3']); ?></h5>
            <div class="text-justify desc2"><?php echo nl2br($options['top_content3_banner_body3']); ?></div>
            <?php if($options['top_content3_banner_url3']){ ?><a class="read-more romaji mobile-mt-0" href="<?php echo $options['top_content3_banner_url3']; ?>"><?php echo $options['top_content3_banner_btnlabel3']; ?></a><?php }; ?>
          </div>
        </div>
      </div>
    </div>
  </div>

  <?php $top_main_image4 = wp_get_attachment_image_src($options['top_main_image4'], 'full'); ?>
  <div class="separator" data-parallax="scroll" data-speed="0.6" data-image-src="<?php echo $top_main_image4[0]; ?>">
    <div class="title">
      <div class="container">
        <div class="row">
          <div class="col-xs-120">
            <h4 class="liner"><?php echo $options['top_content4_headline']; ?></h4>
            <span class="lead romaji"><?php echo $options['top_content4_headline_sub']; ?></span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="main-content">
    <div class="section container">
      <div class="row">
          <?php $the_query = new WP_Query("post_type=post&posts_per_page=6&orderby=date&order=DESC"); ?>
          <?php if ( $the_query->have_posts() ) : ?>

            <?php /* Start the Loop */ ?>
            <?php while ( $the_query->have_posts() ) : $the_query->the_post(); ?>
            <div class="col-sm-40 top_content4_post"><?php get_template_part( 'content', get_post_format() ); ?></div>
            <?php endwhile; ?>

          <?php endif; ?>
       <?php if($options['top_content4_indexurl']) { ?><a href="<?php echo $options['top_content4_indexurl']; ?>" class="archives_btn"><?php if($options['top_content4_indexlabel']){ echo $options['top_content4_indexlabel']; }else{ _e('Blog Index', 'tcd-w'); }; ?></a><?php }; ?>
    </div><!-- close .row -->
  </div><!-- close .container -->
</div><!-- close .main-content -->

  <?php $top_main_image5 = wp_get_attachment_image_src($options['top_main_image5'], 'full'); ?>
  <div class="separator" data-parallax="scroll" data-speed="0.6" data-image-src="<?php echo $top_main_image5[0]; ?>">
    <div class="title">
      <div class="container">
        <div class="row">
          <div class="col-xs-120">
            <h4 class="liner"><?php echo $options['top_content5_headline']; ?></h4>
            <span class="lead romaji"><?php echo $options['top_content5_headline_sub']; ?></span>
          </div>
        </div>
      </div>
    </div>
  </div>


  <?php
    $top_content5_banner_image1 = wp_get_attachment_image_src($options['top_content5_banner_image1'], 'size2');
    $top_content5_banner_image2 = wp_get_attachment_image_src($options['top_content5_banner_image2'], 'size2');
    $top_content5_banner_image3 = wp_get_attachment_image_src($options['top_content5_banner_image3'], 'size2');
  ?>
  <div class="section container">
    <div class="row">

      <div class="col-sm-40 mobile-mb-40">
        <div class="text-left staff-interview">
         <?php if($options['top_content5_banner_url1']){ ;?><a href="<?php echo $options['top_content5_banner_url1']; ?>"><?php }; ?>
          <?php if($top_content5_banner_image1[0]){ ?><img class="full-width" style="border-radius:0; padding-bottom:15px" src="<?php echo $top_content5_banner_image1[0]; ?>"><?php }; ?>
          <p class="read_copy"><span style="color:#<?php echo $options['pickedcolor3']; ?>"><?php echo $options['top_content5_banner_headline1']; ?></span></p>
         <?php if($options['top_content5_banner_url1']): ?>
          <div class="text-left staff" style="background:#<?php echo $options['pickedcolor3']; ?>; color:white">
           <span class="department"><?php echo $options['top_content5_banner_btnlabel_sub1']; ?></span><br/>
           <span class="name"><?php echo $options['top_content5_banner_btnlabel1']; ?></span><span class="arrow_ico1"></span>
          </div>
        <?php endif; ?>
         <?php if($options['top_content5_banner_url1']){ ;?></a><?php }; ?>
        </div>
        <p class="text-left desc2"><?php echo $options['top_content5_banner_body1']; ?></p>
      </div>

      <div class="col-sm-40 mobile-mb-40">
        <div class="text-left staff-interview">
         <?php if($options['top_content5_banner_url2']){ ;?><a href="<?php echo $options['top_content5_banner_url2']; ?>"><?php }; ?>
          <?php if($top_content5_banner_image2[0]){ ?><img class="full-width" style="border-radius:0; padding-bottom:15px" src="<?php echo $top_content5_banner_image2[0]; ?>"><?php }; ?>
          <p class="read_copy"><span style="color:#<?php echo $options['pickedcolor4']; ?>"><?php echo $options['top_content5_banner_headline2']; ?></span></p>
           <?php if($options['top_content5_banner_url2']): ?>
          <div class="text-left staff" style="background:#<?php echo $options['pickedcolor4']; ?>; color:white">
           <span class="department"><?php echo $options['top_content5_banner_btnlabel_sub2']; ?></span><br/>
           <span class="name"><?php echo $options['top_content5_banner_btnlabel2']; ?></span><span class="arrow_ico1"></span>
          </div>
        <?php endif; ?>
         <?php if($options['top_content5_banner_url2']){ ;?></a><?php }; ?>
        </div>
        <p class="text-left desc2"><?php echo $options['top_content5_banner_body2']; ?></p>
      </div>

      <div class="col-sm-40">
        <div class="text-left staff-interview">
         <?php if($options['top_content5_banner_url3']){ ;?><a href="<?php echo $options['top_content5_banner_url3']; ?>"><?php }; ?>
          <?php if($top_content5_banner_image3[0]){ ?><img class="full-width" style="border-radius:0; padding-bottom:15px" src="<?php echo $top_content5_banner_image3[0]; ?>"><?php }; ?>
          <p class="read_copy"><span style="color:#<?php echo $options['pickedcolor5']; ?>"><?php echo $options['top_content5_banner_headline3']; ?></span></p>
           <?php if($options['top_content5_banner_url3']): ?>
          <div class="text-left staff" style="background:#<?php echo $options['pickedcolor5']; ?>; color:white">
           <span class="department"><?php echo $options['top_content5_banner_btnlabel_sub3']; ?></span><br/>
           <span class="name"><?php echo $options['top_content5_banner_btnlabel3']; ?></span><span class="arrow_ico1"></span>
          </div>
        <?php endif; ?>
         <?php if($options['top_content5_banner_url3']){ ;?></a><?php }; ?>
        </div>
        <p class="text-left desc2"><?php echo $options['top_content5_banner_body3']; ?></p>
      </div>

    </div>
  </div>


  <?php
    if($options['top_content6_contents']=='image'):
    $top_content6_banner_image1 = wp_get_attachment_image_src($options['top_content6_banner_image1'], 'circle1');
    $top_content6_banner_image2 = wp_get_attachment_image_src($options['top_content6_banner_image2'], 'circle1');
    $top_content6_banner_image3 = wp_get_attachment_image_src($options['top_content6_banner_image3'], 'circle1');
    $top_content6_banner_image4 = wp_get_attachment_image_src($options['top_content6_banner_image4'], 'circle1');
    $top_content6_banner_image5 = wp_get_attachment_image_src($options['top_content6_banner_image5'], 'circle1');
  ?>
  <div class="section container-fluid section6">
    <div class="row">
      <div id="carousel" class="carousel">
        <?php if($top_content6_banner_image1[0]){ ?><div class="col-xs-24"><?php if($options['top_content6_banner_url1']){ ?><a href="<?php echo $options['top_content6_banner_url1']; ?>"><?php }; ?><span class="carousel_images"><img src="<?php echo $top_content6_banner_image1[0]; ?>"></span><?php if($options['top_content6_banner_url1']){ ?></a><?php }; ?></div><?php }; ?>
        <?php if($top_content6_banner_image2[0]){ ?><div class="col-xs-24"><?php if($options['top_content6_banner_url2']){ ?><a href="<?php echo $options['top_content6_banner_url2']; ?>"><?php }; ?><span class="carousel_images"><img src="<?php echo $top_content6_banner_image2[0]; ?>"></span><?php if($options['top_content6_banner_url2']){ ?></a><?php }; ?></div><?php }; ?>
        <?php if($top_content6_banner_image3[0]){ ?><div class="col-xs-24"><?php if($options['top_content6_banner_url3']){ ?><a href="<?php echo $options['top_content6_banner_url3']; ?>"><?php }; ?><span class="carousel_images"><img src="<?php echo $top_content6_banner_image3[0]; ?>"></span><?php if($options['top_content6_banner_url3']){ ?></a><?php }; ?></div><?php }; ?>
        <?php if($top_content6_banner_image4[0]){ ?><div class="col-xs-24"><?php if($options['top_content6_banner_url4']){ ?><a href="<?php echo $options['top_content6_banner_url4']; ?>"><?php }; ?><span class="carousel_images"><img src="<?php echo $top_content6_banner_image4[0]; ?>"></span><?php if($options['top_content6_banner_url4']){ ?></a><?php }; ?></div><?php }; ?>
        <?php if($top_content6_banner_image5[0]){ ?><div class="col-xs-24"><?php if($options['top_content6_banner_url5']){ ?><a href="<?php echo $options['top_content6_banner_url5']; ?>"><?php }; ?><span class="carousel_images"><img src="<?php echo $top_content6_banner_image5[0]; ?>"></span><?php if($options['top_content6_banner_url5']){ ?></a><?php }; ?></div><?php }; ?>
      </div>
    </div>
  </div>
  <?php elseif($options['top_content6_contents']=='post'): ?>
  <?php
    $args = array('post_type' => 'post', 'orderby' =>$options['order_by'], 'numberposts' => $options['number_posts']);
    $recommend_post=get_posts($args);
    if ($recommend_post) {
  ?>
  <div class="section container-fluid section6">
    <div class="row">
      <div id="carousel" class="carousel">
        <?php foreach ($recommend_post as $post) : setup_postdata ($post); ?>
        <div class="col-xs-24"><a class="carousel_images" href="<?php the_permalink() ?>"><?php if ( has_post_thumbnail()) { echo the_post_thumbnail('staff_thumb'); } else { echo '<img src="'; bloginfo('template_url'); echo '/img/common/no_image9.gif">'; }; ?></a></div>
        <?php endforeach; wp_reset_query(); ?>
      </div>
    </div>
  </div>
  <?php }; ?>
  <?php endif; ?>


<?php get_footer(); ?>