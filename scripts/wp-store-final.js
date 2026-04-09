/**
 * 店舗ページ最終修正 - マップ部分をGoogleマップリンクボタンに変更
 * + コンテンツ全体を再生成（クリーンな状態から）
 */

const https = require('https');
const querystring = require('querystring');

const WP_BASE = 'https://stretchzero.jp';
let cookies = '';
let nonce = '';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname, port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: { 'User-Agent': 'VONDS-SEO', ...(options.headers || {}) },
    };
    if (cookies) reqOptions.headers['Cookie'] = cookies;
    const req = https.request(reqOptions, (res) => {
      if (res.headers['set-cookie']) {
        const nc = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        cookies = cookies ? cookies + '; ' + nc : nc;
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function login() {
  const postData = querystring.stringify({
    log: 'Stretchlabo', pwd: 'Stretchlabo0501',
    'wp-submit': 'Log In', redirect_to: WP_BASE + '/wp-admin/', testcookie: 1,
  });
  await request(WP_BASE + '/wp-login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData), 'Cookie': 'wordpress_test_cookie=WP+Cookie+check' },
    body: postData,
  });
  const res = await request(WP_BASE + '/wp-admin/admin-ajax.php?action=rest-nonce');
  nonce = res.body.trim();
}

async function wpApi(method, endpoint, data) {
  const opts = { method, headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce } };
  if (data) opts.body = JSON.stringify(data);
  const res = await request(WP_BASE + '/wp-json' + endpoint, opts);
  if (res.status >= 200 && res.status < 300) {
    try { return JSON.parse(res.body); } catch { return res.body; }
  }
  console.error(`API Error [${res.status}]: ${res.body.substring(0, 200)}`);
  return null;
}

// 共通CSS
const CSS = `<style>
.sz{font-family:'Noto Sans JP',sans-serif;color:#2b2b2b;max-width:100%;margin:0 auto}
.sz *{box-sizing:border-box}
.sz-hero{position:relative;width:100%;height:400px;overflow:hidden;border-radius:12px;margin-bottom:40px}
.sz-hero img{width:100%;height:100%;object-fit:cover}
.sz-ov{position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(180deg,rgba(16,57,75,.15) 0%,rgba(16,57,75,.7) 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:40px}
.sz-ov h1{font-family:'Noto Sans JP',sans-serif;color:#fff;font-size:clamp(1.5rem,1.2rem + 1.5vw,2.2rem);font-weight:700;margin:0 0 8px;text-shadow:0 2px 8px rgba(0,0,0,.3);line-height:1.4}
.sz-badge{display:inline-block;background:#F8742D;color:#fff;font-size:13px;font-weight:700;padding:6px 16px;border-radius:20px;margin-bottom:12px;width:fit-content}
.sz-sub{color:rgba(255,255,255,.9);font-size:15px;margin:0}
.sz-sec{margin-bottom:48px}
.sz-st{font-family:'Jost',sans-serif;font-size:12px;font-weight:400;letter-spacing:.3em;color:#F8742D;text-transform:uppercase;margin:0 0 4px}
.sz-sh{font-family:'Noto Sans JP',sans-serif;font-size:clamp(1.25rem,1.1rem + .8vw,1.75rem);font-weight:700;color:#2b2b2b;margin:0 0 24px;padding-bottom:12px;border-bottom:3px solid #F8742D;display:inline-block}
.sz-lead{font-size:clamp(.95rem,.9rem + .3vw,1.1rem);line-height:1.9;letter-spacing:.05em;margin-bottom:32px}
.sz-lead strong{color:#F8742D}
.sz-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-bottom:40px}
.sz-card{background:#fff;border:1px solid #eee;border-radius:12px;padding:28px 24px;transition:box-shadow .3s,transform .3s}
.sz-card:hover{box-shadow:0 8px 24px rgba(248,116,45,.12);transform:translateY(-2px)}
.sz-icon{width:48px;height:48px;background:linear-gradient(135deg,#F8742D 0%,#F8CC2D 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:24px}
.sz-card h3{font-size:16px;font-weight:700;margin:0 0 8px;color:#2b2b2b}
.sz-card p{font-size:14px;line-height:1.7;color:#666;margin:0}
.sz-sym{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:40px}
.sz-sb{background:#F6F2EC;border-radius:10px;padding:24px 20px}
.sz-sb h3{font-size:15px;font-weight:700;color:#F8742D;margin:0 0 12px;display:flex;align-items:center;gap:8px}
.sz-sb ul{list-style:none;padding:0;margin:0}
.sz-sb li{font-size:14px;line-height:1.6;padding:4px 0 4px 16px;position:relative}
.sz-sb li::before{content:'✓';position:absolute;left:0;color:#F8742D;font-weight:bold}
.sz-tbl{width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;overflow:hidden;margin-bottom:40px;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.sz-tbl thead th{background:#10394b;color:#fff;font-size:14px;font-weight:600;padding:14px 16px;text-align:center}
.sz-tbl thead th:first-child{text-align:left}
.sz-tbl thead th:nth-child(2){background:#F8742D}
.sz-tbl tbody td{padding:14px 16px;font-size:14px;border-bottom:1px solid #f0f0f0;text-align:center}
.sz-tbl tbody td:first-child{font-weight:600;text-align:left;background:#fafafa}
.sz-tbl tbody td:nth-child(2){background:rgba(248,116,45,.05);font-weight:600;color:#F8742D}
.sz-tbl tbody tr:last-child td{border-bottom:none}
.sz-pt{width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;overflow:hidden;margin-bottom:24px;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.sz-pt thead th{background:#F8742D;color:#fff;font-size:14px;font-weight:600;padding:14px 16px}
.sz-pt tbody td{padding:16px;font-size:14px;border-bottom:1px solid #f0f0f0}
.sz-pt tbody tr:last-child td{border-bottom:none}
.sz-pt tbody tr:hover{background:#FFF8F4}
.sz-ph{background:#FFF8F4!important;font-weight:700}
.sz-ai{background:#fff;border:1px solid #eee;border-radius:12px;padding:28px}
.sz-ai table{width:100%;border-collapse:collapse}
.sz-ai td{padding:12px 0;font-size:14px;border-bottom:1px solid #f5f5f5;vertical-align:top}
.sz-ai td:first-child{font-weight:700;color:#F8742D;width:100px;white-space:nowrap}
.sz-map-btn{display:inline-flex;align-items:center;gap:8px;background:#fff;border:2px solid #F8742D;color:#F8742D;font-size:15px;font-weight:700;padding:14px 28px;border-radius:30px;text-decoration:none;transition:all .3s;margin-top:16px}
.sz-map-btn:hover{background:#F8742D;color:#fff}
.sz-cta{background:linear-gradient(135deg,#10394b 0%,#1a5a6e 100%);border-radius:16px;padding:48px 40px;text-align:center;margin-bottom:48px}
.sz-cta h2{color:#fff;font-size:clamp(1.2rem,1rem + 1vw,1.6rem);font-weight:700;margin:0 0 12px}
.sz-cta p{color:rgba(255,255,255,.8);font-size:14px;margin:0 0 28px;line-height:1.7}
.sz-cta-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.sz-bp{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(90deg,#F8742D 0%,#F8CC2D 100%);color:#fff;font-size:16px;font-weight:700;padding:16px 36px;border-radius:30px;text-decoration:none;box-shadow:0 6px 15px rgba(248,116,45,.3);transition:all .3s;letter-spacing:.05em}
.sz-bp:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(248,116,45,.4)}
.sz-bs{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:30px;text-decoration:none;border:2px solid rgba(255,255,255,.5);transition:all .3s}
.sz-bs:hover{background:rgba(255,255,255,.1);border-color:#fff}
.sz-rel{margin-bottom:48px}
.sz-rg{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}
.sz-rc{display:flex;align-items:center;gap:12px;padding:16px 20px;background:#fff;border:1px solid #eee;border-radius:10px;text-decoration:none;color:#2b2b2b;transition:all .3s;font-size:14px;font-weight:500}
.sz-rc:hover{border-color:#F8742D;box-shadow:0 4px 12px rgba(248,116,45,.1)}
.sz-rc::before{content:'▶';color:#F8742D;font-size:10px;flex-shrink:0}
@media(max-width:768px){.sz-hero{height:280px}.sz-ov{padding:24px}}
</style>`;

function gen(s) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`;
  return `${CSS}
<div class="sz">
<div class="sz-hero">
<img src="${s.image}" alt="${s.storeName} 外観" loading="eager">
<div class="sz-ov">
<div class="sz-badge">${s.areaLabel}のストレッチ専門店</div>
<h1>${s.storeName}</h1>
<p class="sz-sub">${s.catchcopy}</p>
</div>
</div>

<div class="sz-sec">
<p class="sz-lead">${s.area}で<strong>肩こり・腰痛・姿勢の悩み</strong>を根本から改善したい方へ。<br>${s.storeName}は、山梨県${s.area}エリアで${s.uniquePoint}。<br>「マッサージに通っても改善しない」「整体を受けても戻ってしまう」——そんなお悩みに、<strong>プロのパーソナルストレッチ</strong>で根本からアプローチします。</p>
</div>

<div class="sz-sec">
<p class="sz-st">REASON</p>
<h2 class="sz-sh">${s.area}で選ばれる理由</h2>
<div class="sz-grid">
<div class="sz-card"><div class="sz-icon">🏥</div><h3>国家資格保有者が施術</h3><p>理学療法士・柔道整復師など、医学的知識を持つプロが一人ひとりの身体を評価し、最適なストレッチを提供します。</p></div>
<div class="sz-card"><div class="sz-icon">🎯</div><h3>根本原因にアプローチ</h3><p>マッサージのような一時的な緩和ではなく、筋肉の柔軟性を回復させることで、肩こり・腰痛・姿勢の崩れを根本から改善。</p></div>
<div class="sz-card"><div class="sz-icon">📋</div><h3>セルフケアまで指導</h3><p>施術後には自宅でできるセルフストレッチを指導。来店していない日も効果が持続する仕組みを作ります。</p></div>
<div class="sz-card"><div class="sz-icon">🛋️</div><h3>完全個室・予約制</h3><p>プライベートな空間で、周りを気にすることなくリラックスしてストレッチを受けられます。</p></div>
</div>
</div>

<div class="sz-sec">
<p class="sz-st">SYMPTOMS</p>
<h2 class="sz-sh">こんなお悩みに対応しています</h2>
<div class="sz-sym">
<div class="sz-sb"><h3>💆 痛み・コリの改善</h3><ul><li><strong>肩こり</strong>が慢性化している</li><li><strong>腰痛</strong>で長時間座れない</li><li>首や背中が常に張っている</li><li>頭痛がひどい</li></ul></div>
<div class="sz-sb"><h3>🧍 姿勢・体型の改善</h3><ul><li><strong>猫背</strong>が気になる</li><li><strong>姿勢</strong>が悪いと言われる</li><li>反り腰を改善したい</li><li>O脚・X脚が気になる</li></ul></div>
<div class="sz-sb"><h3>⚡ パフォーマンス向上</h3><ul><li>スポーツの<strong>パフォーマンス</strong>を上げたい</li><li>身体の柔軟性を高めたい</li><li>ケガの予防をしたい</li><li>疲労回復を早めたい</li></ul></div>
</div>
</div>

<div class="sz-sec">
<p class="sz-st">COMPARISON</p>
<h2 class="sz-sh">整体・マッサージとの違い</h2>
<table class="sz-tbl">
<thead><tr><th></th><th>ストレッチ</th><th>整体</th><th>マッサージ</th></tr></thead>
<tbody>
<tr><td>アプローチ</td><td>筋肉を伸ばして柔軟性回復</td><td>骨格の歪みを矯正</td><td>筋肉を揉みほぐす</td></tr>
<tr><td>効果の持続性</td><td>根本改善で長期間持続</td><td>中程度</td><td>一時的</td></tr>
<tr><td>再発予防</td><td>セルフストレッチ指導あり</td><td>△</td><td>×</td></tr>
<tr><td>施術者の資格</td><td>国家資格保有者が施術</td><td>資格不要の場合あり</td><td>資格不要の場合あり</td></tr>
</tbody>
</table>
<p class="sz-lead" style="margin-top:16px">${s.area}で整体やマッサージをお探しの方にこそ、一度<strong>ストレッチの効果</strong>を体感していただきたいと考えています。</p>
</div>

<div class="sz-sec">
<p class="sz-st">PLAN</p>
<h2 class="sz-sh">料金プラン</h2>
<table class="sz-pt">
<thead><tr><th>コース</th><th>時間</th><th>料金（税込）</th></tr></thead>
<tbody>
<tr class="sz-ph"><td><strong>初回体験</strong></td><td>60分</td><td>お問い合わせください</td></tr>
<tr><td>ベーシック</td><td>40分</td><td>お問い合わせください</td></tr>
<tr><td>スタンダード</td><td>60分</td><td>お問い合わせください</td></tr>
<tr><td>プレミアム</td><td>80分</td><td>お問い合わせください</td></tr>
</tbody>
</table>
<p style="font-size:13px;color:#999">※ 料金の詳細はお問い合わせください。初めての方は初回体験コースがおすすめです。</p>
</div>

<div class="sz-sec">
<p class="sz-st">ACCESS</p>
<h2 class="sz-sh">店舗情報・アクセス</h2>
<div class="sz-ai">
<table>
<tr><td>店舗名</td><td>${s.storeName}</td></tr>
<tr><td>住所</td><td>${s.address}</td></tr>
${s.phone ? `<tr><td>電話番号</td><td><a href="tel:${s.phone.replace(/-/g, '')}" style="color:#F8742D;text-decoration:none;font-weight:700">${s.phone}</a></td></tr>` : ''}
<tr><td>アクセス</td><td>${s.access}</td></tr>
<tr><td>営業時間</td><td>9:00〜22:00（完全予約制）</td></tr>
<tr><td>定休日</td><td>不定休</td></tr>
</table>
<a href="${mapUrl}" target="_blank" rel="noopener" class="sz-map-btn">📍 Googleマップで見る →</a>
</div>
</div>

<div class="sz-cta">
<h2>まずは初回体験から</h2>
<p>ご予約は電話またはWebからお気軽にどうぞ。<br>初めての方は初回体験コースがおすすめです。</p>
<div class="sz-cta-btns">
<a href="/contact/" class="sz-bp">Web予約・お問い合わせ →</a>
${s.phone ? `<a href="tel:${s.phone.replace(/-/g, '')}" class="sz-bs">☎ ${s.phone}</a>` : ''}
</div>
</div>

<div class="sz-rel">
<p class="sz-st">COLUMN</p>
<h2 class="sz-sh">お悩み別のご案内</h2>
<div class="sz-rg">
<a href="/column/katakori-kofu-stretch/" class="sz-rc">肩こりでお悩みの方</a>
<a href="/column/yotsu-kofu-stretch/" class="sz-rc">腰痛でお悩みの方</a>
<a href="/column/nekoze-stretch-yamanashi/" class="sz-rc">猫背を改善したい方</a>
<a href="/column/shisei-kaizen-kofu/" class="sz-rc">姿勢を改善したい方</a>
<a href="/column/stretch-kouka-yamanashi/" class="sz-rc">ストレッチの効果を知りたい方</a>
<a href="/column/kofu-stretch-hikaku/" class="sz-rc">整体・マッサージとの違い</a>
</div>
</div>

<div class="sz-sec" style="text-align:center;padding:24px 0;border-top:1px solid #eee">
<p style="font-size:13px;color:#999;margin-bottom:12px">その他の店舗</p>
<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
${s.otherStores.map(o => `<a href="${o.url}" style="color:#F8742D;font-size:14px;text-decoration:none;font-weight:600">${o.name}</a>`).join(' | ')}
</div>
</div>
</div>

<script type="application/ld+json">
{"@context":"https://schema.org","@type":"LocalBusiness","name":"${s.storeName}","description":"${s.area}のストレッチ専門店。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。","address":{"@type":"PostalAddress","streetAddress":"${s.address}","addressLocality":"${s.area}","addressRegion":"山梨県","addressCountry":"JP"}${s.phone ? `,"telephone":"${s.phone}"` : ''},"url":"https://stretchzero.jp${s.url}","openingHours":"Mo-Su 09:00-22:00","priceRange":"¥¥","image":"${s.image}"}
</script>`;
}

const STORES = [
  { pageId:3056, storeName:'ストレッチゼロ 甲府上石田店', area:'甲府', areaLabel:'甲府', url:'/shop/shop-kofu/', image:'https://stretchzero.jp/wp-content/uploads/2025/02/183886-1024x768.jpg', address:'〒400-0041 山梨県甲府市上石田3-7-7', phone:'055-288-9827', access:'甲府昭和ICから車約5分、アルプス通り沿い', catchcopy:'理学療法士在籍 ── 肩こり・腰痛・姿勢改善にプロのストレッチを', uniquePoint:'唯一の<strong>ストレッチ専門店</strong>です', otherStores:[{name:'南アルプス店',url:'/shop/shop-minami-alps/'},{name:'韮崎店',url:'/shop/shop-nirasaki/'},{name:'甲斐響が丘店',url:'/shop/shop-kai-hibikigaoka/'}] },
  { pageId:3057, storeName:'ストレッチゼロ 南アルプス店', area:'南アルプス', areaLabel:'南アルプス市', url:'/shop/shop-minami-alps/', image:'https://stretchzero.jp/wp-content/uploads/2025/05/%E5%8D%97%E3%82%A2%E3%83%AB%E3%83%97%E3%82%B9%E5%BA%97-%E6%A1%88%E5%86%85%E7%94%BB%E5%83%8F-1024x768.jpg', address:'〒400-0306 山梨県南アルプス市小笠原1281-8', phone:'055-284-1824', access:'南アルプス市小笠原エリア、市役所近く', catchcopy:'南アルプス市唯一のストレッチ専門店で、身体の不調を根本から改善', uniquePoint:'<strong>唯一のストレッチ専門店</strong>です', otherStores:[{name:'甲府上石田店',url:'/shop/shop-kofu/'},{name:'韮崎店',url:'/shop/shop-nirasaki/'},{name:'甲斐響が丘店',url:'/shop/shop-kai-hibikigaoka/'}] },
  { pageId:3058, storeName:'ストレッチゼロ 韮崎店', area:'韮崎', areaLabel:'韮崎', url:'/shop/shop-nirasaki/', image:'https://stretchzero.jp/wp-content/uploads/2025/11/250719-001_v2-1024x769.jpg', address:'〒407-0015 山梨県韮崎市若宮2-2-43', phone:'0551-45-6560', access:'韮崎駅から車約5分', catchcopy:'韮崎エリア唯一のストレッチ専門店。プロの施術で身体が変わる。', uniquePoint:'<strong>唯一のストレッチ専門店</strong>です', otherStores:[{name:'甲府上石田店',url:'/shop/shop-kofu/'},{name:'南アルプス店',url:'/shop/shop-minami-alps/'},{name:'甲斐響が丘店',url:'/shop/shop-kai-hibikigaoka/'}] },
  { pageId:3059, storeName:'ストレッチゼロ 甲斐響が丘店', area:'甲斐', areaLabel:'甲斐市', url:'/shop/shop-kai-hibikigaoka/', image:'https://stretchzero.jp/wp-content/uploads/2026/02/image-1-1024x769.png', address:'〒400-0118 山梨県甲斐市竜王新町1981-10', phone:'', access:'響が丘エリア', catchcopy:'甲斐市のストレッチ専門店。理学療法士がパーソナルストレッチを提供。', uniquePoint:'エリアの<strong>ストレッチ専門店</strong>です', otherStores:[{name:'甲府上石田店',url:'/shop/shop-kofu/'},{name:'南アルプス店',url:'/shop/shop-minami-alps/'},{name:'韮崎店',url:'/shop/shop-nirasaki/'}] },
];

async function main() {
  await login();
  console.log('ログイン完了\n');

  for (const s of STORES) {
    console.log(`更新: ${s.storeName} (ID: ${s.pageId})`);
    const content = gen(s);
    const result = await wpApi('PUT', `/wp/v2/pages/${s.pageId}`, { content });
    console.log(`  ${result ? '✓' : '✗'} ${result ? result.link : '失敗'}`);
  }

  console.log('\n完了');
}

main().catch(console.error);
