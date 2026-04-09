/**
 * AIOSEO メタデータ更新（正しいAPI形式）
 * POST /wp-json/aioseo/v1/post に {"id": postId, ...} で送信
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
      hostname: parsedUrl.hostname,
      port: 443,
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
  console.log('ログイン完了, nonce:', nonce);
}

async function getAioseoRoutes() {
  const res = await request(WP_BASE + '/wp-json/aioseo/v1', {
    headers: { 'X-WP-Nonce': nonce },
  });
  const data = JSON.parse(res.body);
  console.log('AIOSEO routes:');
  for (const [route, info] of Object.entries(data.routes)) {
    console.log(`  ${route} [${info.methods.join(',')}]`);
  }
  return data.routes;
}

async function updateAioseoPost(postId, title, description) {
  // Try POST with id in body
  const body = JSON.stringify({ id: postId, title, description });
  const res = await request(WP_BASE + '/wp-json/aioseo/v1/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    },
    body,
  });
  console.log(`  POST /aioseo/v1/post {id:${postId}} → [${res.status}] ${res.body.substring(0, 200)}`);

  if (res.status === 200) return true;

  // Try PUT
  const res2 = await request(WP_BASE + '/wp-json/aioseo/v1/post', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    },
    body,
  });
  console.log(`  PUT /aioseo/v1/post {id:${postId}} → [${res2.status}] ${res2.body.substring(0, 200)}`);

  if (res2.status === 200) return true;

  // Try PATCH
  const res3 = await request(WP_BASE + '/wp-json/aioseo/v1/post', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    },
    body,
  });
  console.log(`  PATCH /aioseo/v1/post {id:${postId}} → [${res3.status}] ${res3.body.substring(0, 200)}`);

  return res3.status === 200;
}

async function main() {
  await login();
  const routes = await getAioseoRoutes();

  // Test with one page first
  console.log('\n=== テスト: トップページ (ID:11) ===');
  const success = await updateAioseoPost(
    11,
    'ストレッチゼロ｜山梨県初のストレッチ専門店【甲府・南アルプス・韮崎】肩こり・腰痛・姿勢改善',
    '山梨県初のストレッチ専門店「ストレッチゼロ」。甲府・南アルプス・韮崎・甲斐に4店舗展開。理学療法士在籍、肩こり・腰痛・猫背・姿勢改善に専門対応。マッサージや整体では改善しなかった症状に、プロのパーソナルストレッチで根本からアプローチ。'
  );

  if (success) {
    console.log('\n=== 全ページ更新 ===');
    const updates = [
      { id: 647, title: 'トレーナー紹介｜理学療法士・柔道整復師在籍｜ストレッチゼロ', desc: 'ストレッチゼロのトレーナー紹介。理学療法士・柔道整復師など国家資格保有者が多数在籍。山梨県の甲府・南アルプス・韮崎・甲斐で、プロのパーソナルストレッチを提供。' },
      { id: 666, title: '店舗一覧｜山梨のストレッチ・整体・マッサージならストレッチゼロ【甲府・南アルプス・韮崎・甲斐】', desc: 'ストレッチゼロ山梨県内4店舗（甲府上石田・甲斐響が丘・南アルプス・韮崎）のアクセス・営業時間・電話番号。整体やマッサージをお探しの方にもおすすめのストレッチ専門店。' },
      { id: 1406, title: 'ご予約・お問い合わせ｜ストレッチゼロ【山梨のストレッチ専門店】', desc: 'ストレッチゼロへのご予約・お問い合わせ。山梨県内4店舗で初回体験コース受付中。' },
      { id: 2807, title: '会社概要｜SANKEN株式会社（ストレッチゼロ運営）', desc: 'ストレッチゼロを運営するSANKEN株式会社の会社概要。山梨県甲府市本社、ストレッチ専門店4店舗展開。' },
      { id: 3056, title: '甲府のストレッチ専門店｜ストレッチゼロ 甲府上石田店', desc: '甲府でストレッチ・整体・マッサージをお探しなら「ストレッチゼロ甲府上石田店」。理学療法士在籍、肩こり・腰痛・姿勢改善に対応。甲府昭和ICから車5分。' },
      { id: 3057, title: '南アルプスのストレッチ専門店｜ストレッチゼロ 南アルプス店', desc: '南アルプス市でストレッチ・整体・マッサージをお探しなら「ストレッチゼロ南アルプス店」。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。' },
      { id: 3058, title: '韮崎のストレッチ専門店｜ストレッチゼロ 韮崎店', desc: '韮崎市でストレッチ・整体・マッサージをお探しなら「ストレッチゼロ韮崎店」。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。韮崎駅から車5分。' },
      { id: 3059, title: '甲斐市のストレッチ専門店｜ストレッチゼロ 甲斐響が丘店', desc: '甲斐市でストレッチ・整体・マッサージをお探しなら「ストレッチゼロ甲斐響が丘店」。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。' },
      { id: 3060, title: '猫背はストレッチで改善できる？山梨のプロが解説｜ストレッチゼロ', desc: '猫背矯正にはストレッチが効果的。山梨県のストレッチ専門店「ストレッチゼロ」が猫背の原因・改善方法・セルフストレッチを解説。甲府・南アルプス・韮崎で対応。' },
      { id: 3061, title: '甲府で姿勢改善するなら？ストレッチ専門店が教える正しいアプローチ', desc: '甲府で姿勢改善をお考えの方へ。ストレッチゼロが姿勢の崩れの原因と改善方法を解説。整体・マッサージとの違い、効果的なストレッチ方法をプロが紹介。' },
      { id: 3062, title: '甲府で肩こりにお悩みの方へ｜ストレッチで根本改善する方法', desc: '甲府で肩こり改善をお考えの方へ。マッサージや整体で改善しない肩こりにはストレッチが効果的。ストレッチゼロが原因と改善法を解説。' },
    ];

    for (const u of updates) {
      console.log(`\nID: ${u.id} - ${u.title.substring(0, 30)}...`);
      await updateAioseoPost(u.id, u.title, u.desc);
    }
  }

  console.log('\n完了');
}

main().catch(console.error);
