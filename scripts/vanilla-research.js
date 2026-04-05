/**
 * バニラ求人 全国人気店の店長ブログ調査
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const REGIONS = [
  'kanto', 'kansai', 'tokai', 'kyusyu-okinawa',
  'hokkaido-tohoku', 'kitakanto', 'hokuriku-koshinetsu', 'chugoku-shikoku'
];

async function research() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  const allBlogs = [];

  for (const region of REGIONS) {
    const regionUrl = `https://${region}.qzin.jp/`;
    console.log(`\n=== ${region} ===`);

    try {
      await page.goto(regionUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

      // 店舗ページリンクを収集
      const shops = await page.evaluate(() => {
        const seen = new Set();
        const result = [];
        document.querySelectorAll('a[href]').forEach(a => {
          const m = a.href.match(/^https:\/\/[a-z-]+\.qzin\.jp\/([a-z0-9_-]+)\/$/);
          if (m && !seen.has(m[1]) && m[1].length > 3 && !/genre|column|blog|area|entry/.test(m[1])) {
            seen.add(m[1]);
            result.push({ id: m[1], href: a.href });
          }
        });
        return result.slice(0, 20);
      });

      console.log(`  店舗: ${shops.length}件`);

      // 上位6店舗のブログ調査
      for (const shop of shops.slice(0, 6)) {
        try {
          const blogUrl = shop.href + 'blog/';
          await page.goto(blogUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });

          // 記事リンク取得
          const articles = await page.evaluate(() => {
            const links = [];
            document.querySelectorAll('a[href*="blog/?entry="]').forEach(a => {
              links.push(a.href);
            });
            return [...new Set(links)].slice(0, 2);
          });

          if (articles.length === 0) continue;

          // 店舗名取得
          const shopName = await page.evaluate(() => {
            const el = document.querySelector('.shopName, h1, [class*="shopName"]');
            return el ? el.textContent.trim().substring(0, 40) : '';
          });

          // 記事詳細取得
          for (const articleUrl of articles.slice(0, 1)) {
            try {
              await page.goto(articleUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });

              const detail = await page.evaluate(() => {
                // ページ内のメインコンテンツを探す
                const body = document.body.innerHTML;
                const text = document.body.innerText;

                // タイトル
                const titleEl = document.querySelector('[class*="blog"] h2, [class*="blog"] h3, [class*="detail"] h2');
                const title = titleEl ? titleEl.textContent.trim() : '';

                // 本文部分を特定（ブログ本体は通常特定のクラスの中）
                let contentHtml = '';
                let contentText = '';
                const contentSelectors = [
                  '.blogDetail-txt', '.blog-detail-body', '.detail-txt',
                  '.managerBlog-txt', '[class*="blog-txt"]', '[class*="blogTxt"]',
                  '.entry-body', '.article-body',
                ];
                for (const sel of contentSelectors) {
                  const el = document.querySelector(sel);
                  if (el && el.innerText.length > 50) {
                    contentHtml = el.innerHTML;
                    contentText = el.innerText;
                    break;
                  }
                }

                // フォールバック: blog関連クラスを持つ一番大きなテキストブロック
                if (!contentText) {
                  document.querySelectorAll('[class*="blog"], [class*="detail"], article, .content').forEach(el => {
                    if (el.innerText.length > contentText.length) {
                      contentHtml = el.innerHTML;
                      contentText = el.innerText;
                    }
                  });
                }

                // HTML装飾分析
                const tags = {};
                ['h2','h3','h4','strong','b','em','u','br','p','img','ul','ol','li','hr','span','font','div'].forEach(tag => {
                  const c = (contentHtml.match(new RegExp(`<${tag}[\\s>/]`, 'gi')) || []).length;
                  if (c > 0) tags[tag] = c;
                });

                return {
                  title,
                  html: contentHtml.substring(0, 5000),
                  text: contentText.substring(0, 3000),
                  charCount: contentText.length,
                  htmlTags: tags,
                };
              });

              if (detail.charCount > 100) {
                allBlogs.push({ area: region, shop: shopName || shop.id, ...detail });
                console.log(`  ✓ ${shopName || shop.id}: "${detail.title}" (${detail.charCount}文字)`);
              }
            } catch (e) { /* skip */ }
          }
        } catch (e) { /* skip */ }
      }
    } catch (e) {
      console.log(`  エラー: ${e.message.substring(0, 60)}`);
    }
  }

  // ========== 分析レポート ==========
  console.log('\n\n' + '='.repeat(60));
  console.log('  全国人気店 店長ブログ分析レポート');
  console.log('='.repeat(60));

  console.log(`\n収集記事数: ${allBlogs.length}`);

  if (allBlogs.length > 0) {
    const chars = allBlogs.map(b => b.charCount).filter(c => c > 0);
    const avg = Math.round(chars.reduce((a, b) => a + b, 0) / chars.length);

    console.log(`\n【文字数統計】`);
    console.log(`  平均: ${avg}文字 / 最大: ${Math.max(...chars)}文字 / 最小: ${Math.min(...chars)}文字`);
    console.log(`  1000文字以上: ${chars.filter(c => c >= 1000).length}/${chars.length}`);
    console.log(`  2000文字以上: ${chars.filter(c => c >= 2000).length}/${chars.length}`);

    // タグ使用率
    const tagUsage = {};
    allBlogs.forEach(b => {
      Object.keys(b.htmlTags || {}).forEach(tag => {
        tagUsage[tag] = (tagUsage[tag] || 0) + 1;
      });
    });

    console.log(`\n【HTML装飾使用率】`);
    Object.entries(tagUsage).sort((a, b) => b[1] - a[1]).forEach(([tag, count]) => {
      console.log(`  <${tag}>: ${count}/${allBlogs.length} (${Math.round(count / allBlogs.length * 100)}%)`);
    });

    // 各記事サマリー
    console.log(`\n【記事サマリー】`);
    allBlogs.forEach((b, i) => {
      console.log(`\n[${i + 1}] ${b.area} / ${b.shop} (${b.charCount}文字)`);
      console.log(`  タイトル: ${b.title}`);
      console.log(`  装飾: ${JSON.stringify(b.htmlTags)}`);
      console.log(`  冒頭: ${b.text.substring(0, 150).replace(/\n/g, ' ')}`);
    });

    // 上位3記事のHTML
    const top = allBlogs.sort((a, b) => b.charCount - a.charCount).slice(0, 3);
    console.log('\n\n【文字数上位3記事のHTML】');
    top.forEach((b, i) => {
      console.log(`\n${'─'.repeat(50)}`);
      console.log(`[TOP${i + 1}] ${b.area}/${b.shop} "${b.title}" (${b.charCount}文字)`);
      console.log(`${'─'.repeat(50)}`);
      console.log(b.html.substring(0, 4000));
    });
  }

  fs.writeFileSync(path.join(__dirname, 'vanilla-research-result.json'), JSON.stringify(allBlogs, null, 2));
  await browser.close();
  console.log('\n\n完了');
}

research();
