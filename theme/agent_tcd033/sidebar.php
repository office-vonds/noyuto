    <div class="sidebar-padder">

      <?php do_action( 'before_sidebar' ); ?>

      <?php if(is_archive()): ?>
	      <?php if(is_active_sidebar('sidebar-2')) :
	        dynamic_sidebar( 'sidebar-2' );
	      endif; ?>
	  <?php else: ?>
	      <?php if(is_active_sidebar('sidebar-1')) :
	        dynamic_sidebar( 'sidebar-1' );
	      endif; ?>
	  <?php endif; ?>

    </div><!-- close .sidebar-padder -->