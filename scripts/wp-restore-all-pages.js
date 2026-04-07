/**
 * 全ページDB直接復元 — contact, thanks, shop一覧, 店舗4ページ
 */
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const WP_BASE = 'https://stretchzero.jp';
const FTP_USER = 'stlab@stretchlabo.jp';
const FTP_PASS = 'Stretchlabo0501';
const FTP_HOST = 'sv14862.xserver.jp';

const IMG = JSON.parse(fs.readFileSync('/home/ozawakiryu0902/projects/vonds/scripts/uploaded-images.json', 'utf-8'));
const I = {
  s1: IMG['宣材画像①.jpg'].url, s2: IMG['宣材画像②.jpg'].url,
  s3: IMG['宣材画像③.jpg'].url, s4: IMG['宣材画像④.jpg'].url,
  s5: IMG['宣材画像⑤.jpg'].url, s6: IMG['宣材画像⑥.jpg'].url,
  s7: IMG['宣材画像⑦.jpg'].url, s8: IMG['宣材画像⑧.jpg'].url,
  s9: IMG['宣材画像⑨.jpg'].url, s10: IMG['宣材画像⑩.jpg'].url,
  s11: IMG['宣材画像⑪.jpg'].url, bg: IMG['LP TOP背景希望.jpg'].url,
  ba: IMG['反り腰リセット！ 画像.jpg'].url,
  kofu: IMG['上石田店.jpg'].url, alps: IMG['南アルプス店.jpg'].url,
  nira: IMG['韮崎店.jpg'].url, kai: IMG['甲斐響が丘店.png'].url,
};

async function directUpdate(postId, content) {
  // エスケープ: PHPの一重引用符内に入れるため
  const escaped = content.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const php = `<?php
require_once dirname(__FILE__) . '/wp-load.php';
if (!isset($_GET['t']) || $_GET['t'] !== 'sz2026') { http_response_code(403); exit; }
global $wpdb;
$r = $wpdb->update($wpdb->posts, array('post_content' => '${escaped}'), array('ID' => ${postId}), array('%s'), array('%d'));
clean_post_cache(${postId});
echo ($r !== false) ? 'OK:${postId}' : 'ERR:'.$wpdb->last_error;
unlink(__FILE__);
`;

  const tmpFile = `/tmp/sz_u_${postId}.php`;
  fs.writeFileSync(tmpFile, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP_USER}:${FTP_PASS}" -T ${tmpFile} "ftp://${FTP_HOST}/stretchzero.jp/public_html/sz_u_${postId}.php"`, { timeout: 15000 });

  return new Promise((resolve) => {
    https.get(`${WP_BASE}/sz_u_${postId}.php?t=sz2026`, (res) => {
      let body = ''; res.on('data', c => body += c);
      res.on('end', () => { try { fs.unlinkSync(tmpFile); } catch(e) {} resolve(body); });
    }).on('error', (e) => { resolve('ERR:' + e.message); });
  });
}

// ===== コンタクトページ =====
const contactContent = `[contact-form-7 id="1354" title="ストレッチゼロ 予約フォーム"]`;

// ===== サンクスページ =====
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
<p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#10394b">■ 重要：お電話番号について</p>
<p style="margin:0 0 8px;font-size:13px">以下の電話番号からおかけいたします。</p>
<div style="font-size:24px;font-weight:700;color:#F8742D;letter-spacing:.1em">055-242-7011</div>
<p style="font-size:13px;color:#666;margin:8px 0 0">※ 知らない番号からの着信を警戒される方が増えております。<br>上記番号からの着信にお出になれるようお願いいたします。</p>
</div>
</div>
<a href="/" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(90deg,#F8742D,#F8CC2D);color:#fff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:30px;text-decoration:none;box-shadow:0 6px 15px rgba(248,116,45,.3)">TOPへ戻る →</a>
</div>`;

// ===== 店舗ページ生成関数 =====
function storePage(s) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`;
  return `<div class="sz"><div class="sz-hero"><img src="${s.heroImg}" alt="${s.storeName} 外観" loading="eager"><div class="sz-ov"><div class="sz-badge">${s.areaLabel}のストレッチ専門店</div><h1>${s.storeName}</h1><p class="sz-sub">${s.catchcopy}</p></div></div><div class="sz-2col"><div><p class="sz-lead">${s.area}で<strong>肩こり・腰痛・姿勢の悩み</strong>を根本から改善したい方へ。<br>${s.storeName}は、山梨県${s.area}エリアで${s.uniquePoint}。<br>「マッサージに通っても改善しない」「整体を受けても戻ってしまう」——そんなお悩みに、<strong>プロのパーソナルストレッチ</strong>で根本からアプローチします。</p></div><img src="${s.subImg1}" alt="パーソナルストレッチ施術" loading="lazy"></div><div class="sz-sec"><p class="sz-st">REASON</p><h2 class="sz-sh">${s.area}で選ばれる理由</h2><div class="sz-grid"><div class="sz-card"><img src="${s.subImg2}" alt="国家資格保有者による施術" class="sz-card-img" loading="lazy"><h3>国家資格保有者が施術</h3><p>理学療法士・柔道整復師など医学的知識を持つプロが施術。</p></div><div class="sz-card"><img src="${s.subImg3}" alt="根本改善" class="sz-card-img" loading="lazy"><h3>根本原因にアプローチ</h3><p>筋肉の柔軟性を回復させ、肩こり・腰痛・姿勢の崩れを根本改善。</p></div><div class="sz-card"><img src="${I.ba}" alt="Before After" class="sz-card-img" loading="lazy"><h3>効果を実感できる</h3><p>施術前後の姿勢変化を可視化。セルフケア指導も毎回実施。</p></div></div></div><div class="sz-sec"><p class="sz-st">GALLERY</p><h2 class="sz-sh">施術の様子</h2><div class="sz-gallery">${s.gallery.map((url,i)=>`<img src="${url}" alt="施術風景${i+1}" loading="lazy">`).join('')}</div></div><div class="sz-sec"><p class="sz-st">SYMPTOMS</p><h2 class="sz-sh">こんなお悩みに対応</h2><div class="sz-sym"><div class="sz-sb"><h3>痛み・コリの改善</h3><ul><li><strong>肩こり</strong>が慢性化</li><li><strong>腰痛</strong>で座れない</li><li>首・背中が張る</li><li>頭痛がひどい</li></ul></div><div class="sz-sb"><h3>姿勢・体型の改善</h3><ul><li><strong>猫背</strong>が気になる</li><li><strong>姿勢</strong>が悪い</li><li>反り腰を改善したい</li><li>O脚・X脚</li></ul></div><div class="sz-sb"><h3>パフォーマンス向上</h3><ul><li>スポーツ向上</li><li>柔軟性を高めたい</li><li>ケガの予防</li><li>疲労回復</li></ul></div></div></div><div class="sz-sec"><p class="sz-st">COMPARISON</p><h2 class="sz-sh">整体・マッサージとの違い</h2><table class="sz-tbl"><thead><tr><th></th><th>ストレッチ</th><th>整体</th><th>マッサージ</th></tr></thead><tbody><tr><td>アプローチ</td><td>筋肉を伸ばして柔軟性回復</td><td>骨格矯正</td><td>揉みほぐす</td></tr><tr><td>持続性</td><td>根本改善で長期持続</td><td>中程度</td><td>一時的</td></tr><tr><td>再発予防</td><td>セルフケア指導あり</td><td>△</td><td>×</td></tr><tr><td>施術者</td><td>国家資格保有者</td><td>資格不要の場合あり</td><td>資格不要の場合あり</td></tr></tbody></table></div><div class="sz-sec"><p class="sz-st">PLAN</p><h2 class="sz-sh">料金プラン</h2><table class="sz-pt"><thead><tr><th>コース</th><th>時間</th><th>料金</th></tr></thead><tbody><tr class="sz-ph"><td><strong>初回体験</strong></td><td>60分</td><td>お問い合わせください</td></tr><tr><td>ベーシック</td><td>40分</td><td>お問い合わせください</td></tr><tr><td>スタンダード</td><td>60分</td><td>お問い合わせください</td></tr><tr><td>プレミアム</td><td>80分</td><td>お問い合わせください</td></tr></tbody></table></div><div class="sz-sec"><p class="sz-st">ACCESS</p><h2 class="sz-sh">店舗情報</h2><div class="sz-ai"><table><tr><td>店舗名</td><td>${s.storeName}</td></tr><tr><td>住所</td><td>${s.address}</td></tr>${s.phone?`<tr><td>電話</td><td><a href="tel:${s.phone.replace(/-/g,'')}" style="color:#F8742D;text-decoration:none;font-weight:700">${s.phone}</a></td></tr>`:''}<tr><td>アクセス</td><td>${s.access}</td></tr><tr><td>営業時間</td><td>9:00〜22:00（完全予約制）</td></tr><tr><td>定休日</td><td>不定休</td></tr></table><a href="${mapUrl}" target="_blank" rel="noopener" class="sz-map-btn">Googleマップで見る →</a></div></div><div class="sz-cta"><h2>まずは初回体験から</h2><p>ご予約は電話またはWebからお気軽にどうぞ。</p><div class="sz-cta-btns"><a href="/contact/" class="sz-bp">Web予約 →</a>${s.phone?`<a href="tel:${s.phone.replace(/-/g,'')}" class="sz-bs">☎ ${s.phone}</a>`:''}</div></div><div class="sz-sec"><p class="sz-st">COLUMN</p><h2 class="sz-sh">お悩み別のご案内</h2><div class="sz-rg"><a href="/column/katakori-kofu-stretch/" class="sz-rc">肩こりでお悩みの方</a><a href="/column/yotsu-kofu-stretch/" class="sz-rc">腰痛でお悩みの方</a><a href="/column/nekoze-stretch-yamanashi/" class="sz-rc">猫背を改善したい方</a><a href="/column/shisei-kaizen-kofu/" class="sz-rc">姿勢改善したい方</a><a href="/column/stretch-kouka-yamanashi/" class="sz-rc">ストレッチの効果</a><a href="/column/kofu-stretch-hikaku/" class="sz-rc">整体との違い</a></div></div><div style="text-align:center;padding:24px 0;border-top:1px solid #eee"><p style="font-size:13px;color:#999;margin-bottom:12px">その他の店舗</p><div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">${s.otherStores.map(o=>`<a href="${o.url}" style="color:#F8742D;font-size:14px;text-decoration:none;font-weight:600">${o.name}</a>`).join(' | ')}</div></div></div><script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"${s.storeName}","description":"${s.area}のストレッチ専門店","address":{"@type":"PostalAddress","streetAddress":"${s.address}","addressLocality":"${s.area}","addressRegion":"山梨県","addressCountry":"JP"}${s.phone?`,"telephone":"${s.phone}"`:''},"url":"https://stretchzero.jp${s.url}","openingHours":"Mo-Su 09:00-22:00","image":"${s.heroImg}"}</script>`;
}

const STORES = [
  { pageId:3056, storeName:'ストレッチゼロ 甲府上石田店', area:'甲府', areaLabel:'甲府', url:'/shop/shop-kofu/', heroImg:I.kofu, subImg1:I.s1, subImg2:I.s3, subImg3:I.s4, gallery:[I.s1,I.s2,I.s3,I.s4,I.s5,I.s6], address:'〒400-0041 山梨県甲府市上石田3-7-7', phone:'055-288-9827', access:'甲府昭和ICから車約5分', catchcopy:'理学療法士在籍──肩こり・腰痛・姿勢改善にプロのストレッチを', uniquePoint:'唯一の<strong>ストレッチ専門店</strong>です', otherStores:[{name:'南アルプス店',url:'/shop/shop-minami-alps/'},{name:'韮崎店',url:'/shop/shop-nirasaki/'},{name:'甲斐響が丘店',url:'/shop/shop-kai-hibikigaoka/'}] },
  { pageId:3057, storeName:'ストレッチゼロ 南アルプス店', area:'南アルプス', areaLabel:'南アルプス市', url:'/shop/shop-minami-alps/', heroImg:I.alps, subImg1:I.s5, subImg2:I.s6, subImg3:I.s7, gallery:[I.s5,I.s6,I.s7,I.s8,I.s9,I.s10], address:'〒400-0306 山梨県南アルプス市小笠原1281-8', phone:'055-284-1824', access:'小笠原エリア、市役所近く', catchcopy:'南アルプス市唯一のストレッチ専門店', uniquePoint:'<strong>唯一のストレッチ専門店</strong>です', otherStores:[{name:'甲府上石田店',url:'/shop/shop-kofu/'},{name:'韮崎店',url:'/shop/shop-nirasaki/'},{name:'甲斐響が丘店',url:'/shop/shop-kai-hibikigaoka/'}] },
  { pageId:3058, storeName:'ストレッチゼロ 韮崎店', area:'韮崎', areaLabel:'韮崎', url:'/shop/shop-nirasaki/', heroImg:I.nira, subImg1:I.s9, subImg2:I.s10, subImg3:I.s11, gallery:[I.s9,I.s10,I.s11,I.s1,I.s2,I.s3], address:'〒407-0015 山梨県韮崎市若宮2-2-43', phone:'0551-45-6560', access:'韮崎駅から車約5分', catchcopy:'韮崎唯一のストレッチ専門店。プロの施術で身体が変わる。', uniquePoint:'<strong>唯一のストレッチ専門店</strong>です', otherStores:[{name:'甲府上石田店',url:'/shop/shop-kofu/'},{name:'南アルプス店',url:'/shop/shop-minami-alps/'},{name:'甲斐響が丘店',url:'/shop/shop-kai-hibikigaoka/'}] },
  { pageId:3059, storeName:'ストレッチゼロ 甲斐響が丘店', area:'甲斐', areaLabel:'甲斐市', url:'/shop/shop-kai-hibikigaoka/', heroImg:I.kai, subImg1:I.s2, subImg2:I.s8, subImg3:I.s5, gallery:[I.s2,I.s8,I.s5,I.s7,I.s4,I.s11], address:'〒400-0118 山梨県甲斐市竜王新町1981-10', phone:'', access:'響が丘エリア', catchcopy:'甲斐市のストレッチ専門店。理学療法士がパーソナルストレッチを提供。', uniquePoint:'エリアの<strong>ストレッチ専門店</strong>です', otherStores:[{name:'甲府上石田店',url:'/shop/shop-kofu/'},{name:'南アルプス店',url:'/shop/shop-minami-alps/'},{name:'韮崎店',url:'/shop/shop-nirasaki/'}] },
];

// ===== shop一覧ページは元のElementorコンテンツを復元する必要がある =====
// shop一覧はElementorで作られていたため、REST APIで壊れた
// 元のコンテンツを取得する方法がないので、リビジョンから復元する

async function restoreFromRevision(postId) {
  // PHPスクリプトでリビジョンから復元
  const php = `<?php
require_once dirname(__FILE__) . '/wp-load.php';
if (!isset($_GET['t']) || $_GET['t'] !== 'sz2026') { http_response_code(403); exit; }

$post_id = ${postId};
$revisions = wp_get_post_revisions($post_id, array('numberposts' => 20, 'order' => 'DESC'));

$restored = false;
foreach ($revisions as $rev) {
    if (!empty($rev->post_content) && strlen($rev->post_content) > 100) {
        global $wpdb;
        $wpdb->update($wpdb->posts, array('post_content' => $rev->post_content), array('ID' => $post_id));
        clean_post_cache($post_id);
        echo 'RESTORED:' . $post_id . ' from rev:' . $rev->ID . ' len:' . strlen($rev->post_content);
        $restored = true;
        break;
    }
}
if (!$restored) {
    echo 'NO_REVISION_FOUND:' . $post_id;
}
unlink(__FILE__);
`;

  const tmpFile = `/tmp/sz_rev_${postId}.php`;
  fs.writeFileSync(tmpFile, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP_USER}:${FTP_PASS}" -T ${tmpFile} "ftp://${FTP_HOST}/stretchzero.jp/public_html/sz_rev_${postId}.php"`, { timeout: 15000 });

  return new Promise((resolve) => {
    https.get(`${WP_BASE}/sz_rev_${postId}.php?t=sz2026`, (res) => {
      let body = ''; res.on('data', c => body += c);
      res.on('end', () => { try { fs.unlinkSync(tmpFile); } catch(e) {} resolve(body); });
    }).on('error', (e) => { resolve('ERR:' + e.message); });
  });
}

async function main() {
  console.log('=== 全ページ復元開始 ===\n');

  // 1. shop一覧ページ（Elementorコンテンツ）をリビジョンから復元
  console.log('--- shop一覧ページ (ID:666) リビジョン復元 ---');
  const shopResult = await restoreFromRevision(666);
  console.log(`  ${shopResult}\n`);

  // 2. コンタクトページ — CF7ショートコードを復元
  console.log('--- コンタクトページ (ID:1406) ---');
  const contactResult = await directUpdate(1406, contactContent);
  console.log(`  ${contactResult}\n`);

  // 3. サンクスページ
  console.log('--- サンクスページ (ID:1411) ---');
  const thanksResult = await directUpdate(1411, thanksContent);
  console.log(`  ${thanksResult}\n`);

  // 4. 店舗ページ4つ
  console.log('--- 店舗ページ復元 ---');
  for (const s of STORES) {
    console.log(`  ${s.storeName} (ID:${s.pageId})`);
    const content = storePage(s);
    const result = await directUpdate(s.pageId, content);
    console.log(`    ${result}`);
  }

  console.log('\n=== 全ページ復元完了 ===');
}

main().catch(console.error);
