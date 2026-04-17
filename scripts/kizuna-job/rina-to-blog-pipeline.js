#!/usr/bin/env node
/**
 * rina 54本ツイートストック → 絆JOBブログ記事化パイプライン
 *
 * rina凍結事故（2026-04-17）後、60件ストックの資産を捨てずに
 * kizuna-job.com の staff_blog として記事化・SEO流入に転換する。
 *
 * - 同カテゴリのツイートを5本ずつ束ねて1記事化
 * - 導入文 + 5つの体験談 + まとめ + 絆JOB誘導CTA の構成
 * - XML-RPC 経由で WordPress (kizuna-job.com) に投稿
 *
 * 使い方:
 *   node rina-to-blog-pipeline.js --preview    # 次回生成される記事をプレビュー
 *   node rina-to-blog-pipeline.js              # 1記事投稿して stock 5本を消化
 *   node rina-to-blog-pipeline.js --dry-run    # 記事生成はするが投稿しない
 *
 * NOYUTO負担: ゼロ（cron稼働・1日1記事ペース）
 * 消化速度: 54本 ÷ 5本/記事 = 11記事 / 1日1記事 = 11日で全消化
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const RINA_STOCK = '/home/ozawakiryu0902/projects/vonds/rina/x-tweets-stock.json';
const LOG_FILE = path.join(__dirname, 'rina-to-blog.log');
const POSTED_ARTICLES = path.join(__dirname, 'rina-blog-posted.json');

const OFFICIAL = {
  xmlrpcUrl: 'https://kizuna-job.com/xmlrpc.php',
  user: 'link-group',
  pass: 'pjj9khxxrypm',
};

const args = process.argv.slice(2);
const previewMode = args.includes('--preview');
const dryRun = args.includes('--dry-run');

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n', 'utf-8');
}

// ── カテゴリ別記事テンプレート ──
const ARTICLE_TEMPLATES = {
  'money': {
    titles: [
      '26歳で所持金3万円だった頃の話。お金がない夜の気持ち',
      '貯金ゼロから抜け出したい人に読んでほしい、お金の話',
      '手取り14万で暮らしていた頃の、リアルな生活の記録',
      '月収が足りない、貯金ゼロ――あの頃の私に言いたいこと',
    ],
    intro: 'お金がない時期の苦しさは、経験した人にしかわからないものがあります。ここではお金にまつわるリアルな感情を集めました。同じような経験をしている方、少しでも気持ちが軽くなれば幸いです。',
    outro: 'お金の問題は「稼ぎ方」を変えるしかありません。自分の時間を時給で切り売りする働き方から、一度立ち止まって考える時期かもしれません。',
  },
  'independence': {
    titles: [
      '離婚して実家にも頼れない――自立したあの頃の話',
      '一人で生きていくと決めた日の、リアルな気持ち',
      '「普通に就職すればいい」と言われて傷ついた話',
      '実家に帰れない人の、自立への道のり',
    ],
    intro: '自立の道を選ぶとき、周りから理解されない瞬間があります。一人で立たなければならなかった日々の、リアルな感情をまとめました。',
    outro: '一人で生きていく選択は甘くないけれど、選んだ自分を信じて進むしかありません。誰かに理解されなくても、あなたの道は間違っていません。',
  },
  'mental': {
    titles: [
      '夜中に一人で天井を見ていた日々の話',
      '「普通」になれない自分を責めてしまう人へ',
      'SNSが辛くなる夜の、自分の守り方',
      'メンタルが落ちる時期の、リアルな過ごし方',
    ],
    intro: '心が追いつかない時期は、誰にでもあります。ここでは夜に一人で抱えてしまう気持ちをそのまま書き出しました。',
    outro: 'メンタルが辛い時期は、自分を責めずに休むのが一番です。あなたは今、頑張りすぎているだけかもしれません。',
  },
  'tip': {
    titles: [
      'お金がない時に効いた節約術まとめ',
      'コスパ重視で生き抜いた頃の知恵',
      '月収が少なくても生活を回すコツ',
      '貯金ゼロから始めた、現実的な生活術',
    ],
    intro: '節約は精神論ではなく、具体的な行動の積み重ねです。実際にお金がない時期を乗り切った工夫をまとめました。',
    outro: '節約だけでは限界があります。収入を上げる選択肢を並行して考えるのが、長い目で見て一番の節約です。',
  },
  'lifestyle': {
    titles: [
      '一人暮らしの食費を抑えるコツ',
      'コスパ最強の自炊レシピの考え方',
    ],
    intro: '生活コストを下げる工夫は、知っているかどうかで大きく差が出ます。実際に役立った生活術を紹介します。',
    outro: '小さな工夫の積み重ねが生活を変えます。一つずつ取り入れてみてください。',
  },
};

const KIZUNA_CTA = `
<hr>
<h3>働き方に悩んでいる方へ</h3>
<p>お金や生活の不安は、働く環境を変えるだけで解決することもあります。山梨県甲府市のデリヘル「絆」では、初心者の方でも安心して働ける保証制度・寮完備・出稼ぎ対応を用意しています。</p>
<ul>
<li>日給保証12時間 / 体験入店も可能</li>
<li>寮完備（即日入寮OK）</li>
<li>出稼ぎ対応（交通費サポート）</li>
</ul>
<p><a href="https://kizuna-job.com/">絆 求人情報を見る →</a></p>
`;

function loadStock() {
  return JSON.parse(fs.readFileSync(RINA_STOCK, 'utf-8'));
}

function saveStock(stock) {
  fs.writeFileSync(RINA_STOCK, JSON.stringify(stock, null, 2) + '\n', 'utf-8');
}

function loadPostedArticles() {
  if (!fs.existsSync(POSTED_ARTICLES)) return [];
  return JSON.parse(fs.readFileSync(POSTED_ARTICLES, 'utf-8'));
}

function savePostedArticles(list) {
  fs.writeFileSync(POSTED_ARTICLES, JSON.stringify(list, null, 2) + '\n', 'utf-8');
}

function pickNextBundle(stock) {
  // funnel層は除外（既にkizuna誘導なので記事化には合わない）
  const unpostedEmpathyValue = stock
    .map((t, i) => ({ ...t, _idx: i }))
    .filter(t => !t.posted && t.layer !== 'funnel');

  if (unpostedEmpathyValue.length === 0) return null;

  // カテゴリ別でグルーピング
  const byCategory = {};
  unpostedEmpathyValue.forEach(t => {
    const cat = t.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(t);
  });

  // 最も件数多いカテゴリから5本取る
  const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b.length - a.length);
  const [cat, items] = sorted[0];
  const bundle = items.slice(0, Math.min(5, items.length));
  return { category: cat, bundle };
}

function buildArticle(category, bundle) {
  const template = ARTICLE_TEMPLATES[category] || {
    titles: [`${category}の話まとめ`],
    intro: '',
    outro: '',
  };

  const posted = loadPostedArticles();
  const usedTitles = new Set(posted.map(p => p.title));
  const availableTitles = template.titles.filter(t => !usedTitles.has(t));
  const title = availableTitles[0] || `${template.titles[0]} (続編)`;

  const stories = bundle.map((t, i) => `
<h3>${i + 1}.</h3>
<p>${t.text}</p>
`).join('\n');

  const body = `
<p>${template.intro}</p>

${stories}

<h2>まとめ</h2>
<p>${template.outro}</p>

${KIZUNA_CTA}
`.trim();

  return { title, body };
}

function postToOfficial(title, body) {
  return new Promise((resolve, reject) => {
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

    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const match = data.match(/<string>(\d+)<\/string>/);
        if (match) resolve(match[1]);
        else reject(new Error(`XML-RPC error: ${data.substring(0, 300)}`));
      });
    });
    req.on('error', reject);
    req.write(xml);
    req.end();
  });
}

async function main() {
  const stock = loadStock();
  const pick = pickNextBundle(stock);

  if (!pick) {
    log('🎉 empathy/value 全てブログ記事化完了。funnel層12本は別扱い');
    return;
  }

  const { category, bundle } = pick;
  const { title, body } = buildArticle(category, bundle);

  log(`=== 記事生成: カテゴリ=${category} / バンドル=${bundle.length}本 ===`);
  log(`Title: ${title}`);
  log(`Body length: ${body.length}字`);

  if (previewMode) {
    console.log('\n----- PREVIEW -----');
    console.log('Title:', title);
    console.log('\nBody:\n', body);
    console.log('-------------------\n');
    return;
  }

  if (dryRun) {
    log('[DRY-RUN] 投稿スキップ。stock更新もしない');
    return;
  }

  try {
    const postId = await postToOfficial(title, body);
    log(`✅ kizuna-job.com 投稿成功 (Post ID: ${postId})`);

    // stock更新: 使った5本に posted: true + ref_article
    bundle.forEach(t => {
      stock[t._idx].posted = true;
      stock[t._idx].posted_at = new Date().toISOString();
      stock[t._idx].blog_post_id = postId;
      stock[t._idx].blog_title = title;
    });
    saveStock(stock);

    // 投稿履歴保存
    const posted = loadPostedArticles();
    posted.push({
      title,
      post_id: postId,
      category,
      bundle_count: bundle.length,
      posted_at: new Date().toISOString(),
      url: `https://kizuna-job.com/?p=${postId}`,
    });
    savePostedArticles(posted);

    const remaining = stock.filter(t => !t.posted && t.layer !== 'funnel').length;
    log(`残り記事化可能: ${remaining}本 (約${Math.ceil(remaining / 5)}記事分)`);
  } catch (err) {
    log(`❌ エラー: ${err.message}`);
    process.exit(1);
  }
}

main();
