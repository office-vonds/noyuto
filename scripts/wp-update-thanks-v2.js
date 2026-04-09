/**
 * サンクスページ v2: 4店舗全番号をデフォルト表示、JSで店舗別に絞り込み
 */
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const WP_BASE = 'https://stretchzero.jp';
const FTP = { user: 'stlab@stretchlabo.jp', pass: 'Stretchlabo0501', host: 'sv14862.xserver.jp' };

async function dbUpdate(postId, content) {
  const b64 = Buffer.from(content, 'utf-8').toString('base64');
  const php = `<?php
require_once dirname(__FILE__).'/wp-load.php';
if(($_GET['t']??'')!=='sz2026'){http_response_code(403);exit;}
$c=base64_decode('${b64}');
global $wpdb;
$r=$wpdb->update($wpdb->posts,array('post_content'=>$c),array('ID'=>${postId}),array('%s'),array('%d'));
clean_post_cache(${postId});
echo($r!==false)?'OK:${postId}:'.strlen($c):'ERR:'.$wpdb->last_error;
unlink(__FILE__);`;
  const tmp = `/tmp/sz_tv2_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_tv2_${postId}.php"`, {timeout:15000});
  return new Promise(r=>{https.get(`${WP_BASE}/sz_tv2_${postId}.php?t=sz2026`,res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{fs.unlinkSync(tmp)}catch(e){}r(b)})}).on('error',e=>r('ERR:'+e.message))});
}

// 新しいサンクスページHTML（デフォルトで全店舗番号を表示、JSで店舗別に絞り込み）
const thanksContent = `<div style="font-family:'Noto Sans JP',sans-serif;max-width:680px;margin:0 auto;padding:40px 20px;text-align:center;color:#2b2b2b">
<div style="width:80px;height:80px;background:linear-gradient(135deg,#F8742D,#F8CC2D);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:40px;color:#fff">&#10003;</div>
<h1 style="font-size:clamp(1.3rem,1rem + 1.5vw,1.8rem);font-weight:700;margin:0 0 8px">お申し込みありがとうございます</h1>
<p style="font-size:14px;color:#666;margin:0 0 32px">（送信完了）</p>
<div style="background:#F6F2EC;border-radius:16px;padding:32px 28px;text-align:left;margin-bottom:32px">
<h2 style="font-size:16px;font-weight:700;color:#10394b;margin:0 0 16px;text-align:center">ご予約リクエストを受け付けました</h2>
<p style="font-size:14px;line-height:1.9;margin:0 0 16px">この度は、ストレッチゼロへご予約のリクエストをいただき、誠にありがとうございます。</p>
<p style="font-weight:700;color:#F8742D;font-size:15px;margin:0 0 16px">※ 本メールは「仮予約」となります。</p>
<p style="font-size:14px;line-height:1.9;margin:0 0 16px">スタッフが空き状況を確認し、店舗からの<strong>「予約確定メール」</strong>または<strong>「お電話」</strong>をもって予約完了となります。</p>
<p style="font-size:14px;line-height:1.9;margin:0 0 16px">ホットペッパー等のリアルタイム予約とタイムラグがあるため、ご希望に添えない場合がございます。あらかじめご了承ください。</p>
<div style="background:#fff;border:2px solid #F8742D;border-radius:12px;padding:20px;text-align:center;margin:24px 0">
<p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#10394b">■ 重要：お電話番号について</p>
<p style="margin:0 0 14px;font-size:13px;line-height:1.7" data-sz-thanks-info>ご予約いただいた店舗より、以下のいずれかの電話番号からおかけいたします。</p>
<div data-sz-thanks-tel style="font-size:14px;line-height:2;text-align:left;display:inline-block;margin:0 auto">
<div><strong>甲府上石田店：</strong><a href="tel:07091386772" style="color:#F8742D;text-decoration:none;font-weight:700">070-9138-6772</a></div>
<div><strong>甲斐響が丘店：</strong><a href="tel:05088872377" style="color:#F8742D;text-decoration:none;font-weight:700">050-8887-2377</a></div>
<div><strong>南アルプス店：</strong><a href="tel:05088843492" style="color:#F8742D;text-decoration:none;font-weight:700">050-8884-3492</a></div>
<div><strong>韮崎店：</strong><a href="tel:05088876260" style="color:#F8742D;text-decoration:none;font-weight:700">050-8887-6260</a></div>
</div>
<p style="margin:14px 0 0;font-size:12px;color:#666;line-height:1.7">※ 知らない番号からの着信を警戒される方が増えております。<br>恐れ入りますが、スムーズにご連絡できるよう、<br>上記番号からの着信にお出になれるようお願いいたします。</p>
</div>
</div>
<a href="/" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(90deg,#F8742D,#F8CC2D);color:#fff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:30px;text-decoration:none;box-shadow:0 6px 15px rgba(248,116,45,.3)">TOPへ戻る →</a>
</div>`;

async function main() {
  console.log('=== サンクスページv2（全店舗番号常時表示＋絞り込み）===\n');
  const result = await dbUpdate(1411, thanksContent);
  console.log(`  ${result}`);
}

main().catch(console.error);
