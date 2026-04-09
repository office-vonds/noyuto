/**
 * 店舗ページのGoogle Maps iframe再挿入
 * mu-pluginでiframe許可済みなので、再保存で反映されるはず
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
  console.log('ログイン完了');
}

async function wpApi(method, endpoint, data) {
  const opts = { method, headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce } };
  if (data) opts.body = JSON.stringify(data);
  const res = await request(WP_BASE + '/wp-json' + endpoint, opts);
  if (res.status >= 200 && res.status < 300) {
    try { return JSON.parse(res.body); } catch { return res.body; }
  }
  console.error(`API Error [${res.status}]: ${res.body.substring(0, 300)}`);
  return null;
}

async function main() {
  await login();

  // 各店舗ページの現在のコンテンツを取得し、マップ部分を修正
  const stores = [
    { id: 3056, address: '山梨県甲府市上石田3-7-7', name: '甲府上石田店' },
    { id: 3057, address: '山梨県南アルプス市小笠原1281-8', name: '南アルプス店' },
    { id: 3058, address: '山梨県韮崎市若宮2-2-43', name: '韮崎店' },
    { id: 3059, address: '山梨県甲斐市竜王新町1981-10', name: '甲斐響が丘店' },
  ];

  for (const store of stores) {
    console.log(`\n${store.name} (ID: ${store.id}):`);

    // 現在のコンテンツを取得
    const page = await wpApi('GET', `/wp/v2/pages/${store.id}`);
    if (!page || !page.content) {
      console.log('  ✗ 取得失敗');
      continue;
    }

    let content = page.content.raw || '';

    // マップ部分を置換（Google Mapsのdivプレースホルダーをiframeに）
    const mapPlaceholder = '<div style="text-align:center; color: #999; padding: 40px;">Google Maps</div>';
    const mapIframe = `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(store.address)}&output=embed" width="100%" height="100%" style="border:0; min-height:300px; border-radius:12px;" allowfullscreen loading="lazy"></iframe>`;

    if (content.includes(mapPlaceholder)) {
      content = content.replace(mapPlaceholder, mapIframe);
      console.log('  マッププレースホルダーをiframeに置換');
    } else if (content.includes('Google Maps')) {
      // 別形式のプレースホルダー
      content = content.replace(/Google Maps<\/div>/, mapIframe + '</div>');
      console.log('  Google Mapsテキストをiframeに置換');
    }

    // 既にiframeが含まれている場合は正しいURLに修正
    if (content.includes('google.com/maps?q=') && !content.includes(encodeURIComponent(store.address))) {
      // URLを修正
      content = content.replace(
        /src="https:\/\/www\.google\.com\/maps\?q=[^"]*"/g,
        `src="https://maps.google.com/maps?q=${encodeURIComponent(store.address)}&output=embed"`
      );
      console.log('  Google Maps URLを修正');
    }

    // 更新
    const result = await wpApi('PUT', `/wp/v2/pages/${store.id}`, { content });
    console.log(`  ${result ? '✓' : '✗'} 更新${result ? '成功' : '失敗'}`);
  }

  // 確認
  console.log('\n=== iframe確認 ===');
  for (const store of stores) {
    const res = await request(WP_BASE + `/shop/${store.id === 3056 ? 'shop-kofu' : store.id === 3057 ? 'shop-minami-alps' : store.id === 3058 ? 'shop-nirasaki' : 'shop-kai-hibikigaoka'}/`);
    const hasIframe = res.body.includes('maps.google.com') || res.body.includes('google.com/maps');
    console.log(`  ${store.name}: iframe ${hasIframe ? '✓ あり' : '✗ なし'}`);
  }

  console.log('\n完了');
}

main().catch(console.error);
