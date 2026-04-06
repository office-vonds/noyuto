/**
 * デリヘルタウン(dto.jp) 写メ日記ランキング調査スクリプト
 * 全国上位キャストの写メ日記を収集・分析し「勝ちパターン」を抽出する
 */
const { chromium } = require('playwright');

const AREAS = [
  { name: '東京', slug: 'tokyo' },
  { name: '大阪', slug: 'osaka' },
  { name: '神奈川', slug: 'kanagawa' },
  { name: '愛知', slug: 'aichi' },
  { name: '福岡', slug: 'fukuoka' },
  { name: '北海道', slug: 'hokkaido' },
  { name: '埼玉', slug: 'saitama' },
  { name: '千葉', slug: 'chiba' },
];

const BASE_URL = 'https://www.dto.jp';
const MAX_DIARIES_PER_AREA = 10;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function collectDiaryLinksFromRanking(page, areaSlug) {
  const url = `${BASE_URL}/${areaSlug}/shop-list/diary`;
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    if (!resp || resp.status() !== 200) return [];
    await sleep(1500);
  } catch (e) {
    console.log(`    アクセス失敗: ${e.message}`);
    return [];
  }

  const diaries = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="diary_id="]'));
    return links.map(a => {
      const text = a.textContent.trim();
      // テキストからランク、タイトル、キャスト名、店舗名などを抽出
      const rankMatch = text.match(/^(\d+)位/);
      return {
        href: a.href,
        fullText: text.substring(0, 200),
        rank: rankMatch ? parseInt(rankMatch[1]) : null,
        classes: a.className,
      };
    }).filter(l => l.rank && l.rank <= 50);
  });

  return diaries;
}

async function scrapeDiaryDetail(page, url) {
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    if (!resp || resp.status() !== 200) return null;
    await sleep(1200);

    const diary = await page.evaluate(() => {
      // 日記本文: .body.clearfix または .diary_detail 内
      let bodyText = '';
      let bodyHtml = '';

      const bodyEl = document.querySelector('.body.clearfix')
        || document.querySelector('.diary_detail .body')
        || document.querySelector('.diary_detail');

      if (bodyEl) {
        bodyText = bodyEl.innerText.trim();
        bodyHtml = bodyEl.innerHTML;
      }

      // フォールバック
      if (!bodyText || bodyText.length < 10) {
        const main = document.querySelector('#main_frame') || document.querySelector('main');
        if (main) bodyText = main.innerText.trim();
      }

      // タイトル: ページタイトルから抽出 or h2等
      const pageTitle = document.title;
      // "Mな身体で責めて責められ…🩷｜写メ日記 - 舞湖｜..." のパターン
      let title = '';
      const titleMatch = pageTitle.match(/^(.+?)｜写メ日記/);
      if (titleMatch) {
        title = titleMatch[1].trim();
      } else {
        // diary_detail内のタイトル要素
        const titleEl = document.querySelector('.diary_detail h2, .diary_detail h3, .diary_title');
        if (titleEl) title = titleEl.textContent.trim();
      }

      // キャスト名: h2.gal_name or ページタイトルから
      let castName = '';
      const galNameEl = document.querySelector('h2.gal_name, .gal_name');
      if (galNameEl) {
        castName = galNameEl.textContent.trim();
      } else {
        const castMatch = pageTitle.match(/写メ日記\s*-\s*(.+?)｜/);
        if (castMatch) castName = castMatch[1].trim();
      }

      // 店舗名
      let shopName = '';
      const shopEl = document.querySelector('.shop_name, [class*="shop_name"]');
      if (shopEl) {
        shopName = shopEl.textContent.trim();
      } else {
        // ページタイトルの最後の部分
        const parts = pageTitle.split('｜');
        if (parts.length >= 3) {
          shopName = parts[parts.length - 2].replace(/ - デリヘルタウン$/, '').trim();
        }
      }

      // h1からも店舗名を取得できる
      if (!shopName) {
        const h1 = document.querySelector('h1');
        if (h1) {
          const h1Match = h1.textContent.match(/（(.+?)）/);
          if (h1Match) shopName = h1Match[1];
        }
      }

      // 画像
      const diaryImages = document.querySelectorAll('.diary_detail img, .body img, img[src*="diary"]');
      const imageCount = diaryImages.length;
      const imageSrcs = Array.from(diaryImages).map(img => img.src).slice(0, 5);

      // いいね数
      let likeCount = 0;
      const likeEl = document.querySelector('[class*="like"] span, [class*="good"]');
      if (likeEl) {
        const m = likeEl.textContent.match(/(\d+)/);
        if (m) likeCount = parseInt(m[1]);
      }
      // "いいね！26" パターンも
      const bodyAllText = document.body.innerText;
      const likeMatch = bodyAllText.match(/いいね！(\d+)/);
      if (likeMatch && !likeCount) likeCount = parseInt(likeMatch[1]);

      // 本文内のリンク
      const bodyLinks = [];
      if (bodyEl) {
        bodyEl.querySelectorAll('a[href]').forEach(a => {
          bodyLinks.push({ href: a.href, text: a.textContent.trim() });
        });
      }

      // 投稿日時
      let postDate = '';
      const dateMatch = bodyAllText.match(/(\d{4}年\d{1,2}月\d{1,2}日\([月火水木金土日]\)\s*\d{1,2}:\d{2})/);
      if (dateMatch) postDate = dateMatch[1];

      return {
        title,
        castName,
        shopName,
        bodyText: bodyText.substring(0, 10000),
        bodyHtml: bodyHtml.substring(0, 12000),
        imageCount,
        imageSrcs,
        likeCount,
        bodyLinks,
        postDate,
        url: window.location.href,
        pageTitle,
      };
    });

    return diary;
  } catch (e) {
    console.log(`      エラー: ${e.message}`);
    return null;
  }
}

function analyzeEmojis(text) {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2614}-\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}\u{1FA77}-\u{1FA7C}\u{1F979}\u{1FAE0}-\u{1FAE8}]/gu;

  const emojis = text.match(emojiRegex) || [];
  const freq = {};
  emojis.forEach(e => { freq[e] = (freq[e] || 0) + 1; });

  return {
    total: emojis.length,
    unique: Object.keys(freq).length,
    frequency: Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([emoji, count]) => ({ emoji, count })),
  };
}

function analyzeDecorationPatterns(text) {
  const patterns = {
    starLine: (text.match(/[★☆✩✪⭐]/g) || []).length,
    heartLine: (text.match(/[♡♥❤💕💖💗💓💞💘💝🩷🩶🖤🤍🤎💜💙💚🧡💛]/g) || []).length,
    musicNote: (text.match(/[♪♫♬🎵🎶]/g) || []).length,
    sparkle: (text.match(/[✨💫✩✧]/g) || []).length,
    flower: (text.match(/[🌸🌺🌹💐🌷🌻🌼🍀]/g) || []).length,
    kakkoLine: (text.match(/[【】「」『』〈〉《》〔〕｢｣]/g) || []).length,
    decorLine: (text.match(/[━─═＝〜～…‥┈┄▹▸◃◂⿻]/g) || []).length,
    exclamation: (text.match(/[！!]{2,}/g) || []).length,
    arrow: (text.match(/[→⇒▶►➡➤↓↑↗]/g) || []).length,
    kaomoji: (text.match(/[\(（][^\)）]{2,15}[\)）]/g) || []).length,
    circledNum: (text.match(/[①②③④⑤⑥⑦⑧⑨⑩㈪㈫㈬㈭㈮㈯㈰]/g) || []).length,
  };

  // 見出し・装飾行パターン検出
  const headingPatterns = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.length > 80) continue;

    // 装飾記号で囲まれた行
    if (/^[★☆✩♡♥❤💕✨🌸♪【《『「〈━─═▹◃┈┄⿻].{2,}/.test(trimmed) && trimmed.length < 60) {
      headingPatterns.push(trimmed);
    }
    // 【】で囲まれた見出し
    else if (/^【.+】/.test(trimmed)) {
      headingPatterns.push(trimmed.substring(0, 60));
    }
    // ━━━ や ┈┈┈ などの区切り線
    else if (/^[━═─┈┄▹◃▸◂⿻\*\.·˖°]{3,}/.test(trimmed) && trimmed.length < 40) {
      headingPatterns.push(trimmed);
    }
    // ♡ で始まる箇条書き
    else if (/^[♡♥❤💕✨🌸♪▸▹►➤→●◆■□]/.test(trimmed) && trimmed.length < 60) {
      headingPatterns.push(trimmed);
    }
  }

  return { patterns, headingPatterns: [...new Set(headingPatterns)].slice(0, 20) };
}

function analyzeLineBreaks(text) {
  const lines = text.split('\n');
  const nonEmptyLines = lines.filter(l => l.trim().length > 0);
  const emptyLines = lines.filter(l => l.trim().length === 0);

  // 1行あたりの平均文字数
  const charsPerLine = nonEmptyLines.map(l => l.trim().length);
  const avgCharsPerLine = charsPerLine.length > 0
    ? Math.round(charsPerLine.reduce((a, b) => a + b, 0) / charsPerLine.length)
    : 0;

  // 空行の割合
  const emptyRatio = lines.length > 0 ? Math.round(emptyLines.length / lines.length * 100) : 0;

  return {
    totalLines: lines.length,
    nonEmptyLines: nonEmptyLines.length,
    emptyLines: emptyLines.length,
    avgCharsPerLine,
    emptyRatio,
  };
}

async function main() {
  console.log('='.repeat(70));
  console.log('  デリヘルタウン(dto.jp) 写メ日記ランキング調査');
  console.log('  実行日: ' + new Date().toISOString().split('T')[0]);
  console.log('='.repeat(70));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  const allDiaries = [];
  const areaResults = [];

  for (const area of AREAS) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`[${area.name}] ランキング調査`);
    console.log('='.repeat(50));

    const diaryLinks = await collectDiaryLinksFromRanking(page, area.slug);
    console.log(`  ランキング掲載日記: ${diaryLinks.length}件`);

    if (diaryLinks.length === 0) {
      areaResults.push({ area: area.name, slug: area.slug, collected: 0, found: 0 });
      continue;
    }

    // 上位の日記を個別取得
    let collected = 0;
    for (const link of diaryLinks.slice(0, MAX_DIARIES_PER_AREA)) {
      console.log(`  [${link.rank}位] ${link.fullText.substring(0, 60)}`);

      const diary = await scrapeDiaryDetail(page, link.href);
      if (diary && diary.bodyText && diary.bodyText.length > 20) {
        diary.area = area.name;
        diary.areaSlug = area.slug;
        diary.areaRank = link.rank;
        allDiaries.push(diary);
        console.log(`    -> ${diary.castName} | ${diary.shopName} | ${diary.bodyText.length}文字 | いいね${diary.likeCount} | 画像${diary.imageCount}枚`);
        collected++;
      } else {
        console.log(`    -> 本文取得失敗`);
      }
      await sleep(600);
    }

    areaResults.push({
      area: area.name,
      slug: area.slug,
      collected,
      found: diaryLinks.length,
    });
  }

  await browser.close();

  // ===== 分析レポート =====
  console.log('\n\n');
  console.log('#'.repeat(70));
  console.log('#  写メ日記 分析レポート');
  console.log('#'.repeat(70));

  console.log(`\n## 収集サマリー`);
  console.log(`  調査エリア数: ${AREAS.length}`);
  console.log(`  収集日記数: ${allDiaries.length}`);
  areaResults.forEach(r => {
    console.log(`  ${r.area}: ${r.collected}件収集 (ランキング${r.found}件中)`);
  });

  if (allDiaries.length === 0) {
    console.log('\n*** 日記が1件も取得できませんでした ***');
    return;
  }

  // === 文字数統計 ===
  const charCounts = allDiaries.map(d => d.bodyText.length).sort((a, b) => a - b);
  const avg = Math.round(charCounts.reduce((a, b) => a + b, 0) / charCounts.length);
  const median = charCounts[Math.floor(charCounts.length / 2)];
  const min = charCounts[0];
  const max = charCounts[charCounts.length - 1];

  console.log(`\n## 1. 文字数統計`);
  console.log(`  平均: ${avg}文字`);
  console.log(`  中央値: ${median}文字`);
  console.log(`  最小: ${min}文字`);
  console.log(`  最大: ${max}文字`);
  console.log(`  分布:`);
  const ranges = [[0, 100], [100, 200], [200, 400], [400, 700], [700, 1000], [1000, 2000], [2000, Infinity]];
  ranges.forEach(([lo, hi]) => {
    const count = charCounts.filter(c => c >= lo && c < hi).length;
    const pct = Math.round(count / allDiaries.length * 100);
    const bar = '#'.repeat(Math.round(count / allDiaries.length * 40));
    const label = hi === Infinity ? `${lo}文字以上` : `${lo}-${hi}文字`;
    console.log(`    ${label.padEnd(15)} ${count.toString().padStart(3)}件 (${pct.toString().padStart(2)}%) ${bar}`);
  });

  // === 絵文字分析 ===
  console.log(`\n## 2. 絵文字使用パターン`);
  const allEmojiData = allDiaries.map(d => ({
    ...analyzeEmojis(d.bodyText),
    charCount: d.bodyText.length,
  }));
  const totalEmojis = allEmojiData.reduce((a, b) => a + b.total, 0);
  const avgEmojis = (totalEmojis / allDiaries.length).toFixed(1);
  const diariesWithEmoji = allEmojiData.filter(e => e.total > 0).length;
  const avgEmojiDensity = allEmojiData.length > 0
    ? (allEmojiData.reduce((a, b) => a + (b.charCount > 0 ? b.total / b.charCount * 100 : 0), 0) / allEmojiData.length).toFixed(1)
    : '0';

  console.log(`  絵文字使用率: ${diariesWithEmoji}/${allDiaries.length}件 (${Math.round(diariesWithEmoji / allDiaries.length * 100)}%)`);
  console.log(`  平均絵文字数: ${avgEmojis}個/記事`);
  console.log(`  絵文字密度: ${avgEmojiDensity}% (本文中の絵文字の割合)`);

  const globalEmojiFreq = {};
  allEmojiData.forEach(e => {
    e.frequency.forEach(({ emoji, count }) => {
      globalEmojiFreq[emoji] = (globalEmojiFreq[emoji] || 0) + count;
    });
  });
  const topEmojis = Object.entries(globalEmojiFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);
  console.log(`\n  よく使われる絵文字 TOP25:`);
  topEmojis.forEach(([emoji, count], i) => {
    console.log(`    ${(i + 1).toString().padStart(2)}. ${emoji}  x${count}回`);
  });

  // === 装飾・見出しパターン ===
  console.log(`\n## 3. 見出し・装飾パターン`);
  const allDeco = allDiaries.map(d => analyzeDecorationPatterns(d.bodyText));
  const decoTotals = {};
  allDeco.forEach(d => {
    Object.entries(d.patterns).forEach(([key, val]) => {
      decoTotals[key] = (decoTotals[key] || 0) + val;
    });
  });
  const decoNames = {
    starLine: '★☆スター系',
    heartLine: '♡♥ハート系',
    musicNote: '♪音符系',
    sparkle: '✨キラキラ系',
    flower: '🌸花・クローバー系',
    kakkoLine: '【】「」括弧系',
    decorLine: '━─罫線・装飾線',
    exclamation: '!!感嘆符連続',
    arrow: '→矢印系',
    kaomoji: '顔文字',
    circledNum: '丸数字・曜日',
  };
  Object.entries(decoTotals)
    .sort((a, b) => b[1] - a[1])
    .forEach(([key, count]) => {
      const bar = '#'.repeat(Math.min(30, Math.round(count / 3)));
      console.log(`  ${(decoNames[key] || key).padEnd(20)} ${count.toString().padStart(4)}回 ${bar}`);
    });

  // 見出し実例
  const allHeadings = [];
  allDeco.forEach(d => allHeadings.push(...d.headingPatterns));
  if (allHeadings.length > 0) {
    console.log(`\n  装飾行・見出しの実例 (${allHeadings.length}種):`);
    [...new Set(allHeadings)].slice(0, 25).forEach(h => console.log(`    ${h}`));
  }

  // === 改行・レイアウト分析 ===
  console.log(`\n## 4. 改行・レイアウト分析`);
  const lineData = allDiaries.map(d => analyzeLineBreaks(d.bodyText));
  const avgTotalLines = Math.round(lineData.reduce((a, b) => a + b.totalLines, 0) / lineData.length);
  const avgEmptyRatio = Math.round(lineData.reduce((a, b) => a + b.emptyRatio, 0) / lineData.length);
  const avgCPL = Math.round(lineData.reduce((a, b) => a + b.avgCharsPerLine, 0) / lineData.length);
  console.log(`  平均行数: ${avgTotalLines}行/記事`);
  console.log(`  平均空行率: ${avgEmptyRatio}%`);
  console.log(`  1行あたり平均文字数: ${avgCPL}文字`);

  // === URL/リンク分析 ===
  console.log(`\n## 5. URL/リンクの使い方`);
  const diariesWithLinks = allDiaries.filter(d => d.bodyLinks && d.bodyLinks.length > 0);
  console.log(`  リンク含む日記: ${diariesWithLinks.length}/${allDiaries.length}件 (${Math.round(diariesWithLinks.length / allDiaries.length * 100)}%)`);
  if (diariesWithLinks.length > 0) {
    const allBodyLinks = diariesWithLinks.flatMap(d => d.bodyLinks);
    console.log(`  リンク総数: ${allBodyLinks.length}件`);
    const linkPatterns = {};
    allBodyLinks.forEach(l => {
      try {
        const domain = new URL(l.href).hostname;
        linkPatterns[domain] = (linkPatterns[domain] || 0) + 1;
      } catch (e) {
        linkPatterns['(parse error)'] = (linkPatterns['(parse error)'] || 0) + 1;
      }
    });
    console.log(`  リンク先ドメイン:`);
    Object.entries(linkPatterns).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .forEach(([domain, count]) => console.log(`    ${domain}: ${count}件`));
  }

  // === 画像分析 ===
  console.log(`\n## 6. 画像の使用状況`);
  const diariesWithImages = allDiaries.filter(d => d.imageCount > 0);
  console.log(`  画像あり: ${diariesWithImages.length}/${allDiaries.length}件 (${Math.round(diariesWithImages.length / allDiaries.length * 100)}%)`);
  if (diariesWithImages.length > 0) {
    const imgCounts = diariesWithImages.map(d => d.imageCount);
    console.log(`  平均画像数: ${(imgCounts.reduce((a, b) => a + b, 0) / imgCounts.length).toFixed(1)}枚`);
    console.log(`  最大画像数: ${Math.max(...imgCounts)}枚`);
  }

  // === いいね数分析 ===
  console.log(`\n## 7. いいね数分析`);
  const likes = allDiaries.map(d => d.likeCount).filter(l => l > 0).sort((a, b) => a - b);
  if (likes.length > 0) {
    console.log(`  いいね付き日記: ${likes.length}/${allDiaries.length}件`);
    console.log(`  平均いいね: ${Math.round(likes.reduce((a, b) => a + b, 0) / likes.length)}`);
    console.log(`  中央値: ${likes[Math.floor(likes.length / 2)]}`);
    console.log(`  最大: ${likes[likes.length - 1]}`);
    console.log(`  最小: ${likes[0]}`);
  }

  // === タイトルパターン分析 ===
  console.log(`\n## 8. タイトルパターン分析`);
  const titles = allDiaries.map(d => d.title).filter(t => t && t.length > 0);
  const titleLens = titles.map(t => t.length);
  if (titleLens.length > 0) {
    console.log(`  平均タイトル文字数: ${Math.round(titleLens.reduce((a, b) => a + b, 0) / titleLens.length)}文字`);
    console.log(`  最長: ${Math.max(...titleLens)}文字`);
    console.log(`  最短: ${Math.min(...titleLens)}文字`);

    // 絵文字含有率
    const titlesWithEmoji = titles.filter(t => analyzeEmojis(t).total > 0).length;
    console.log(`  絵文字含有率: ${Math.round(titlesWithEmoji / titles.length * 100)}%`);
  }
  console.log(`\n  タイトル一覧:`);
  allDiaries.forEach((d, i) => {
    console.log(`    ${(i + 1).toString().padStart(3)}. [${d.area}${d.areaRank}位] ${d.title || '(なし)'} (${d.bodyText.length}文字/いいね${d.likeCount})`);
  });

  // === 上位記事の全文 ===
  console.log(`\n## 9. 上位記事の全文テキスト`);
  console.log(`   (いいね数が多い順 TOP3 + 文字数が多い順 TOP3)`);

  // いいね数順TOP3
  const byLikes = [...allDiaries].sort((a, b) => b.likeCount - a.likeCount);
  console.log(`\n### いいね数 TOP3`);
  byLikes.slice(0, 3).forEach((d, i) => {
    console.log(`\n${'~'.repeat(60)}`);
    console.log(`[いいね${i + 1}位] ${d.title || '(タイトルなし)'}`);
    console.log(`  エリア: ${d.area} | キャスト: ${d.castName} | 店舗: ${d.shopName}`);
    console.log(`  ${d.bodyText.length}文字 | いいね${d.likeCount} | 画像${d.imageCount}枚`);
    console.log(`  URL: ${d.url}`);
    console.log('~'.repeat(60));
    console.log(d.bodyText);
  });

  // 文字数順TOP3（いいね順と重複しないもの優先）
  const byLength = [...allDiaries].sort((a, b) => b.bodyText.length - a.bodyText.length);
  const likeTopUrls = new Set(byLikes.slice(0, 3).map(d => d.url));
  const lengthTop = byLength.filter(d => !likeTopUrls.has(d.url)).slice(0, 3);
  if (lengthTop.length < 3) {
    // 足りなければ重複許可
    byLength.forEach(d => {
      if (lengthTop.length < 3 && !lengthTop.includes(d)) lengthTop.push(d);
    });
  }

  console.log(`\n### 文字数 TOP3`);
  lengthTop.slice(0, 3).forEach((d, i) => {
    console.log(`\n${'~'.repeat(60)}`);
    console.log(`[文字数${i + 1}位] ${d.title || '(タイトルなし)'}`);
    console.log(`  エリア: ${d.area} | キャスト: ${d.castName} | 店舗: ${d.shopName}`);
    console.log(`  ${d.bodyText.length}文字 | いいね${d.likeCount} | 画像${d.imageCount}枚`);
    console.log(`  URL: ${d.url}`);
    console.log('~'.repeat(60));
    console.log(d.bodyText);
  });

  // === 勝ちパターンまとめ ===
  console.log(`\n\n${'#'.repeat(70)}`);
  console.log(`#  勝ちパターン分析まとめ`);
  console.log('#'.repeat(70));

  console.log(`
  [文字数] 平均${avg}文字 / 中央値${median}文字
  [絵文字] ${Math.round(diariesWithEmoji / allDiaries.length * 100)}%が使用 / 1記事平均${avgEmojis}個
  [画像] ${Math.round(diariesWithImages.length / allDiaries.length * 100)}%が添付
  [改行] 空行率${avgEmptyRatio}% / 1行あたり平均${avgCPL}文字 (読みやすさ重視の短い行)
  [いいね] ${likes.length > 0 ? `平均${Math.round(likes.reduce((a, b) => a + b, 0) / likes.length)}` : 'データなし'}
  [タイトル] ${titleLens.length > 0 ? `平均${Math.round(titleLens.reduce((a, b) => a + b, 0) / titleLens.length)}文字` : 'データなし'}
  `);

  console.log(`\n${'='.repeat(70)}`);
  console.log('  調査完了');
  console.log('='.repeat(70));
}

main().catch(e => {
  console.error('致命的エラー:', e);
  process.exit(1);
});
