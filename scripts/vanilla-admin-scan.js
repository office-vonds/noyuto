/**
 * バニラ管理画面 全機能スキャン
 * 管理画面トップのすべてのメニュー・ボタン・リンクを収集
 */
const { chromium } = require('playwright');

const CONFIG = {
  loginUrl: 'https://qzin.jp/entry/',
  username: 'kizuna0511',
  password: 'kiryu0902',
};

async function scanAdmin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. ログイン
    console.log('=== ログイン ===');
    await page.goto(CONFIG.loginUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#form_username', CONFIG.username);
    await page.fill('#form_password', CONFIG.password);
    await page.click('#button');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log('ログイン後URL:', page.url());

    // 2. トップページ全体のHTML構造を取得
    console.log('\n=== 管理画面トップ ===');

    // すべてのフォーム（submit ボタン）を収集
    const forms = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('form').forEach(form => {
        const inputs = [];
        form.querySelectorAll('input, select, button').forEach(el => {
          inputs.push({
            tag: el.tagName,
            type: el.type || '',
            name: el.name || '',
            value: el.value || '',
            id: el.id || '',
          });
        });
        results.push({
          action: form.action || '',
          method: form.method || '',
          inputs,
        });
      });
      return results;
    });
    console.log('\nフォーム一覧:');
    console.log(JSON.stringify(forms, null, 2));

    // すべてのリンクを収集
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]')).map(a => ({
        text: a.textContent.trim().substring(0, 100),
        href: a.href,
      }));
    });
    console.log('\nリンク一覧:');
    console.log(JSON.stringify(links, null, 2));

    // すべてのセクション見出し・ラベルを収集
    const sections = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('h1, h2, h3, h4, h5, th, dt, label, .title, .heading, .section-title').forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length < 200) {
          results.push({ tag: el.tagName, class: el.className, text });
        }
      });
      return results;
    });
    console.log('\nセクション・見出し:');
    console.log(JSON.stringify(sections, null, 2));

    // スクリーンショット
    await page.screenshot({ path: '/tmp/vanilla-admin-top.png', fullPage: true });
    console.log('\nスクショ: /tmp/vanilla-admin-top.png');

    // 3. 各メニューページを巡回して機能を把握
    // まずsubmitボタン付きのフォームからメニュー項目を抽出
    const menuButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input[type="submit"]')).map(btn => ({
        name: btn.name,
        value: btn.value,
        formAction: btn.closest('form')?.action || '',
      }));
    });
    console.log('\nメニューボタン一覧:');
    console.log(JSON.stringify(menuButtons, null, 2));

    // 4. 各メニューページを一つずつ巡回
    console.log('\n=== 各ページ巡回 ===');
    for (const btn of menuButtons) {
      if (!btn.name || btn.value === 'ログアウト') continue;

      try {
        // トップに戻る
        await page.goto(CONFIG.loginUrl.replace('/entry/', '/entry/top.html'), { waitUntil: 'networkidle', timeout: 15000 });

        // ボタンクリック
        const selector = `input[name="${btn.name}"][value="${btn.value}"]`;
        const exists = await page.$(selector);
        if (!exists) continue;

        await exists.click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });

        console.log(`\n--- ${btn.value} (${btn.name}) ---`);
        console.log('URL:', page.url());

        // ページ内のフォーム要素を収集
        const pageInfo = await page.evaluate(() => {
          const info = {
            title: document.title,
            headings: [],
            forms: [],
            inputs: [],
            textareas: [],
            selects: [],
            tables: [],
          };

          document.querySelectorAll('h1, h2, h3, h4').forEach(h => {
            info.headings.push(h.textContent.trim().substring(0, 100));
          });

          document.querySelectorAll('input:not([type="hidden"])').forEach(el => {
            info.inputs.push({
              type: el.type, name: el.name, id: el.id,
              value: el.value?.substring(0, 50),
              placeholder: el.placeholder || '',
            });
          });

          document.querySelectorAll('textarea').forEach(el => {
            info.textareas.push({ name: el.name, id: el.id });
          });

          document.querySelectorAll('select').forEach(el => {
            const options = Array.from(el.options).map(o => o.text.substring(0, 50));
            info.selects.push({ name: el.name, id: el.id, options });
          });

          // テーブルの見出し行を収集
          document.querySelectorAll('table').forEach(table => {
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim().substring(0, 50));
            if (headers.length > 0) {
              info.tables.push({ headers });
            }
          });

          return info;
        });

        console.log(JSON.stringify(pageInfo, null, 2));

        // スクリーンショット
        const safeName = btn.name.replace(/[^a-zA-Z0-9_]/g, '_');
        await page.screenshot({ path: `/tmp/vanilla-admin-${safeName}.png`, fullPage: true });

      } catch (e) {
        console.log(`  エラー: ${e.message}`);
      }
    }

  } catch (e) {
    console.error('致命的エラー:', e.message);
    await page.screenshot({ path: '/tmp/vanilla-admin-error.png', fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
}

scanAdmin();
