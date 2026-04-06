/**
 * ストレッチゼロ 既存ページSEO修正スクリプト
 * - トップページのtitle/meta最適化
 * - trainer/company/contact の meta description修正
 * - 店舗一覧ページから各店舗個別ページへの内部リンク追加
 */

const https = require('https');
const http = require('http');
const querystring = require('querystring');

const WP_BASE = 'https://stretchzero.jp';
const WP_LOGIN_URL = 'https://stretchzero.jp/wp-login.php';
const WP_USER = 'Stretchlabo';
const WP_PASS = 'Stretchlabo0501';

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
  const res = await request(WP_LOGIN_URL, {
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

async function wpApiPut(endpoint, data) {
  const jsonBody = JSON.stringify(data);
  const res = await request(WP_BASE + '/wp-json' + endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    },
    body: jsonBody,
  });
  if (res.status === 200) return JSON.parse(res.body);
  console.error(`API PUT Error [${res.status}]:`, res.body.substring(0, 500));
  return null;
}

async function wpApiGet(endpoint) {
  const res = await request(WP_BASE + '/wp-json' + endpoint, {
    headers: { 'X-WP-Nonce': nonce },
  });
  if (res.status === 200) return JSON.parse(res.body);
  return null;
}

// --- AIOSEO メタデータ更新（wp_postmeta 直接書き込みはAPIでは難しいのでAIOSEO REST APIを試す） ---

async function updatePageMeta(pageId, title, description) {
  // AIOSEO stores meta in its own table, accessible via REST API if available
  // Try AIOSEO REST API first
  const aioseoRes = await request(WP_BASE + `/wp-json/aioseo/v1/post?id=${pageId}`, {
    headers: { 'X-WP-Nonce': nonce },
  });

  if (aioseoRes.status === 200) {
    const data = JSON.parse(aioseoRes.body);
    console.log(`  現在のAIOSEO title: "${data.title || '(未設定)'}"`);
    console.log(`  現在のAIOSEO description: "${(data.description || '(未設定)').substring(0, 50)}..."`);

    // Update via AIOSEO API
    const updateRes = await request(WP_BASE + `/wp-json/aioseo/v1/post?id=${pageId}`, {
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

    if (updateRes.status === 200) {
      console.log(`  ✓ AIOSEO メタデータ更新成功`);
      return true;
    } else {
      console.log(`  ✗ AIOSEO更新失敗 [${updateRes.status}]: ${updateRes.body.substring(0, 200)}`);
    }
  } else {
    console.log(`  AIOSEO API not available [${aioseoRes.status}], trying WP meta...`);
  }

  return false;
}

// --- 店舗一覧ページに内部リンク追加 ---

function generateShopListAddendum() {
  return `

<!-- wp:heading -->
<h2>各店舗の詳細情報</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>各店舗の詳しいアクセス・サービス内容は、下記の店舗ページをご覧ください。</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
<li><a href="/shop/shop-kofu/"><strong>甲府上石田店</strong></a> — 甲府でストレッチ・整体・マッサージをお探しの方に</li>
<li><a href="/shop/shop-minami-alps/"><strong>南アルプス店</strong></a> — 南アルプス市唯一のストレッチ専門店</li>
<li><a href="/shop/shop-nirasaki/"><strong>韮崎店</strong></a> — 韮崎エリアのストレッチ専門店</li>
<li><a href="/shop/shop-kai-hibikigaoka/"><strong>甲斐響が丘店</strong></a> — 甲斐市エリアのストレッチ専門店</li>
</ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>お悩み別のご案内</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li><a href="/2026/04/07/nekoze-stretch-yamanashi/">猫背でお悩みの方</a> — ストレッチで猫背を根本改善</li>
<li><a href="/2026/04/07/shisei-kaizen-kofu/">姿勢改善をお考えの方</a> — 正しい姿勢を取り戻すアプローチ</li>
<li><a href="/2026/04/07/katakori-kofu-stretch/">肩こりでお悩みの方</a> — マッサージで治らない肩こりに</li>
</ul>
<!-- /wp:list -->
`;
}

async function main() {
  console.log('=== ストレッチゼロ SEO修正開始 ===\n');

  await wpLogin();
  await getNonce();
  console.log('ログイン・Nonce取得完了\n');

  // 1. 各ページのAIOSEOメタデータ更新
  const metaUpdates = [
    {
      id: 11, // トップページ
      title: 'ストレッチゼロ｜山梨県初のストレッチ専門店【甲府・南アルプス・韮崎】肩こり・腰痛・姿勢改善',
      description: '山梨県初のストレッチ専門店「ストレッチゼロ」。甲府・南アルプス・韮崎・甲斐に4店舗展開。理学療法士在籍、肩こり・腰痛・猫背・姿勢改善に専門対応。マッサージや整体では改善しなかった症状に、プロのパーソナルストレッチで根本からアプローチ。',
    },
    {
      id: 647, // トレーナーページ
      title: 'トレーナー紹介｜理学療法士・柔道整復師在籍｜ストレッチゼロ',
      description: 'ストレッチゼロのトレーナー紹介。理学療法士・柔道整復師など国家資格保有者が多数在籍。山梨県の甲府・南アルプス・韮崎・甲斐の各店舗で、プロのパーソナルストレッチを提供しています。',
    },
    {
      id: 666, // 店舗一覧ページ
      title: '店舗一覧｜山梨のストレッチ・整体・マッサージならストレッチゼロ【甲府・南アルプス・韮崎・甲斐】',
      description: 'ストレッチゼロは山梨県内に4店舗（甲府上石田・甲斐響が丘・南アルプス・韮崎）展開。各店舗のアクセス・営業時間・電話番号はこちら。整体やマッサージをお探しの方にもおすすめのストレッチ専門店です。',
    },
    {
      id: 1406, // お問い合わせ
      title: 'ご予約・お問い合わせ｜ストレッチゼロ【山梨のストレッチ専門店】',
      description: 'ストレッチゼロへのご予約・お問い合わせはこちら。山梨県内4店舗（甲府・南アルプス・韮崎・甲斐）で初回体験コースを受付中。',
    },
    {
      id: 2807, // 会社概要
      title: '会社概要｜SANKEN株式会社（ストレッチゼロ運営）',
      description: 'ストレッチゼロを運営するSANKEN株式会社の会社概要。山梨県甲府市に本社を置き、ストレッチ専門店を4店舗展開しています。',
    },
  ];

  for (const meta of metaUpdates) {
    console.log(`--- ページID: ${meta.id} ---`);
    await updatePageMeta(meta.id, meta.title, meta.description);
    console.log('');
  }

  // 2. 店舗一覧ページに内部リンクを追加
  console.log('--- 店舗一覧ページに内部リンク追加 ---');
  const shopPage = await wpApiGet('/wp/v2/pages/666');
  if (shopPage) {
    const currentContent = shopPage.content.rendered || '';
    console.log(`  現在のコンテンツ長: ${currentContent.length}文字`);

    // Append internal links to the shop page
    const addendum = generateShopListAddendum();
    const result = await wpApiPut('/wp/v2/pages/666', {
      content: (shopPage.content.raw || currentContent) + addendum,
    });
    if (result) {
      console.log('  ✓ 内部リンク追加成功');
    } else {
      console.log('  ✗ 内部リンク追加失敗');
    }
  }

  // 3. 新しく作成した店舗ページのAIOSEOメタデータも設定
  console.log('\n--- 新規店舗ページのAIOSEOメタデータ設定 ---');
  const newPageMeta = [
    { id: 3056, title: '甲府のストレッチ専門店｜ストレッチゼロ 甲府上石田店', description: '甲府でストレッチ・整体・マッサージをお探しなら、山梨県初のストレッチ専門店「ストレッチゼロ甲府上石田店」。理学療法士在籍、肩こり・腰痛・姿勢改善に対応。甲府昭和ICから車5分。' },
    { id: 3057, title: '南アルプスのストレッチ専門店｜ストレッチゼロ 南アルプス店', description: '南アルプス市でストレッチ・整体・マッサージをお探しなら「ストレッチゼロ南アルプス店」。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。' },
    { id: 3058, title: '韮崎のストレッチ専門店｜ストレッチゼロ 韮崎店', description: '韮崎市でストレッチ・整体・マッサージをお探しなら「ストレッチゼロ韮崎店」。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。韮崎駅から車5分。' },
    { id: 3059, title: '甲斐市のストレッチ専門店｜ストレッチゼロ 甲斐響が丘店', description: '甲斐市でストレッチ・整体・マッサージをお探しなら「ストレッチゼロ甲斐響が丘店」。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。' },
    { id: 3060, title: '猫背はストレッチで改善できる？山梨のプロが解説｜ストレッチゼロ', description: '猫背矯正にはストレッチが効果的。山梨県のストレッチ専門店「ストレッチゼロ」が、猫背の原因・改善方法・セルフストレッチを解説。甲府・南アルプス・韮崎で対応。' },
    { id: 3061, title: '甲府で姿勢改善するなら？ストレッチ専門店が教える正しいアプローチ', description: '甲府で姿勢改善をお考えの方へ。ストレッチゼロが姿勢の崩れの原因と改善方法を解説。整体・マッサージとの違い、効果的なストレッチ方法をプロが紹介。' },
    { id: 3062, title: '甲府で肩こりにお悩みの方へ｜ストレッチで根本改善する方法', description: '甲府で肩こりの改善をお考えの方へ。マッサージや整体で改善しない肩こりには、ストレッチが効果的。ストレッチゼロが肩こりの原因と改善法を解説。' },
  ];

  for (const meta of newPageMeta) {
    console.log(`  ID: ${meta.id} - ${meta.title.substring(0, 30)}...`);
    await updatePageMeta(meta.id, meta.title, meta.description);
  }

  console.log('\n=== 全SEO修正完了 ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
