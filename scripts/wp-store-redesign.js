/**
 * ストレッチゼロ 店舗ページ フルリデザイン
 * ブランドカラー・フォント・レイアウトをメインサイトに統一
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
  console.log('ログイン完了');
}

async function wpApi(method, endpoint, data) {
  const opts = { method, headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce } };
  if (data) opts.body = JSON.stringify(data);
  const res = await request(WP_BASE + '/wp-json' + endpoint, opts);
  if (res.status >= 200 && res.status < 300) {
    try { return JSON.parse(res.body); } catch { return res.body; }
  }
  console.error(`API Error [${res.status}]: ${res.body.substring(0, 300)}`);
  return null;
}

// ============================================
// 共通CSS（全店舗ページ共通）
// ============================================

const COMMON_CSS = `
<style>
  .sz-store-page { font-family: 'Noto Sans JP', sans-serif; color: #2b2b2b; max-width: 100%; margin: 0 auto; }
  .sz-store-page * { box-sizing: border-box; }

  /* ヒーローセクション */
  .sz-hero {
    position: relative;
    width: 100%;
    height: 400px;
    overflow: hidden;
    border-radius: 12px;
    margin-bottom: 40px;
  }
  .sz-hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .sz-hero-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(180deg, rgba(16,57,75,0.15) 0%, rgba(16,57,75,0.7) 100%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 40px;
  }
  .sz-hero-overlay h1 {
    font-family: 'Noto Sans JP', sans-serif;
    color: #fff;
    font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2.2rem);
    font-weight: 700;
    margin: 0 0 8px 0;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
    line-height: 1.4;
  }
  .sz-hero-badge {
    display: inline-block;
    background: #F8742D;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    padding: 6px 16px;
    border-radius: 20px;
    margin-bottom: 12px;
    width: fit-content;
  }
  .sz-hero-sub {
    color: rgba(255,255,255,0.9);
    font-size: 15px;
    margin: 0;
  }

  /* セクションタイトル */
  .sz-section { margin-bottom: 48px; }
  .sz-section-title {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.3em;
    color: #F8742D;
    text-transform: uppercase;
    margin: 0 0 4px 0;
  }
  .sz-section-heading {
    font-family: 'Noto Sans JP', sans-serif;
    font-size: clamp(1.25rem, 1.1rem + 0.8vw, 1.75rem);
    font-weight: 700;
    color: #2b2b2b;
    margin: 0 0 24px 0;
    padding-bottom: 12px;
    border-bottom: 3px solid #F8742D;
    display: inline-block;
  }

  /* リード文 */
  .sz-lead {
    font-size: clamp(0.95rem, 0.9rem + 0.3vw, 1.1rem);
    line-height: 1.9;
    letter-spacing: 0.05em;
    margin-bottom: 32px;
  }
  .sz-lead strong { color: #F8742D; }

  /* 特徴カード */
  .sz-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }
  .sz-feature-card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 28px 24px;
    transition: box-shadow 0.3s, transform 0.3s;
  }
  .sz-feature-card:hover {
    box-shadow: 0 8px 24px rgba(248,116,45,0.12);
    transform: translateY(-2px);
  }
  .sz-feature-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #F8742D 0%, #F8CC2D 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 24px;
  }
  .sz-feature-card h3 {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #2b2b2b;
  }
  .sz-feature-card p {
    font-size: 14px;
    line-height: 1.7;
    color: #666;
    margin: 0;
  }

  /* 症状グリッド */
  .sz-symptoms {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 40px;
  }
  .sz-symptom-box {
    background: #F6F2EC;
    border-radius: 10px;
    padding: 24px 20px;
  }
  .sz-symptom-box h3 {
    font-size: 15px;
    font-weight: 700;
    color: #F8742D;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sz-symptom-box ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .sz-symptom-box li {
    font-size: 14px;
    line-height: 1.6;
    padding: 4px 0;
    padding-left: 16px;
    position: relative;
  }
  .sz-symptom-box li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #F8742D;
    font-weight: bold;
  }

  /* 比較テーブル */
  .sz-compare-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 40px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .sz-compare-table thead th {
    background: #10394b;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    padding: 14px 16px;
    text-align: center;
  }
  .sz-compare-table thead th:first-child { text-align: left; }
  .sz-compare-table thead th:nth-child(2) {
    background: #F8742D;
  }
  .sz-compare-table tbody td {
    padding: 14px 16px;
    font-size: 14px;
    border-bottom: 1px solid #f0f0f0;
    text-align: center;
  }
  .sz-compare-table tbody td:first-child {
    font-weight: 600;
    text-align: left;
    background: #fafafa;
  }
  .sz-compare-table tbody td:nth-child(2) {
    background: rgba(248,116,45,0.05);
    font-weight: 600;
    color: #F8742D;
  }
  .sz-compare-table tbody tr:last-child td { border-bottom: none; }

  /* 料金セクション */
  .sz-price-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .sz-price-table thead th {
    background: #F8742D;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    padding: 14px 16px;
  }
  .sz-price-table tbody td {
    padding: 16px;
    font-size: 14px;
    border-bottom: 1px solid #f0f0f0;
  }
  .sz-price-table tbody tr:last-child td { border-bottom: none; }
  .sz-price-table tbody tr:hover { background: #FFF8F4; }
  .sz-price-highlight {
    background: #FFF8F4 !important;
    font-weight: 700;
  }

  /* アクセス情報 */
  .sz-access-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 40px;
  }
  @media (max-width: 768px) {
    .sz-access-grid { grid-template-columns: 1fr; }
  }
  .sz-access-info {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 28px;
  }
  .sz-access-info table {
    width: 100%;
    border-collapse: collapse;
  }
  .sz-access-info td {
    padding: 12px 0;
    font-size: 14px;
    border-bottom: 1px solid #f5f5f5;
    vertical-align: top;
  }
  .sz-access-info td:first-child {
    font-weight: 700;
    color: #F8742D;
    width: 100px;
    white-space: nowrap;
  }
  .sz-access-map {
    border-radius: 12px;
    overflow: hidden;
    min-height: 300px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sz-access-map iframe {
    width: 100%;
    height: 100%;
    min-height: 300px;
    border: none;
  }

  /* CTAセクション */
  .sz-cta {
    background: linear-gradient(135deg, #10394b 0%, #1a5a6e 100%);
    border-radius: 16px;
    padding: 48px 40px;
    text-align: center;
    margin-bottom: 48px;
  }
  .sz-cta h2 {
    color: #fff;
    font-size: clamp(1.2rem, 1rem + 1vw, 1.6rem);
    font-weight: 700;
    margin: 0 0 12px 0;
  }
  .sz-cta p {
    color: rgba(255,255,255,0.8);
    font-size: 14px;
    margin: 0 0 28px 0;
    line-height: 1.7;
  }
  .sz-cta-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .sz-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(90deg, #F8742D 0%, #F8CC2D 100%);
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    padding: 16px 36px;
    border-radius: 30px;
    text-decoration: none;
    box-shadow: 0 6px 15px rgba(248,116,45,0.3);
    transition: all 0.3s;
    letter-spacing: 0.05em;
  }
  .sz-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(248,116,45,0.4);
  }
  .sz-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    padding: 14px 32px;
    border-radius: 30px;
    text-decoration: none;
    border: 2px solid rgba(255,255,255,0.5);
    transition: all 0.3s;
  }
  .sz-btn-secondary:hover {
    background: rgba(255,255,255,0.1);
    border-color: #fff;
  }

  /* 関連コンテンツ */
  .sz-related {
    margin-bottom: 48px;
  }
  .sz-related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }
  .sz-related-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 10px;
    text-decoration: none;
    color: #2b2b2b;
    transition: all 0.3s;
    font-size: 14px;
    font-weight: 500;
  }
  .sz-related-card:hover {
    border-color: #F8742D;
    box-shadow: 0 4px 12px rgba(248,116,45,0.1);
  }
  .sz-related-card::before {
    content: '▶';
    color: #F8742D;
    font-size: 10px;
    flex-shrink: 0;
  }

  /* 構造化データは非表示 */
  .sz-schema { display: none; }
</style>
`;

// ============================================
// 店舗ページHTML生成
// ============================================

function generateStorePage(store) {
  return `
${COMMON_CSS}

<div class="sz-store-page">

  <!-- ヒーロー -->
  <div class="sz-hero">
    <img src="${store.image}" alt="${store.storeName} 外観" loading="eager">
    <div class="sz-hero-overlay">
      <div class="sz-hero-badge">${store.areaLabel}のストレッチ専門店</div>
      <h1>${store.storeName}</h1>
      <p class="sz-hero-sub">${store.catchcopy}</p>
    </div>
  </div>

  <!-- リード文 -->
  <div class="sz-section">
    <p class="sz-lead">
      ${store.area}で<strong>肩こり・腰痛・姿勢の悩み</strong>を根本から改善したい方へ。<br>
      ${store.storeName}は、山梨県${store.area}エリアで${store.uniquePoint}。<br>
      「マッサージに通っても改善しない」「整体を受けても戻ってしまう」——そんなお悩みに、<strong>プロのパーソナルストレッチ</strong>で根本からアプローチします。
    </p>
  </div>

  <!-- 選ばれる理由 -->
  <div class="sz-section">
    <p class="sz-section-title">REASON</p>
    <h2 class="sz-section-heading">${store.area}で選ばれる理由</h2>
    <div class="sz-features">
      <div class="sz-feature-card">
        <div class="sz-feature-icon">🏥</div>
        <h3>国家資格保有者が施術</h3>
        <p>理学療法士・柔道整復師など、医学的知識を持つプロのトレーナーが一人ひとりの身体を評価し、最適なストレッチを提供します。</p>
      </div>
      <div class="sz-feature-card">
        <div class="sz-feature-icon">🎯</div>
        <h3>根本原因にアプローチ</h3>
        <p>マッサージのような一時的な緩和ではなく、筋肉の柔軟性を回復させることで、肩こり・腰痛・姿勢の崩れを根本から改善します。</p>
      </div>
      <div class="sz-feature-card">
        <div class="sz-feature-icon">📋</div>
        <h3>セルフケアまで指導</h3>
        <p>施術後には自宅でできるセルフストレッチを指導。来店していない日も効果が持続する仕組みを作ります。</p>
      </div>
      <div class="sz-feature-card">
        <div class="sz-feature-icon">🛋️</div>
        <h3>完全個室・予約制</h3>
        <p>プライベートな空間で、周りを気にすることなくリラックスしてストレッチを受けられます。完全予約制で待ち時間もゼロ。</p>
      </div>
    </div>
  </div>

  <!-- こんなお悩みに -->
  <div class="sz-section">
    <p class="sz-section-title">SYMPTOMS</p>
    <h2 class="sz-section-heading">こんなお悩みに対応しています</h2>
    <div class="sz-symptoms">
      <div class="sz-symptom-box">
        <h3>💆 痛み・コリの改善</h3>
        <ul>
          <li><strong>肩こり</strong>が慢性化している</li>
          <li><strong>腰痛</strong>で長時間座れない</li>
          <li>首や背中が常に張っている</li>
          <li>頭痛がひどい</li>
        </ul>
      </div>
      <div class="sz-symptom-box">
        <h3>🧍 姿勢・体型の改善</h3>
        <ul>
          <li><strong>猫背</strong>が気になる</li>
          <li><strong>姿勢</strong>が悪いと言われる</li>
          <li>反り腰を改善したい</li>
          <li>O脚・X脚が気になる</li>
        </ul>
      </div>
      <div class="sz-symptom-box">
        <h3>⚡ パフォーマンス向上</h3>
        <ul>
          <li>スポーツの<strong>パフォーマンス</strong>を上げたい</li>
          <li>身体の柔軟性を高めたい</li>
          <li>ケガの予防をしたい</li>
          <li>疲労回復を早めたい</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 比較テーブル -->
  <div class="sz-section">
    <p class="sz-section-title">COMPARISON</p>
    <h2 class="sz-section-heading">整体・マッサージとの違い</h2>
    <table class="sz-compare-table">
      <thead>
        <tr>
          <th></th>
          <th>ストレッチ</th>
          <th>整体</th>
          <th>マッサージ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>アプローチ</td>
          <td>筋肉を伸ばして柔軟性を回復</td>
          <td>骨格の歪みを矯正</td>
          <td>筋肉を揉みほぐす</td>
        </tr>
        <tr>
          <td>効果の持続性</td>
          <td>根本改善で長期間持続</td>
          <td>中程度</td>
          <td>一時的</td>
        </tr>
        <tr>
          <td>再発予防</td>
          <td>セルフストレッチ指導あり</td>
          <td>△</td>
          <td>×</td>
        </tr>
        <tr>
          <td>施術者の資格</td>
          <td>国家資格保有者が施術</td>
          <td>資格不要の場合あり</td>
          <td>資格不要の場合あり</td>
        </tr>
      </tbody>
    </table>
    <p class="sz-lead" style="margin-top: 16px;">
      ${store.area}で整体やマッサージをお探しの方にこそ、一度<strong>ストレッチの効果</strong>を体感していただきたいと考えています。
    </p>
  </div>

  <!-- 料金プラン -->
  <div class="sz-section">
    <p class="sz-section-title">PLAN</p>
    <h2 class="sz-section-heading">料金プラン</h2>
    <table class="sz-price-table">
      <thead>
        <tr>
          <th>コース</th>
          <th>時間</th>
          <th>料金（税込）</th>
        </tr>
      </thead>
      <tbody>
        <tr class="sz-price-highlight">
          <td><strong>初回体験</strong></td>
          <td>60分</td>
          <td>お問い合わせください</td>
        </tr>
        <tr>
          <td>ベーシック</td>
          <td>40分</td>
          <td>お問い合わせください</td>
        </tr>
        <tr>
          <td>スタンダード</td>
          <td>60分</td>
          <td>お問い合わせください</td>
        </tr>
        <tr>
          <td>プレミアム</td>
          <td>80分</td>
          <td>お問い合わせください</td>
        </tr>
      </tbody>
    </table>
    <p style="font-size: 13px; color: #999;">※ 料金の詳細はお問い合わせください。初めての方は初回体験コースがおすすめです。</p>
  </div>

  <!-- アクセス情報 -->
  <div class="sz-section">
    <p class="sz-section-title">ACCESS</p>
    <h2 class="sz-section-heading">店舗情報・アクセス</h2>
    <div class="sz-access-grid">
      <div class="sz-access-info">
        <table>
          <tr><td>店舗名</td><td>${store.storeName}</td></tr>
          <tr><td>住所</td><td>${store.address}</td></tr>
          ${store.phone ? `<tr><td>電話番号</td><td><a href="tel:${store.phone.replace(/-/g, '')}" style="color: #F8742D; text-decoration: none; font-weight: 700;">${store.phone}</a></td></tr>` : ''}
          <tr><td>アクセス</td><td>${store.access}</td></tr>
          <tr><td>営業時間</td><td>9:00〜22:00（完全予約制）</td></tr>
          <tr><td>定休日</td><td>不定休</td></tr>
        </table>
      </div>
      <div class="sz-access-map">
        ${store.mapIframe || '<div style="text-align:center; color: #999; padding: 40px;">Google Maps</div>'}
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div class="sz-cta">
    <h2>まずは初回体験から</h2>
    <p>ご予約は電話またはWebからお気軽にどうぞ。<br>初めての方は初回体験コースがおすすめです。</p>
    <div class="sz-cta-buttons">
      <a href="/contact/" class="sz-btn-primary">Web予約・お問い合わせ →</a>
      ${store.phone ? `<a href="tel:${store.phone.replace(/-/g, '')}" class="sz-btn-secondary">☎ ${store.phone}</a>` : ''}
    </div>
  </div>

  <!-- 関連コンテンツ -->
  <div class="sz-related">
    <p class="sz-section-title">COLUMN</p>
    <h2 class="sz-section-heading">お悩み別のご案内</h2>
    <div class="sz-related-grid">
      <a href="/column/katakori-kofu-stretch/" class="sz-related-card">肩こりでお悩みの方</a>
      <a href="/column/yotsu-kofu-stretch/" class="sz-related-card">腰痛でお悩みの方</a>
      <a href="/column/nekoze-stretch-yamanashi/" class="sz-related-card">猫背を改善したい方</a>
      <a href="/column/shisei-kaizen-kofu/" class="sz-related-card">姿勢を改善したい方</a>
      <a href="/column/stretch-kouka-yamanashi/" class="sz-related-card">ストレッチの効果を知りたい方</a>
      <a href="/column/kofu-stretch-hikaku/" class="sz-related-card">整体・マッサージとの違い</a>
    </div>
  </div>

  <!-- 他店舗リンク -->
  <div class="sz-section" style="text-align: center; padding: 24px 0; border-top: 1px solid #eee;">
    <p style="font-size: 13px; color: #999; margin-bottom: 12px;">その他の店舗</p>
    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
      ${store.otherStores.map(s => `<a href="${s.url}" style="color: #F8742D; font-size: 14px; text-decoration: none; font-weight: 600;">${s.name}</a>`).join(' | ')}
    </div>
  </div>

</div>

<!-- 構造化データ -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${store.storeName}",
  "description": "${store.area}のストレッチ専門店。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "${store.address}",
    "addressLocality": "${store.area}",
    "addressRegion": "山梨県",
    "addressCountry": "JP"
  },
  ${store.phone ? `"telephone": "${store.phone}",` : ''}
  "url": "https://stretchzero.jp${store.url}",
  "openingHours": "Mo-Su 09:00-22:00",
  "priceRange": "¥¥",
  "image": "${store.image}",
  "sameAs": []
}
</script>
`;
}

// ============================================
// 店舗データ
// ============================================

const STORES = [
  {
    pageId: 3056,
    storeName: 'ストレッチゼロ 甲府上石田店',
    area: '甲府',
    areaLabel: '甲府',
    url: '/shop/shop-kofu/',
    image: 'https://stretchzero.jp/wp-content/uploads/2025/02/183886-1024x768.jpg',
    address: '〒400-0041 山梨県甲府市上石田3-7-7',
    phone: '055-288-9827',
    access: '甲府昭和ICから車約5分、アルプス通り沿い',
    catchcopy: '理学療法士在籍 ── 肩こり・腰痛・姿勢改善にプロのストレッチを',
    uniquePoint: '唯一の<strong>ストレッチ専門店</strong>です',
    mapIframe: '<iframe src="https://www.google.com/maps?q=山梨県甲府市上石田3-7-7&output=embed" allowfullscreen loading="lazy"></iframe>',
    otherStores: [
      { name: '南アルプス店', url: '/shop/shop-minami-alps/' },
      { name: '韮崎店', url: '/shop/shop-nirasaki/' },
      { name: '甲斐響が丘店', url: '/shop/shop-kai-hibikigaoka/' },
    ],
  },
  {
    pageId: 3057,
    storeName: 'ストレッチゼロ 南アルプス店',
    area: '南アルプス',
    areaLabel: '南アルプス市',
    url: '/shop/shop-minami-alps/',
    image: 'https://stretchzero.jp/wp-content/uploads/2025/05/南アルプス店-案内画像-1024x768.jpg',
    address: '〒400-0306 山梨県南アルプス市小笠原1281-8',
    phone: '055-284-1824',
    access: '南アルプス市小笠原エリア、市役所近く',
    catchcopy: '南アルプス市唯一のストレッチ専門店で、身体の不調を根本から改善',
    uniquePoint: '<strong>唯一のストレッチ専門店</strong>です',
    mapIframe: '<iframe src="https://www.google.com/maps?q=山梨県南アルプス市小笠原1281-8&output=embed" allowfullscreen loading="lazy"></iframe>',
    otherStores: [
      { name: '甲府上石田店', url: '/shop/shop-kofu/' },
      { name: '韮崎店', url: '/shop/shop-nirasaki/' },
      { name: '甲斐響が丘店', url: '/shop/shop-kai-hibikigaoka/' },
    ],
  },
  {
    pageId: 3058,
    storeName: 'ストレッチゼロ 韮崎店',
    area: '韮崎',
    areaLabel: '韮崎',
    url: '/shop/shop-nirasaki/',
    image: 'https://stretchzero.jp/wp-content/uploads/2025/11/250719-001_v2-1024x769.jpg',
    address: '〒407-0015 山梨県韮崎市若宮2-2-43',
    phone: '0551-45-6560',
    access: '韮崎駅から車約5分',
    catchcopy: '韮崎エリア唯一のストレッチ専門店。プロの施術で身体が変わる。',
    uniquePoint: '<strong>唯一のストレッチ専門店</strong>です',
    mapIframe: '<iframe src="https://www.google.com/maps?q=山梨県韮崎市若宮2-2-43&output=embed" allowfullscreen loading="lazy"></iframe>',
    otherStores: [
      { name: '甲府上石田店', url: '/shop/shop-kofu/' },
      { name: '南アルプス店', url: '/shop/shop-minami-alps/' },
      { name: '甲斐響が丘店', url: '/shop/shop-kai-hibikigaoka/' },
    ],
  },
  {
    pageId: 3059,
    storeName: 'ストレッチゼロ 甲斐響が丘店',
    area: '甲斐',
    areaLabel: '甲斐市',
    url: '/shop/shop-kai-hibikigaoka/',
    image: 'https://stretchzero.jp/wp-content/uploads/2026/02/image-1-1024x769.png',
    address: '〒400-0118 山梨県甲斐市竜王新町1981-10',
    phone: '',
    access: '響が丘エリア',
    catchcopy: '甲斐市のストレッチ専門店。理学療法士がパーソナルストレッチを提供。',
    uniquePoint: 'エリアの<strong>ストレッチ専門店</strong>です',
    mapIframe: '<iframe src="https://www.google.com/maps?q=山梨県甲斐市竜王新町1981-10&output=embed" allowfullscreen loading="lazy"></iframe>',
    otherStores: [
      { name: '甲府上石田店', url: '/shop/shop-kofu/' },
      { name: '南アルプス店', url: '/shop/shop-minami-alps/' },
      { name: '韮崎店', url: '/shop/shop-nirasaki/' },
    ],
  },
];

// ============================================
// メイン実行
// ============================================

async function main() {
  await login();

  console.log('\n=== 店舗ページ リデザイン更新 ===\n');

  for (const store of STORES) {
    console.log(`更新中: ${store.storeName} (ID: ${store.pageId})`);
    const content = generateStorePage(store);

    const result = await wpApi('PUT', `/wp/v2/pages/${store.pageId}`, {
      content: content,
    });

    if (result) {
      console.log(`  ✓ 更新成功: ${result.link}`);
    } else {
      console.log(`  ✗ 更新失敗`);
    }
  }

  console.log('\n========================================');
  console.log('全4店舗ページ リデザイン完了');
  console.log('========================================');
}

main().catch(console.error);
