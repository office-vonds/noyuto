/**
 * 承認済みレイアウト実装
 * 1. 店舗ページにクイック予約バー追加
 * 2. 記事ページのレイアウト最終調整
 */
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const WP_BASE = 'https://stretchzero.jp';
const FTP = { user: 'stlab@stretchlabo.jp', pass: 'Stretchlabo0501', host: 'sv14862.xserver.jp' };

async function getContent(postId) {
  const php = `<?php
require_once dirname(__FILE__) . '/wp-load.php';
if (($_GET['t']??'')!=='sz2026'){http_response_code(403);exit;}
echo base64_encode(get_post(${postId})->post_content);
unlink(__FILE__);`;
  const tmp = `/tmp/sz_gc_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_gc_${postId}.php"`, {timeout:15000});
  return new Promise(r=>{https.get(`${WP_BASE}/sz_gc_${postId}.php?t=sz2026`,res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{fs.unlinkSync(tmp)}catch(e){}r(Buffer.from(b,'base64').toString('utf-8'))})}).on('error',()=>r(''))});
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
  const tmp = `/tmp/sz_du_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_du_${postId}.php"`, {timeout:15000});
  return new Promise(r=>{https.get(`${WP_BASE}/sz_du_${postId}.php?t=sz2026`,res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{fs.unlinkSync(tmp)}catch(e){}r(b)})}).on('error',e=>r('ERR:'+e.message))});
}

// ===== 店舗データ =====
const STORE_PHONES = {
  3056: '055-288-9827',
  3057: '055-284-1824',
  3058: '0551-45-6560',
  3059: '',
};

const STORE_NAMES = {
  3056: '甲府上石田店',
  3057: '南アルプス店',
  3058: '韮崎店',
  3059: '甲斐響が丘店',
};

// クイック予約バーHTML
function quickBar(phone) {
  const phoneLink = phone ? `<a href="tel:${phone.replace(/-/g,'')}" class="sz-qb-phone">☎ ${phone}</a>` : '';
  return `<div class="sz-quick-bar"><a href="/contact/" class="sz-qb-web">Web予約 →</a>${phoneLink}<span class="sz-qb-time">9:00〜22:00（完全予約制）</span></div>`;
}

async function main() {
  console.log('=== 承認済みレイアウト実装 ===\n');

  // ===== 1. 店舗ページにクイック予約バー追加 =====
  console.log('--- 店舗ページ: クイック予約バー追加 ---');

  for (const [pageId, phone] of Object.entries(STORE_PHONES)) {
    const id = parseInt(pageId);
    console.log(`  ${STORE_NAMES[id]} (ID:${id})`);

    let content = await getContent(id);
    if (content.length < 100) { console.log('    ✗ コンテンツ空'); continue; }

    // 既にクイック予約バーがあればスキップ
    if (content.includes('sz-quick-bar')) {
      console.log('    - 既存');
      continue;
    }

    // ヒーローの閉じタグの後にクイック予約バーを挿入
    // sz-heroの閉じdivの後（sz-2colの前）に挿入
    const bar = quickBar(phone);

    if (content.includes('</div>\n\n<div class="sz-2col">')) {
      content = content.replace(
        '</div>\n\n<div class="sz-2col">',
        '</div>\n\n' + bar + '\n\n<div class="sz-2col">'
      );
    } else if (content.includes('</div>\n<div class="sz-2col">')) {
      content = content.replace(
        '</div>\n<div class="sz-2col">',
        '</div>\n' + bar + '\n<div class="sz-2col">'
      );
    } else {
      // sz-hero閉じタグの後を探す
      // ヒーロー終了後の最初の位置に挿入
      const heroEnd = content.indexOf('</div>', content.indexOf('sz-sub'));
      if (heroEnd > 0) {
        // heroのoverlayの閉じ→heroの閉じ→の後に挿入
        const afterHero = content.indexOf('</div>', heroEnd + 6); // overlay close
        const afterHero2 = content.indexOf('</div>', afterHero + 6); // hero close
        if (afterHero2 > 0) {
          content = content.slice(0, afterHero2 + 6) + '\n\n' + bar + '\n\n' + content.slice(afterHero2 + 6);
        }
      }
    }

    const result = await dbUpdate(id, content);
    console.log(`    ${result}`);
  }

  console.log('\n完了');
}

main().catch(console.error);
