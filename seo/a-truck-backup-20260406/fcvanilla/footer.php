<footer>
        <div class="wrapper">
          <div class="footer-left"><a class="footer-logo" href="<?php echo home_url();?>/"><img src="<?php echo get_template_directory_uri();?>/img/common/footer_logo.png" width="150" height="107" alt="AT A-Truck" loading="lazy"></a>
            <div class="wrap-button"><a class="trans button-footer address" href="<?php echo home_url();?>/offices/"><span>お近くの営業所</span></a><a class="trans button-footer mail" href="<?php echo home_url();?>/contact/"><span>お問い合わせ</span></a></div>
          </div>
          <div class="footer-right">
            <ul class="list-menu-footer">
              <li class="detail-footer">
                <ul class="list-footer">
                  <li class="detail"><a class="trans" href="<?php echo home_url();?>/">ホーム</a></li>
                  <li class="detail"><a class="trans" href="<?php echo home_url();?>/rental/">レンタルについて</a>
                    <ul class="list-sub">
                      <li><a class="trans" href="<?php echo home_url();?>/rental/list/">レンタルトラック検索</a></li>
                      <li><a class="trans" href="<?php echo home_url();?>/number/">営業ナンバーレンタル</a></li>
                      <li><a class="trans" href="<?php echo home_url();?>/matching-lease/">マッチングリース</a></li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li class="detail-footer">
                <ul class="list-footer">
                  <li class="detail"><a class="trans" href="<?php echo home_url();?>/used/">中古車販売</a>
                    <ul class="list-sub">
                      <li><a class="trans" href="<?php echo home_url();?>/used/">中古車検索</a></li>
                      <li><a class="trans" href="<?php echo home_url();?>/used/coming-soon/">近日販売開始予定車</a></li>
                    </ul>
                  </li>
                  <li class="detail"><a class="trans" href="<?php echo home_url();?>/repair/">鈑金塗装</a></li>
                  <li class="detail"><a class="trans" href="<?php echo home_url();?>/parts/">中古パーツ</a></li>
                </ul>
              </li>
              <li class="detail-footer">
                <ul class="list-footer">
                  <li class="detail"><a class="trans" href="<?php echo home_url();?>/company/">企業情報</a>
                    <ul class="list-sub">
                      <li><a class="trans" href="<?php echo home_url();?>/company/">会社情報</a></li>
                      <li><a class="trans" href="<?php echo home_url();?>/offices/">営業所一覧</a></li>
                      <li><a class="trans" href="<?php echo home_url();?>/csr/">CSR活動</a></li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li class="detail-footer">
                <ul class="list-footer">
                  <li class="detail"><a class="trans" href="<?php echo home_url();?>/news/">お知らせ</a></li>
                  <li class="detail"><a class="trans" href="https://a-truck-recruit.com/" target="_blank" rel="noopener">採用情報</a></li>
<!--                  <li class="detail"><a class="trans" href="http://a-truck.recruit.style/" target="_blank" rel="noopener">採用情報</a></li> -->
                  <li class="detail"><a class="trans" href="<?php echo home_url();?>/contact/">お問い合わせ</a></li>
                </ul>
              </li>
            </ul><a class="privacy-policy" href="<?php echo home_url();?>/terms/">レンタカー約款・プライバシーポリシー</a>
          </div>
        </div>

	
        <div class="wrapper snsbtn-wrapper">
          <ul class="snsbtniti">
            <li><a href="https://twitter.com/atruck6" class="flowbtn6 fl_tw1" target="_blank" rel="noopener"><i class="fa-brands fa-square-x-twitter fa-4x"></i></a></li>
            <li><a href="https://www.instagram.com/a_truck_official/" class="flowbtn6 insta_btn6" target="_blank" rel="noopener"><i class="fab fa-instagram fa-4x"></i></a></li>
            <li><a href="https://www.facebook.com/%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE-A-TRUCK-102218874697166/" class="flowbtn6 fl_fb6" target="_blank" rel="noopener"><i class="fab fa-facebook-square fa-4x"></i></a></li>
            <li><a href="https://www.youtube.com/channel/UCOKMtXs2FXVj9-Ul8YwtGzw" class="flowbtn6 fl_yu6" target="_blank" rel="noopener"><i class="fab fa-youtube fa-4x"></i></a></li>
          </ul>
	    </div>
	
        <div class="copyright"><small>Copyright &copy; 2025 A-TRUCK Allrights Reserved.</small></div>
      </footer>
    </div>
    <?php if (is_post_type_archive("ucar") || is_singular("ucar") || is_page(21) ) { ?>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery.matchHeight/0.7.2/jquery.matchHeight-min.js?ver=0.7.2" id="matchHeight-js"></script>
    <?php } ?>
    <?php if (is_singular("rcar") || is_singular("ucar") ) { ?>
    <div class="print-container js-print-container"></div>
    <?php } ?>
		<?php wp_footer();?>

<!-- SaleceForce Account Engagement設定 -->
<script type='text/javascript'> piAId = '1070052'; piCId = '88408'; piHostname = 'go.a-truck.jp';
(function() { function async_load(){ var s = document.createElement('script'); s.type = 'text/javascript'; s.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + piHostname + '/pd.js'; var c = document.getElementsByTagName('script')[0]; c.parentNode.insertBefore(s, c); } if(window.attachEvent) { window.attachEvent('onload', async_load); } else { window.addEventListener('load', async_load, false); } })(); </script>



	</body>
</html>
