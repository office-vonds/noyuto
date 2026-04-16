/**
 * デリヘルタウン（dto.jp）写メ日記 競合分析スクレイピングスクリプト
 *
 * 目的: 人気エリアの上位店舗の写メ日記を収集・分析し、
 *       エンゲージメントが高い投稿パターンを抽出する
 *
 * 出力:
 *   - dto-competitor-data.json: 収集した生データ
 *   - dto-analysis-result.json: 分析結果
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// === 設定 ===
const AREAS = [
  { name: '東京', slug: 'tokyo' },
  { name: '大阪', slug: 'osaka' },
  { name: '愛知（名古屋）', slug: 'aichi' },
  { name: '福岡', slug: 'fukuoka' },
  { name: '神奈川（横浜）', slug: 'kanagawa' },
];

const BASE_URL = 'https://dto.jp';
const REQUEST_DELAY_MS = 2500; // レート制限: 2.5秒
const TOP_ENTRIES_PER_AREA = 30; // 各エリアの上位30件を取得
const DETAIL_LIMIT_PER_AREA = 15; // 詳細ページは各エリア15件まで

const OUTPUT_DIR = path.dirname(__filename);
const DATA_FILE = path.join(OUTPUT_DIR, 'dto-competitor-data.json');
const ANALYSIS_FILE = path.join(OUTPUT_DIR, 'dto-analysis-result.json');

// === ユーティリティ ===
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(msg) {
  const now = new Date().toLocaleTimeString('ja-JP');
  console.log(`[${now}] ${msg}`);
}

// === スクレイピング ===

/**
 * ランキングページから上位エントリを取得
 */
async function scrapeRankingPage(page, area) {
  const url = `${BASE_URL}/${area.slug}/shop-list/diary`;
  log(`ランキングページ取得中: ${area.name} (${url})`);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(REQUEST_DELAY_MS);

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

      results.push({
        href,
        title: title.trim(),
        postedTime: time.trim(),
        castName: castName.trim(),
        castAge: castAge.trim(),
        shopName: shopName.trim(),
        rank,
      });
    }
    return results;
  }, TOP_ENTRIES_PER_AREA);

  log(`  ${entries.length}件取得`);
  return entries;
}

/**
 * 個別日記ページから本文・いいね数を取得
 */
async function scrapeDiaryDetail(page, href) {
  const url = `${BASE_URL}${href}`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(REQUEST_DELAY_MS);

    const detail = await page.evaluate(() => {
      const detailDiv = document.querySelector('.diary_detail');
      if (!detailDiv) return null;

      const title = (detailDiv.querySelector('.head .title') || {}).textContent || '';
      const noteEl = detailDiv.querySelector('.head .note');
      const noteText = noteEl ? noteEl.textContent : '';

      // 本文取得（HTMLタグを除去してプレーンテキストに）
      const contentEl = detailDiv.querySelector('.body .content');
      const bodyHtml = contentEl ? contentEl.innerHTML : '';
      const bodyText = contentEl ? contentEl.textContent.replace(/\s+/g, ' ').trim() : '';

      // いいね数
      const favEl = detailDiv.querySelector('.favorite_diary .count');
      const likes = favEl ? parseInt(favEl.textContent) || 0 : 0;

      return {
        title: title.trim(),
        noteText: noteText.trim(),
        bodyText,
        bodyHtml,
        likes,
      };
    });

    return detail;
  } catch (e) {
    log(`  詳細取得エラー: ${href} - ${e.message}`);
    return null;
  }
}

// === 分析ロジック ===

function analyzeData(allEntries) {
  log('分析開始...');

  const results = {
    totalEntries: allEntries.length,
    generatedAt: new Date().toISOString(),
    areas: {},
    overall: {},
  };

  // --- エリア別分析 ---
  const areaGroups = {};
  for (const entry of allEntries) {
    if (!areaGroups[entry.area]) areaGroups[entry.area] = [];
    areaGroups[entry.area].push(entry);
  }

  for (const [area, entries] of Object.entries(areaGroups)) {
    results.areas[area] = analyzeEntryGroup(entries);
  }

  // --- 全体分析 ---
  results.overall = analyzeEntryGroup(allEntries);

  // --- 上位投稿パターン（いいね数 上位20件）---
  const withLikes = allEntries.filter(e => e.likes !== undefined && e.likes !== null);
  withLikes.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  results.topPosts = withLikes.slice(0, 20).map(e => ({
    rank: e.rank,
    area: e.area,
    title: e.title,
    shopName: e.shopName,
    castName: e.castName,
    likes: e.likes,
    bodyLength: (e.bodyText || '').length,
    postedTime: e.postedTime,
    emojiCount: countEmojis(e.bodyText || ''),
  }));

  return results;
}

function analyzeEntryGroup(entries) {
  const result = {
    count: entries.length,
  };

  // 文字数分布
  const lengths = entries
    .filter(e => e.bodyText)
    .map(e => e.bodyText.length);

  if (lengths.length > 0) {
    lengths.sort((a, b) => a - b);
    result.bodyLength = {
      min: lengths[0],
      max: lengths[lengths.length - 1],
      avg: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length),
      median: lengths[Math.floor(lengths.length / 2)],
      distribution: {
        '0-100': lengths.filter(l => l <= 100).length,
        '101-200': lengths.filter(l => l > 100 && l <= 200).length,
        '201-300': lengths.filter(l => l > 200 && l <= 300).length,
        '301-500': lengths.filter(l => l > 300 && l <= 500).length,
        '501-1000': lengths.filter(l => l > 500 && l <= 1000).length,
        '1001+': lengths.filter(l => l > 1000).length,
      },
    };
  }

  // 時間帯分布
  const hourDist = {};
  for (let h = 0; h < 24; h++) hourDist[h] = 0;

  for (const entry of entries) {
    const time = entry.postedTime || '';
    // "4月16日(木) 22:10" or "2026年4月16日(木) 22:10"
    const match = time.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const hour = parseInt(match[1]);
      hourDist[hour]++;
    }
  }
  result.timeDistribution = hourDist;

  // ピーク時間帯
  const sortedHours = Object.entries(hourDist)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0);
  result.peakHours = sortedHours.slice(0, 5).map(([hour, count]) => ({
    hour: parseInt(hour),
    count,
  }));

  // 絵文字使用頻度
  const emojiCounts = entries
    .filter(e => e.bodyText)
    .map(e => countEmojis(e.bodyText));

  if (emojiCounts.length > 0) {
    result.emojiUsage = {
      avgPerPost: Math.round((emojiCounts.reduce((a, b) => a + b, 0) / emojiCounts.length) * 10) / 10,
      postsWithEmoji: emojiCounts.filter(c => c > 0).length,
      postsWithoutEmoji: emojiCounts.filter(c => c === 0).length,
      emojiRatio: Math.round((emojiCounts.filter(c => c > 0).length / emojiCounts.length) * 100),
    };
  }

  // 頻出絵文字
  const emojiFreq = {};
  for (const entry of entries) {
    if (!entry.bodyText) continue;
    const emojis = extractEmojis(entry.bodyText);
    for (const e of emojis) {
      emojiFreq[e] = (emojiFreq[e] || 0) + 1;
    }
  }
  result.topEmojis = Object.entries(emojiFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([emoji, count]) => ({ emoji, count }));

  // タイトルパターン分析
  const titles = entries.map(e => e.title).filter(Boolean);
  result.titleAnalysis = {
    avgLength: titles.length > 0
      ? Math.round(titles.reduce((a, t) => a + t.length, 0) / titles.length)
      : 0,
    withEmoji: titles.filter(t => countEmojis(t) > 0).length,
    withoutEmoji: titles.filter(t => countEmojis(t) === 0).length,
    // 頻出ワード（2文字以上）
    frequentWords: extractFrequentWords(titles, 20),
  };

  // 店舗別投稿数
  const shopCounts = {};
  for (const entry of entries) {
    if (entry.shopName) {
      shopCounts[entry.shopName] = (shopCounts[entry.shopName] || 0) + 1;
    }
  }
  result.topShops = Object.entries(shopCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // いいね数分析
  const likesArr = entries
    .filter(e => e.likes !== undefined && e.likes !== null)
    .map(e => e.likes);

  if (likesArr.length > 0) {
    likesArr.sort((a, b) => a - b);
    result.likes = {
      min: likesArr[0],
      max: likesArr[likesArr.length - 1],
      avg: Math.round((likesArr.reduce((a, b) => a + b, 0) / likesArr.length) * 10) / 10,
      median: likesArr[Math.floor(likesArr.length / 2)],
    };
  }

  return result;
}

// 絵文字カウント
function countEmojis(text) {
  if (!text) return 0;
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{2934}\u{2935}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2602}\u{2603}\u{2604}\u{260E}\u{2611}\u{2614}\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}\u{2623}\u{2626}\u{262A}\u{262E}\u{262F}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{265F}\u{2660}\u{2663}\u{2665}\u{2666}\u{2668}\u{267B}\u{267E}\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}\u{269C}\u{26A0}\u{26A1}\u{26AA}\u{26AB}\u{26B0}\u{26B1}\u{26BD}\u{26BE}\u{26C4}\u{26C5}\u{26C8}\u{26CE}\u{26CF}\u{26D1}\u{26D3}\u{26D4}\u{26E9}\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}]/gu;
  const matches = text.match(emojiRegex);
  return matches ? matches.length : 0;
}

// 絵文字抽出
function extractEmojis(text) {
  if (!text) return [];
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{2934}\u{2935}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2602}\u{2603}\u{2604}\u{260E}\u{2611}\u{2614}\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}\u{2623}\u{2626}\u{262A}\u{262E}\u{262F}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{265F}\u{2660}\u{2663}\u{2665}\u{2666}\u{2668}\u{267B}\u{267E}\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}\u{269C}\u{26A0}\u{26A1}\u{26AA}\u{26AB}\u{26B0}\u{26B1}\u{26BD}\u{26BE}\u{26C4}\u{26C5}\u{26C8}\u{26CE}\u{26CF}\u{26D1}\u{26D3}\u{26D4}\u{26E9}\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}]/gu;
  return text.match(emojiRegex) || [];
}

// 頻出ワード抽出
function extractFrequentWords(texts, limit) {
  const wordFreq = {};
  // 日本語の場合、2-6文字のカタカナ・ひらがな・漢字の連続を抽出
  const wordRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]{2,6}/g;

  for (const text of texts) {
    const words = text.match(wordRegex) || [];
    for (const w of words) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }

  // 一般的すぎるワードを除外
  const stopWords = new Set(['です', 'ます', 'した', 'して', 'する', 'から', 'まで', 'ない', 'ある', 'いる', 'なる', 'れる', 'られ', 'こと', 'もの', 'ところ', 'よう', 'ため']);

  return Object.entries(wordFreq)
    .filter(([word]) => !stopWords.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

// === メイン処理 ===

async function main() {
  log('=== デリヘルタウン 写メ日記 競合分析 開始 ===');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const allEntries = [];

  try {
    for (const area of AREAS) {
      log(`\n--- ${area.name} エリア ---`);

      // 1. ランキングページから上位エントリ取得
      const rankingEntries = await scrapeRankingPage(page, area);

      // 2. 上位の詳細ページを取得
      const detailTargets = rankingEntries.slice(0, DETAIL_LIMIT_PER_AREA);
      log(`  詳細ページ ${detailTargets.length}件を取得中...`);

      for (let i = 0; i < detailTargets.length; i++) {
        const entry = detailTargets[i];
        log(`  [${i + 1}/${detailTargets.length}] ${entry.title} (${entry.castName})`);

        const detail = await scrapeDiaryDetail(page, entry.href);

        const fullEntry = {
          area: area.name,
          areaSlug: area.slug,
          ...entry,
          bodyText: detail ? detail.bodyText : null,
          likes: detail ? detail.likes : null,
        };

        allEntries.push(fullEntry);
      }

      // 残りのエントリ（詳細なし）も記録
      for (let i = DETAIL_LIMIT_PER_AREA; i < rankingEntries.length; i++) {
        allEntries.push({
          area: area.name,
          areaSlug: area.slug,
          ...rankingEntries[i],
          bodyText: null,
          likes: null,
        });
      }

      log(`  ${area.name} 完了: ${rankingEntries.length}件`);
    }

    // 3. 生データ保存
    log(`\n生データ保存: ${DATA_FILE}`);
    fs.writeFileSync(DATA_FILE, JSON.stringify(allEntries, null, 2), 'utf-8');
    log(`  ${allEntries.length}件保存完了`);

    // 4. 分析実行・保存
    const analysis = analyzeData(allEntries);
    log(`分析結果保存: ${ANALYSIS_FILE}`);
    fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(analysis, null, 2), 'utf-8');
    log('分析結果保存完了');

    // 5. サマリー表示
    printSummary(analysis);

  } catch (e) {
    log(`エラー発生: ${e.message}`);
    console.error(e);

    // エラーでも途中データは保存
    if (allEntries.length > 0) {
      log('途中データを保存中...');
      fs.writeFileSync(DATA_FILE, JSON.stringify(allEntries, null, 2), 'utf-8');
      const analysis = analyzeData(allEntries);
      fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(analysis, null, 2), 'utf-8');
    }
  } finally {
    await browser.close();
  }

  log('\n=== 完了 ===');
}

function printSummary(analysis) {
  console.log('\n========================================');
  console.log('        分析サマリー');
  console.log('========================================');
  console.log(`総投稿数: ${analysis.totalEntries}`);

  if (analysis.overall.bodyLength) {
    console.log(`\n【文字数分布】`);
    console.log(`  平均: ${analysis.overall.bodyLength.avg}文字`);
    console.log(`  中央値: ${analysis.overall.bodyLength.median}文字`);
    console.log(`  最小: ${analysis.overall.bodyLength.min}文字 / 最大: ${analysis.overall.bodyLength.max}文字`);
    console.log(`  分布:`, analysis.overall.bodyLength.distribution);
  }

  if (analysis.overall.peakHours) {
    console.log(`\n【投稿ピーク時間帯】`);
    for (const h of analysis.overall.peakHours) {
      console.log(`  ${h.hour}時台: ${h.count}件`);
    }
  }

  if (analysis.overall.emojiUsage) {
    console.log(`\n【絵文字使用】`);
    console.log(`  使用率: ${analysis.overall.emojiUsage.emojiRatio}%`);
    console.log(`  平均/投稿: ${analysis.overall.emojiUsage.avgPerPost}個`);
  }

  if (analysis.overall.topEmojis && analysis.overall.topEmojis.length > 0) {
    console.log(`\n【頻出絵文字 TOP10】`);
    for (const e of analysis.overall.topEmojis.slice(0, 10)) {
      console.log(`  ${e.emoji}: ${e.count}回`);
    }
  }

  if (analysis.overall.titleAnalysis) {
    console.log(`\n【タイトル分析】`);
    console.log(`  平均文字数: ${analysis.overall.titleAnalysis.avgLength}文字`);
    console.log(`  絵文字あり: ${analysis.overall.titleAnalysis.withEmoji}件`);
    if (analysis.overall.titleAnalysis.frequentWords.length > 0) {
      console.log(`  頻出ワード:`, analysis.overall.titleAnalysis.frequentWords.slice(0, 10).map(w => `${w.word}(${w.count})`).join(', '));
    }
  }

  if (analysis.overall.topShops && analysis.overall.topShops.length > 0) {
    console.log(`\n【上位店舗】`);
    for (const s of analysis.overall.topShops.slice(0, 5)) {
      console.log(`  ${s.name}: ${s.count}件`);
    }
  }

  if (analysis.topPosts && analysis.topPosts.length > 0) {
    console.log(`\n【いいね数 TOP5投稿】`);
    for (const p of analysis.topPosts.slice(0, 5)) {
      console.log(`  ${p.likes}いいね | ${p.area} | ${p.shopName} | ${p.castName} | ${p.title}`);
    }
  }
}

main().catch(console.error);
