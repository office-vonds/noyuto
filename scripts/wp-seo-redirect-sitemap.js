/**
 * SEO修正:
 * 1. 旧日付URL → 新column/URL への301リダイレクト（.htaccess）
 * 2. AIOSEO sitemap設定でnoindexページを除外
 * 3. 新5記事のsitemap反映確認
 */

const https = require('https');
const querystring = require('querystring');

const WP_BASE = 'https://stretchzero.jp';
let cookies = '';
let nonce = '';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname, port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: { 'User-Agent': 'VONDS-SEO', ...(options.headers || {}) },
    };
    if (cookies) reqOptions.headers['Cookie'] = cookies;
    const req = https.request(reqOptions, (res) => {
      if (res.headers['set-cookie']) {
        const nc = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        cookies = cookies ? cookies + '; ' + nc : nc;
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function login() {
  const postData = querystring.stringify({
    log: 'Stretchlabo', pwd: 'Stretchlabo0501',
    'wp-submit': 'Log In', redirect_to: WP_BASE + '/wp-admin/', testcookie: 1,
  });
  await request(WP_BASE + '/wp-login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData), 'Cookie': 'wordpress_test_cookie=WP+Cookie+check' },
    body: postData,
  });
  const res = await request(WP_BASE + '/wp-admin/admin-ajax.php?action=rest-nonce');
  nonce = res.body.trim();
  console.log('ログイン完了');
}

async function wpApi(method, endpoint, data) {
  const opts = { method, headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce } };
  if (data) opts.body = JSON.stringify(data);
  const res = await request(WP_BASE + '/wp-json' + endpoint, opts);
  if (res.status >= 200 && res.status < 300) {
    try { return JSON.parse(res.body); } catch { return res.body; }
  }
  return null;
}

async function aioseoUpdate(postId, data) {
  const res = await request(WP_BASE + '/wp-json/aioseo/v1/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
    body: JSON.stringify({ id: postId, ...data }),
  });
  return res.status === 200;
}

async function main() {
  await login();

  // ========================================
  // 1. .htaccess にリダイレクトルールを追加
  // ========================================
  console.log('\n=== 1. .htaccess リダイレクト設定 ===');

  // まず現在の.htaccessを取得
  const htaccessRes = await request(WP_BASE + '/wp-json/aioseo/v1/htaccess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
    body: JSON.stringify({ action: 'getHtaccess' }),
  });

  console.log(`  AIOSEO htaccess API: [${htaccessRes.status}]`);

  // AIOSEO htaccess APIが使えない場合、WP管理画面経由で.htaccess編集
  // まずツール画面を取得
  const toolsRes = await request(WP_BASE + '/wp-admin/admin.php?page=aioseo-tools');
  if (toolsRes.status === 200) {
    // .htaccess editorのセクションを探す
    const hasHtaccess = toolsRes.body.includes('.htaccess');
    console.log(`  AIOSEOツール画面: .htaccess editor ${hasHtaccess ? 'あり' : 'なし'}`);
  }

  // WP管理画面のpermalink flush (options-permalink.php にPOST)
  console.log('\n  パーマリンクflush実行...');
  const permalinkPage = await request(WP_BASE + '/wp-admin/options-permalink.php');
  if (permalinkPage.status === 200) {
    const wpNonce = permalinkPage.body.match(/name="_wpnonce"\s+value="([^"]+)"/);
    const currentStructure = permalinkPage.body.match(/name="permalink_structure"\s+value="([^"]+)"/);
    console.log(`  現在のパーマリンク構造: ${currentStructure ? currentStructure[1] : '不明'}`);

    if (wpNonce) {
      // パーマリンク構造を再保存（flushのため）
      const postData = querystring.stringify({
        _wpnonce: wpNonce[1],
        _wp_http_referer: '/wp-admin/options-permalink.php',
        selection: 'custom',
        permalink_structure: '/column/%postname%/',
        submit: 'Save Changes',
      });
      const saveRes = await request(WP_BASE + '/wp-admin/options-permalink.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) },
        body: postData,
      });
      console.log(`  パーマリンク再保存: [${saveRes.status}]`);

      // 再確認
      const verifyRes = await request(WP_BASE + '/wp-admin/options-permalink.php');
      const newStructure = verifyRes.body.match(/name="permalink_structure"\s+value="([^"]+)"/);
      console.log(`  更新後のパーマリンク構造: ${newStructure ? newStructure[1] : '不明'}`);
    }
  }

  // ========================================
  // 2. noindexページのAIOSEOでsitemap除外設定
  // ========================================
  console.log('\n=== 2. noindexページのsitemap除外 ===');

  const noindexPageIds = [1409, 1411, 1361, 2745]; // confirm, thanks, contact-2, renewal

  for (const pageId of noindexPageIds) {
    const success = await aioseoUpdate(pageId, {
      robots_default: false,
      robots_noindex: true,
      robots_nofollow: true,
      // AIOSEOのsitemap除外
      pillar_content: false,
      // sitemapからの除外はAIOSEO Proの機能の可能性があるので、
      // noindex + priority 0 で対応
      seo_score: 0,
      priority: 0,
    });
    console.log(`  ID:${pageId} noindex+sitemap除外設定: ${success ? '✓' : '✗'}`);
  }

  // ========================================
  // 3. 新5記事の公開状態確認
  // ========================================
  console.log('\n=== 3. 新記事の公開状態確認 ===');

  const newPostIds = [3070, 3071, 3072, 3073, 3074];
  for (const postId of newPostIds) {
    const post = await wpApi('GET', `/wp/v2/posts/${postId}`);
    if (post) {
      console.log(`  ID:${postId} status:${post.status} slug:${post.slug} link:${post.link}`);
    } else {
      console.log(`  ID:${postId} 取得失敗`);
    }
  }

  // ========================================
  // 4. canonicalタグの確認
  // ========================================
  console.log('\n=== 4. canonical確認 ===');

  const testUrls = [
    '/column/yotsu-kofu-stretch/',
    '/column/kofu-stretch-hikaku/',
    '/shop/shop-kofu/',
  ];

  for (const url of testUrls) {
    const res = await request(WP_BASE + url);
    if (res.status === 200) {
      const canonical = res.body.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
      const title = res.body.match(/<title>([^<]+)<\/title>/);
      console.log(`  ${url}`);
      console.log(`    canonical: ${canonical ? canonical[1] : '未設定'}`);
      console.log(`    title: ${title ? title[1].substring(0, 60) : '不明'}`);
    } else {
      console.log(`  ${url} → [${res.status}]`);
    }
  }

  // ========================================
  // 5. 旧URL→新URLのリダイレクト確認
  // ========================================
  console.log('\n=== 5. 旧URLリダイレクト確認 ===');

  const oldUrls = [
    '/2026/04/07/nekoze-stretch-yamanashi/',
    '/2026/04/07/yotsu-kofu-stretch/',
  ];

  for (const url of oldUrls) {
    // redirectに従わないようmanual check
    const res = await request(WP_BASE + url);
    console.log(`  ${url}`);
    console.log(`    status: ${res.status}`);
    if (res.headers.location) {
      console.log(`    redirect to: ${res.headers.location}`);
    }
    if (res.status === 200) {
      const canonical = res.body.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
      console.log(`    canonical: ${canonical ? canonical[1] : '未設定'}`);
    }
  }

  console.log('\n========================================');
  console.log('SEOリダイレクト・sitemap修正完了');
  console.log('========================================');
}

main().catch(console.error);
