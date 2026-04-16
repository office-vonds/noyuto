#!/usr/bin/env node
/**
 * @unryuto_ai を rina の X Developer App で認証する
 * PIN-based OAuth 1.0a フロー
 *
 * 使い方:
 *   node oauth_setup.js          # Step 1: 認証URLを表示
 *   node oauth_setup.js <PIN>    # Step 2: PINを入力してトークン取得
 */

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

// rina の App 認証情報を使う（こちらのAppにクレジットがある）
const APP = {
  apiKey: 'jEW6lIGzvuQJDAW9UyZEZ3BtA',
  apiSecret: 'bhkJdtH2Fm8Y7CC4S43T0a8TUkKyLlcU0seBBnxtWXvGwhIN85',
};

const TEMP_FILE = path.join(__dirname, '.oauth_temp.json');

function oauthSign(method, url, params, tokenSecret = '') {
  const base = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(
      Object.keys(params).sort()
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&')
    ),
  ].join('&');
  const key = `${encodeURIComponent(APP.apiSecret)}&${encodeURIComponent(tokenSecret)}`;
  return crypto.createHmac('sha1', key).update(base).digest('base64');
}

function makeAuthHeader(params) {
  return 'OAuth ' + Object.keys(params).sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(params[k])}"`)
    .join(', ');
}

function httpRequest(method, hostname, urlPath, headers, body = null) {
  return new Promise((resolve, reject) => {
    const options = { hostname, path: urlPath, method, headers };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function step1_getRequestToken() {
  const url = 'https://api.twitter.com/oauth/request_token';
  const params = {
    oauth_consumer_key: APP.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0',
    oauth_callback: 'oob', // PIN-based
  };
  params.oauth_signature = oauthSign('POST', url, params);

  const res = await httpRequest('POST', 'api.twitter.com', '/oauth/request_token', {
    'Authorization': makeAuthHeader(params),
    'Content-Length': '0',
  });

  if (res.status !== 200) {
    console.error('ERROR:', res.body);
    process.exit(1);
  }

  const data = {};
  res.body.split('&').forEach(pair => {
    const [k, v] = pair.split('=');
    data[k] = decodeURIComponent(v);
  });

  // 一時保存
  fs.writeFileSync(TEMP_FILE, JSON.stringify(data));

  console.log('\n========================================');
  console.log('  STEP 1: 以下のURLをブラウザで開いてください');
  console.log('========================================\n');
  console.log(`  https://api.twitter.com/oauth/authorize?oauth_token=${data.oauth_token}\n`);
  console.log('  ※ @unryuto_ai でログインした状態で開くこと');
  console.log('  ※ 「Authorize app」を押すとPINコードが表示される\n');
  console.log('========================================');
  console.log('  PINが表示されたら以下を実行:');
  console.log(`  node oauth_setup.js <PIN番号>`);
  console.log('========================================\n');
}

async function step2_getAccessToken(pin) {
  if (!fs.existsSync(TEMP_FILE)) {
    console.error('ERROR: まず node oauth_setup.js を引数なしで実行してください');
    process.exit(1);
  }

  const temp = JSON.parse(fs.readFileSync(TEMP_FILE, 'utf-8'));
  const url = 'https://api.twitter.com/oauth/access_token';
  const params = {
    oauth_consumer_key: APP.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: temp.oauth_token,
    oauth_verifier: pin,
    oauth_version: '1.0',
  };
  params.oauth_signature = oauthSign('POST', url, params, temp.oauth_token_secret);

  const res = await httpRequest('POST', 'api.twitter.com', '/oauth/access_token', {
    'Authorization': makeAuthHeader(params),
    'Content-Length': '0',
  });

  if (res.status !== 200) {
    console.error('ERROR:', res.body);
    fs.unlinkSync(TEMP_FILE);
    process.exit(1);
  }

  const data = {};
  res.body.split('&').forEach(pair => {
    const [k, v] = pair.split('=');
    data[k] = decodeURIComponent(v);
  });

  // 一時ファイル削除
  fs.unlinkSync(TEMP_FILE);

  console.log('\n========================================');
  console.log('  認証成功！');
  console.log('========================================\n');
  console.log(`  ユーザー: @${data.screen_name} (ID: ${data.user_id})`);
  console.log(`  Access Token: ${data.oauth_token}`);
  console.log(`  Access Token Secret: ${data.oauth_token_secret}`);
  console.log('\n  ↓ この値を .env に設定してください:\n');
  console.log(`  X_API_KEY=${APP.apiKey}`);
  console.log(`  X_API_SECRET=${APP.apiSecret}`);
  console.log(`  X_ACCESS_TOKEN=${data.oauth_token}`);
  console.log(`  X_ACCESS_TOKEN_SECRET=${data.oauth_token_secret}`);
  console.log('\n========================================\n');

  // .env を自動更新
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    let env = fs.readFileSync(envPath, 'utf-8');
    env = env.replace(/^X_API_KEY=.*/m, `X_API_KEY=${APP.apiKey}`);
    env = env.replace(/^X_API_SECRET=.*/m, `X_API_SECRET=${APP.apiSecret}`);
    env = env.replace(/^X_ACCESS_TOKEN=.*/m, `X_ACCESS_TOKEN=${data.oauth_token}`);
    env = env.replace(/^X_ACCESS_TOKEN_SECRET=.*/m, `X_ACCESS_TOKEN_SECRET=${data.oauth_token_secret}`);
    fs.writeFileSync(envPath, env);
    console.log('  ✅ unryuto/.env を自動更新しました\n');
  }
}

// メイン
const pin = process.argv[2];
if (pin) {
  step2_getAccessToken(pin);
} else {
  step1_getRequestToken();
}
