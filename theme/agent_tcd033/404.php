<?php
$showBorder = true;
$options = get_desing_plus_option();

get_header(); ?>

  <div class="main-content">
    <div class="container single_wrap">
      <?php get_template_part('breadcrumb'); ?>
      <div class="row">
        <div class="main-content-inner col-sm-80">
            <div class="row">
                <div class="col-sm-60 archive_post">
                  <h2>404 Not Found</h2>
                  <p><?php _e("Sorry, but you are looking for something that isn't here.", 'tcd-w');  ?></p>
                </div>
            </div>
      </div>
      <div class="col-sm-37 col-sm-offset-3">
        <?php get_sidebar(); ?>
      </div>
    </div>
  </div>
</div>
<?php get_footer(); ?>
