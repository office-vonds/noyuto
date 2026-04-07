#!/usr/bin/env node
/**
 * 絆ブログ投稿パイプライン
 *
 * フロー:
 *   1. kizuna-job.com（公式求人サイト）に先行投稿（WordPress REST API）
 *   2. ガールズヘブンに転載（Playwright）
 *   3. バニラに転載（Playwright）
 *
 * 使い方:
 *   node kizuna-blog-pipeline.js                          # 自動記事生成→3サイト投稿
 *   node kizuna-blog-pipeline.js --title "..." --body "..." # 指定記事を3サイト投稿
 *   node kizuna-blog-pipeline.js --official-only           # 公式サイトのみ
 *   node kizuna-blog-pipeline.js --skip-official           # GH+バニラのみ（既に公式投稿済み）
 *
 * cron例（毎日20時に実行→公式投稿→21時にGH/バニラ投稿）:
 *   0 20 * * * node kizuna-blog-pipeline.js >> ~/projects/vonds/scripts/pipeline-cron.log 2>&1
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ── 設定 ──
const OFFICIAL = {
  url: 'https://kizuna-job.com',
  xmlrpcUrl: 'https://kizuna-job.com/xmlrpc.php',
  user: 'link-group',
  pass: 'pjj9khxxrypm',
};

const VANILLA = {
  loginUrl: 'https://qzin.jp/entry/',
  username: 'kizuna0511',
  password: 'kiryu0902',
};

const GH = {
  loginUrl: 'https://manager.girlsheaven-job.net/',
  loginId: '05007',
  loginPass: '70050',
  shopName: '絆甲府店',
};

const STATE_FILE = path.join(__dirname, 'pipeline-state.json');
const POSTS_FILE = path.join(__dirname, 'kizuna-blog-posts.json');

// ── 引数解析 ──
const args = process.argv.slice(2);
const officialOnly = args.includes('--official-only');
const skipOfficial = args.includes('--skip-official');
const dryRun = args.includes('--dry-run');

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  console.log(`[${ts}] ${msg}`);
}

// ── 記事データ読み込み ──
function loadPost() {
  const inlineTitle = getArg('--title');
  const inlineBody = getArg('--body');
  if (inlineTitle && inlineBody) {
    return { title: inlineTitle, body: inlineBody };
  }

  if (fs.existsSync(POSTS_FILE)) {
    const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
    const next = posts.find(p => !p.posted);
    if (!next) {
      log('未投稿の記事がありません');
      return null;
    }
    return { ...next, _postsFile: POSTS_FILE, _posts: posts };
  }

  log(`${POSTS_FILE} が見つかりません`);
  return null;
}

function markAsPosted(post) {
  if (post._postsFile && post._posts) {
    const idx = post._posts.indexOf(post._posts.find(p => p.title === post.title));
    if (idx !== -1) {
      post._posts[idx].posted = true;
      post._posts[idx].postedAt = new Date().toISOString();
      fs.writeFileSync(post._postsFile, JSON.stringify(post._posts, null, 2), 'utf-8');
    }
  }
}

// ── Step 1: 公式サイト投稿（XML-RPC） ──
async function postToOfficial(title, body) {
  log('📝 Step 1: kizuna-job.com に投稿中...');
  if (dryRun) { log('  [DRY RUN] スキップ'); return 'dry-run'; }

  return new Promise((resolve, reject) => {
    const xmlrpc = require('xmlrpc');
    // Simple XML-RPC call without library
    const xml = `<?xml version="1.0"?>
<methodCall>
  <methodName>wp.newPost</methodName>
  <params>
    <param><value><int>0</int></value></param>
    <param><value><string>${OFFICIAL.user}</string></value></param>
    <param><value><string>${OFFICIAL.pass}</string></value></param>
    <param><value><struct>
      <member><name>post_type</name><value><string>staff_blog</string></value></member>
      <member><name>post_title</name><value><string><![CDATA[${title}]]></string></value></member>
      <member><name>post_content</name><value><string><![CDATA[${body}]]></string></value></member>
      <member><name>post_status</name><value><string>publish</string></value></member>
    </struct></value></param>
  </params>
</methodCall>`;

    const options = {
      hostname: 'kizuna-job.com',
      path: '/xmlrpc.php',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(xml, 'utf-8'),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/<string>(\d+)<\/string>/);
        if (match) {
          const postId = match[1];
          log(`  ✅ 公式サイト投稿完了 (ID: ${postId})`);
          resolve(postId);
        } else {
          log(`  ❌ 公式サイト投稿エラー: ${data.substring(0, 200)}`);
          reject(new Error('XML-RPC error'));
        }
      });
    });

    req.on('error', reject);
    req.write(xml);
    req.end();
  });
}

// ── Step 2: ガールズヘブン投稿（Playwright） ──
async function postToGirlsHeaven(title, body) {
  log('📝 Step 2: ガールズヘブンに投稿中...');
  if (dryRun) { log('  [DRY RUN] スキップ'); return; }

  // 既存のgirlsheaven-auto-post.jsの投稿ロジックを呼び出し
  const ghScript = path.join(__dirname, 'girlsheaven-auto-post.js');
  if (fs.existsSync(ghScript)) {
    const { execSync } = require('child_process');
    try {
      execSync(`node "${ghScript}" --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"').substring(0, 29000)}"`, {
        cwd: __dirname,
        timeout: 120000,
        stdio: 'inherit',
      });
      log('  ✅ ガールズヘブン投稿完了');
    } catch (e) {
      log(`  ⚠️ ガールズヘブン投稿エラー: ${e.message}`);
    }
  } else {
    log(`  ⚠️ ${ghScript} が見つかりません。手動投稿してください。`);
  }
}

// ── Step 3: バニラ投稿（Playwright） ──
async function postToVanilla(title, body) {
  log('📝 Step 3: バニラに投稿中...');
  if (dryRun) { log('  [DRY RUN] スキップ'); return; }

  const vanillaScript = path.join(__dirname, 'vanilla-auto-post.js');
  if (fs.existsSync(vanillaScript)) {
    const { execSync } = require('child_process');
    try {
      execSync(`node "${vanillaScript}" --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}"`, {
        cwd: __dirname,
        timeout: 120000,
        stdio: 'inherit',
      });
      log('  ✅ バニラ投稿完了');
    } catch (e) {
      log(`  ⚠️ バニラ投稿エラー: ${e.message}`);
    }
  } else {
    log(`  ⚠️ ${vanillaScript} が見つかりません。手動投稿してください。`);
  }
}

// ── メインフロー ──
async function main() {
  log('=== 絆ブログ投稿パイプライン開始 ===');
  log(`モード: ${dryRun ? 'DRY RUN' : officialOnly ? '公式のみ' : skipOfficial ? 'GH+バニラのみ' : '全3サイト'}`);

  const post = loadPost();
  if (!post) {
    log('投稿する記事がありません。終了。');
    return;
  }

  log(`記事: "${post.title}"`);

  // GH/バニラ用にHTMLタグを簡略化（CKEditor対応）
  const plainBody = post.body
    .replace(/style="[^"]*"/g, '')  // インラインスタイル除去
    .replace(/<div[^>]*>/g, '<p>').replace(/<\/div>/g, '</p>');  // div→p変換

  try {
    // Step 1: 公式サイト
    if (!skipOfficial) {
      await postToOfficial(post.title, post.body);
    }

    // Step 2: ガールズヘブン
    if (!officialOnly) {
      await postToGirlsHeaven(post.title, plainBody);
    }

    // Step 3: バニラ
    if (!officialOnly) {
      await postToVanilla(post.title, plainBody);
    }

    // 投稿済みマーク
    markAsPosted(post);

    log('=== パイプライン完了 ===');
  } catch (e) {
    log(`❌ パイプラインエラー: ${e.message}`);
    process.exit(1);
  }
}

main().catch(e => {
  log(`Fatal: ${e.message}`);
  process.exit(1);
});
