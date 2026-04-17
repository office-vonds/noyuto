/**
 * シティヘブンネット（cityheaven.net）写メ日記 競合分析
 *
 * ヘブンネット側の売れてるキャストの写メ日記を収集・分析
 * 画像審査: トップレス/乳首露出NG（scripts/regulations-notes.md）
 *
 * 収集軸:
 *   - エリア別ランキング上位の店舗→キャスト
 *   - 写メ日記本文・画像URL・ハッシュタグ・投稿時間
 *
 * 出力:
 *   - heaven-competitor-data.json
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AREAS = [
  { name: '東京',   path: 'a01/' },
  { name: '大阪',   path: 'a27/' },
  { name: '愛知',   path: 'a23/' },
  { name: '福岡',   path: 'a40/' },
  { name: '神奈川', path: 'a14/' },
  { name: '北海道', path: 'a01_hk/' },
];

const BASE_URL = 'https://www.cityheaven.net';
const REQUEST_DELAY_MS = 2500;
const TOP_ENTRIES_PER_AREA = 30;

const OUTPUT_DIR = path.dirname(__filename);
const DATA_FILE = path.join(OUTPUT_DIR, 'heaven-competitor-data.json');
const LOG_FILE = path.join(OUTPUT_DIR, 'heaven-analyze.log');

const sleep = ms => new Promise(r => setTimeout(r, ms));
function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

/**
 * エリア別 写メ日記ランキング取得
 * cityheaven.net は写メ日記ランキングURL パターンが複数あり得るので、複数候補を順次試行
 */
async function scrapeAreaDiaryRanking(page, area) {
  const candidates = [
    `${BASE_URL}/${area.path}girlsdiary/`,
    `${BASE_URL}/${area.path}diary_ranking/`,
    `${BASE_URL}/${area.path}diary/`,
  ];
  for (const url of candidates) {
    log(`試行: ${url}`);
    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (res && res.status() < 400) {
        await sleep(REQUEST_DELAY_MS);
        const entries = await page.evaluate((limit) => {
          const results = [];
          // 構造は頻繁に変わるため、幅広いセレクタで試行
          const candidates = document.querySelectorAll(
            'article, li.diary_list, li.diary-item, div.girlsdiary_item, .diary-area__item, .diarylist li'
          );
          for (let i = 0; i < Math.min(candidates.length, limit); i++) {
            const el = candidates[i];
            const link = el.querySelector('a[href*="diary"], a.shop_diary, a.diary-link, a');
            if (!link) continue;
            const href = link.getAttribute('href') || '';
            const title = (el.querySelector('.title, .diary-title, h3, .dialy_title') || {}).textContent || '';
            const castName = (el.querySelector('.gal_name, .girl-name, .name, .staff-name') || {}).textContent || '';
            const shopName = (el.querySelector('.shop_name, .shop-name, .storename') || {}).textContent || '';
            const thumb = el.querySelector('img');
            const thumbUrl = thumb ? (thumb.getAttribute('data-src') || thumb.getAttribute('src') || '') : '';
            if (!href) continue;
            results.push({
              href: href.startsWith('http') ? href : (href.startsWith('/') ? 'https://www.cityheaven.net' + href : ''),
              title: title.trim(),
              castName: castName.trim(),
              shopName: shopName.trim(),
              thumbUrl,
              rank: i + 1,
            });
          }
          return results;
        }, TOP_ENTRIES_PER_AREA);
        if (entries.length > 0) {
          log(`  ${entries.length}件取得（${url}）`);
          return entries;
        }
      }
    } catch (e) {
      log(`  ✗ ${url}: ${e.message}`);
    }
  }
  return [];
}

async function scrapeDiaryDetail(page, href) {
  try {
    await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(REQUEST_DELAY_MS);
    return await page.evaluate(() => {
      // 複数構造対応
      const contentEl = document.querySelector(
        '.diary_main, .diary-main, .blog_main, .blog-main, .girlsdiary_detail, .sweetbox_diary, article'
      );
      if (!contentEl) return null;
      const title = (contentEl.querySelector('h1, h2, .title, .diary-title') || {}).textContent || '';
      const bodyText = (contentEl.querySelector('.body, .text, .diary_body, .blog_body, .content') || contentEl).textContent.replace(/\s+/g, ' ').trim();
      const imgs = Array.from(contentEl.querySelectorAll('img'))
        .map(i => i.getAttribute('data-src') || i.getAttribute('src') || '')
        .filter(u => u && !u.includes('icon') && !u.includes('emoji') && !u.includes('logo'));
      // ハッシュタグ
      const hashtagEls = contentEl.querySelectorAll('a[href*="hashtag"], a[href*="tag="], .hashtag, .tag');
      const hashtags = Array.from(hashtagEls).map(a => (a.textContent || '').trim()).filter(Boolean);
      // 投稿時間
      const time = (contentEl.querySelector('time, .post_date, .date, .diary-date') || {}).textContent || '';
      return { title: title.trim(), bodyText, imageUrls: imgs, hashtags, postedTime: time.trim() };
    });
  } catch (e) {
    log(`  詳細取得エラー ${href}: ${e.message}`);
    return null;
  }
}

async function main() {
  try { fs.writeFileSync(LOG_FILE, ''); } catch {}
  log('=== heaven競合分析 開始 ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  const allEntries = [];
  try {
    for (const area of AREAS) {
      log(`\n--- ${area.name} ---`);
      const ranking = await scrapeAreaDiaryRanking(page, area);
      for (let i = 0; i < ranking.length; i++) {
        const entry = ranking[i];
        log(`  [${i + 1}/${ranking.length}] ${entry.castName} "${entry.title}"`);
        const detail = entry.href ? await scrapeDiaryDetail(page, entry.href) : null;
        allEntries.push({
          area: area.name,
          ...entry,
          bodyText: detail?.bodyText || null,
          imageUrls: detail?.imageUrls || [],
          hashtags: detail?.hashtags || [],
          detailPostedTime: detail?.postedTime || null,
        });
        if (allEntries.length % 10 === 0) {
          fs.writeFileSync(DATA_FILE, JSON.stringify(allEntries, null, 2), 'utf-8');
        }
      }
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(allEntries, null, 2), 'utf-8');
    log(`\n=== 完了 計${allEntries.length}件 → ${DATA_FILE} ===`);
  } finally {
    await browser.close();
  }
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });
