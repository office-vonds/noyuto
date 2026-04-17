#!/usr/bin/env node
/**
 * 絆JOB IndexNow 自動送信
 *
 * IndexNow API (Bing/Yandex/Naver/Seznam) に URL を一括送信する。
 * Google のインデックス登録機能はAPIで提供されていないが、
 * Bing→Google のクロールトリガー効果があり、SEO加速の補助になる。
 *
 * NOYUTO作業: ゼロ（KIRYUが cron で週次自動送信）
 *
 * 実行: node kizuna-indexnow-ping.js
 *   または cron: 0 3 * * 1 （毎週月曜3時）
 *
 * 初回セットアップ:
 *   kizuna-job.com 直下に /vonds2026seo.txt ファイル（中身: vonds2026seo）を配置
 *   → これでIndexNowが所有権確認可能
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

const INDEXNOW_KEY = 'vonds2026seo';
const HOST = 'kizuna-job.com';
const LOG_FILE = path.join(__dirname, 'indexnow-ping.log');

// 送信対象URL
const STATIC_URLS = [
  'https://kizuna-job.com/',
  'https://kizuna-job.com/beginner/',
  'https://kizuna-job.com/mature/',
  'https://kizuna-job.com/guarantee/',
  'https://kizuna-job.com/salary/',
  'https://kizuna-job.com/flow/',
  'https://kizuna-job.com/security/',
  'https://kizuna-job.com/dormitory/',
  'https://kizuna-job.com/qa/',
  'https://kizuna-job.com/contact/',
  'https://kizuna-job.com/blog/',
];

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n', 'utf-8');
}

// WordPress xmlrpc で最新記事URL取得
function getRecentBlogUrls(limit = 10) {
  return new Promise((resolve, reject) => {
    const xml = `<?xml version="1.0"?>
<methodCall>
  <methodName>wp.getPosts</methodName>
  <params>
    <param><value><int>0</int></value></param>
    <param><value><string>link-group</string></value></param>
    <param><value><string>pjj9khxxrypm</string></value></param>
    <param><value><struct>
      <member><name>post_type</name><value><string>staff_blog</string></value></member>
      <member><name>number</name><value><int>${limit}</int></value></member>
      <member><name>orderby</name><value><string>date</string></value></member>
      <member><name>order</name><value><string>DESC</string></value></member>
    </struct></value></param>
  </params>
</methodCall>`;

    const options = {
      hostname: HOST,
      path: '/xmlrpc.php',
      method: 'POST',
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

// IndexNow API に URL を一括送信
function submitToIndexNow(urls) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.html`,
      urlList: urls,
    });

    const options = {
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body, 'utf-8'),
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// sitemap.xml の ping (Google/Bing)
function pingSitemaps() {
  const sitemapUrl = `https://${HOST}/wp-sitemap.xml`;
  const targets = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  return Promise.all(targets.map(url => new Promise(resolve => {
    const req = https.get(url, res => {
      log(`sitemap ping ${url.includes('google') ? 'Google' : 'Bing'}: ${res.statusCode}`);
      res.on('data', () => {});
      res.on('end', resolve);
    });
    req.on('error', err => { log(`sitemap ping error: ${err.message}`); resolve(); });
    req.setTimeout(10000, () => { req.destroy(); resolve(); });
  })));
}

async function main() {
  log('=== 絆JOB IndexNow 自動送信開始 ===');

  try {
    const blogUrls = await getRecentBlogUrls(20);
    log(`xmlrpc経由でstaff_blog ${blogUrls.length}件のURL取得`);

    const allUrls = [...STATIC_URLS, ...blogUrls];
    log(`送信URL総数: ${allUrls.length}`);

    const result = await submitToIndexNow(allUrls);
    log(`IndexNow結果: HTTP ${result.status}${result.body ? ' / ' + result.body.substring(0, 200) : ''}`);

    // 200 or 202 が成功
    if (result.status === 200 || result.status === 202) {
      log('✅ IndexNow送信成功（Bing/Yandex等に即反映）');
    } else if (result.status === 403) {
      log(`⚠️ keyファイル未配置: https://${HOST}/${INDEXNOW_KEY}.txt に "${INDEXNOW_KEY}" を置いてください`);
    } else {
      log(`⚠️ 想定外のレスポンス: ${result.status}`);
    }

    // sitemap ping
    await pingSitemaps();

    log('=== 終了 ===');
  } catch (err) {
    log(`ERROR: ${err.message}`);
    process.exit(1);
  }
}

main();
