/**
 * バニラ求人 店長ブログ自動投稿スクリプト
 *
 * 使い方:
 *   node vanilla-auto-post.js                    # posts.json の最初の未投稿記事を公開投稿
 *   node vanilla-auto-post.js --dry-run          # 入力まで実行、投稿はしない
 *   node vanilla-auto-post.js --draft            # 下書きとして保存
 *   node vanilla-auto-post.js --title "..." --body "<p>...</p>"  # インライン指定
 *
 * posts.json フォーマット:
 *   [{ "title": "...", "body": "<p>...</p>", "posted": false }, ...]
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// ── 設定 ──
const CONFIG = {
  loginUrl: 'https://qzin.jp/entry/',
  username: 'kizuna0511',
  password: 'kiryu0902',
};

// ── 引数解析 ──
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const isDraft = args.includes('--draft');

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}

function loadPost() {
  const inlineTitle = getArg('--title');
  const inlineBody = getArg('--body');

  if (inlineTitle && inlineBody) {
    return { title: inlineTitle, body: inlineBody };
  }

  const postsFile = path.join(__dirname, 'vanilla-posts.json');
  if (fs.existsSync(postsFile)) {
    const posts = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));
    const next = posts.find(p => !p.posted);
    if (!next) {
      console.log('vanilla-posts.json に未投稿の記事がありません');
      process.exit(0);
    }
    return { ...next, _postsFile: postsFile, _posts: posts };
  }

  console.error('投稿内容が指定されていません。\n--title / --body を指定するか、vanilla-posts.json を作成してください');
  process.exit(1);
}

// ── メイン ──
async function autoPost() {
  const post = loadPost();
  const status = isDraft ? 'draft' : 'public';

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. ログイン
    console.log('1. ログイン中...');
    await page.goto(CONFIG.loginUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#form_username', CONFIG.username);
    await page.fill('#form_password', CONFIG.password);
    await page.click('#button');
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    if (!page.url().includes('top.html')) {
      throw new Error('ログイン失敗: ' + page.url());
    }
    console.log('   OK');

    // 2. 店長ブログ新規投稿ページへ遷移
    console.log('2. 投稿ページへ...');
    const blogBtn = await page.$('input[name="shopmanager_blog"][value="更新/入力する"]');
    if (!blogBtn) throw new Error('店長ブログ投稿ボタンが見つからない');
    await blogBtn.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    if (!page.url().includes('shop_manager_blog.html')) {
      throw new Error('投稿ページ遷移失敗');
    }
    console.log('   OK');

    // 3. フォーム入力
    console.log('3. フォーム入力...');

    // ステータス
    await page.click(status === 'public' ? '#status_1' : '#status_0');
    console.log('   ステータス:', status === 'public' ? '公開' : '下書き');

    // タイトル
    await page.fill('#title', post.title);
    console.log('   タイトル:', post.title);

    // CKEditor 本文
    await page.waitForFunction(() =>
      typeof CKEDITOR !== 'undefined' &&
      CKEDITOR.instances.editor1 &&
      CKEDITOR.instances.editor1.status === 'ready',
      { timeout: 10000 }
    );
    await page.evaluate((html) => {
      CKEDITOR.instances.editor1.setData(html);
    }, post.body);
    console.log('   本文:', post.body.length + '文字');

    if (dryRun) {
      await page.screenshot({ path: path.join(__dirname, 'vanilla-post-preview.png'), fullPage: true });
      console.log('\n[DRY RUN] 入力確認のみ。投稿は実行せず終了。');
      console.log('スクショ: scripts/vanilla-post-preview.png');
      return;
    }

    // 4. 確認ボタン
    console.log('4. 確認...');
    await page.click('input[name="confirm"]');
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    const confirmCheck = await page.evaluate(() => document.body.innerText);
    if (!confirmCheck.includes('投稿する')) {
      throw new Error('確認ページに到達できませんでした');
    }
    console.log('   OK（確認ページ表示）');

    // 5. 投稿実行
    console.log('5. 投稿...');
    const completeBtn = await page.$('input[name="complete"][value="投稿する"]');
    if (!completeBtn) throw new Error('「投稿する」ボタンが見つからない');

    // type="button" → type="submit" に変更して name="complete" をPOSTに含める
    await page.evaluate(() => {
      const btn = document.querySelector('input[name="complete"]');
      btn.removeAttribute('onclick');
      btn.type = 'submit';
    });
    await completeBtn.click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const result = await page.evaluate(() => document.body.innerText);
    if (result.includes('投稿が完了しました')) {
      console.log('   投稿成功！');

      // posts.json の投稿済みフラグを更新
      if (post._postsFile && post._posts) {
        const target = post._posts.find(p => p.title === post.title && !p.posted);
        if (target) {
          target.posted = true;
          target.postedAt = new Date().toISOString();
          fs.writeFileSync(post._postsFile, JSON.stringify(post._posts, null, 2), 'utf-8');
          console.log('   vanilla-posts.json 更新済み');
        }
      }
    } else {
      console.log('   投稿結果（要確認）:', result.substring(0, 300));
    }

  } catch (e) {
    console.error('エラー:', e.message);
    await page.screenshot({ path: path.join(__dirname, 'vanilla-post-error.png'), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
}

autoPost();
