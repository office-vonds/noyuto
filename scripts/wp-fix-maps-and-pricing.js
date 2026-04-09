/**
 * ②Googleマップリンク→GBP URL差替え
 * ③料金プラン統一（初回体験・60/90/120分）
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
  const tmp = `/tmp/sz_mp_g_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_mp_g_${postId}.php"`, {timeout:15000});
  return new Promise(r=>{https.get(`${WP_BASE}/sz_mp_g_${postId}.php?t=sz2026`,res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{fs.unlinkSync(tmp)}catch(e){}r(Buffer.from(b,'base64').toString('utf-8'))})}).on('error',()=>r(''))});
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
  const tmp = `/tmp/sz_mp_u_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_mp_u_${postId}.php"`, {timeout:15000});
  return new Promise(r=>{https.get(`${WP_BASE}/sz_mp_u_${postId}.php?t=sz2026`,res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{fs.unlinkSync(tmp)}catch(e){}r(b)})}).on('error',e=>r('ERR:'+e.message))});
}

// 各店舗のGBP URL（前の調査で判明済み）
const GBP_URLS = {
  3056: 'https://maps.app.goo.gl/hkqec9MjHfqLgBnU8',  // 甲府上石田店
  3057: 'https://maps.app.goo.gl/9sKWfmy1fksaX6Zg8',  // 南アルプス店
  3058: 'https://maps.app.goo.gl/LhyN1NY7iqmMehj27',  // 韮崎店
  3059: 'https://maps.app.goo.gl/eTmK4dt7KomDw4zK7',  // 甲斐響が丘店
};

// 新しい料金プラン（初回体験統一・3コース）
const NEW_PRICING = `<table class="sz-pt"><thead><tr><th>コース</th><th>時間</th><th>料金（税込）</th></tr></thead><tbody>
<tr class="sz-ph"><td><strong>初回体験</strong><br><span style="font-size:11px;color:#F8742D;font-weight:600">おすすめ</span></td><td>60分</td><td>お問い合わせください</td></tr>
<tr><td><strong>初回体験</strong></td><td>90分</td><td>お問い合わせください</td></tr>
<tr><td><strong>初回体験</strong></td><td>120分</td><td>お問い合わせください</td></tr>
</tbody></table>
<p style="font-size:13px;color:#999;margin-top:8px">※ 料金の詳細はお問い合わせください。初めての方は初回体験コースがおすすめです。</p>`;

async function main() {
  console.log('=== マップリンク＋料金プラン修正 ===\n');

  for (const [pageId, gbpUrl] of Object.entries(GBP_URLS)) {
    const id = parseInt(pageId);
    console.log(`ID:${id}`);

    let content = await getContent(id);
    if (content.length < 100) { console.log('  コンテンツ空'); continue; }

    let changed = false;
    const original = content;

    // 1. Googleマップリンクを差替え
    // 既存: https://www.google.com/maps/search/?api=1&query=住所
    const oldMapRegex = /href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=[^"]+"/g;
    if (content.match(oldMapRegex)) {
      content = content.replace(oldMapRegex, `href="${gbpUrl}"`);
      console.log(`  ✓ Googleマップリンク差替え → ${gbpUrl}`);
      changed = true;
    }

    // 2. 料金プランテーブルを差替え
    // 既存テーブル全体を新テーブルに置換
    // <table class="sz-pt">で始まり</table>まで＋直後の※ 料金の詳細...<p/>まで
    const oldPricingRegex = /<table class="sz-pt">[\s\S]*?<\/table>(\s*<p[^>]*>※ 料金[^<]*<\/p>)?/;
    if (content.match(oldPricingRegex)) {
      content = content.replace(oldPricingRegex, NEW_PRICING);
      console.log('  ✓ 料金プラン更新（初回体験・60/90/120分）');
      changed = true;
    }

    if (changed) {
      const result = await dbUpdate(id, content);
      console.log(`  ${result}\n`);
    } else {
      console.log('  変更なし\n');
    }
  }

  console.log('完了');
}

main().catch(console.error);
