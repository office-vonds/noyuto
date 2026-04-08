/**
 * 全ページの住所を正規住所に修正
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
  const tmp = `/tmp/sz_ad_g_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_ad_g_${postId}.php"`, {timeout:15000});
  return new Promise(r=>{https.get(`${WP_BASE}/sz_ad_g_${postId}.php?t=sz2026`,res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{fs.unlinkSync(tmp)}catch(e){}r(Buffer.from(b,'base64').toString('utf-8'))})}).on('error',()=>r(''))});
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
  const tmp = `/tmp/sz_ad_u_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_ad_u_${postId}.php"`, {timeout:15000});
  return new Promise(r=>{https.get(`${WP_BASE}/sz_ad_u_${postId}.php?t=sz2026`,res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{fs.unlinkSync(tmp)}catch(e){}r(b)})}).on('error',e=>r('ERR:'+e.message))});
}

// 旧住所 → 正規住所マッピング
const REPLACEMENTS = [
  // 甲府上石田店: 「南西パークマンション 101」を削除 + 住所修正
  { old: '〒400-0041 山梨県甲府市上石田3-7-7', new: '〒400-0041 山梨県甲府市上石田3丁目12-12' },
  { old: '山梨県甲府市上石田3-7-7', new: '山梨県甲府市上石田3丁目12-12' },
  { old: '南西パークマンション 101', new: '' },
  { old: '南西パークマンション101', new: '' },

  // 南アルプス店
  { old: '〒400-0306 山梨県南アルプス市小笠原1281-8', new: '〒400-0305 山梨県南アルプス市十五所700-1' },
  { old: '山梨県南アルプス市小笠原1281-8', new: '山梨県南アルプス市十五所700-1' },
  { old: '小笠原エリア、市役所近く', new: '十五所エリア' },
  { old: '小笠原エリア', new: '十五所エリア' },
  { old: '南アルプス市小笠原エリア', new: '南アルプス市十五所エリア' },

  // 韮崎店
  { old: '〒407-0015 山梨県韮崎市若宮2-2-43', new: '〒407-0004 山梨県韮崎市藤井町南下條241-1' },
  { old: '山梨県韮崎市若宮2-2-43', new: '山梨県韮崎市藤井町南下條241-1' },

  // 甲斐響が丘店
  { old: '〒400-0118 山梨県甲斐市竜王新町1981-10', new: '〒400-0104 山梨県甲斐市龍地3579-9' },
  { old: '山梨県甲斐市竜王新町1981-10', new: '山梨県甲斐市龍地3579-9' },

  // Googleマップリンクの住所パラメータも修正
  { old: encodeURIComponent('〒400-0041 山梨県甲府市上石田3-7-7'), new: encodeURIComponent('山梨県甲府市上石田3丁目12-12') },
  { old: encodeURIComponent('山梨県甲府市上石田3-7-7'), new: encodeURIComponent('山梨県甲府市上石田3丁目12-12') },
  { old: encodeURIComponent('〒400-0306 山梨県南アルプス市小笠原1281-8'), new: encodeURIComponent('山梨県南アルプス市十五所700-1') },
  { old: encodeURIComponent('山梨県南アルプス市小笠原1281-8'), new: encodeURIComponent('山梨県南アルプス市十五所700-1') },
  { old: encodeURIComponent('〒407-0015 山梨県韮崎市若宮2-2-43'), new: encodeURIComponent('山梨県韮崎市藤井町南下條241-1') },
  { old: encodeURIComponent('山梨県韮崎市若宮2-2-43'), new: encodeURIComponent('山梨県韮崎市藤井町南下條241-1') },
  { old: encodeURIComponent('〒400-0118 山梨県甲斐市竜王新町1981-10'), new: encodeURIComponent('山梨県甲斐市龍地3579-9') },
  { old: encodeURIComponent('山梨県甲斐市竜王新町1981-10'), new: encodeURIComponent('山梨県甲斐市龍地3579-9') },
];

function applyReplacements(content) {
  for (const r of REPLACEMENTS) {
    if (r.old && content.includes(r.old)) {
      content = content.split(r.old).join(r.new);
    }
  }
  // 空行の連続を除去（南西パークマンション削除後の余分な改行）
  content = content.replace(/<br>\s*<br>/g, '<br>');
  content = content.replace(/\n\n\n+/g, '\n\n');
  return content;
}

async function main() {
  console.log('=== 全ページ住所修正 ===\n');

  // 店舗ページ4つ + ブログ記事8つ + columnインデックス
  const allIds = [
    // 店舗ページ
    { id: 3056, name: '甲府上石田店ページ' },
    { id: 3057, name: '南アルプス店ページ' },
    { id: 3058, name: '韮崎店ページ' },
    { id: 3059, name: '甲斐響が丘店ページ' },
    // ブログ記事
    { id: 3060, name: '猫背記事' },
    { id: 3061, name: '姿勢改善記事' },
    { id: 3062, name: '肩こり記事' },
    { id: 3070, name: '腰痛記事' },
    { id: 3071, name: '南アルプス記事' },
    { id: 3072, name: '韮崎記事' },
    { id: 3073, name: 'ストレッチ効果記事' },
    { id: 3074, name: '比較記事' },
    // columnインデックス
    { id: 3149, name: 'コラム一覧' },
  ];

  for (const page of allIds) {
    let content = await getContent(page.id);
    if (content.length < 50) {
      console.log(`  ${page.name} (ID:${page.id}) — コンテンツ空、スキップ`);
      continue;
    }

    const original = content;
    content = applyReplacements(content);

    if (content !== original) {
      const result = await dbUpdate(page.id, content);
      console.log(`  ✓ ${page.name} (ID:${page.id}) — ${result}`);
    } else {
      console.log(`  - ${page.name} (ID:${page.id}) — 変更なし`);
    }
  }

  console.log('\n完了');
}

main().catch(console.error);
