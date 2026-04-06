/**
 * AIOSEO sitemap除外設定 + AIOSEO全体設定でnoindex→sitemap除外連動
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
      res.on('end', () => resolve({ status: res.statusCode, body }));
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
}

async function aioseoGet(postId) {
  const res = await request(WP_BASE + `/wp-json/aioseo/v1/post`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
  });
  // GET requires id as param - but the API uses POST body
  // Let's try to get the post data via the main GET with ?id
  const res2 = await request(WP_BASE + `/wp-json/aioseo/v1/post?id=${postId}`, {
    headers: { 'X-WP-Nonce': nonce },
  });
  return { status: res2.status, body: res2.body.substring(0, 500) };
}

async function aioseoPost(postId, data) {
  const res = await request(WP_BASE + '/wp-json/aioseo/v1/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
    body: JSON.stringify({ id: postId, ...data }),
  });
  return { status: res.status, body: res.body.substring(0, 300) };
}

async function main() {
  await login();
  console.log('ログイン完了\n');

  // 各noindexページにsitemap_exclude設定を試す
  const noindexPages = [
    { id: 1409, name: 'contact-confirm' },
    { id: 1411, name: 'contact-thanks' },
    { id: 1361, name: 'contact-2' },
    { id: 2745, name: 'renewal' },
  ];

  // まず1ページのAIOSEOデータ構造を確認
  console.log('=== AIOSEO POST構造確認 ===');
  const test = await aioseoGet(1409);
  console.log(`GET /aioseo/v1/post?id=1409: [${test.status}] ${test.body}`);

  // 各フィールドを試す
  console.log('\n=== sitemap除外設定 ===');
  for (const page of noindexPages) {
    console.log(`\n${page.name} (ID: ${page.id}):`);

    // AIOSEO uses different field names for sitemap exclusion
    // Try multiple approaches
    const fields = [
      { sitemap_exclude: true },
      { sitemap_priority: '0' },
      { robots_default: false, robots_noindex: true, robots_nofollow: true, sitemap_exclude: true },
    ];

    for (const field of fields) {
      const result = await aioseoPost(page.id, field);
      console.log(`  ${JSON.stringify(field).substring(0, 80)} → [${result.status}]`);
      if (result.status === 200) break;
    }
  }

  // AIOSEO全体オプションでsitemap設定を確認・修正
  console.log('\n=== AIOSEO sitemap全体設定 ===');
  const optionsRes = await request(WP_BASE + '/wp-json/aioseo/v1/options', {
    headers: { 'X-WP-Nonce': nonce },
  });

  if (optionsRes.status === 200) {
    const options = JSON.parse(optionsRes.body);
    // sitemap設定を確認
    if (options.sitemap) {
      console.log('現在のsitemap設定:');
      console.log('  general:', JSON.stringify(options.sitemap.general || {}).substring(0, 200));

      // sitemapでnoindexページを除外する設定を追加
      const sitemapUpdate = {
        sitemap: {
          general: {
            ...options.sitemap.general,
            advancedSettings: {
              ...((options.sitemap.general || {}).advancedSettings || {}),
              enable: true,
              excludePosts: [1409, 1411, 1361, 2745].join(','),
            },
          },
        },
      };

      const updateRes = await request(WP_BASE + '/wp-json/aioseo/v1/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
        body: JSON.stringify(sitemapUpdate),
      });
      console.log(`\nsitemap除外設定更新: [${updateRes.status}]`);
      if (updateRes.status === 200) {
        console.log('✓ 成功');
      } else {
        console.log(updateRes.body.substring(0, 300));
      }
    }
  }

  // 最終確認
  console.log('\n=== sitemap再確認 ===');
  const sitemapRes = await request(WP_BASE + '/page-sitemap.xml');
  const hasExcluded = ['contact-thanks', 'contact-confirm', 'contact-2', 'renewal']
    .filter(slug => sitemapRes.body.includes(slug));
  console.log(`まだsitemapに残っているページ: ${hasExcluded.length > 0 ? hasExcluded.join(', ') : 'なし（全除外済み）'}`);

  console.log('\n完了');
}

main().catch(console.error);
