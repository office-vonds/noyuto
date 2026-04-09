/**
 * 店舗ページのGoogle Maps部分をショートコードに変更
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

async function wpApi(method, endpoint, data) {
  const opts = { method, headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce } };
  if (data) opts.body = JSON.stringify(data);
  const res = await request(WP_BASE + '/wp-json' + endpoint, opts);
  if (res.status >= 200 && res.status < 300) {
    try { return JSON.parse(res.body); } catch { return res.body; }
  }
  return null;
}

const stores = [
  { id: 3056, address: '山梨県甲府市上石田3-7-7', name: '甲府上石田店' },
  { id: 3057, address: '山梨県南アルプス市小笠原1281-8', name: '南アルプス店' },
  { id: 3058, address: '山梨県韮崎市若宮2-2-43', name: '韮崎店' },
  { id: 3059, address: '山梨県甲斐市竜王新町1981-10', name: '甲斐響が丘店' },
];

async function main() {
  await login();
  console.log('ログイン完了\n');

  for (const store of stores) {
    console.log(`${store.name} (ID: ${store.id}):`);
    const page = await wpApi('GET', `/wp/v2/pages/${store.id}`);
    if (!page) { console.log('  取得失敗'); continue; }

    let content = page.content.raw || '';

    // sz-access-map div内のコンテンツをショートコードに置換
    const mapDivRegex = /<div class="sz-access-map">[\s\S]*?<\/div>/;
    const shortcode = `[sz_map address="${store.address}" height="300"]`;

    if (content.match(mapDivRegex)) {
      content = content.replace(mapDivRegex, `<div class="sz-access-map">${shortcode}</div>`);
      console.log('  マップDIVをショートコードに置換');
    } else {
      console.log('  sz-access-map DIV未検出、直接挿入');
      // アクセス情報の後にショートコードを挿入
      content = content.replace(
        '</div>\n  </div>\n\n  <!-- CTA -->',
        `</div>\n    <div class="sz-access-map">${shortcode}</div>\n  </div>\n\n  <!-- CTA -->`
      );
    }

    const result = await wpApi('PUT', `/wp/v2/pages/${store.id}`, { content });
    console.log(`  ${result ? '✓' : '✗'} 更新`);
  }

  // 確認
  console.log('\n=== マップ表示確認 ===');
  const slugs = ['shop-kofu', 'shop-minami-alps', 'shop-nirasaki', 'shop-kai-hibikigaoka'];
  for (let i = 0; i < stores.length; i++) {
    const res = await request(`${WP_BASE}/shop/${slugs[i]}/`);
    const hasMap = res.body.includes('maps.google.com');
    console.log(`  ${stores[i].name}: ${hasMap ? '✓ マップあり' : '✗ マップなし'}`);
  }

  console.log('\n完了');
}

main().catch(console.error);
