#!/usr/bin/env node
/**
 * BAR KOFU IndexNow 自動送信
 * 新規記事追加 or 週次で発火（cron登録済）
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

const INDEXNOW_KEY = 'barkofu2026seo';
const HOST = 'bar-kofu.com';
const LOG_FILE = path.join(__dirname, 'indexnow-ping.log');

const STATIC_URLS = [
  'https://bar-kofu.com/',
  'https://bar-kofu.com/access/',
  'https://bar-kofu.com/contact/',
  'https://bar-kofu.com/info/',
  'https://bar-kofu.com/sitemap/',
];

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n', 'utf-8');
}

function getRecentPosts(limit = 20) {
  return new Promise((resolve, reject) => {
    const xml = `<?xml version="1.0"?>
<methodCall>
  <methodName>wp.getPosts</methodName>
  <params>
    <param><value><int>0</int></value></param>
    <param><value><string>bar-kofu</string></value></param>
    <param><value><string>kxwgu6op5vwv</string></value></param>
    <param><value><struct>
      <member><name>post_type</name><value><string>post</string></value></member>
      <member><name>number</name><value><int>${limit}</int></value></member>
    </struct></value></param>
  </params>
</methodCall>`;
    const options = {
      hostname: HOST, path: '/xmlrpc.php', method: 'POST',
      headers: { 'Content-Type': 'text/xml', 'Content-Length': Buffer.byteLength(xml, 'utf-8') },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const links = [...data.matchAll(/<name>link<\/name>\s*<value><string>([^<]+)<\/string>/g)]
          .map(m => m[1].replace(/&amp;/g, '&'));
        resolve(links);
      });
    });
    req.on('error', reject);
    req.write(xml);
    req.end();
  });
}

function submitToIndexNow(urls) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.html`,
      urlList: urls,
    });
    const options = {
      hostname: 'api.indexnow.org', path: '/indexnow', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body, 'utf-8') },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  log('=== BAR KOFU IndexNow 送信開始 ===');
  const blogUrls = await getRecentPosts(20);
  const allUrls = [...STATIC_URLS, ...blogUrls];
  log(`送信URL総数: ${allUrls.length}`);

  const result = await submitToIndexNow(allUrls);
  log(`結果: HTTP ${result.status}${result.body ? ' / ' + result.body.substring(0, 200) : ''}`);
  if (result.status === 200 || result.status === 202) log('✅ 成功');
  log('=== 終了 ===');
}

main().catch(e => { log('ERROR: ' + e.message); process.exit(1); });
