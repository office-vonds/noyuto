<?php
	$showForm = false;
	if(get_post_meta($post->ID,'page_main_image',true)) {
		if(is_mobile()){
			if(get_post_meta($post->ID, 'page_main_image_mobile', true)){
				$value = get_post_meta($post->ID, 'page_main_image_mobile', true);
			}else{
				$value = get_post_meta($post->ID, 'page_main_image', true);
			}
			$image = wp_get_attachment_image_src($value, 'full');
		}else{
			$value = get_post_meta($post->ID, 'page_main_image', true);
			$image = wp_get_attachment_image_src($value, 'full');
		};
	}else{
		if(has_post_thumbnail()){
			$value = get_post_thumbnail_id($post->ID);
			$image = wp_get_attachment_image_src($value, 'full');
		}else{
			$image = false;
		};
	};
?>

<?php if($image): ?>
<div class="container-fluid">
  <div class="row">
		<div class="col-xs-120 page-splash hidden-xs" data-parallax="scroll" data-image-src="<?php echo $image[0]; ?>"></div>
		<div class="col-xs-120 visible-xs" style="padding:0; height:300px; background-image:url(<?php echo $image[0]; ?>); background-size:cover; background-repeat: no-repeat; background-position:center center;"></div>
  </div>
</div>
<?php endif; ?>

<div class="container" style="<?php if(!$image){ echo 'margin-top:215px;'; } else { echo 'margin-top:50px;'; } ?> background:white">
  <?php get_template_part('breadcrumb'); ?>
	<div class="row">
		<div class="col-sm-80">
			<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
				<header>
					<h2 class="page-title"><?php the_title(); ?></h2>
				</header><!-- .entry-header -->

				<div class="entry-content">
					<div class="entry-content-thumbnail">
						<?php the_post_thumbnail(); ?>
					</div>
					<?php the_content(); ?>
					<?php custom_wp_link_pages(); ?>
				</div><!-- .entry-content -->
			</article><!-- #post-## -->

			<?php if( $showForm ) : ?>
				<div ng-app="optionsApp" ng-controller="FormCtrl">
					<h2 class="text-center" ng-show="completed">Message sent. Thank you.</h2>
					<div id="conversion"></div>
					<form ng-submit="confirmForm()" style="table-layout:fixed" ng-hide="completed">
						<table class="table table-bordered">
							<tr>
								<td class="text-center" colspan="2"><?php echo addslashes($options['contact_form_title']); ?></td>
							</tr>
							<tr ng-repeat="row in formObj">

								<td style="width:20%" class="text-center">
									<span>{{row.title}}<span ng-if=" row.required == '1' " class="text-danger">&nbsp;*</span></span>
								</td>

								<td ng-hide="confirm">
									<input class="form-control" type="text" ng-if=" row.type == 'text' " ng-model="row.answer" ng-required=" row.required == '1' " />
									<textarea class="form-control" ng-if=" row.type == 'textarea' " ng-model="row.answer" ng-required=" row.required == '1' "></textarea>
									<fieldset>
										<div style="display:inline-block" ng-repeat="option in row.options">
											<input type="radio" id="{{option}}" value="{{option}}" ng-model="row.answer" />&nbsp;&nbsp;<label for="{{option}}">{{option}}</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
										</div>
									</fieldset>
								</td>

								<td ng-show="confirm">{{ row.answer }}</td>

							</tr>
							<tr>

							<td class="text-right" colspan="2" ng-hide="confirm">
								<input type="submit" class="btn btn-primary" value="Confirm" />
							</td>

							<td class="text-right" colspan="2" ng-show="confirm">
								<button type="button" class="btn btn-default" ng-click="confirm = false">Cancel</button>
								<button type="button" class="btn btn-primary" ng-click="sendForm()">Send</button>
							</td>

							</tr>
						</table>
					</form>
				</div>

				<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular.min.js"></script>
				<script type="text/javascript">
					angular.module('optionsApp', []).controller('FormCtrl', function($scope, $http){

							$scope.formStr = "<?php echo addslashes($options['contact_form_json']); ?>"

							try{
								$scope.formObj = JSON.parse($scope.formStr)
							} catch(e) {
								$scope.formObj = []
							}

							$scope.confirmForm = function(){
								$scope.confirm = true
							}

							$scope.sendForm = function(){
								var str = "";

								$scope.formObj.forEach(function(row){
									str = str + row.title + ': ' + row.answer
									str = str + '\n----------\n'
								})

								$http({
									url: "<?php echo admin_url( 'admin-ajax.php' ); ?>",
									method: "POST",
									params: { action: "submit_form", data: str }
								}).then(function(res){
									$scope.completed = true
									jQuery("#conversion").html(res.data)
								})
							}

					})
				</script>
			<?php endif; ?>
		</div>

		<div class="col-sm-37 col-sm-offset-3">
			<?php get_sidebar(); ?>
		</div>
	</div>
</div>
