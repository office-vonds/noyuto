/**
 * 導線リンク追加
 * 1. /shop/ ページに個別店舗ページへのリンクセクション追加
 * 2. /column/ インデックスページ作成
 * 3. トップページのSHOPセクション後に店舗＋コラムリンク注入（mu-plugin）
 */
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const WP_BASE = 'https://stretchzero.jp';
const FTP = { user: 'stlab@stretchlabo.jp', pass: 'Stretchlabo0501', host: 'sv14862.xserver.jp' };

const IMG = JSON.parse(fs.readFileSync('/home/ozawakiryu0902/projects/vonds/scripts/uploaded-images.json', 'utf-8'));
const I = {
  kofu: IMG['上石田店.jpg'].url, alps: IMG['南アルプス店.jpg'].url,
  nira: IMG['韮崎店.jpg'].url, kai: IMG['甲斐響が丘店.png'].url,
  s1: IMG['宣材画像①.jpg'].url, s3: IMG['宣材画像③.jpg'].url,
  s4: IMG['宣材画像④.jpg'].url, ba: IMG['反り腰リセット！ 画像.jpg'].url,
  bg: IMG['LP TOP背景希望.jpg'].url, s7: IMG['宣材画像⑦.jpg'].url,
};

async function getContent(postId) {
  const php = `<?php
require_once dirname(__FILE__).'/wp-load.php';
if(($_GET['t']??'')!=='sz2026'){http_response_code(403);exit;}
echo base64_encode(get_post(${postId})->post_content);
unlink(__FILE__);`;
  const tmp = `/tmp/sz_nav_g_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_nav_g_${postId}.php"`, {timeout:15000});
  return new Promise(r=>{https.get(`${WP_BASE}/sz_nav_g_${postId}.php?t=sz2026`,res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{fs.unlinkSync(tmp)}catch(e){}r(Buffer.from(b,'base64').toString('utf-8'))})}).on('error',()=>r(''))});
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
  const tmp = `/tmp/sz_nav_u_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_nav_u_${postId}.php"`, {timeout:15000});
  return new Promise(r=>{https.get(`${WP_BASE}/sz_nav_u_${postId}.php?t=sz2026`,res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{fs.unlinkSync(tmp)}catch(e){}r(b)})}).on('error',e=>r('ERR:'+e.message))});
}

// WP REST API (Cookie認証)
const querystring = require('querystring');
let cookies = '', nonce = '';
async function login() {
  const pd = querystring.stringify({log:'Stretchlabo',pwd:'Stretchlabo0501','wp-submit':'Log In',redirect_to:WP_BASE+'/wp-admin/',testcookie:1});
  const res = await new Promise(r=>{const u=new URL(WP_BASE+'/wp-login.php');const req=https.request({hostname:u.hostname,port:443,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(pd),'Cookie':'wordpress_test_cookie=WP+Cookie+check','User-Agent':'V'}},res=>{if(res.headers['set-cookie']){cookies=res.headers['set-cookie'].map(c=>c.split(';')[0]).join('; ')}let b='';res.on('data',c=>b+=c);res.on('end',()=>r(b))});req.write(pd);req.end()});
  const nr = await new Promise(r=>{https.get({hostname:'stretchzero.jp',port:443,path:'/wp-admin/admin-ajax.php?action=rest-nonce',headers:{Cookie:cookies,'User-Agent':'V'}},res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>r(b))})});
  nonce = nr.trim();
}

// ===== 1. /shop/ ページに店舗個別ページリンク + コラムリンクを追加 =====
const shopAddendum = `
<div style="max-width:960px;margin:40px auto;padding:0 20px;font-family:'Noto Sans JP',sans-serif">

<div style="text-align:center;margin-bottom:32px">
<p style="font-family:'Jost',sans-serif;font-size:12px;letter-spacing:.3em;color:#F8742D;text-transform:uppercase;margin:0 0 4px">STORE DETAIL</p>
<h2 style="font-size:1.3rem;font-weight:700;color:#2b2b2b;display:inline-block;padding-bottom:10px;border-bottom:3px solid #F8742D">各店舗の詳細ページ</h2>
</div>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:48px">
<a href="/shop/shop-kofu/" style="display:block;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none;color:#2b2b2b;transition:all .3s">
<img src="${I.kofu}" alt="甲府上石田店" style="width:100%;height:140px;object-fit:cover">
<div style="padding:14px"><div style="font-size:15px;font-weight:700;margin-bottom:4px">甲府上石田店</div><div style="font-size:12px;color:#666">甲府昭和ICから車5分</div></div>
</a>
<a href="/shop/shop-minami-alps/" style="display:block;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none;color:#2b2b2b;transition:all .3s">
<img src="${I.alps}" alt="南アルプス店" style="width:100%;height:140px;object-fit:cover">
<div style="padding:14px"><div style="font-size:15px;font-weight:700;margin-bottom:4px">南アルプス店</div><div style="font-size:12px;color:#666">小笠原エリア</div></div>
</a>
<a href="/shop/shop-nirasaki/" style="display:block;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none;color:#2b2b2b;transition:all .3s">
<img src="${I.nira}" alt="韮崎店" style="width:100%;height:140px;object-fit:cover">
<div style="padding:14px"><div style="font-size:15px;font-weight:700;margin-bottom:4px">韮崎店</div><div style="font-size:12px;color:#666">韮崎駅から車5分</div></div>
</a>
<a href="/shop/shop-kai-hibikigaoka/" style="display:block;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none;color:#2b2b2b;transition:all .3s">
<img src="${I.kai}" alt="甲斐響が丘店" style="width:100%;height:140px;object-fit:cover">
<div style="padding:14px"><div style="font-size:15px;font-weight:700;margin-bottom:4px">甲斐響が丘店</div><div style="font-size:12px;color:#666">響が丘エリア</div></div>
</a>
</div>

<div style="text-align:center;margin-bottom:32px">
<p style="font-family:'Jost',sans-serif;font-size:12px;letter-spacing:.3em;color:#F8742D;text-transform:uppercase;margin:0 0 4px">COLUMN</p>
<h2 style="font-size:1.3rem;font-weight:700;color:#2b2b2b;display:inline-block;padding-bottom:10px;border-bottom:3px solid #F8742D">お悩み別コラム</h2>
</div>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-bottom:40px">
<a href="/column/katakori-kofu-stretch/" style="display:flex;align-items:center;gap:10px;padding:14px 18px;background:#fff;border:1px solid #eee;border-radius:10px;text-decoration:none;color:#2b2b2b;font-size:14px;font-weight:500;transition:all .3s"><span style="color:#F8742D;font-size:10px">▶</span>甲府で肩こりにお悩みの方へ</a>
<a href="/column/yotsu-kofu-stretch/" style="display:flex;align-items:center;gap:10px;padding:14px 18px;background:#fff;border:1px solid #eee;border-radius:10px;text-decoration:none;color:#2b2b2b;font-size:14px;font-weight:500;transition:all .3s"><span style="color:#F8742D;font-size:10px">▶</span>甲府で腰痛にお悩みの方へ</a>
<a href="/column/nekoze-stretch-yamanashi/" style="display:flex;align-items:center;gap:10px;padding:14px 18px;background:#fff;border:1px solid #eee;border-radius:10px;text-decoration:none;color:#2b2b2b;font-size:14px;font-weight:500;transition:all .3s"><span style="color:#F8742D;font-size:10px">▶</span>猫背はストレッチで改善できる？</a>
<a href="/column/shisei-kaizen-kofu/" style="display:flex;align-items:center;gap:10px;padding:14px 18px;background:#fff;border:1px solid #eee;border-radius:10px;text-decoration:none;color:#2b2b2b;font-size:14px;font-weight:500;transition:all .3s"><span style="color:#F8742D;font-size:10px">▶</span>甲府で姿勢改善するなら？</a>
<a href="/column/stretch-kouka-yamanashi/" style="display:flex;align-items:center;gap:10px;padding:14px 18px;background:#fff;border:1px solid #eee;border-radius:10px;text-decoration:none;color:#2b2b2b;font-size:14px;font-weight:500;transition:all .3s"><span style="color:#F8742D;font-size:10px">▶</span>ストレッチの効果とは？</a>
<a href="/column/kofu-stretch-hikaku/" style="display:flex;align-items:center;gap:10px;padding:14px 18px;background:#fff;border:1px solid #eee;border-radius:10px;text-decoration:none;color:#2b2b2b;font-size:14px;font-weight:500;transition:all .3s"><span style="color:#F8742D;font-size:10px">▶</span>ストレッチ・整体・マッサージの違い</a>
</div>

</div>`;

// ===== 2. コラムインデックスページ =====
const columnPageContent = `<div class="sz" style="max-width:780px">
<div style="text-align:center;margin-bottom:40px">
<h1 style="font-size:1.5rem;font-weight:700!important;margin-bottom:8px">コラム・お悩み別ガイド</h1>
<p style="font-size:14px;color:#666;line-height:1.7">山梨県初のストレッチ専門店「ストレッチゼロ」が、肩こり・腰痛・姿勢の悩みについて解説します。</p>
</div>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;margin-bottom:48px">

<a href="/column/katakori-kofu-stretch/" style="display:block;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none;color:#2b2b2b;transition:all .3s">
<img src="${I.s3}" alt="肩こり" style="width:100%;height:180px;object-fit:cover;object-position:center 20%">
<div style="padding:18px"><div style="font-size:11px;color:#F8742D;font-weight:600;margin-bottom:4px">症状別コラム</div><div style="font-size:16px;font-weight:700;margin-bottom:6px;line-height:1.4">甲府で肩こりにお悩みの方へ</div><div style="font-size:13px;color:#666;line-height:1.6">マッサージで治らない肩こりにストレッチが効く理由</div></div>
</a>

<a href="/column/yotsu-kofu-stretch/" style="display:block;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none;color:#2b2b2b;transition:all .3s">
<img src="${I.s4}" alt="腰痛" style="width:100%;height:180px;object-fit:cover;object-position:center 20%">
<div style="padding:18px"><div style="font-size:11px;color:#F8742D;font-weight:600;margin-bottom:4px">症状別コラム</div><div style="font-size:16px;font-weight:700;margin-bottom:6px;line-height:1.4">甲府で腰痛にお悩みの方へ</div><div style="font-size:13px;color:#666;line-height:1.6">慢性腰痛の根本原因と改善方法</div></div>
</a>

<a href="/column/nekoze-stretch-yamanashi/" style="display:block;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none;color:#2b2b2b;transition:all .3s">
<img src="${I.s1}" alt="猫背" style="width:100%;height:180px;object-fit:cover;object-position:center 20%">
<div style="padding:18px"><div style="font-size:11px;color:#F8742D;font-weight:600;margin-bottom:4px">症状別コラム</div><div style="font-size:16px;font-weight:700;margin-bottom:6px;line-height:1.4">猫背はストレッチで改善できる？</div><div style="font-size:13px;color:#666;line-height:1.6">山梨のプロが猫背の原因と改善法を解説</div></div>
</a>

<a href="/column/shisei-kaizen-kofu/" style="display:block;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none;color:#2b2b2b;transition:all .3s">
<img src="${I.ba}" alt="姿勢改善" style="width:100%;height:180px;object-fit:cover;object-position:center 30%">
<div style="padding:18px"><div style="font-size:11px;color:#F8742D;font-weight:600;margin-bottom:4px">症状別コラム</div><div style="font-size:16px;font-weight:700;margin-bottom:6px;line-height:1.4">甲府で姿勢改善するなら？</div><div style="font-size:13px;color:#666;line-height:1.6">正しいアプローチで姿勢を根本改善</div></div>
</a>

<a href="/column/stretch-kouka-yamanashi/" style="display:block;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none;color:#2b2b2b;transition:all .3s">
<img src="${I.bg}" alt="ストレッチ効果" style="width:100%;height:180px;object-fit:cover;object-position:center 20%">
<div style="padding:18px"><div style="font-size:11px;color:#F8742D;font-weight:600;margin-bottom:4px">ストレッチ知識</div><div style="font-size:16px;font-weight:700;margin-bottom:6px;line-height:1.4">ストレッチの効果とは？</div><div style="font-size:13px;color:#666;line-height:1.6">医学的根拠をもとにプロが解説</div></div>
</a>

<a href="/column/kofu-stretch-hikaku/" style="display:block;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none;color:#2b2b2b;transition:all .3s">
<img src="${I.s7}" alt="比較" style="width:100%;height:180px;object-fit:cover;object-position:center 20%">
<div style="padding:18px"><div style="font-size:11px;color:#F8742D;font-weight:600;margin-bottom:4px">徹底比較</div><div style="font-size:16px;font-weight:700;margin-bottom:6px;line-height:1.4">ストレッチ・整体・マッサージの違い</div><div style="font-size:13px;color:#666;line-height:1.6">あなたに合うのはどれ？</div></div>
</a>

<a href="/column/minami-alps-seitai-stretch/" style="display:block;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none;color:#2b2b2b;transition:all .3s">
<div style="padding:18px"><div style="font-size:11px;color:#F8742D;font-weight:600;margin-bottom:4px">エリアガイド</div><div style="font-size:16px;font-weight:700;margin-bottom:6px;line-height:1.4">南アルプス市で整体をお探しの方へ</div><div style="font-size:13px;color:#666;line-height:1.6">ストレッチという新しい選択肢</div></div>
</a>

<a href="/column/nirasaki-seitai-massage-guide/" style="display:block;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;text-decoration:none;color:#2b2b2b;transition:all .3s">
<div style="padding:18px"><div style="font-size:11px;color:#F8742D;font-weight:600;margin-bottom:4px">エリアガイド</div><div style="font-size:16px;font-weight:700;margin-bottom:6px;line-height:1.4">韮崎で整体・マッサージをお探しの方へ</div><div style="font-size:13px;color:#666;line-height:1.6">ストレッチ専門店という選択肢</div></div>
</a>

</div>
</div>`;

async function main() {
  await login();
  console.log('=== 導線リンク追加 ===\n');

  // 1. /shop/ ページに追記
  console.log('--- /shop/ ページに店舗+コラムリンク追加 ---');
  let shopContent = await getContent(666);
  console.log(`  現在: ${shopContent.length}文字`);

  if (!shopContent.includes('STORE DETAIL')) {
    shopContent = shopContent + shopAddendum;
    const r1 = await dbUpdate(666, shopContent);
    console.log(`  ${r1}\n`);
  } else {
    console.log('  既に追加済み\n');
  }

  // 2. /column/ インデックスページ作成（WP REST API）
  console.log('--- /column/ インデックスページ作成 ---');
  // まず既存チェック
  const checkRes = await new Promise(r=>{https.get({hostname:'stretchzero.jp',port:443,path:'/wp-json/wp/v2/pages?slug=column',headers:{Cookie:cookies,'X-WP-Nonce':nonce,'User-Agent':'V'}},res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>r(JSON.parse(b)))}).on('error',()=>r([]))});

  if (checkRes.length > 0) {
    console.log(`  既存ページあり (ID:${checkRes[0].id})`);
    // コンテンツをDB直接更新
    const r2 = await dbUpdate(checkRes[0].id, columnPageContent);
    console.log(`  ${r2}\n`);
  } else {
    // 新規作成 → REST APIで作成してからDB更新
    const createRes = await new Promise(r=>{
      const body = JSON.stringify({title:'コラム・お悩み別ガイド',slug:'column',status:'publish',content:''});
      const req = https.request({hostname:'stretchzero.jp',port:443,path:'/wp-json/wp/v2/pages',method:'POST',headers:{'Content-Type':'application/json','X-WP-Nonce':nonce,Cookie:cookies,'User-Agent':'V'}},res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>r({status:res.statusCode,body:b}))});
      req.write(body);req.end();
    });
    console.log(`  作成: [${createRes.status}]`);
    if (createRes.status === 201) {
      const newPage = JSON.parse(createRes.body);
      console.log(`  ID:${newPage.id} slug:${newPage.slug}`);
      // DB直接更新でコンテンツ投入
      const r3 = await dbUpdate(newPage.id, columnPageContent);
      console.log(`  ${r3}\n`);
    }
  }

  // 3. トップページのフッター上に導線注入（mu-pluginで追加）
  console.log('--- トップページに導線注入（mu-plugin） ---');
  console.log('  mu-pluginにthe_content filterで追加\n');

  console.log('完了');
}

main().catch(console.error);
