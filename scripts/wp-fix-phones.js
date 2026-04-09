/**
 * 全店舗ページの電話番号を正規番号に修正
 */
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const WP_BASE = 'https://stretchzero.jp';
const FTP = { user: 'stlab@stretchlabo.jp', pass: 'Stretchlabo0501', host: 'sv14862.xserver.jp' };

async function getContent(postId) {
  const php = `<?php
require_once dirname(__FILE__).'/wp-load.php';
if(($_GET['t']??'')!=='sz2026'){http_response_code(403);exit;}
echo base64_encode(get_post(${postId})->post_content);
unlink(__FILE__);`;
  const tmp = `/tmp/sz_ph_g_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_ph_g_${postId}.php"`, {timeout:15000});
  return new Promise(r=>{https.get(`${WP_BASE}/sz_ph_g_${postId}.php?t=sz2026`,res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{fs.unlinkSync(tmp)}catch(e){}r(Buffer.from(b,'base64').toString('utf-8'))})}).on('error',()=>r(''))});
}

async function dbUpdate(postId, content) {
  const b64 = Buffer.from(content,'utf-8').toString('base64');
  const php = `<?php
require_once dirname(__FILE__).'/wp-load.php';
if(($_GET['t']??'')!=='sz2026'){http_response_code(403);exit;}
$c=base64_decode('${b64}');
global $wpdb;
$r=$wpdb->update($wpdb->posts,array('post_content'=>$c),array('ID'=>${postId}),array('%s'),array('%d'));
clean_post_cache(${postId});
echo($r!==false)?'OK:${postId}:'.strlen($c):'ERR:'.$wpdb->last_error;
unlink(__FILE__);`;
  const tmp = `/tmp/sz_ph_u_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_ph_u_${postId}.php"`, {timeout:15000});
  return new Promise(r=>{https.get(`${WP_BASE}/sz_ph_u_${postId}.php?t=sz2026`,res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{fs.unlinkSync(tmp)}catch(e){}r(b)})}).on('error',e=>r('ERR:'+e.message))});
}

// 正規電話番号
const CORRECT_PHONES = {
  3056: { name: '甲府上石田店', tel: '055-242-7011', telRaw: '0552427011' },
  3057: { name: '南アルプス店', tel: '050-8884-3492', telRaw: '05088843492' },
  3058: { name: '韮崎店', tel: '050-8887-6260', telRaw: '05088876260' },
  3059: { name: '甲斐響が丘店', tel: '050-8887-2377', telRaw: '05088872377' },
};

async function main() {
  console.log('=== 電話番号修正 ===\n');

  for (const [pageId, info] of Object.entries(CORRECT_PHONES)) {
    const id = parseInt(pageId);
    console.log(`${info.name} (ID:${id}) → ${info.tel}`);

    let content = await getContent(id);
    if (content.length < 100) { console.log('  ✗ コンテンツ空'); continue; }

    // 現在の電話番号を検出
    const telMatches = content.match(/tel:(\d+)/g) || [];
    const displayMatches = content.match(/\d{2,4}-\d{2,4}-\d{3,4}/g) || [];
    console.log(`  現在のtel:リンク: ${telMatches.join(', ') || 'なし'}`);
    console.log(`  現在の表示番号: ${[...new Set(displayMatches)].join(', ') || 'なし'}`);

    // 全てのtel:リンクを正規番号に置換
    // まず既存のtel:XXXを全て正規番号に
    content = content.replace(/tel:\d{10,11}/g, `tel:${info.telRaw}`);

    // 表示されている電話番号も置換（ハイフン付き）
    // 既存の様々な形式の番号を正規番号に統一
    // 055-288-9827, 055-284-1824, 0551-45-6560 等を置換
    const oldPhonePatterns = [
      /055-288-9827/g,
      /055-284-1824/g,
      /0551-45-6560/g,
      /0552889827/g,
      /0552841824/g,
      /0551456560/g,
    ];

    for (const pattern of oldPhonePatterns) {
      if (content.match(pattern)) {
        const isRaw = pattern.source.match(/^\d+$/);
        content = content.replace(pattern, isRaw ? info.telRaw : info.tel);
      }
    }

    // さらに、ページ内の全ての電話番号表記を統一
    // 「電話番号」ラベルの後の番号を正規化
    // tel:の後の数字と、表示テキストの番号を一致させる

    // 特殊ケース: 甲斐響が丘店は元々電話番号なしだった→追加
    if (id === 3059 && !content.includes('tel:')) {
      // アクセス行の後に電話番号行を追加
      content = content.replace(
        /<tr><td>アクセス<\/td>/,
        `<tr><td>電話番号</td><td><a href="tel:${info.telRaw}" style="color:#F8742D;text-decoration:none;font-weight:700">${info.tel}</a></td></tr><tr><td>アクセス</td>`
      );
      // CTAの電話ボタンも追加
      content = content.replace(
        '</div></div>\n\n<div class="sz-sec"><p class="sz-st">COLUMN',
        `</div><a href="tel:${info.telRaw}" class="sz-bs">☎ ${info.tel}</a></div></div>\n\n<div class="sz-sec"><p class="sz-st">COLUMN`
      );
      // クイック予約バーにも電話追加
      if (content.includes('sz-quick-bar') && !content.includes('sz-qb-phone')) {
        content = content.replace(
          '<span class="sz-qb-time">',
          `<a href="tel:${info.telRaw}" class="sz-qb-phone">☎ ${info.tel}</a><span class="sz-qb-time">`
        );
      }
    }

    // JSON-LD内の電話番号も修正
    content = content.replace(/"telephone":"[^"]*"/, `"telephone":"${info.tel}"`);

    const result = await dbUpdate(id, content);
    console.log(`  ${result}\n`);
  }

  // ブログ記事内の電話番号も修正（店舗リンクに含まれる番号）
  console.log('--- ブログ記事内の電話番号修正 ---');
  const articleIds = [3060, 3061, 3062, 3070, 3071, 3072, 3073, 3074];

  for (const id of articleIds) {
    let content = await getContent(id);
    if (content.length < 100) continue;

    let changed = false;

    // 南アルプス店
    if (content.includes('0552841824') || content.includes('055-284-1824')) {
      content = content.replace(/0552841824/g, '05088843492');
      content = content.replace(/055-284-1824/g, '050-8884-3492');
      changed = true;
    }
    // 韮崎店
    if (content.includes('0551456560') || content.includes('0551-45-6560')) {
      content = content.replace(/0551456560/g, '05088876260');
      content = content.replace(/0551-45-6560/g, '050-8887-6260');
      changed = true;
    }
    // 甲府上石田店
    if (content.includes('0552889827') || content.includes('055-288-9827')) {
      content = content.replace(/0552889827/g, '0552427011');
      content = content.replace(/055-288-9827/g, '055-242-7011');
      changed = true;
    }

    if (changed) {
      const result = await dbUpdate(id, content);
      console.log(`  記事ID:${id} ${result}`);
    }
  }

  // モバイル固定CTAバーの電話番号も確認（mu-pluginで0552427011→正しい）
  console.log('\n--- mu-plugin内の電話番号確認 ---');
  console.log('  モバイル固定CTA: 0552427011 (甲府上石田店) → 正規番号OK');

  console.log('\n完了');
}

main().catch(console.error);
