<?php $options = get_desing_plus_option(); ?>

<div class="section container-fluid">
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
  </div>
</div>

<div class="text-center returntop">
	<a href="#verytop"><span></span></a>
</div>

<div style="background:black">
	<div class="container">
		<div class="row">
			<div class="col-sm-30 text-right col-sm-push-90">
        <?php if($options['facebook_url']){ ?><a href="<?php echo $options['facebook_url']; ?>"><img src="<?php bloginfo('template_url'); ?>/images/facebook.png" class="social-icon"></a><?php }; ?>
        <?php if($options['twitter_url']){ ?><a href="<?php echo $options['twitter_url']; ?>"><img src="<?php bloginfo('template_url'); ?>/images/twitter.png" class="social-icon"></a><?php }; ?>
        <?php if($options['show_rss']){ ?><a class="target_blank" href="<?php bloginfo('rss2_url'); ?>"><img src="<?php bloginfo('template_url'); ?>/images/rss.png" class="social-icon"></a><?php }; ?>
			</div>
      <div class="col-sm-offset-30 col-sm-60 col-sm-pull-30 text-center romaji" style="color:white; height:60px; line-height:60px;">Copyright <?php echo date("Y"); ?> <?php bloginfo('name'); ?></div>
		</div>
	</div>
</div>

<?php wp_footer(); ?>

<script type="text/javascript">
	(function($){

    equalheight=function(t){var i,e=0,h=0,r=new Array;$(t).each(function(){if(i=$(this),$(i).height("auto"),topPostion=i.position().top,h!=topPostion){for(currentDiv=0;currentDiv<r.length;currentDiv++)r[currentDiv].height(e);r.length=0,h=topPostion,e=i.height(),r.push(i)}else r.push(i),e=e<i.height()?i.height():e;for(currentDiv=0;currentDiv<r.length;currentDiv++)r[currentDiv].height(e)})};


    if( $( window ).width() > 767 ){
      $('ul.nav li.dropdown, ul.nav li.dropdown-submenu').hover(function() {
    		$(this).find(' > .dropdown-menu').stop(true, true).delay(200).fadeIn();
    	}, function() {
    		$(this).find(' > .dropdown-menu').stop(true, true).delay(200).fadeOut();
    	})
  	}

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

      slides.fadeOut('slow')
      $(slides[cursor]).fadeIn('slow')

      cursor++;
    }

    setInterval(newSlide, 3000)
    newSlide()

		$("#agent-splash-text").removeClass('translated-right')
		$("#next-button").removeClass('opaque')

    $("a[href*=#]:not([href=#])").click(function(){if(location.pathname.replace(/^\//,"")==this.pathname.replace(/^\//,"")&&location.hostname==this.hostname){var e=jQuery(this.hash);if(e=e.length?e:jQuery("[name="+this.hash.slice(1)+"]"),e.length)return jQuery("html,body").animate({scrollTop:e.offset().top},1e3),!1}});

    $(".navbar-toggle").click(function(){
      setTimeout(function(){
        $(".menu-item").addClass('open')  
      }, 300)
    })
    
    $(".menu-item").click(function(){ })
    
    $(".menu-item a").click(function(){
      if( !$(this).attr('href') ){
        return false
      }
    })

	})(jQuery)
</script>

</body>
</html>
