/**
 * 絆JOB 求人素材をWordPressメディアライブラリに一括アップロード
 *
 * 原本: ~/vonds-assets/kizuna-job-staging/ (NOYUTO提供の絆求人素材)
 * 配置先: kizuna-job.com メディアライブラリ
 * 結果: scripts/kizuna-job/kizuna-uploaded-images.json に保存
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const WP_BASE = 'https://kizuna-job.com';
const WP_USER = 'link-group';
const WP_PASS = 'pjj9khxxrypm';
const STAGING = process.env.HOME + '/vonds-assets/kizuna-job-staging';
const OUTPUT = path.join(__dirname, 'kizuna-uploaded-images.json');

let cookies = '';
let nonce = '';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
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
    log: WP_USER,
    pwd: WP_PASS,
    'wp-submit': 'Log In',
    redirect_to: WP_BASE + '/wp-admin/',
    testcookie: 1,
  });
  await request(WP_BASE + '/wp-login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': 'wordpress_test_cookie=WP+Cookie+check',
    },
    body: postData,
  });
  const res = await request(WP_BASE + '/wp-admin/admin-ajax.php?action=rest-nonce');
  nonce = res.body.trim();
  if (!nonce || nonce.length < 5) {
    throw new Error(`nonce取得失敗: "${nonce}"`);
  }
  console.log(`ログイン完了 (nonce取得: ${nonce.substring(0, 6)}...)`);
}

function uploadFile(filePath, altText) {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);

    let body = Buffer.alloc(0);
    const addPart = (str) => { body = Buffer.concat([body, Buffer.from(str)]); };
    const addBuffer = (buf) => { body = Buffer.concat([body, buf]); };

    addPart(`--${boundary}\r\n`);
    addPart(`Content-Disposition: form-data; name="file"; filename="${encodeURIComponent(fileName)}"\r\n`);
    addPart(`Content-Type: ${mimeType}\r\n\r\n`);
    addBuffer(fileData);
    addPart('\r\n');

    if (altText) {
      addPart(`--${boundary}\r\n`);
      addPart(`Content-Disposition: form-data; name="alt_text"\r\n\r\n`);
      addPart(`${altText}\r\n`);
    }
    addPart(`--${boundary}--\r\n`);

    const parsedUrl = new URL(WP_BASE + '/wp-json/wp/v2/media');
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
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
          try {
            const data = JSON.parse(resBody);
            resolve({ id: data.id, url: data.source_url, slug: data.slug });
          } catch (e) {
            resolve(null);
          }
        } else {
          console.error(`  [${res.statusCode}] ${resBody.substring(0, 200)}`);
          resolve(null);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const images = [
  { file: 'main950-250-1.png', alt: '山梨デリヘル絆 求人メインビジュアル' },
  { file: 'kizuna1020-450.jpg', alt: '絆きずな 山梨甲府 風俗求人' },
  { file: 'motto1020-450.jpg', alt: 'もっと稼げる山梨風俗求人 絆' },
  { file: 'babelロゴ.png', alt: 'BABEL ロゴ 絆グループ' },
  { file: 'kimura-600-800-2.jpg', alt: '絆在籍キャストイメージ' },
  { file: 'shiori-600-800-4.jpg', alt: '絆在籍キャストイメージ' },
  { file: 'GF035_350A.jpg', alt: '山梨風俗求人 高収入イメージ' },
  { file: 'GF049_350A.jpg', alt: '山梨風俗求人 接客イメージ' },
  { file: 'GF059_350A.jpg', alt: '山梨風俗求人 未経験歓迎' },
  { file: 'GF103_350A.jpg', alt: '山梨風俗求人 女性スタッフ対応' },
  { file: 'kyubo_img_1_20240718152424_50162.jpg', alt: '絆 個室寮 ワンルーム室内イメージ' },
  { file: 'kyuryo800-450.png', alt: '絆 給料・日給イメージ' },
  { file: 'heikin800-350.png', alt: '絆キャスト平均給料グラフ' },
  { file: 'hoayo800-450.png', alt: '絆 保証制度イメージ' },
  { file: 'ansin310-214.png', alt: '絆 安心安全への取り組み' },
  { file: 'biginer633-533.png', alt: '絆 未経験の方へ' },
  { file: 'S_4740109362377.jpg', alt: '絆 面接イメージ' },
];

async function main() {
  console.log(`ステージング: ${STAGING}`);
  console.log(`アップロード先: ${WP_BASE}\n`);
  await login();

  const results = {};
  console.log('\n=== アップロード開始 ===\n');
  let okCount = 0;
  for (const img of images) {
    const filePath = path.join(STAGING, img.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ✗ 無い: ${img.file}`);
      continue;
    }
    const size = fs.statSync(filePath).size;
    process.stdout.write(`  ${img.file} (${(size / 1024).toFixed(0)}KB) ... `);
    const result = await uploadFile(filePath, img.alt);
    if (result) {
      results[img.file] = { ...result, alt: img.alt };
      console.log(`OK id=${result.id}`);
      okCount++;
    } else {
      console.log(`FAIL`);
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
  console.log(`\n結果: ${okCount}/${images.length} 成功`);
  console.log(`保存先: ${OUTPUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
