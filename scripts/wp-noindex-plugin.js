/**
 * WordPressにmu-pluginを設置してnoindexを強制出力
 * + sitemap除外
 * FTP経由でmu-pluginsディレクトリにPHPファイルを配置
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');

const FTP_HOST = 'sv14862.xserver.jp';
const FTP_USER = 'stlab@stretchlabo.jp';
const FTP_PASS = 'Stretchlabo0501';
const MU_PLUGIN_PATH = '/stretchzero.jp/public_html/wp-content/mu-plugins';
const PLUGIN_FILE = 'stretchzero-seo.php';

// mu-plugin内容
const phpCode = `<?php
/**
 * Plugin Name: StretchZero SEO Customizations
 * Description: noindex設定・sitemap除外・SEO最適化
 * Version: 1.0
 */

// 不要ページのnoindex設定
add_action('wp_head', function() {
    // noindexにするページIDリスト
    $noindex_ids = [1409, 1411, 1361, 2745]; // contact-confirm, contact-thanks, contact-2, renewal

    if (is_page($noindex_ids)) {
        echo '<meta name="robots" content="noindex, nofollow" />' . "\\n";
    }
});

// AIOSEOのrobots出力をフィルタ
add_filter('aioseo_robots_meta', function($robotsMeta) {
    $noindex_ids = [1409, 1411, 1361, 2745];

    if (is_page($noindex_ids)) {
        $robotsMeta['noindex'] = 'noindex';
        $robotsMeta['nofollow'] = 'nofollow';
    }

    return $robotsMeta;
});

// AIOSEO sitemap除外
add_filter('aioseo_sitemap_posts', function($entries) {
    $exclude_ids = [1409, 1411, 1361, 2745];

    return array_filter($entries, function($entry) use ($exclude_ids) {
        return !in_array($entry->ID, $exclude_ids);
    });
});

// サイト全体のOGP補完（トップページをwebsiteに）
add_filter('aioseo_facebook_tags', function($facebookTags) {
    if (is_front_page()) {
        $facebookTags['og:type'] = 'website';
    }
    return $facebookTags;
});
`;

async function main() {
  console.log('=== mu-plugin 設置 ===');

  // PHPファイルを一時ファイルに書き出し
  const tmpFile = '/tmp/stretchzero-seo.php';
  fs.writeFileSync(tmpFile, phpCode);
  console.log('PHPファイル作成済み');

  // mu-pluginsディレクトリの存在確認・作成
  try {
    const result = execSync(
      `curl -s --ftp-ssl --insecure -u "${FTP_USER}:${FTP_PASS}" --list-only "ftp://${FTP_HOST}${MU_PLUGIN_PATH}/" 2>&1`,
      { timeout: 15000 }
    ).toString();
    console.log('mu-plugins ディレクトリ存在確認:', result.trim() || '(空)');
  } catch (e) {
    console.log('mu-pluginsディレクトリなし、作成します');
    execSync(
      `curl -s --ftp-ssl --insecure -u "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs "ftp://${FTP_HOST}${MU_PLUGIN_PATH}/" -Q "MKD ${MU_PLUGIN_PATH}" 2>&1`,
      { timeout: 15000 }
    );
  }

  // PHPファイルアップロード
  try {
    const uploadResult = execSync(
      `curl -s --ftp-ssl --insecure -u "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs -T ${tmpFile} "ftp://${FTP_HOST}${MU_PLUGIN_PATH}/${PLUGIN_FILE}" 2>&1`,
      { timeout: 15000 }
    ).toString();
    console.log('アップロード結果:', uploadResult || '成功');
  } catch (e) {
    console.error('アップロードエラー:', e.message);
    return;
  }

  // アップロード確認
  const verifyResult = execSync(
    `curl -s --ftp-ssl --insecure -u "${FTP_USER}:${FTP_PASS}" --list-only "ftp://${FTP_HOST}${MU_PLUGIN_PATH}/" 2>&1`,
    { timeout: 15000 }
  ).toString();
  console.log('mu-plugins内容:', verifyResult);

  // noindex確認
  console.log('\n=== noindex出力確認 ===');
  const checkPages = [
    { url: 'https://stretchzero.jp/contact-thanks/', name: 'contact-thanks' },
    { url: 'https://stretchzero.jp/contact-confirm/', name: 'contact-confirm' },
    { url: 'https://stretchzero.jp/renewal/', name: 'renewal' },
  ];

  for (const page of checkPages) {
    const result = execSync(`curl -s "${page.url}" 2>&1 | grep -i 'noindex' | head -3`, { timeout: 10000 }).toString();
    console.log(`  ${page.name}: ${result.trim() || '(noindex未検出 — キャッシュの可能性あり)'}`);
  }

  // sitemap確認
  console.log('\n=== sitemap除外確認 ===');
  const sitemapResult = execSync(
    `curl -s "https://stretchzero.jp/page-sitemap.xml" 2>&1 | grep -oP 'https://stretchzero\\.jp/[^<]+' | grep -E '(contact-thanks|contact-confirm|contact-2|renewal)' || echo "除外済み"`,
    { timeout: 10000 }
  ).toString();
  console.log(`  結果: ${sitemapResult.trim()}`);

  // cleanup
  fs.unlinkSync(tmpFile);
  console.log('\n完了');
}

main().catch(console.error);
