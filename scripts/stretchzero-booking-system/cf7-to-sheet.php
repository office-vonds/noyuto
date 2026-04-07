<?php
/**
 * Plugin Name: StretchZero Booking to Google Sheet
 * Description: CF7予約フォーム送信データをGoogleスプレッドシートに自動記録
 * Version: 1.0
 */

// CF7送信完了時にGoogleスプレッドシートにデータを送信
add_action('wpcf7_mail_sent', function($contact_form) {
    // 予約フォーム（ID:1354）のみ対象
    if ($contact_form->id() != 1354) return;

    $submission = WPCF7_Submission::get_instance();
    if (!$submission) return;

    $data = $submission->get_posted_data();

    // GAS Web AppのURL（後で設定）
    $gas_url = get_option('sz_gas_webhook_url', '');
    if (empty($gas_url)) return;

    // 送信データを整形
    $payload = array(
        'timestamp'  => current_time('Y-m-d H:i:s'),
        'name'       => sanitize_text_field($data['your-name'] ?? ''),
        'furigana'   => sanitize_text_field($data['your-furigana'] ?? ''),
        'tel'        => sanitize_text_field($data['your-tel'] ?? ''),
        'email'      => sanitize_email($data['your-email'] ?? ''),
        'store'      => sanitize_text_field($data['your-store'] ?? ''),
        'course'     => sanitize_text_field($data['your-course'] ?? ''),
        'date1'      => sanitize_text_field($data['your-date1'] ?? ''),
        'time1'      => sanitize_text_field($data['your-time1'] ?? ''),
        'date2'      => sanitize_text_field($data['your-date2'] ?? ''),
        'time2'      => sanitize_text_field($data['your-time2'] ?? ''),
        'date3'      => sanitize_text_field($data['your-date3'] ?? ''),
        'time3'      => sanitize_text_field($data['your-time3'] ?? ''),
        'message'    => sanitize_textarea_field($data['your-message'] ?? ''),
        'status'     => '仮予約',
        'source'     => '自社サイト',
    );

    // GAS Web Appに非同期POST
    wp_remote_post($gas_url, array(
        'timeout'  => 5,
        'blocking' => false,
        'body'     => json_encode($payload, JSON_UNESCAPED_UNICODE),
        'headers'  => array('Content-Type' => 'application/json'),
    ));
});

// 管理画面にGAS URL設定欄を追加
add_action('admin_menu', function() {
    add_options_page(
        'ストレッチゼロ 予約連携設定',
        'SZ予約連携',
        'manage_options',
        'sz-booking-settings',
        function() {
            if (isset($_POST['sz_gas_url_nonce']) && wp_verify_nonce($_POST['sz_gas_url_nonce'], 'sz_gas_url')) {
                update_option('sz_gas_webhook_url', esc_url_raw($_POST['sz_gas_webhook_url']));
                echo '<div class="updated"><p>保存しました。</p></div>';
            }
            $url = get_option('sz_gas_webhook_url', '');
            ?>
            <div class="wrap">
                <h1>ストレッチゼロ 予約連携設定</h1>
                <form method="post">
                    <?php wp_nonce_field('sz_gas_url', 'sz_gas_url_nonce'); ?>
                    <table class="form-table">
                        <tr>
                            <th>GAS Web App URL</th>
                            <td>
                                <input type="url" name="sz_gas_webhook_url" value="<?php echo esc_attr($url); ?>" class="regular-text" style="width:100%">
                                <p class="description">Google Apps ScriptのデプロイURLを入力してください。</p>
                            </td>
                        </tr>
                    </table>
                    <?php submit_button('保存'); ?>
                </form>
            </div>
            <?php
        }
    );
});
