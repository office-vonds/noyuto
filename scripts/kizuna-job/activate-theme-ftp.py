#!/usr/bin/env python3
"""
FTP経由でテーマを強制有効化 + フロントページ設定
mu-pluginsにPHPスクリプトを配置して自動実行
"""

import ftplib
import io

FTP_HOST = 'sv1092.wpx.ne.jp'
FTP_USER = 'kizuna-job.com'
FTP_PASS = 'kiryu0902'

# mu-pluginsに配置するPHP（1回実行後に自動削除）
ACTIVATE_PHP = '''<?php
/**
 * Plugin Name: Kizuna Theme Activator (auto-remove)
 * Description: Activates kizuna-job-theme and sets front page. Removes itself after execution.
 */

// テーマが存在するか確認
$theme = wp_get_theme('kizuna-job-theme');
if ($theme->exists()) {
    // テーマを有効化
    switch_theme('kizuna-job-theme');

    // フロントページ設定
    update_option('show_on_front', 'page');
    update_option('page_on_front', 90);

    // パーマリンク設定
    update_option('permalink_structure', '/%postname%/');
    flush_rewrite_rules();

    // 301リダイレクト用のオプションを追加（旧スラグ→新スラグ）
    $redirects = array(
        'fllow' => 'flow',
        'hosyo' => 'guarantee',
        'over30' => 'mature',
        'biginer' => 'beginner',
        'top' => '',
    );
    update_option('kizuna_old_slug_redirects', $redirects);
}

// このファイルを自動削除
unlink(__FILE__);
'''

REDIRECT_PHP = '''<?php
/**
 * Plugin Name: Kizuna Old Slug Redirects
 * Description: 301 redirect old page slugs to new ones
 */

add_action('template_redirect', function() {
    $redirects = get_option('kizuna_old_slug_redirects', array());
    if (empty($redirects)) return;

    $request = trim($_SERVER['REQUEST_URI'], '/');

    foreach ($redirects as $old => $new) {
        if ($request === $old || $request === $old . '/') {
            $target = home_url('/' . $new . '/');
            if (empty($new)) $target = home_url('/');
            wp_redirect($target, 301);
            exit;
        }
    }
});
'''

print(f'FTP接続中: {FTP_HOST}')
ftp = ftplib.FTP()
ftp.connect(FTP_HOST, 21, timeout=30)
ftp.login(FTP_USER, FTP_PASS)
ftp.encoding = 'utf-8'
print('接続成功')

# mu-pluginsディレクトリを作成
try:
    ftp.mkd('/wp-content/mu-plugins')
    print('mu-plugins ディレクトリ作成')
except:
    print('mu-plugins ディレクトリは既存')

# テーマ有効化スクリプトをアップロード
ftp.storbinary('STOR /wp-content/mu-plugins/kizuna-activate-theme.php', io.BytesIO(ACTIVATE_PHP.encode('utf-8')))
print('kizuna-activate-theme.php アップロード完了')

# リダイレクトスクリプトをアップロード
ftp.storbinary('STOR /wp-content/mu-plugins/kizuna-redirects.php', io.BytesIO(REDIRECT_PHP.encode('utf-8')))
print('kizuna-redirects.php アップロード完了')

ftp.quit()

print('\n次のアクセスでテーマが自動有効化されます。')
print('確認: curl -sI https://kizuna-job.com/')
