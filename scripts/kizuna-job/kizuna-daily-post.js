#!/usr/bin/env node
/**
 * 絆 デイリー軽量ブログ投稿スクリプト
 *
 * 2層構造の「軽量層」：バニラ/ガールズヘブン向けの短い日替わり記事
 * 公式サイト(kizuna-job.com)には投稿しない（公式は月2〜4本の大作のみ）
 *
 * フロー:
 *   1. vanilla-gh-posts.json から未投稿の記事を1本取得
 *   2. バニラに投稿（Playwright）
 *   3. ガールズヘブンに投稿（Playwright）
 *   4. 投稿済みマークを記録
 *
 * 使い方:
 *   node kizuna-daily-post.js              # 次の未投稿記事を投稿
 *   node kizuna-daily-post.js --dry-run    # テスト（投稿しない）
 *   node kizuna-daily-post.js --vanilla    # バニラのみ
 *   node kizuna-daily-post.js --gh         # ガールズヘブンのみ
 *
 * cron（毎日21時）:
 *   0 21 * * * /usr/bin/node /home/ozawakiryu0902/projects/vonds/scripts/kizuna-daily-post.js >> /home/ozawakiryu0902/projects/vonds/scripts/daily-post-cron.log 2>&1
 */

const path = require('path');
const fs = require('fs');

const POSTS_FILE = path.join(__dirname, 'vanilla-gh-posts.json');
const VANILLA_SCRIPT = path.join(__dirname, 'vanilla-auto-post.js');
const GH_SCRIPT = path.join(__dirname, 'girlsheaven-auto-post.js');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const vanillaOnly = args.includes('--vanilla');
const ghOnly = args.includes('--gh');

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  console.log(`[${ts}] ${msg}`);
}

function loadNextPost() {
  if (!fs.existsSync(POSTS_FILE)) {
    log(`${POSTS_FILE} が見つかりません`);
    return null;
  }

  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));

  // バニラ/GH両方に未投稿の記事を探す
  const next = posts.find(p => !p.posted_vanilla || !p.posted_gh);
  if (!next) {
    log('全記事が投稿済みです。ローテーションをリセットします。');
    // 全記事のフラグをリセットして再ローテーション
    posts.forEach(p => {
      p.posted_vanilla = false;
      p.posted_gh = false;
    });
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
    return posts[0];
  }

  return { ...next, _posts: posts };
}

function markPosted(post, platform) {
  if (!post._posts) return;

  const idx = post._posts.findIndex(p => p.title === post.title);
  if (idx === -1) return;

  if (platform === 'vanilla') post._posts[idx].posted_vanilla = true;
  if (platform === 'gh') post._posts[idx].posted_gh = true;
  post._posts[idx].last_posted = new Date().toISOString();

  fs.writeFileSync(POSTS_FILE, JSON.stringify(post._posts, null, 2), 'utf-8');
}

async function postToVanilla(title, body) {
  log('📝 バニラに投稿中...');
  if (dryRun) { log('  [DRY RUN] スキップ'); return true; }

  if (!fs.existsSync(VANILLA_SCRIPT)) {
    log(`  ⚠️ ${VANILLA_SCRIPT} が見つかりません`);
    return false;
  }

  const { execSync } = require('child_process');
  try {
    execSync(
      `node "${VANILLA_SCRIPT}" --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}"`,
      { cwd: __dirname, timeout: 120000, stdio: 'inherit' }
    );
    log('  ✅ バニラ投稿完了');
    return true;
  } catch (e) {
    log(`  ❌ バニラ投稿エラー: ${e.message}`);
    return false;
  }
}

async function postToGH(title, body) {
  log('📝 ガールズヘブンに投稿中...');
  if (dryRun) { log('  [DRY RUN] スキップ'); return true; }

  if (!fs.existsSync(GH_SCRIPT)) {
    log(`  ⚠️ ${GH_SCRIPT} が見つかりません`);
    return false;
  }

  const { execSync } = require('child_process');
  try {
    execSync(
      `node "${GH_SCRIPT}" --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}"`,
      { cwd: __dirname, timeout: 120000, stdio: 'inherit' }
    );
    log('  ✅ ガールズヘブン投稿完了');
    return true;
  } catch (e) {
    log(`  ❌ ガールズヘブン投稿エラー: ${e.message}`);
    return false;
  }
}

async function main() {
  log('=== 絆デイリー軽量ブログ投稿 ===');

  const post = loadNextPost();
  if (!post) return;

  log(`記事: 「${post.title}」(${post.category})`);
  log(`本文: ${post.body.length}字`);

  // バニラ投稿
  if (!ghOnly && !post.posted_vanilla) {
    const ok = await postToVanilla(post.title, post.body);
    if (ok) markPosted(post, 'vanilla');
  }

  // GH投稿
  if (!vanillaOnly && !post.posted_gh) {
    const ok = await postToGH(post.title, post.body);
    if (ok) markPosted(post, 'gh');
  }

  log('=== 完了 ===');
}

main().catch(e => {
  log(`Fatal: ${e.message}`);
  process.exit(1);
});
