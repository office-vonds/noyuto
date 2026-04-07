/**
 * 各店舗ページに口コミセクションを追加（base64 DB直接書き込み）
 */
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const WP_BASE = 'https://stretchzero.jp';
const FTP = { user: 'stlab@stretchlabo.jp', pass: 'Stretchlabo0501', host: 'sv14862.xserver.jp' };

async function dbUpdate(postId, content) {
  const b64 = Buffer.from(content, 'utf-8').toString('base64');
  const php = `<?php
require_once dirname(__FILE__) . '/wp-load.php';
if (($_GET['t'] ?? '') !== 'sz2026') { http_response_code(403); exit; }
$content = base64_decode('${b64}');
global $wpdb;
$r = $wpdb->update($wpdb->posts, array('post_content' => $content), array('ID' => ${postId}), array('%s'), array('%d'));
clean_post_cache(${postId});
echo ($r !== false) ? 'OK:${postId}:'.strlen($content) : 'ERR:'.$wpdb->last_error;
unlink(__FILE__);
`;
  const tmp = `/tmp/sz_rv_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_rv_${postId}.php"`, { timeout: 15000 });
  return new Promise((resolve) => {
    https.get(`${WP_BASE}/sz_rv_${postId}.php?t=sz2026`, (res) => {
      let body = ''; res.on('data', c => body += c);
      res.on('end', () => { try { fs.unlinkSync(tmp); } catch(e) {} resolve(body); });
    }).on('error', (e) => resolve('ERR:' + e.message));
  });
}

// 口コミカードHTML生成
function reviewCard(r) {
  const stars = '★'.repeat(r.star) + '☆'.repeat(5 - r.star);
  return `<div class="sz-review"><div class="sz-review-head"><span class="sz-review-stars">${stars}</span><span class="sz-review-name">${r.name}（${r.attr}）</span></div><p class="sz-review-text">${r.text}</p><span class="sz-review-date">${r.date}</span></div>`;
}

// 口コミセクションHTML生成
function reviewSection(storeName, rating, count, reviews) {
  return `<div class="sz-sec"><p class="sz-st">VOICE</p><h2 class="sz-sh">お客様の声</h2>
<div class="sz-review-summary"><div class="sz-review-score"><span class="sz-review-num">${rating}</span><span class="sz-review-stars-lg">★★★★★</span><span class="sz-review-count">${count}件の口コミ</span></div><p class="sz-review-src">出典：ホットペッパービューティー</p></div>
<div class="sz-reviews">${reviews.map(r => reviewCard(r)).join('')}</div></div>`;
}

// ===== 各店舗の口コミデータ =====
const REVIEWS = {
  3056: { // 甲府上石田店
    rating: '4.52', count: '65', reviews: [
      { star: 5, name: 'よし', attr: '男性/40代', date: '2025.10', text: 'テニスをやってて肩の可動域が狭くなり＆痛かったですが、すごく良い施術をしてくれました。肩が良く動いて痛みも改善しました。' },
      { star: 5, name: 'ai', attr: '男性/40代', date: '2026.02', text: 'ていねいな対応で、背筋も伸びた感じがありました。ストレッチを取り入れた施術でゴリゴリ痛みを伴う系のマッサージでないので、とてもよい施術を受けられました。' },
      { star: 5, name: 'koichi', attr: '男性/50代', date: '2026.01', text: '腕が上がらないのも改善し、姿勢も改善したことが写真撮影で確認できました。' },
      { star: 5, name: 'タクミ', attr: '男性/20代後半', date: '2025.07', text: '右の腰が悪かったのですが、施術後は自分の腰かと思うほど回復しました。' },
      { star: 5, name: 'y', attr: '女性/40代', date: '2025.07', text: '子どもの体の硬さに悩み、友人の紹介で伺いました。一度の施術で体が軽くなった！と効果を実感していました。' },
      { star: 5, name: 'シュウ', attr: '女性/30代前半', date: '2026.03', text: '体の歪みや疲れが気になったので行かせていただきました。丁寧に見てくださり、ストレッチのアドバイスもいただきました。とても良かったです。' },
    ]
  },
  3057: { // 南アルプス店
    rating: '4.50', count: '27', reviews: [
      { star: 5, name: 'さおりん', attr: '女性/50代', date: '2025.09', text: '初回60分体験で首肩の凝りが改善され、可動域が広がって驚いた。施術中に寝落ちするほど気持ちよかった。' },
      { star: 5, name: 'はたちゃん', attr: '女性/50代', date: '2025.11', text: '首肩の凝りと腰痛で来店。施術後は身体が軽くなり首が回せるようになった。' },
      { star: 5, name: 'りほ', attr: '女性/20代', date: '2025.07', text: '丁寧な対応と素晴らしい施術。料金は妥当で回数券購入決定。' },
      { star: 5, name: 'やまん', attr: '男性/40代', date: '2025.07', text: '説明と対応が素晴らしい。その場で回数券購入して定期利用開始。' },
      { star: 5, name: 'がんこもも', attr: '女性/60代', date: '2026.02', text: '施術中に多くの気づきがあり、終了後はスッキリ感を実感。自分ではできない部位のストレッチで大変満足。' },
    ]
  },
  3058: { // 韮崎店
    rating: '4.65', count: '26', reviews: [
      { star: 5, name: 'ともやぎ', attr: '女性/40代', date: '2025.10', text: '慢性的な膝痛からの股関節痛、姿勢の悪さからの肩の痛みがあり困っていました。一度の施術でもかなり軽くなり、子どもたちとの身体を使った遊びにも応じる余裕が出ました。' },
      { star: 5, name: 'きょうこ5', attr: '女性/60代', date: '2025.10', text: '若い頃から全身に不調がありいろいろなところに行きましたが治りませんでした。全身が軽くなったので感動しました。' },
      { star: 5, name: 'プーさん', attr: '男性/60代', date: '2026.03', text: '90分コース2回目。翌日小走りをしたところ、背骨の硬さが感じられず、スムーズな動きになっていたのを実感し驚きました。' },
      { star: 5, name: 'Catalina', attr: '女性/20代前半', date: '2025.11', text: 'めちゃくちゃ良かったです。写真で体の歪み具合を見せていただき、自分の酷さを実感しました。' },
      { star: 5, name: 'りょーちゃん', attr: '男性/20代後半', date: '2026.01', text: '理学療法士さんが施術してくれたので知識がしっかりしており、安心感がありました。' },
      { star: 5, name: 'くんちゃん', attr: '女性/50代', date: '2026.01', text: 'お風呂上がりに鏡を見たら、きちんと気をつけの姿勢ができていて、腕がまっすぐ延びていました。' },
    ]
  },
  3059: { // 甲斐響が丘店
    rating: '5.00', count: '2', reviews: [
      { star: 5, name: 'コウジ', attr: '男性/40代/会社員', date: '2026.03', text: '硬い肩周りが嘘のように動いてビックリ。来店して本当に良かったです。' },
      { star: 5, name: '248', attr: '女性/40代/会社員', date: '2026.03', text: '運動が苦手であり、運動不足や日々の疲れでガチガチだった体がほぐれてとても癒されました。スタッフの方もとても親切で大満足でした。また行きたいと思います！' },
    ]
  },
};

async function main() {
  console.log('=== 店舗ページに口コミセクション追加 ===\n');

  for (const [pageId, data] of Object.entries(REVIEWS)) {
    console.log(`ID:${pageId}`);

    // 現在のコンテンツをDB PHPで取得
    const getPHP = `<?php
require_once dirname(__FILE__) . '/wp-load.php';
if (($_GET['t'] ?? '') !== 'sz2026') { http_response_code(403); exit; }
$post = get_post(${pageId});
echo base64_encode($post->post_content);
unlink(__FILE__);
`;
    const getTmp = `/tmp/sz_get_${pageId}.php`;
    fs.writeFileSync(getTmp, getPHP);
    execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${getTmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_get_${pageId}.php"`, { timeout: 15000 });

    const currentB64 = await new Promise((resolve) => {
      https.get(`${WP_BASE}/sz_get_${pageId}.php?t=sz2026`, (res) => {
        let body = ''; res.on('data', c => body += c);
        res.on('end', () => { try { fs.unlinkSync(getTmp); } catch(e) {} resolve(body); });
      }).on('error', () => resolve(''));
    });

    let content = Buffer.from(currentB64, 'base64').toString('utf-8');
    console.log(`  現在のコンテンツ: ${content.length}文字`);

    if (content.length < 100) {
      console.log(`  ✗ コンテンツが空。スキップ。`);
      continue;
    }

    // 既に口コミセクションがあれば置換、なければCTAの前に挿入
    const reviewHtml = reviewSection(
      '', data.rating, data.count, data.reviews
    );

    if (content.includes('sz-reviews')) {
      // 既存の口コミセクションを置換
      content = content.replace(/<div class="sz-sec"><p class="sz-st">VOICE<\/p>[\s\S]*?<\/div><\/div><\/div>/, reviewHtml);
      console.log(`  口コミセクション置換`);
    } else {
      // CTAセクションの前に挿入
      content = content.replace(
        '<div class="sz-cta">',
        reviewHtml + '\n<div class="sz-cta">'
      );
      console.log(`  口コミセクション新規挿入`);
    }

    const result = await dbUpdate(pageId, content);
    console.log(`  ${result}\n`);
  }

  console.log('完了');
}

main().catch(console.error);
