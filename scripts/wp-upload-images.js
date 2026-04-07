/**
 * 画像一式をWordPressメディアライブラリにアップロード
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const WP_BASE = 'https://stretchzero.jp';
let cookies = '';
let nonce = '';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname: parsedUrl.hostname, port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: { 'User-Agent': 'VONDS-Upload', ...(options.headers || {}) },
    };
    if (cookies) reqOptions.headers['Cookie'] = cookies;
    const req = lib.request(reqOptions, (res) => {
      if (res.headers['set-cookie']) {
        const nc = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        cookies = cookies ? cookies + '; ' + nc : nc;
      }
      let body = Buffer.alloc(0);
      res.on('data', chunk => body = Buffer.concat([body, chunk]));
      res.on('end', () => resolve({ status: res.statusCode, body: body.toString() }));
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

function uploadFile(filePath, altText) {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);

    let body = Buffer.alloc(0);
    const addPart = (str) => { body = Buffer.concat([body, Buffer.from(str)]); };
    const addBuffer = (buf) => { body = Buffer.concat([body, buf]); };

    // File part
    addPart(`--${boundary}\r\n`);
    addPart(`Content-Disposition: form-data; name="file"; filename="${encodeURIComponent(fileName)}"\r\n`);
    addPart(`Content-Type: ${mimeType}\r\n\r\n`);
    addBuffer(fileData);
    addPart('\r\n');

    // Alt text part
    if (altText) {
      addPart(`--${boundary}\r\n`);
      addPart(`Content-Disposition: form-data; name="alt_text"\r\n\r\n`);
      addPart(`${altText}\r\n`);
    }

    addPart(`--${boundary}--\r\n`);

    const parsedUrl = new URL(WP_BASE + '/wp-json/wp/v2/media');
    const reqOptions = {
      hostname: parsedUrl.hostname, port: 443,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        'X-WP-Nonce': nonce,
        'Cookie': cookies,
        'User-Agent': 'VONDS-Upload',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    };

    const req = https.request(reqOptions, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          const data = JSON.parse(resBody);
          resolve({ id: data.id, url: data.source_url, slug: data.slug });
        } else {
          console.error(`Upload failed [${res.statusCode}]: ${resBody.substring(0, 200)}`);
          resolve(null);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  await login();

  const imageDir = '/mnt/c/Users/ozawa/OneDrive/デスクトップ/画像一式';
  const images = [
    { file: '上石田店.jpg', alt: 'ストレッチゼロ 甲府上石田店 外観' },
    { file: '南アルプス店.jpg', alt: 'ストレッチゼロ 南アルプス店 外観' },
    { file: '韮崎店.jpg', alt: 'ストレッチゼロ 韮崎店 外観' },
    { file: '甲斐響が丘店.png', alt: 'ストレッチゼロ 甲斐響が丘店 外観' },
    { file: '宣材画像①.jpg', alt: 'ストレッチゼロ パーソナルストレッチ 施術風景' },
    { file: '宣材画像②.jpg', alt: 'ストレッチゼロ ストレッチ施術 笑顔のトレーナー' },
    { file: '宣材画像③.jpg', alt: 'ストレッチゼロ 首・肩ストレッチ 施術風景' },
    { file: '宣材画像④.jpg', alt: 'ストレッチゼロ 下半身ストレッチ 施術風景' },
    { file: '宣材画像⑤.jpg', alt: 'ストレッチゼロ トレーナー 施術風景' },
    { file: '宣材画像⑥.jpg', alt: 'ストレッチゼロ パーソナルストレッチ 施術' },
    { file: '宣材画像⑦.jpg', alt: 'ストレッチゼロ ストレッチ施術 風景' },
    { file: '宣材画像⑧.jpg', alt: 'ストレッチゼロ 肩甲骨ストレッチ 施術' },
    { file: '宣材画像⑨.jpg', alt: 'ストレッチゼロ 腰ストレッチ 施術風景' },
    { file: '宣材画像⑩.jpg', alt: 'ストレッチゼロ 施術風景 プロトレーナー' },
    { file: '宣材画像⑪.jpg', alt: 'ストレッチゼロ 全身ストレッチ 施術' },
    { file: 'LP TOP背景希望.jpg', alt: 'ストレッチゼロ LP背景 ストレッチ施術' },
    { file: '反り腰リセット！ 画像.jpg', alt: 'ストレッチゼロ 反り腰改善 Before After' },
  ];

  const results = {};
  console.log('\n=== 画像アップロード開始 ===\n');

  for (const img of images) {
    const filePath = path.join(imageDir, img.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ✗ ファイルなし: ${img.file}`);
      continue;
    }
    const size = fs.statSync(filePath).size;
    console.log(`  アップロード中: ${img.file} (${(size / 1024).toFixed(0)}KB)`);
    const result = await uploadFile(filePath, img.alt);
    if (result) {
      results[img.file] = result;
      console.log(`    ✓ ID:${result.id} ${result.url}`);
    } else {
      console.log(`    ✗ 失敗`);
    }
  }

  // 結果をJSONファイルに保存
  const outputPath = '/home/ozawakiryu0902/projects/vonds/scripts/uploaded-images.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n結果を ${outputPath} に保存`);
  console.log(`合計: ${Object.keys(results).length}/${images.length} 成功`);
}

main().catch(console.error);
