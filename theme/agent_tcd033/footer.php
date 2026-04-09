<?php $options = get_desing_plus_option(); ?>

  <?php $footer_image = wp_get_attachment_image_src($options['footer_image'], 'full'); ?>
  <div class="recruit-splash" data-parallax="scroll" data-speed="0.6" data-image-src="<?php echo $footer_image[0]; ?>">
    <div class="container section section-small" style="overflow:hidden;">
      <div class="row">
        <div class="col-xs-120 text-center">
          <h2 class="recruit-splash-h2 smaller-mobile-h2"><?php echo $options['footer_headline']; ?></h2>
          <?php if($options['footer_url']){ ?><a class="link-button-azure_btm big" style="margin-top:24px" href="<?php echo $options['footer_url']; ?>"><span class="btn_lavel"><?php echo $options['footer_btnlabel']; ?></span><span class="arrow_ico2"></span></a><?php }; ?>
        </div>
      </div>
    </div>
  </div>

<div class="section container-fluid"<?php if(is_mobile()){ echo ' style="padding-bottom:0 !important;"';}; ?>>
  <div class="row">
    <?php $footer_logo = wp_get_attachment_image_src($options['footer_logo'], 'full'); ?>
    <?php if($footer_logo[0]){ ?><div class="col-xs-120"><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><img src="<?php echo $footer_logo[0]; ?>" alt="<?php bloginfo('name'); ?>" title="<?php bloginfo('name'); ?>" width="<?php echo $footer_logo[1]; ?>" height="<?php echo $footer_logo[2]; ?>" class="footer_logo"></a></div><?php }; ?>
    <div class="col-xs-120 footer-menu">
      <?php wp_nav_menu(
        array(
          'theme_location'    => 'footer-menu',
          'depth'             => 1,
          'container'         => 'div',
          'container_class'   => 'collapse navbar-collapse',
          'menu_class'        => 'nav navbar-nav',
          'fallback_cb'       => 'wp_bootstrap_navwalker::fallback',
          'menu_id'           => 'footer-menu',
          'walker'            => new wp_bootstrap_navwalker()
        )
      ); ?>
    </div>

    <?php
      if (is_mobile() && is_active_sidebar('mobile_footer_widget')) {
        echo '      <div class="col-xs-120 footer_menu_mobile">';
        dynamic_sidebar('mobile_footer_widget');
        echo '      </div>';
      }
    ?>

    <?php if(is_mobile()){ ?>
      <!-- social button -->
      <?php if ($options['show_rss'] or $options['twitter_url'] or $options['facebook_url'] or $options['insta_url'] or $options['pinterest_url'] or $options['flickr_url'] or $options['tumblr_url']) { ?>
      <div class="col-xs-120">
       <ul class="user_sns clearfix" id="footer_social_link">
          <?php if(($options['twitter_url'])): ?><li class="twitter"><a href="<?php esc_attr_e($options['twitter_url']) ?>" target="_blank"><span>Twitter</span></a></li><?php endif; ?>
          <?php if(($options['facebook_url'])): ?><li class="facebook"><a href="<?php esc_attr_e($options['facebook_url']) ?>" target="_blank"><span>Facebook</span></a></li><?php endif; ?>
          <?php if(($options['insta_url'])): ?><li class="insta"><a href="<?php esc_attr_e($options['insta_url']) ?>" target="_blank"><span>Instagram</span></a></li><?php endif; ?>
          <?php if(($options['pinterest_url'])): ?><li class="pint"><a href="<?php esc_attr_e($options['pinterest_url']) ?>" target="_blank"><span>Pinterest</span></a></li><?php endif; ?>
          <?php if(($options['flickr_url'])): ?><li class="flickr"><a href="<?php esc_attr_e($options['flickr_url']) ?>" target="_blank"><span>Flickr</span></a></li><?php endif; ?>
          <?php if(($options['tumblr_url'])): ?><li class="tumblr"><a href="<?php esc_attr_e($options['tumblr_url']) ?>" target="_blank"><span>Tumblr</span></a></li><?php endif; ?>
          <?php if(($options['show_rss'])): ?><li class="rss"><a href="<?php bloginfo('rss2_url'); ?>" target="_blank"><span>RSS</span></a></li><?php endif; ?>
       </ul>
      </div>
      <?php }; ?>
    <?php }; ?>
  </div>
</div>

<div class="text-center returntop">
	<a href="#verytop"<?php if ( is_mobile()&&($options['footer_bar_display']==1||$options['footer_bar_display']==2) ) { echo ' style="bottom:72px;"'; }; ?>><span></span></a>
</div>

<div style="background:black; <?php if ( is_mobile()&&($options['footer_bar_display']==1||$options['footer_bar_display']==2) ) { echo ' padding-bottom:72px;'; }; ?>">
	<div class="container">
		<div class="row">
      <?php if(!is_mobile()){ ?>
			<div class="col-sm-30 text-right col-sm-push-90">
        <?php if($options['facebook_url']){ ?><a href="<?php echo $options['facebook_url']; ?>"><img src="<?php bloginfo('template_url'); ?>/images/facebook.png" class="social-icon"></a><?php }; ?>
        <?php if($options['twitter_url']){ ?><a href="<?php echo $options['twitter_url']; ?>"><img src="<?php bloginfo('template_url'); ?>/images/twitter.png" class="social-icon"></a><?php }; ?>
        <?php if($options['show_rss']){ ?><a class="target_blank" href="<?php bloginfo('rss2_url'); ?>"><img src="<?php bloginfo('template_url'); ?>/images/rss.png" class="social-icon"></a><?php }; ?>
			</div>
      <?php }; ?>
      <div class="col-sm-offset-30 col-sm-60 col-sm-pull-30 text-center romaji copyright">Copyright <?php echo date("Y"); ?> <?php bloginfo('name'); ?></div>
		</div>
	</div>
</div>

<?php
      // footer menu for mobile device
      if( is_mobile()&&($options['footer_bar_display']=='type1'||$options['footer_bar_display']=='type2') ) get_template_part('footer-bar/footer-bar');
?>

<?php wp_footer(); ?>

<script type="text/javascript">
	(function($){

    equalheight=function(t){var i,e=0,h=0,r=new Array;$(t).each(function(){if(i=$(this),$(i).height("auto"),topPostion=i.position().top,h!=topPostion){for(currentDiv=0;currentDiv<r.length;currentDiv++)r[currentDiv].height(e);r.length=0,h=topPostion,e=i.height(),r.push(i)}else r.push(i),e=e<i.height()?i.height():e;for(currentDiv=0;currentDiv<r.length;currentDiv++)r[currentDiv].height(e)})};

    <?php if( !is_mobile() ) : ?>
      $('ul.nav li.dropdown, ul.nav li.dropdown-submenu').hover(function() {
    		$(this).find(' > .dropdown-menu').stop(true, true).delay(200).fadeIn();
    	}, function() {
    		$(this).find(' > .dropdown-menu').stop(true, true).delay(200).fadeOut();
    	})
  	<?php endif; ?>


var doHeightAsViewport = function(){
    $('.heightasviewport').css('height', $(window).height())
  }

    function fixStuff() {
      jQuery(".heightaswidth").each(function(){
        $(this).css('height', $(this).outerWidth())
      })
    }

    fixStuff();
    doHeightAsViewport();

    setInterval(fixStuff, 1000)
    setInterval(doHeightAsViewport, 300)

    equalheight('.equal-height');

    $(".verticalcenter").each(function(){
      var center = ($(this).parent().outerHeight() / 2) - parseInt($(this).parent().css('padding-top'))
      var size = $(this).outerHeight() / 2

      $(this).css('padding-top', center - size)
    })
    

    var cursor = 0
    var slides = $(".splash-image")
    slides.hide()

    var newSlide = function(){
      if( cursor >= slides.length ){
        cursor = 0
      }

      if (slides.length!=1){
        slides.fadeOut('slow')
      }
      $(slides[cursor]).fadeIn('slow')

      cursor++;
    }

    setInterval(newSlide, 3000)
    newSlide()

		$("#agent-splash-text").removeClass('translated-right')
		$("#next-button").removeClass('opaque')

    $("a[href*=#]:not([href=#])").click(function(){if(location.pathname.replace(/^\//,"")==this.pathname.replace(/^\//,"")&&location.hostname==this.hostname){var e=jQuery(this.hash);if(e=e.length?e:jQuery("[name="+this.hash.slice(1)+"]"),e.length)return jQuery("html,body").animate({scrollTop:e.offset().top},1e3),!1}});

    // setTimeout(function(){
    //   if( $('.navbar-collapse').first().hasClass('in') ){
    //     $(".navbar-toggle").trigger("click") 
    //   }
    // }, 300)
    
    if( $(window).width() < 1200 ){
      $(".navbar-toggle").click(function(){
        setTimeout(function(){
          $(".menu-item").addClass('open')  
        }, 300)
      })
    }
    
    $(".menu-item").click(function(){ })
    
    $(".menu-item a").click(function(){
      if( !$(this).attr('href') ){
        return false
      }
    })

  window.onpageshow = function(event) {
    if (event.persisted) {
      window.location.reload() 
    }
  }

	})(jQuery)

</script>

 <?php if(is_single()) { ?>
 <!-- facebook share button code -->
 <div id="fb-root"></div>
 <script>
 (function(d, s, id) {
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) return;
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v2.5";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
 </script>
 <?php }; ?>

</body>
</html>
