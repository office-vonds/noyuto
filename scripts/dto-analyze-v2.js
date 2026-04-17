/**
 * デリヘルタウン 写メ日記 競合分析 v2
 *
 * v1との違い:
 *   - 画像URL複数枚を収集
 *   - エリア拡大（5→10）
 *   - 詳細ページ全件（15→30）
 *   - 本文HTML保存（誘惑フレーズ・導線リンク抽出用）
 *
 * 出力:
 *   - dto-competitor-data-v2.json: 生データ
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AREAS = [
  { name: '東京',   slug: 'tokyo' },
  { name: '大阪',   slug: 'osaka' },
  { name: '愛知',   slug: 'aichi' },
  { name: '福岡',   slug: 'fukuoka' },
  { name: '神奈川', slug: 'kanagawa' },
  { name: '北海道', slug: 'hokkaido' },
  { name: '宮城',   slug: 'miyagi' },
  { name: '広島',   slug: 'hiroshima' },
  { name: '埼玉',   slug: 'saitama' },
  { name: '千葉',   slug: 'chiba' },
];

const BASE_URL = 'https://dto.jp';
const REQUEST_DELAY_MS = 2500;
const TOP_ENTRIES_PER_AREA = 30;
const DETAIL_LIMIT_PER_AREA = 30;

const OUTPUT_DIR = path.dirname(__filename);
const DATA_FILE = path.join(OUTPUT_DIR, 'dto-competitor-data-v2.json');
const LOG_FILE = path.join(OUTPUT_DIR, 'dto-analyze-v2.log');

const sleep = ms => new Promise(r => setTimeout(r, ms));
function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

async function scrapeRankingPage(page, area) {
  const url = `${BASE_URL}/${area.slug}/shop-list/diary`;
  log(`ランキング取得: ${area.name}`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(REQUEST_DELAY_MS);
  } catch (e) {
    log(`  ✗ ${area.name} ランキング失敗: ${e.message}`);
    return [];
  }
  const entries = await page.evaluate((limit) => {
    const items = document.querySelectorAll('ul.com_diary_inner > li');
    const results = [];
    for (let i = 0; i < Math.min(items.length, limit); i++) {
      const li = items[i];
      const link = li.querySelector('a');
      if (!link) continue;
      const href = link.getAttribute('href') || '';
      const title = (li.querySelector('span.title') || {}).textContent || '';
      const time = (li.querySelector('span.regist_time') || {}).textContent || '';
      const castName = (li.querySelector('span.gal_text span.name') || {}).textContent || '';
      const castAge = (li.querySelector('span.gal_text span.age') || {}).textContent || '';
      const shopName = (li.querySelector('span.shop span.inner2') || {}).textContent || '';
      const rankText = (li.querySelector('span.number') || {}).textContent || '';
      const rank = parseInt(rankText) || (i + 1);
      const thumb = li.querySelector('img');
      const thumbUrl = thumb ? (thumb.getAttribute('data-src') || thumb.getAttribute('src') || '') : '';
      results.push({
        href,
        title: title.trim(),
        postedTime: time.trim(),
        castName: castName.trim(),
        castAge: castAge.trim(),
        shopName: shopName.trim(),
        rank,
        thumbUrl,
      });
    }
    return results;
  }, TOP_ENTRIES_PER_AREA);
  log(`  ${entries.length}件取得`);
  return entries;
}

async function scrapeDiaryDetail(page, href) {
  const url = `${BASE_URL}${href}`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(REQUEST_DELAY_MS);
    return await page.evaluate(() => {
      const detailDiv = document.querySelector('.diary_detail');
      if (!detailDiv) return null;
      const title = (detailDiv.querySelector('.head .title') || {}).textContent || '';
      const contentEl = detailDiv.querySelector('.body .content');
      const bodyText = contentEl ? contentEl.textContent.replace(/\s+/g, ' ').trim() : '';
      const bodyHtml = contentEl ? contentEl.innerHTML : '';
      const favEl = detailDiv.querySelector('.favorite_diary .count');
      const likes = favEl ? parseInt(favEl.textContent) || 0 : 0;
      // 画像URL全部
      const imgs = Array.from(detailDiv.querySelectorAll('img'))
        .map(i => i.getAttribute('data-src') || i.getAttribute('src') || '')
        .filter(u => u && !u.includes('icon') && !u.includes('emoji'));
      // 本文中のリンク（導線）
      const links = contentEl ? Array.from(contentEl.querySelectorAll('a')).map(a => ({
        href: a.getAttribute('href') || '',
        text: (a.textContent || '').trim(),
      })) : [];
      return { title: title.trim(), bodyText, bodyHtml, likes, imageUrls: imgs, innerLinks: links };
    });
  } catch (e) {
    log(`  詳細取得エラー ${href}: ${e.message}`);
    return null;
  }
}

async function main() {
  try { fs.writeFileSync(LOG_FILE, ''); } catch {}
  log('=== dto競合分析v2 開始 ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  const allEntries = [];
  try {
    for (const area of AREAS) {
      log(`\n--- ${area.name} ---`);
      const ranking = await scrapeRankingPage(page, area);
      const details = ranking.slice(0, DETAIL_LIMIT_PER_AREA);
      for (let i = 0; i < details.length; i++) {
        const entry = details[i];
        log(`  [${i + 1}/${details.length}] ${entry.castName} "${entry.title}"`);
        const detail = await scrapeDiaryDetail(page, entry.href);
        allEntries.push({
          area: area.name,
          areaSlug: area.slug,
          ...entry,
          bodyText: detail?.bodyText || null,
          bodyHtml: detail?.bodyHtml || null,
          likes: detail?.likes ?? null,
          imageUrls: detail?.imageUrls || [],
          innerLinks: detail?.innerLinks || [],
        });
        // Incremental save
        if (allEntries.length % 10 === 0) {
          fs.writeFileSync(DATA_FILE, JSON.stringify(allEntries, null, 2), 'utf-8');
        }
      }
      for (let i = DETAIL_LIMIT_PER_AREA; i < ranking.length; i++) {
        allEntries.push({ area: area.name, areaSlug: area.slug, ...ranking[i], bodyText: null, bodyHtml: null, likes: null, imageUrls: [], innerLinks: [] });
      }
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(allEntries, null, 2), 'utf-8');
    log(`\n=== 完了 計${allEntries.length}件 → ${DATA_FILE} ===`);
  } finally {
    await browser.close();
  }
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });
