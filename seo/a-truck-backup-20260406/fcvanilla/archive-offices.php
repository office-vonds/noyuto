<?php
remove_filter('the_content', 'wpautop');
remove_filter('the_excerpt', 'wpautop');
?>
<?php get_header() ?>
<?php $list = array(); if (have_posts()) : while (have_posts()) : the_post() ?>
<?php
  $place = get_field('place');
  if(!isset($list[$place])) $list[$place] = array();
  $list[$place][] = get_the_ID();
?>
<?php endwhile; endif ?>
<main>
    <div class="keyvisual">
        <div class="wrapper">
            <h1 class="title-keyvisual">支店・営業所一覧</h1>
        </div>
    </div>
    <div class="section-offices">
        <div class="wrapper-offices">
            <div class="search-offices">
                <h2 id="rental-offices" class="title-offices">営業所検索</h2>
                <div class="search-map">
                    <div id="office-map"></div>
                    <div class="search-menu-wrapper">
                        <div id="search-hokkaido" class="search-menu">
                            <button class="search-close-button">×</button>
                            <ul class="list-sub-offices">
                                <li class="detail">
                                    <div class="content-left">
                                        <h3 class="title">サテライト東北</h3><a class="telephone" href="tel:022-369-3995">TEL：022-369-3995</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/satellite_tohoku/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:022-369-3995"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒989-3124 宮城県仙台市青葉区上愛子字街道42-3</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">北海道・青森県･岩手県・秋田県・宮城県・山形県</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div id="search-tohoku" class="search-menu">
                            <button class="search-close-button">×</button>
                            <ul class="list-sub-offices">
                                <li class="detail">
                                    <div class="content-left">
                                        <h3 class="title">サテライト東北</h3><a class="telephone" href="tel:022-369-3995">TEL：022-369-3995</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/satellite_tohoku/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:022-369-3995"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒984-0032 宮城県仙台市青葉区上愛子字街道42-3</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">北海道・青森県･岩手県・秋田県・宮城県・山形県</p>
                                    </div>
                                </li>
                                <li id="サテライト長岡" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">サテライト長岡</h3><a class="telephone" href="tel:0258-23-2600">TEL：0258-23-2600</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/satellite_nagaoka/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:0258-23-2600"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒940-1146                                    新潟県長岡市下条町79-2</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">新潟県・長野県・富山県・福島県</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div id="search-kanto" class="search-menu">
                            <button class="search-close-button">×</button>
                            <ul class="list-sub-offices">
                                <li id="首都圏支店" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">首都圏支店</h3><a class="telephone" href="tel:047-407-1552">TEL：047-407-1552</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/syutoken/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:047-407-1552"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒274-0817                                    千葉県船橋市高根町1706</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">東京23区･千葉県･茨城県･その他全国地域</p>
                                    </div>
                                </li>
                                <li id="北関東支店" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">北関東支店</h3><a class="telephone" href="tel:04-2946-9830">TEL：04-2946-9830</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/kitakantou/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:04-2946-9830"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒359-0012                                    埼玉県所沢市坂之下687-1</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">東京都多摩地域･埼玉県･群馬県･栃木県<br><font size="2">＊南多摩5市（八王子市・町田市・日野市・多摩市・稲城市）は神奈川支店の対応エリアとなります</font></p>                            
									</div>
                                </li>
                                <li id="神奈川支店" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">神奈川支店</h3><a class="telephone" href="tel:042-711-9682">TEL：042-711-9682</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/kanagawa/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:042-711-9682"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒252-0335                                    神奈川県相模原市南区下溝307-7</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">神奈川県･東京都南多摩地域･山梨県･静岡県東部および中部(静岡市･藤枝市等)<br><font size="2">＊南多摩地域は八王子市・町田市・日野市・多摩市・稲城市となります</font></p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div id="search-chubu" class="search-menu">
                            <button class="search-close-button">×</button>
                            <ul class="list-sub-offices">
                                <li id="神奈川支店" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">神奈川支店</h3><a class="telephone" href="tel:042-711-9682">TEL：042-711-9682</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/kanagawa/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:042-711-9682"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒252-0335                                    神奈川県相模原市南区下溝307-7</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">神奈川県･東京都南多摩地域･山梨県･静岡県東部および中部(静岡市･藤枝市等)<br><font size="2">＊南多摩地域は八王子市・町田市・日野市・多摩市・稲城市となります</font></p>
                                    </div>
                                </li>
                                <li id="名古屋支店" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">名古屋支店</h3><a class="telephone" href="tel:0567-68-1970">TEL：0567-68-1970</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/nagoya/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:0567-68-1970"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒498-0064                                    愛知県弥富市西末広4-57</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">東海地方･石川県･福井県･静岡県西部(浜松市･掛川市等)</p>
                                    </div>
                                </li>
                                <li id="サテライト長岡" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">サテライト長岡</h3><a class="telephone" href="tel:0258-23-2600">TEL：0258-23-2600</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/satellite_nagaoka/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:0258-23-2600"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒940-1146                                    新潟県長岡市下条町79-2</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">新潟県・長野県・富山県・福島県</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div id="search-kinki" class="search-menu">
                            <button class="search-close-button">×</button>
                            <ul class="list-sub-offices">
                                <li id="大阪支店" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">大阪支店</h3><a class="telephone" href="tel:072-886-1301">TEL：072-886-1301</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/osaka/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:072-886-1301"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒571-0024                                    大阪府門真市野口875-1</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">関西地方(福井県を含まない)･中国地方東部(岡山県･鳥取県)･四国地方</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div id="search-chugoku" class="search-menu">
                            <button class="search-close-button">×</button>
                            <ul class="list-sub-offices">
                                <li id="大阪支店" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">大阪支店</h3><a class="telephone" href="tel:072-886-1301">TEL：072-886-1301</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/osaka/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:072-886-1301"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒571-0024                                    大阪府門真市野口875-1</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">関西地方(福井県を含まない)･中国地方東部(岡山県･鳥取県)･四国地方</p>
                                    </div>
                                </li>
                                <li id="九州支店" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">九州支店</h3><a class="telephone" href="tel:093-482-2091">TEL：093-482-2091</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/kyushu/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:093-482-2091"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒800-0212                                    福岡県北九州市小倉南区曽根4370-1</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">九州地方･中国地方西部(山口県･広島県･島根県)</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div id="search-shikoku" class="search-menu">
                            <button class="search-close-button">×</button>
                            <ul class="list-sub-offices">
                                <li id="大阪支店" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">大阪支店</h3><a class="telephone" href="tel:072-886-1301">TEL：072-886-1301</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/osaka/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:072-886-1301"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒571-0024                                    大阪府門真市野口875-1</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">関西地方(福井県を含まない)･中国地方東部(岡山県･鳥取県)･四国地方</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div id="search-kyusyu" class="search-menu">
                            <button class="search-close-button">×</button>
                            <ul class="list-sub-offices">
                                <li id="九州支店" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">九州支店</h3><a class="telephone" href="tel:093-482-2091">TEL：093-482-2091</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/kyushu/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:093-482-2091"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒800-0212                                    福岡県北九州市小倉南区曽根4370-1</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">九州地方･中国地方西部(山口県･広島県･島根県)</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div id="search-okinawa" class="search-menu">
                            <button class="search-close-button">×</button>
                            <ul class="list-sub-offices">
                                <li id="沖縄支店" class="detail">
                                    <div class="content-left">
                                        <h3 class="title">沖縄支店</h3><a class="telephone" href="tel:098-851-7810">TEL：098-851-7810</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn" href="https://www.a-truck.jp/offices/okinawa/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans tellnkbtn" href="tel:098-851-7810"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒901-0302                                    沖縄県糸満市潮平787-6 ネオックス潮平103</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">沖縄本島</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div id="search-jigyobu" class="search-menu">
                            <button class="search-close-button">×</button>
                            <ul class="list-sub-offices">
                                <li id="売買事業部" class="detail">
                                    <div class="content-left">
                                        <h2 class="title">売買事業部</h2><a class="telephone" href="tel:047-407-1552">TEL：047-407-1552</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans" href="https://www.a-truck.jp/offices/head/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans" href="tel:047-407-1552"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒274-0817                                    千葉県船橋市高根町1706</address>
                                        <span class="mail-area">対応エリア</span>
                                        <p class="text">全国地域</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div id="search-repair" class="search-menu">
                            <button class="search-close-button">×</button>
                            <ul class="list-sub-offices">
                                <li id="市川R＆Cセンター" class="detail">
                                    <div class="content-left">
                                        <h2 class="title">市川R＆Cセンター</h2><a class="telephone" href="tel:047-303-3902">TEL：047-303-3902</a>
                                        <div class="wrap-button"><a class="button-common is-blue trans" href="https://www.a-truck.jp/offices/ichikawa/"><span>店舗詳細</span></a></div>
                                        <br>
                                        <div class="wrap-button"><a class="button-common is-red trans" href="tel:047-303-3902"><span>電話をかける</span></a></div>
                                    </div>
                                    <div class="content-right">
                                        <address class="address">〒272-0004                                    千葉県市川市原木3-18-6</address>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <ul class="list-offices">
                <li class="detail-offices">
                    <h2 id="rental-offices" class="title-offices">レンタル拠点</h2>
                    <ul class="list-sub-offices">
                        <?php foreach($list['レンタル拠点'] as $pid): ?>
						<?php $calendar_sw = get_field('calendar_sw',$pid); ?>
                        <li id="<?php echo get_the_title($pid); ?>" class="detail">
                            <div class="content-left">
                                <h3 class="title"><?php echo get_the_title($pid); ?></h3><a class="telephone"
                                    href="tel:<?php the_field('tel',$pid); ?>">TEL：<?php the_field('tel',$pid); ?></a>
                                <div class="wrap-button"><a class="button-common is-blue trans dtllnkbtn"
                                        href="<?php echo get_the_permalink($pid); ?>"><span>店舗詳細</span></a></div>
                                <br>
                                <div class="wrap-button"><a class="button-common is-red trans tellnkbtn"
                                        href="tel:<?php the_field('tel',$pid); ?>"><span>電話をかける</span></a></div>
                            </div>
							<?php if($calendar_sw == '表示する'): ?>
                            <div class="content-right">
							<?php else: ?>
							<div class="content-right calendar_no">
							<?php endif; ?>
                                <address class="address">〒<?php the_field('zip',$pid); ?>
                                    <?php the_field('address',$pid); ?></address>
                                <?php if(get_field('area',$pid)): ?><span class="mail-area">対応エリア</span>
                                <p class="text"><?php the_field('area',$pid); ?></p><?php endif; ?>
                            </div>
							<?php if($calendar_sw == '表示する'): ?>
                            <div class="calenderArea">
                                    <?php
									$current_slug = get_post_field('post_name', $pid);
                                    if($current_slug == 'satellite_tohoku'){
                                        $current_slug = 's-tohoku'; 
                                    }elseif($current_slug == 'satellite_nagaoka'){
                                        $current_slug = 's-nagaoka';  
                                    }                               
                                    $slug_with_holiday = $current_slug . '-holiday';
                                    $slug_with_tel = $current_slug . '-tel';
									$slug_with_fair = $current_slug . '-fair';
									echo do_shortcode('[xo_event_calendar holidays="'.$slug_with_fair.','.$slug_with_holiday.','.$slug_with_tel.'" previous="0" next="0" months="1"]');
                                    ?>
                            </div><!--/ .calenderArea -->
							<?php endif; ?>	
                        </li>
                        <?php endforeach; ?>
                    </ul>
                    <?php foreach($list['中古車・鈑金塗装'] as $pid): ?>
                        <?php if(get_the_title($pid) == "売買事業部"): ?>
                            <h2 id="ucar-offices" class="title-offices">中古車</h2>
                        <?php elseif(get_the_title($pid) == "市川R＆Cセンター"): ?>
                            <h2 id="repair-offices" class="title-offices">鈑金塗装</h2>
                        <?php endif; ?>
                        <ul class="list-sub-offices">
                        <?php $calendar_sw = get_field('calendar_sw',$pid); ?>
                            <li class="detail">
                                <div class="content-left">
                                    <h2 class="title"><?php echo get_the_title($pid); ?></h2><a class="telephone"
                                        href="tel:<?php the_field('tel',$pid); ?>">TEL：<?php the_field('tel',$pid); ?></a>
                                    <div class="wrap-button"><a class="button-common is-blue trans"
                                            href="<?php echo get_the_permalink($pid); ?>"><span>店舗詳細</span></a></div>
                                    <br>
                                    <div class="wrap-button"><a class="button-common is-red trans"
                                            href="tel:<?php the_field('tel',$pid); ?>"><span>電話をかける</span></a></div>
                                </div>
                                <?php if($calendar_sw == '表示する'): ?>
                                <div class="content-right">
							    <?php else: ?>
							    <div class="content-right calendar_no">
							    <?php endif; ?>
                                    <address class="address">〒<?php the_field('zip',$pid); ?>
                                        <?php the_field('address',$pid); ?></address>
                                    <?php if(get_field('area',$pid)): ?><span class="mail-area">対応エリア</span>
                                    <p class="text"><?php the_field('area',$pid); ?></p><?php endif; ?>
                                </div>
                                <?php if($calendar_sw == '表示する'): ?>
                                <div class="calenderArea">
                                    <?php
                                    $current_slug = get_post_field('post_name', $pid);
                                    $slug_with_holiday = $current_slug . '-holiday';
                                    $slug_with_tel = $current_slug . '-tel';
									$slug_with_fair = $current_slug . '-fair';
									echo do_shortcode('[xo_event_calendar holidays="'.$slug_with_fair.','.$slug_with_holiday.','.$slug_with_tel.'" previous="0" next="0" months="1"]');
                                    ?>
                                </div><!--/ .calenderArea -->
                                <?php endif; ?>	
                            </li>
                        </ul>
                    <?php endforeach; ?>

                    <!-- サテライト非表示 20221031
		  <h2 id="satellite-offices" class="title-offices">サテライト店</h2>
          <ul class="list-sub-offices">
            <?php foreach($list['サテライト'] as $pid): ?>
            <li class="detail">
              <div class="content-left">
                <h3 class="title"><?php echo get_the_title($pid); ?></h3><?php if(get_field('url',$pid)): ?><a class="is-underline" href="<?php the_field('url',$pid); ?>" target="_blank"><?php the_field('url_title',$pid); ?></a><?php endif; ?>
                <div class="wrap-button"><a class="button-common is-blue trans" href="<?php echo get_the_permalink($pid); ?>"><span>店舗詳細</span></a></div>
				<br>
				<div class="wrap-button"><a class="button-common is-red trans" href="tel:<?php the_field('tel',$pid); ?>"><span>電話をかける</span></a></div>
              </div>
              <div class="content-right">
                <address class="address">〒<?php the_field('zip',$pid); ?> <?php the_field('address',$pid); ?></address>
                <?php if(get_field('area',$pid)): ?><span class="mail-area">対応エリア</span>
                <p class="text"><?php the_field('area',$pid); ?></p><?php endif; ?>
              </div>
            </li>
            <?php endforeach; ?>
          </ul>
サテライト非表示 20221031 -->

                </li>
            </ul>
        </div>
    </div>
</main>
<?php get_footer() ?>