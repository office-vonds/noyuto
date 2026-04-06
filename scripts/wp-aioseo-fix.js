/**
 * AIOSEO メタデータ更新 - WordPress admin-ajax.php 経由
 * AIOSEOのREST APIが使えない場合、admin-ajax.php または直接postmeta更新を使う
 */

const https = require('https');
const http = require('http');
const querystring = require('querystring');
const { execSync } = require('child_process');

const WP_BASE = 'https://stretchzero.jp';
const WP_LOGIN_URL = 'https://stretchzero.jp/wp-login.php';
const WP_USER = 'Stretchlabo';
const WP_PASS = 'Stretchlabo0501';

// MySQL接続情報
const MYSQL_HOST = 'localhost'; // Xサーバー内部
const MYSQL_DB = 'xs955842_wp2';
const MYSQL_USER = 'xs955842_wp2';
const MYSQL_PASS = '8kwi36ieuv';

let cookies = '';
let nonce = '';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (VONDS SEO Fix)',
        ...(options.headers || {}),
      },
    };
    if (cookies) reqOptions.headers['Cookie'] = cookies;
    const req = lib.request(reqOptions, (res) => {
      if (res.headers['set-cookie']) {
        const newCookies = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        cookies = cookies ? cookies + '; ' + newCookies : newCookies;
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

async function wpLogin() {
  const postData = querystring.stringify({
    log: WP_USER, pwd: WP_PASS,
    'wp-submit': 'Log In',
    redirect_to: WP_BASE + '/wp-admin/',
    testcookie: 1,
  });
  await request(WP_LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': 'wordpress_test_cookie=WP+Cookie+check',
    },
    body: postData,
  });
  return cookies.includes('wordpress_logged_in');
}

async function getNonce() {
  const res = await request(WP_BASE + '/wp-admin/admin-ajax.php?action=rest-nonce');
  if (res.status === 200 && res.body.length < 30) {
    nonce = res.body.trim();
    return true;
  }
  return false;
}

// AIOSEO v2 API を試す
async function tryAioseoV2(postId, title, description) {
  // Try different AIOSEO API endpoints
  const endpoints = [
    `/wp-json/aioseo/v1/post/${postId}`,
    `/wp-json/aioseo/v1/posts/${postId}`,
  ];

  for (const endpoint of endpoints) {
    const res = await request(WP_BASE + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce,
      },
      body: JSON.stringify({
        title: title,
        description: description,
      }),
    });
    if (res.status === 200) {
      console.log(`  ✓ AIOSEO更新成功 via ${endpoint}`);
      return true;
    }
  }
  return false;
}

// WP postmeta 経由で _aioseo_title, _aioseo_description を更新
async function updateViaPostMeta(postId, title, description, isPage = true) {
  const endpoint = isPage ? 'pages' : 'posts';

  // AIOSEO uses serialized data in wp_aioseo_posts table, not postmeta
  // Let's try updating the Yoast-style postmeta that some themes fall back to
  const res = await request(WP_BASE + `/wp-json/wp/v2/${endpoint}/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    },
    body: JSON.stringify({
      meta: {
        _aioseo_title: title,
        _aioseo_description: description,
      },
    }),
  });

  if (res.status === 200) {
    const data = JSON.parse(res.body);
    console.log(`  ✓ WP meta更新成功 (ID: ${postId})`);
    return true;
  } else {
    console.log(`  WP meta更新結果 [${res.status}]: ${res.body.substring(0, 200)}`);
    return false;
  }
}

// WordPress admin画面経由でAIOSEO settingsを更新（post.php submit）
async function updateViaAdminPost(postId, title, description) {
  // まずedit画面を取得してnonce等を取得
  const editRes = await request(WP_BASE + `/wp-admin/post.php?post=${postId}&action=edit`);

  if (editRes.status !== 200) {
    console.log(`  edit画面取得失敗 [${editRes.status}]`);
    return false;
  }

  // _wpnonce を取得
  const wpNonceMatch = editRes.body.match(/name="_wpnonce"\s+value="([^"]+)"/);
  if (!wpNonceMatch) {
    console.log(`  _wpnonce取得失敗`);
    return false;
  }

  // AIOSEO のメタボックスデータを探す
  const aioseoNonceMatch = editRes.body.match(/name="aioseo-post-settings-nonce"\s+value="([^"]+)"/);

  // AIOSEO stores data via JS/React so form submit won't work well
  // Let's check if there's an aioseo_meta in the form
  console.log(`  _wpnonce: ${wpNonceMatch[1]}`);
  console.log(`  AIOSEO nonce: ${aioseoNonceMatch ? aioseoNonceMatch[1] : 'not found'}`);

  return false;
}

// 方法: ページタイトル自体をSEO最適化（titleタグはWPのページタイトルから生成されるケースが多い）
async function updatePageTitle(postId, newTitle, isPage = true) {
  const endpoint = isPage ? 'pages' : 'posts';
  const res = await request(WP_BASE + `/wp-json/wp/v2/${endpoint}/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    },
    body: JSON.stringify({
      title: newTitle,
    }),
  });

  if (res.status === 200) {
    console.log(`  ✓ ページタイトル更新成功`);
    return true;
  }
  console.log(`  ✗ タイトル更新失敗 [${res.status}]`);
  return false;
}

// AIOSEO REST API のエンドポイント探索
async function discoverAioseoApi() {
  console.log('=== AIOSEO APIエンドポイント探索 ===');

  const endpoints = [
    '/wp-json/aioseo/v1',
    '/wp-json/aioseo/v1/post',
    '/wp-json/aioseo/v1/post?id=11',
    '/wp-json/aioseo/v1/posts',
    '/wp-json/aioseo/v1/post/11',
    '/wp-json/aioseo/v1/posts/11',
  ];

  for (const ep of endpoints) {
    const res = await request(WP_BASE + ep, {
      headers: { 'X-WP-Nonce': nonce },
    });
    console.log(`  ${ep} → [${res.status}] ${res.body.substring(0, 150)}`);
  }
}

async function main() {
  console.log('=== AIOSEO メタデータ更新 ===\n');

  await wpLogin();
  await getNonce();
  console.log('ログイン完了\n');

  // まずAIOSEO APIを探索
  await discoverAioseoApi();

  // ページタイトルの更新（これはWP REST APIで確実にできる）
  console.log('\n=== ページタイトル更新 ===');

  const titleUpdates = [
    { id: 647, title: 'トレーナー紹介｜理学療法士・柔道整復師在籍｜ストレッチゼロ', isPage: true },
    { id: 1406, title: 'ご予約・お問い合わせ｜ストレッチゼロ', isPage: true },
    { id: 2807, title: '会社概要｜SANKEN株式会社（ストレッチゼロ運営）', isPage: true },
  ];

  for (const update of titleUpdates) {
    console.log(`\nID: ${update.id} → ${update.title}`);
    await updatePageTitle(update.id, update.title, update.isPage);
  }

  // postmeta経由でのmeta description更新を試みる
  console.log('\n=== postmeta経由 meta description 更新 ===');
  const metaUpdates = [
    { id: 11, title: 'ストレッチゼロ｜山梨県初のストレッチ専門店【甲府・南アルプス・韮崎】', desc: '山梨県初のストレッチ専門店「ストレッチゼロ」。甲府・南アルプス・韮崎・甲斐に4店舗展開。理学療法士在籍、肩こり・腰痛・猫背・姿勢改善に専門対応。', isPage: true },
    { id: 647, title: 'トレーナー紹介｜理学療法士・柔道整復師在籍｜ストレッチゼロ', desc: 'ストレッチゼロのトレーナー紹介。理学療法士・柔道整復師など国家資格保有者が多数在籍。山梨県の甲府・南アルプス・韮崎・甲斐の各店舗で、プロのパーソナルストレッチを提供。', isPage: true },
    { id: 666, title: '店舗一覧｜山梨のストレッチ・整体・マッサージならストレッチゼロ', desc: 'ストレッチゼロ山梨県内4店舗（甲府上石田・甲斐響が丘・南アルプス・韮崎）のアクセス・営業時間。整体やマッサージをお探しの方にもおすすめ。', isPage: true },
    { id: 1406, title: 'ご予約・お問い合わせ｜ストレッチゼロ', desc: 'ストレッチゼロへのご予約・お問い合わせ。山梨県内4店舗（甲府・南アルプス・韮崎・甲斐）で初回体験コース受付中。', isPage: true },
    { id: 2807, title: '会社概要｜SANKEN株式会社', desc: 'ストレッチゼロを運営するSANKEN株式会社の会社概要。山梨県甲府市に本社、ストレッチ専門店を4店舗展開。', isPage: true },
  ];

  for (const m of metaUpdates) {
    console.log(`\nID: ${m.id}`);
    await updateViaPostMeta(m.id, m.title, m.desc, m.isPage);
  }

  console.log('\n=== 完了 ===');
}

main().catch(console.error);
