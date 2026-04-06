<?php get_header() ?>
<?php if (have_posts()) : while (have_posts()) : the_post() ?>
<?php $calendar_sw = get_field('calendar_sw',$pid); ?>
<main>
	<div class="keyvisual">
		<div class="wrapper">
			<h1 class="title-keyvisual"><?php the_title(); ?></h1>
		</div>
	</div>
	<div class="information-store">
		<div class="wrapper">
			<div class="images_4_Wrapper">
			<?php
			$thumbnail_urls = array();
			// アイキャッチ画像のURLが存在するか確認して配列に追加
			$thumbnail_url = get_the_post_thumbnail_url();
			if ($thumbnail_url) {
				$thumbnail_urls[] = $thumbnail_url;
			}
			// カスタムフィールドの画像のURLが存在するか確認して配列に追加
			$fields = ['office_image_1', 'office_image_2', 'office_image_3', 'office_image_4'];
			foreach ($fields as $field) {
				$field_url = get_field($field);
				if ($field_url) {
					$thumbnail_urls[] = $field_url;
				}
			}
			?>
				<figure class="image-store">
				<?php
				if ($thumbnail_urls[0]) {
    				echo '<img id="mainImage" src="'.($thumbnail_urls[0]).'" alt="サムネイル1" />';
				}else{
    				echo '<img src="'.get_stylesheet_directory_uri().'/img/parts/no_image.png" />';
				}
				?>
				</figure>				
				<?php if(count($thumbnail_urls) > 1): ?>
				<div class="thumbnails">
					<?php if($thumbnail_urls[0]): ?><div><img src="<?php echo($thumbnail_urls[0]); ?>" alt="サムネイル1" class="thumbnail"></div><?php endif; ?>
					<?php if($thumbnail_urls[1]): ?><div><img src="<?php echo($thumbnail_urls[1]); ?>" alt="サムネイル2" class="thumbnail transparent"></div><?php endif; ?>
					<?php if($thumbnail_urls[2]): ?><div><img src="<?php echo($thumbnail_urls[2]); ?>" alt="サムネイル3" class="thumbnail transparent"></div><?php endif; ?>
					<?php if($thumbnail_urls[3]): ?><div><img src="<?php echo($thumbnail_urls[3]); ?>" alt="サムネイル4" class="thumbnail transparent"></div><?php endif; ?>
				</div><!-- .thumbnails -->
      			<?php endif; ?>
			</div><!-- .images_4_Wrapper -->
			<div class="content-store">
				<table class="table-information">
					<?php if(get_field('business_hour')): ?>
					<tr class="business-hours">
						<th>営業時間</th>
						<td><?php the_field('business_hour'); ?></td>
					</tr><?php endif; ?>
					<?php if(get_field('tel')): ?><tr>
						<th>お電話</th>
						<td><a class="telephone" href="tel:<?php the_field('tel'); ?>">TEL:<span><?php the_field('tel'); ?></span></a></td>
					</tr><?php endif; ?>
					<?php if(get_field('fax')): ?><tr class="fax">
						<th>FAX</th>
						<td>FAX:<?php the_field('fax'); ?></td>
					</tr><?php endif; ?>
					<?php if(get_field('access')): ?><tr class="access">
						<th>アクセス</th>
						<td><?php the_field('access'); ?></td>
					</tr><?php endif; ?>
				</table>
			</div><!-- .content-store -->
    	</div><!-- .wrapper -->
		<?php 
		$current_slug = get_post_field('post_name', get_post());
		if($calendar_sw == '表示する'):
		?>
		<div class="calenderArea">
		<?php
		
		if($current_slug == 'satellite_tohoku'){
			$current_slug = 's-tohoku'; 
		}elseif($current_slug == 'satellite_nagaoka'){
			$current_slug = 's-nagaoka';  
		}
		$slug_with_holiday = $current_slug . '-holiday';
		$slug_with_tel = $current_slug . '-tel';
		$slug_with_fair = $current_slug . '-fair';
		echo do_shortcode('[xo_event_calendar holidays="'.$slug_with_fair.','.$slug_with_holiday.','.$slug_with_tel.'" previous="0" next="0" months="2"]');
		?>
		</div><!--/ .calenderArea -->
		<?php endif; ?>
		<?php
		$args = array(
			'post_type' => 'office_news',//投稿タイプを指定します
			'post_status' => 'publish',
			'posts_per_page' => 5,
			'tax_query' => array(
				array(
					'taxonomy' => 'office_news_category', // 絞り込みたいタクソノミーを指定
					'field'    => 'slug', // タームのスラッグを使用
					'terms'    => $current_slug, // 絞り込みたいタームのスラッグを指定
				),
			),
		);
		$the_query = new WP_Query( $args );
		if ( $the_query->have_posts() ) :
		?>
		<div class="officeEventArea">
			<h2>お知らせ</h2>
			<?php
			while ( $the_query->have_posts() ) : $the_query->the_post();
				$event_summary = get_post_field('event_summary');
			?>
			<div class="newsSingleBox"><figure>
				<?php
				if ( has_post_thumbnail() ) {
    				the_post_thumbnail('full');
				}else{
    				echo '<img src="'.get_stylesheet_directory_uri().'/img/parts/no_image.png" />';
				}
				?>
				</figure>
				<div class="newsSingleBox_innr">
					<h3><a href="<?php the_permalink(); ?>">
					<?php 
						if(mb_strlen($post->post_title)>35) { 
							$title= mb_substr($post->post_title,0,35) ; echo $title. ･･･ ;
						} else {
							echo $post->post_title;
						}?>
					</a></h3>
					<?php
					if($event_summary):
  						echo '<p>'.($event_summary).'</p>';
					else :
						$excerpt = get_the_excerpt();
						// 抜粋の文字数を50文字に制限
						$limited_excerpt = mb_substr($excerpt, 0, 150);
						// 制限した抜粋の後に省略記号を追加する
						if (mb_strlen($excerpt) > 150) {
    						$limited_excerpt .= '...';
						}
						// 制限した抜粋を表示
						echo $limited_excerpt;
					endif ;
					?>
					<time></time>
					<p class="btn"><a href="<?php the_permalink(); ?>">詳細はこちら</a></p>
				</div><!--/ .newsSingleBox_innr  -->
			</div><!--/ .newsSingleBox  -->
			<?php
			endwhile;
			?>
		</div><!--/ .officeEventArea -->
		<?php
		endif;
		wp_reset_postdata();
		?>
	</div><!--/ .information-store -->
	<section class="section-access-map">
		<div class="wrapper">
			<?php if(get_field('iframe')): ?>
			<h2 class="section-title">アクセスマップ</h2>
			<address class="address">〒<?php the_field('zip'); ?> <?php the_field('address'); ?></address>
			<div class="wrap-map">
				<?php the_field('iframe'); ?>
			</div>
			<?php endif; ?>
			<div class="wrap-button"><a class="button-common is-blue trans" href="<?php echo home_url();?>/offices/"><span>店舗一覧に戻る</span></a></div>
		</div><!--/ .wrapper -->
	</section>
</main>
<?php endwhile; endif ?>
<?php get_footer() ?>