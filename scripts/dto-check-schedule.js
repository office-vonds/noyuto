#!/usr/bin/env node
/**
 * デリヘルタウン 本日出勤キャスト確認スクリプト
 * - ログイン → 出勤情報取得 → 写メ日記送信先取得 → 出力
 */
const { chromium } = require('playwright');
const path = require('path');

const SHOP_ID = '21720';
const BASE = `https://admin.dto.jp/shop-admin/${SHOP_ID}`;
const LOGIN_URL = 'https://admin.dto.jp/a/auth/input?key=000874b3ba76b36a7c5308288e6501e5';

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  console.log(`[${ts}] ${msg}`);
}

/** 数値時間を HH:MM 形式に変換（14 → 14:00, 17.5 → 17:30, 26 → 翌2:00） */
function formatTime(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  const h = Math.floor(num);
  const m = num % 1 === 0.5 ? '30' : '00';
  const displayH = h >= 24 ? `翌${h - 24}` : String(h);
  return `${displayH}:${m}`;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    // === 1. ログイン ===
    log('ログイン中...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#login_id', 'kisaki-no1@au.com');
    await page.fill('input[name="password"]', 'kisaki0902');
    await page.click('#login_button');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    log('ログイン完了');

    // === 2. 出勤情報ページ ===
    log('出勤情報を取得中...');
    await page.goto(`${BASE}/schedule`, { waitUntil: 'networkidle', timeout: 30000 });

    const scheduleData = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('table tr');

      // 「本日」列のインデックスを特定
      let todayColIndex = -1;
      for (const row of rows) {
        const text = row.textContent || '';
        if (text.includes('本日')) {
          const cells = row.querySelectorAll('th, td');
          for (let i = 0; i < cells.length; i++) {
            if (cells[i].textContent.includes('本日')) {
              todayColIndex = i;
              break;
            }
          }
          break;
        }
      }

      if (todayColIndex < 0) return { error: '本日列が見つかりません' };

      for (const row of rows) {
        const cells = row.querySelectorAll('th, td');
        if (cells.length <= todayColIndex) continue;

        // キャスト名のリンクがある行のみ対象
        const firstCell = cells[0];
        const nameLink = firstCell.querySelector('a[href*="gal"]');
        if (!nameLink) continue;

        const name = nameLink.textContent.trim();
        const hrefMatch = nameLink.href.match(/id=(\d+)/);
        const galId = hrefMatch ? hrefMatch[1] : null;

        // 本日列のselect要素から実際に選択されている値を取得
        const todayCell = cells[todayColIndex];
        const selects = todayCell.querySelectorAll('select');

        let startTime = '';
        let endTime = '';

        if (selects.length >= 2) {
          // select[0] = 開始時間, select[1] = 終了時間
          // value が "未定" や空でなければ出勤が登録されている
          const sv1 = selects[0].value;
          const sv2 = selects[1].value;
          if (sv1 && sv2 && sv1 !== '未定' && sv2 !== '未定' && sv1 !== '' && sv2 !== '') {
            startTime = sv1;
            endTime = sv2;
          }
        }

        // selectがない場合はテキストから時間を抽出
        if (!startTime && !endTime) {
          const text = todayCell.textContent.trim();
          const timeMatch = text.match(/^(\d+(?:\.\d+)?)\s*[〜~\-−→]\s*(\d+(?:\.\d+)?)$/);
          if (timeMatch) {
            startTime = timeMatch[1];
            endTime = timeMatch[2];
          }
        }

        // 出勤時間が設定されているキャストのみ追加
        if (startTime && endTime) {
          results.push({ name, galId, startTime, endTime });
        }
      }

      return { todayColIndex, results };
    });

    const todayCasts = scheduleData.results || [];
    log(`本日出勤キャスト: ${todayCasts.length}名`);

    // === 3. 写メ日記管理ページから送信先メールアドレスを取得 ===
    log('写メ日記管理ページを取得中...');
    await page.goto(`${BASE}/diary-management`, { waitUntil: 'networkidle', timeout: 30000 });

    const emailMap = {};

    // ページ内の diary.{ID}.{token}@dto.jp を全て抽出
    const diaryEmails = await page.evaluate(() => {
      const html = document.body.innerHTML;
      const pattern = /diary\.(\d+)\.([a-zA-Z0-9]+)@dto\.jp/g;
      const map = {};
      let match;
      while ((match = pattern.exec(html)) !== null) {
        map[match[1]] = match[0];
      }
      return map;
    });

    Object.assign(emailMap, diaryEmails);
    log(`写メ日記メール: ${Object.keys(emailMap).length}件`);

    // === 4. 最終結果出力 ===
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    console.log('\n========================================');
    console.log(`  本日の出勤キャスト一覧 (${todayStr})`);
    console.log('========================================');
    console.log('キャスト名, ID, 出勤時間, 写メ日記送信先');
    console.log('---');

    if (todayCasts.length > 0) {
      todayCasts.forEach(c => {
        const time = `${formatTime(c.startTime)}〜${formatTime(c.endTime)}`;
        const email = emailMap[c.galId] || '未登録';
        console.log(`${c.name}, ${c.galId}, ${time}, ${email}`);
      });
    } else {
      console.log('本日の出勤キャストはいません。');
    }

    console.log('========================================\n');

  } catch (err) {
    console.error('エラー:', err.message);
    await page.screenshot({ path: path.join(__dirname, 'dto-error-debug.png'), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
}

main();
