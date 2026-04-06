<?php get_header() ?>
<?php if (have_posts()) : while (have_posts()) : the_post(); $cat = get_the_category()[0]; ?>
<main>
  <div class="keyvisual">
    <div class="wrapper">
      <p class="title-keyvisual">お知らせ</p>
    </div>
  </div>
  <article class="article-news">
    <div class="wrapper-news">
      <div class="wrapper-title">
        <h1 class="title-news"><?php the_title(); ?></h1>
        <div class="category-time">
          <time class="time font-heebo" datetime="<?php echo get_the_date('Y-m-d'); ?>"><?php echo get_the_date(); ?></time><span>/</span><span class="category"><?php echo $cat->name; ?></span>
        </div>
      </div>
      <div class="post-content"><?php the_content(); ?></div>
      <div class="wrap-button"><a class="button-common is-blue trans" href="<?php echo home_url();?>/news/"><span>お知らせ一覧に戻る</span></a></div>
    </div>
  </article>
</main>
<?php endwhile; endif ?>
<?php get_footer() ?>