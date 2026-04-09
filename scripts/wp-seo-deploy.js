/**
 * ストレッチゼロ SEOページ一括投入スクリプト
 * WordPress REST API (Cookie認証) 経由で店舗別・症状別ページを作成
 */

const https = require('https');
const http = require('http');
const querystring = require('querystring');

const WP_BASE = 'https://stretchzero.jp';
const WP_LOGIN_URL = 'https://stretchzero.jp/wp-login.php';
const WP_USER = 'Stretchlabo';
const WP_PASS = 'Stretchlabo0501';

let cookies = '';
let nonce = '';

// --- HTTP helpers ---

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (VONDS SEO Deploy)',
        ...(options.headers || {}),
      },
    };
    if (cookies) {
      reqOptions.headers['Cookie'] = cookies;
    }

    const req = lib.request(reqOptions, (res) => {
      // Capture set-cookie
      if (res.headers['set-cookie']) {
        const newCookies = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        cookies = cookies ? cookies + '; ' + newCookies : newCookies;
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function wpLogin() {
  console.log('=== WordPress ログイン ===');
  const postData = querystring.stringify({
    log: WP_USER,
    pwd: WP_PASS,
    'wp-submit': 'Log In',
    redirect_to: WP_BASE + '/wp-admin/',
    testcookie: 1,
  });

  const res = await request(WP_LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': 'wordpress_test_cookie=WP+Cookie+check',
    },
    body: postData,
  });

  if (res.status === 302 && cookies.includes('wordpress_logged_in')) {
    console.log('ログイン成功');
    return true;
  }
  console.log('ログイン結果:', res.status);
  console.log('Cookies:', cookies.substring(0, 200));
  return cookies.includes('wordpress_logged_in');
}

async function getNonce() {
  console.log('=== Nonce取得 ===');
  const res = await request(WP_BASE + '/wp-admin/admin-ajax.php?action=rest-nonce');
  if (res.status === 200 && res.body.length < 30) {
    nonce = res.body.trim();
    console.log('Nonce取得成功:', nonce);
    return true;
  }
  // Fallback: parse from admin page
  const adminRes = await request(WP_BASE + '/wp-admin/');
  const match = adminRes.body.match(/wpApiSettings.*?"nonce":"([^"]+)"/);
  if (match) {
    nonce = match[1];
    console.log('Nonce取得成功(fallback):', nonce);
    return true;
  }
  console.log('Nonce取得失敗');
  return false;
}

async function wpApiPost(endpoint, data) {
  const jsonBody = JSON.stringify(data);
  const res = await request(WP_BASE + '/wp-json' + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    },
    body: jsonBody,
  });
  if (res.status === 201 || res.status === 200) {
    const parsed = JSON.parse(res.body);
    return parsed;
  }
  console.error(`API Error [${res.status}]:`, res.body.substring(0, 500));
  return null;
}

async function wpApiPut(endpoint, data) {
  const jsonBody = JSON.stringify(data);
  const res = await request(WP_BASE + '/wp-json' + endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    },
    body: jsonBody,
  });
  if (res.status === 200) {
    return JSON.parse(res.body);
  }
  console.error(`API PUT Error [${res.status}]:`, res.body.substring(0, 500));
  return null;
}

async function wpApiDelete(endpoint) {
  const res = await request(WP_BASE + '/wp-json' + endpoint, {
    method: 'DELETE',
    headers: {
      'X-WP-Nonce': nonce,
    },
  });
  if (res.status === 200) {
    return JSON.parse(res.body);
  }
  console.error(`API DELETE Error [${res.status}]:`, res.body.substring(0, 500));
  return null;
}

// --- SEOコンテンツ定義 ---

const STORE_PAGES = [
  {
    slug: 'shop-kofu',
    title: '甲府のストレッチ専門店｜ストレッチゼロ 甲府上石田店',
    meta_description: '甲府でストレッチ・整体・マッサージをお探しなら、山梨県初のストレッチ専門店「ストレッチゼロ甲府上石田店」。理学療法士在籍、肩こり・腰痛・姿勢改善に対応。甲府昭和ICから車5分。',
    content: generateStoreContent({
      storeName: 'ストレッチゼロ 甲府上石田店',
      area: '甲府',
      prefecture: '山梨',
      address: '〒400-0041 山梨県甲府市上石田3-7-7',
      phone: '055-288-9827',
      mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3245.!2d138.558!3d35.651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z44K544OI44Os44OD44OB44K844Ot55Sy5bqc5LiK55Oz55Sw5bqX!5e0!3m2!1sja!2sjp!4v1',
      access: '甲府昭和ICから車約5分、アルプス通り沿い',
      features: [
        '理学療法士・柔道整復師が多数在籍',
        '完全個室でプライベート空間を確保',
        '肩こり・腰痛・猫背・姿勢改善に幅広く対応',
        'マッサージや整体では改善しなかった症状にも対応',
        '初回体験コースあり（60分）',
      ],
      keywords: ['甲府 ストレッチ', '甲府 整体', '甲府 マッサージ', '甲府 肩こり', '甲府 腰痛', '甲府 姿勢改善'],
    }),
  },
  {
    slug: 'shop-minami-alps',
    title: '南アルプスのストレッチ専門店｜ストレッチゼロ 南アルプス店',
    meta_description: '南アルプス市でストレッチ・整体・マッサージをお探しなら「ストレッチゼロ南アルプス店」。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。南アルプス市小笠原エリア。',
    content: generateStoreContent({
      storeName: 'ストレッチゼロ 南アルプス店',
      area: '南アルプス',
      prefecture: '山梨',
      address: '〒400-0306 山梨県南アルプス市小笠原1281-8',
      phone: '055-284-1824',
      mapEmbed: '',
      access: '小笠原エリア、南アルプス市役所近く',
      features: [
        '理学療法士・柔道整復師が多数在籍',
        '南アルプス市唯一のストレッチ専門店',
        '肩こり・腰痛・猫背・姿勢改善に幅広く対応',
        'マッサージや整体では改善しなかった症状にも対応',
        '初回体験コースあり（60分）',
      ],
      keywords: ['南アルプス ストレッチ', '南アルプス 整体', '南アルプス マッサージ', '南アルプス 肩こり'],
    }),
  },
  {
    slug: 'shop-nirasaki',
    title: '韮崎のストレッチ専門店｜ストレッチゼロ 韮崎店',
    meta_description: '韮崎市でストレッチ・整体・マッサージをお探しなら「ストレッチゼロ韮崎店」。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。韮崎駅から車5分。',
    content: generateStoreContent({
      storeName: 'ストレッチゼロ 韮崎店',
      area: '韮崎',
      prefecture: '山梨',
      address: '〒407-0015 山梨県韮崎市若宮2-2-43',
      phone: '0551-45-6560',
      mapEmbed: '',
      access: '韮崎駅から車約5分',
      features: [
        '理学療法士・柔道整復師が多数在籍',
        '韮崎エリア唯一のストレッチ専門店',
        '肩こり・腰痛・猫背・姿勢改善に幅広く対応',
        'マッサージや整体では改善しなかった症状にも対応',
        '初回体験コースあり（60分）',
      ],
      keywords: ['韮崎 ストレッチ', '韮崎 整体', '韮崎 マッサージ', '韮崎 肩こり'],
    }),
  },
  {
    slug: 'shop-kai-hibikigaoka',
    title: '甲斐市のストレッチ専門店｜ストレッチゼロ 甲斐響が丘店',
    meta_description: '甲斐市でストレッチ・整体・マッサージをお探しなら「ストレッチゼロ甲斐響が丘店」。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。響が丘エリア。',
    content: generateStoreContent({
      storeName: 'ストレッチゼロ 甲斐響が丘店',
      area: '甲斐',
      prefecture: '山梨',
      address: '〒400-0118 山梨県甲斐市竜王新町1981-10',
      phone: '',
      mapEmbed: '',
      access: '響が丘エリア',
      features: [
        '理学療法士・柔道整復師が多数在籍',
        '甲斐市エリアのストレッチ専門店',
        '肩こり・腰痛・猫背・姿勢改善に幅広く対応',
        'マッサージや整体では改善しなかった症状にも対応',
        '初回体験コースあり（60分）',
      ],
      keywords: ['甲斐 ストレッチ', '甲斐市 整体', '甲斐市 マッサージ'],
    }),
  },
];

function generateStoreContent(store) {
  const featuresList = store.features.map(f => `<li>${f}</li>`).join('\n');
  const keywordsMeta = store.keywords.join('、');

  return `
<!-- wp:heading {"level":1} -->
<h1>${store.area}のストレッチ専門店｜${store.storeName}</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><strong>${store.area}で肩こり・腰痛・姿勢の悩みを根本から改善したい方へ。</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>${store.storeName}は、${store.prefecture}県${store.area}エリアで唯一の<strong>ストレッチ専門店</strong>です。「マッサージに通っても改善しない」「整体を受けても戻ってしまう」——そんなお悩みに、プロのパーソナルストレッチで根本からアプローチします。</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>${store.area}で「ストレッチ専門店」が選ばれる理由</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>整体やマッサージは「押す・揉む」ことで筋肉をほぐしますが、効果は一時的になりがちです。ストレッチゼロでは、<strong>理学療法士や柔道整復師の国家資格保有者</strong>が、一人ひとりの身体の状態を評価し、科学的根拠に基づいたパーソナルストレッチを提供します。</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>${store.storeName}の特徴</h3>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
${featuresList}
</ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>こんなお悩みに対応しています</h2>
<!-- /wp:heading -->

<!-- wp:columns -->
<div class="wp-block-columns">

<!-- wp:column -->
<div class="wp-block-column">
<h3>痛み・コリの改善</h3>
<ul>
<li><strong>肩こり</strong>が慢性化している</li>
<li><strong>腰痛</strong>で長時間座れない</li>
<li>首や背中が常に張っている</li>
<li>頭痛がひどい</li>
</ul>
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<h3>姿勢・体型の改善</h3>
<ul>
<li><strong>猫背</strong>が気になる</li>
<li><strong>姿勢</strong>が悪いと言われる</li>
<li>反り腰を改善したい</li>
<li>O脚・X脚が気になる</li>
</ul>
</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column">
<h3>パフォーマンス向上</h3>
<ul>
<li>スポーツの<strong>パフォーマンス</strong>を上げたい</li>
<li>身体の柔軟性を高めたい</li>
<li>ケガの予防・リハビリをしたい</li>
<li>疲労回復を早めたい</li>
</ul>
</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

<!-- wp:heading -->
<h2>整体・マッサージとストレッチの違い</h2>
<!-- /wp:heading -->

<!-- wp:table -->
<figure class="wp-block-table">
<table>
<thead>
<tr><th></th><th>ストレッチ</th><th>整体</th><th>マッサージ</th></tr>
</thead>
<tbody>
<tr><td>アプローチ</td><td><strong>筋肉を伸ばして柔軟性を回復</strong></td><td>骨格の歪みを矯正</td><td>筋肉を揉みほぐす</td></tr>
<tr><td>効果の持続性</td><td><strong>根本改善で長期間持続</strong></td><td>中程度</td><td>一時的</td></tr>
<tr><td>再発予防</td><td><strong>セルフストレッチ指導あり</strong></td><td>△</td><td>×</td></tr>
<tr><td>安全性</td><td><strong>国家資格保有者が施術</strong></td><td>資格不要の場合あり</td><td>資格不要の場合あり</td></tr>
</tbody>
</table>
</figure>
<!-- /wp:table -->

<!-- wp:paragraph -->
<p>${store.area}で整体やマッサージをお探しの方にこそ、一度ストレッチの効果を体感していただきたいと考えています。</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>料金プラン</h2>
<!-- /wp:heading -->

<!-- wp:table -->
<figure class="wp-block-table">
<table>
<thead>
<tr><th>コース</th><th>時間</th><th>料金（税込）</th></tr>
</thead>
<tbody>
<tr><td><strong>初回体験</strong></td><td>60分</td><td>お問い合わせください</td></tr>
<tr><td>ベーシック</td><td>40分</td><td>お問い合わせください</td></tr>
<tr><td>スタンダード</td><td>60分</td><td>お問い合わせください</td></tr>
<tr><td>プレミアム</td><td>80分</td><td>お問い合わせください</td></tr>
</tbody>
</table>
</figure>
<!-- /wp:table -->

<!-- wp:heading -->
<h2>店舗情報・アクセス</h2>
<!-- /wp:heading -->

<!-- wp:table -->
<figure class="wp-block-table">
<table>
<tbody>
<tr><td><strong>店舗名</strong></td><td>${store.storeName}</td></tr>
<tr><td><strong>住所</strong></td><td>${store.address}</td></tr>
${store.phone ? `<tr><td><strong>電話番号</strong></td><td><a href="tel:${store.phone.replace(/-/g, '')}">${store.phone}</a></td></tr>` : ''}
<tr><td><strong>アクセス</strong></td><td>${store.access}</td></tr>
<tr><td><strong>営業時間</strong></td><td>10:00〜21:00（最終受付20:00）</td></tr>
<tr><td><strong>定休日</strong></td><td>不定休</td></tr>
</tbody>
</table>
</figure>
<!-- /wp:table -->

<!-- wp:heading -->
<h2>ご予約・お問い合わせ</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>ご予約は電話またはWebからお気軽にどうぞ。初めての方は<strong>初回体験コース</strong>がおすすめです。</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons">
<!-- wp:button {"className":"is-style-fill"} -->
<div class="wp-block-button is-style-fill"><a class="wp-block-button__link" href="/contact/">Web予約・お問い合わせ</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->

<!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">関連キーワード: ${keywordsMeta}</p>
<!-- /wp:paragraph -->

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
  "url": "https://stretchzero.jp/${store.slug}/",
  "openingHours": "Mo-Su 10:00-21:00",
  "priceRange": "¥¥",
  "image": "https://stretchzero.jp/wp-content/uploads/logo.png",
  "sameAs": []
}
</script>
`;
}

// --- 症状別コンテンツ ---

const SYMPTOM_POSTS = [
  {
    slug: 'nekoze-stretch-yamanashi',
    title: '猫背はストレッチで改善できる？山梨のプロが解説｜ストレッチゼロ',
    meta_description: '猫背矯正にはストレッチが効果的。山梨県のストレッチ専門店「ストレッチゼロ」が、猫背の原因・改善方法・セルフストレッチを解説。甲府・南アルプス・韮崎で対応。',
    content: `
<!-- wp:heading {"level":1} -->
<h1>猫背はストレッチで改善できる？山梨のプロが解説</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>「猫背を治したいけど、どこに行けばいいかわからない」「山梨で猫背矯正ができる場所を探している」——そんな方に向けて、<strong>山梨県初のストレッチ専門店「ストレッチゼロ」</strong>のプロトレーナーが、猫背の原因と改善方法を解説します。</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>猫背の原因は「筋肉の硬さ」にある</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>猫背の主な原因は、<strong>胸の前側の筋肉（大胸筋・小胸筋）が硬くなり、背中側の筋肉（僧帽筋・菱形筋）が弱くなる</strong>というアンバランスです。デスクワークやスマートフォンの長時間使用で、この姿勢が固定化されていきます。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>整体で骨格を矯正しても、筋肉の硬さが残っていれば、すぐに元の猫背に戻ってしまいます。<strong>猫背を根本から改善するには、硬くなった筋肉をストレッチで伸ばし、正しい姿勢を維持できる柔軟性を取り戻す</strong>ことが重要です。</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>整体・マッサージとストレッチの違い</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>山梨県内には整体院やマッサージ店が多数ありますが、猫背改善へのアプローチはそれぞれ異なります。</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
<li><strong>整体</strong>：骨格の歪みを矯正。一時的な改善は見込めるが、筋肉の硬さが残れば再発しやすい</li>
<li><strong>マッサージ</strong>：筋肉をほぐして血行改善。リラクゼーション効果は高いが、猫背の根本原因にはアプローチしにくい</li>
<li><strong>ストレッチ</strong>：硬くなった筋肉を伸ばし、関節の可動域を広げる。<strong>猫背の根本原因である筋バランスの崩れに直接アプローチ</strong>できる</li>
</ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>自宅でできる猫背改善セルフストレッチ3選</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>1. 胸開きストレッチ（大胸筋）</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>壁に手をつき、体を反対側にゆっくり回転させます。胸の前側が伸びるのを感じながら、30秒×左右2セット行いましょう。</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>2. 背中丸め→反らしストレッチ（脊柱）</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>四つん這いの姿勢から、息を吐きながら背中を丸め、息を吸いながら反らします。10回×2セットが目安です。</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>3. 肩甲骨寄せストレッチ（菱形筋）</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>両手を後ろで組み、肩甲骨を寄せながら胸を張ります。15秒×3セット行いましょう。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>セルフストレッチで改善が難しい場合は、プロによるパーソナルストレッチがおすすめです。一人では伸ばしにくい深部の筋肉まで、しっかりアプローチできます。</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>山梨で猫背矯正ならストレッチゼロ</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>ストレッチゼロは<strong>山梨県内に4店舗</strong>（甲府上石田・甲斐響が丘・南アルプス・韮崎）を展開するストレッチ専門店です。理学療法士や柔道整復師の国家資格保有者が、あなたの猫背の原因を見極め、最適なストレッチプログラムをご提案します。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>「マッサージに通っても猫背が治らない」「整体を受けても元に戻る」</strong>——そんな方こそ、一度ストレッチの効果を体感してください。</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons">
<!-- wp:button {"className":"is-style-fill"} -->
<div class="wp-block-button is-style-fill"><a class="wp-block-button__link" href="/contact/">無料カウンセリング予約はこちら</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->
`,
  },
  {
    slug: 'shisei-kaizen-kofu',
    title: '甲府で姿勢改善するなら？ストレッチ専門店が教える正しいアプローチ',
    meta_description: '甲府で姿勢改善をお考えの方へ。ストレッチゼロが姿勢の崩れの原因と改善方法を解説。整体・マッサージとの違い、効果的なストレッチ方法をプロが紹介。',
    content: `
<!-- wp:heading {"level":1} -->
<h1>甲府で姿勢改善するなら？ストレッチ専門店が教える正しいアプローチ</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>「姿勢が悪い」と人から指摘されたことはありませんか？ 甲府市内で姿勢改善に取り組みたい方に、<strong>山梨県初のストレッチ専門店「ストレッチゼロ」</strong>が、姿勢の崩れの原因と正しい改善アプローチをお伝えします。</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>なぜ姿勢は崩れるのか？</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>姿勢の崩れは、単なる「意識の問題」ではありません。長時間のデスクワーク、スマートフォンの使用、運動不足によって、<strong>特定の筋肉が硬くなり（短縮）、反対側の筋肉が弱くなる（伸長）</strong>ことで、身体のバランスが崩れていきます。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>代表的な姿勢の崩れには以下のパターンがあります：</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
<li><strong>猫背（円背）</strong>：胸椎が過度に丸まった状態。肩こり・頭痛の原因に</li>
<li><strong>反り腰</strong>：腰椎が過度に反った状態。腰痛の主要原因</li>
<li><strong>ストレートネック</strong>：首の自然なカーブが失われた状態。首・肩の痛みの原因</li>
<li><strong>骨盤の前傾/後傾</strong>：下半身全体のバランスが崩れ、膝痛や腰痛を引き起こす</li>
</ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>姿勢改善に「ストレッチ」が効果的な理由</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>姿勢改善には、<strong>硬くなった筋肉を伸ばして元の長さに戻す</strong>ことが不可欠です。整体で骨格を矯正しても、筋肉の硬さが原因であれば根本解決にはなりません。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>ストレッチゼロでは、理学療法士の知見を活かした<strong>パーソナルストレッチ</strong>で、一人ひとりの姿勢パターンを分析し、硬くなっている筋肉を特定。科学的根拠に基づいたストレッチプログラムで、根本から姿勢を改善します。</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>ストレッチゼロの姿勢改善プログラム</h2>
<!-- /wp:heading -->

<!-- wp:list {"ordered":true} -->
<ol>
<li><strong>姿勢評価</strong>：立位・座位での姿勢を多角的に評価し、崩れのパターンを特定</li>
<li><strong>原因筋の特定</strong>：どの筋肉が硬くなっているか、どの筋肉が弱くなっているかを判別</li>
<li><strong>パーソナルストレッチ</strong>：プロのトレーナーが1対1で、硬くなった筋肉を丁寧にストレッチ</li>
<li><strong>セルフケア指導</strong>：自宅でできるストレッチを指導し、効果の持続をサポート</li>
</ol>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>甲府で姿勢改善できる施設の比較</h2>
<!-- /wp:heading -->

<!-- wp:table -->
<figure class="wp-block-table">
<table>
<thead>
<tr><th></th><th>ストレッチゼロ</th><th>整体院</th><th>マッサージ店</th><th>ジム</th></tr>
</thead>
<tbody>
<tr><td>姿勢評価</td><td><strong>◎ 専門的</strong></td><td>○</td><td>×</td><td>△</td></tr>
<tr><td>筋肉へのアプローチ</td><td><strong>◎ 直接的</strong></td><td>△ 間接的</td><td>○ 表層のみ</td><td>○ 筋トレ中心</td></tr>
<tr><td>国家資格者</td><td><strong>◎ 理学療法士在籍</strong></td><td>△ 店舗による</td><td>△ 店舗による</td><td>× 不在が多い</td></tr>
<tr><td>セルフケア指導</td><td><strong>◎ 毎回実施</strong></td><td>△</td><td>×</td><td>○</td></tr>
<tr><td>効果の持続性</td><td><strong>◎ 長期的</strong></td><td>○ 中程度</td><td>△ 一時的</td><td>○</td></tr>
</tbody>
</table>
</figure>
<!-- /wp:table -->

<!-- wp:heading -->
<h2>甲府・山梨エリアの店舗</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>ストレッチゼロは山梨県内に<strong>4店舗</strong>展開。甲府にお住まいの方は<strong>甲府上石田店</strong>または<strong>甲斐響が丘店</strong>が便利です。</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
<li><a href="/shop-kofu/">甲府上石田店</a>：甲府昭和ICから車約5分</li>
<li><a href="/shop-kai-hibikigaoka/">甲斐響が丘店</a>：響が丘エリア</li>
<li><a href="/shop-minami-alps/">南アルプス店</a>：南アルプス市小笠原エリア</li>
<li><a href="/shop-nirasaki/">韮崎店</a>：韮崎駅から車約5分</li>
</ul>
<!-- /wp:list -->

<!-- wp:buttons -->
<div class="wp-block-buttons">
<!-- wp:button {"className":"is-style-fill"} -->
<div class="wp-block-button is-style-fill"><a class="wp-block-button__link" href="/contact/">姿勢改善の相談・予約はこちら</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->
`,
  },
  {
    slug: 'katakori-kofu-stretch',
    title: '甲府で肩こりにお悩みの方へ｜ストレッチで根本改善する方法',
    meta_description: '甲府で肩こりの改善をお考えの方へ。マッサージや整体で改善しない肩こりには、ストレッチが効果的。ストレッチゼロが肩こりの原因と改善法を解説。',
    content: `
<!-- wp:heading {"level":1} -->
<h1>甲府で肩こりにお悩みの方へ｜ストレッチで根本改善する方法</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>「毎週マッサージに通っているのに肩こりが治らない」「整体を受けても数日で元に戻る」——甲府市内でそんなお悩みを抱えている方は少なくありません。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>実は、<strong>慢性的な肩こりの根本原因は「筋肉の柔軟性の低下」</strong>にあります。マッサージで一時的にほぐしても、筋肉の柔軟性が回復しなければ、すぐに元の硬さに戻ってしまうのです。</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>肩こりの本当の原因</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>肩こりは「肩」だけの問題ではありません。以下の筋肉の硬さ・アンバランスが複合的に作用しています：</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
<li><strong>僧帽筋（上部）</strong>：デスクワークで常に緊張し、硬くなりやすい</li>
<li><strong>胸鎖乳突筋</strong>：スマホの使いすぎで短縮し、頭を前方に引っ張る</li>
<li><strong>大胸筋・小胸筋</strong>：猫背姿勢で硬くなり、肩が前に巻く原因に</li>
<li><strong>肩甲挙筋</strong>：ストレスや寒さで緊張し、肩の「張り感」を生む</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>これらの筋肉を<strong>適切にストレッチして柔軟性を取り戻す</strong>ことが、肩こりの根本改善への近道です。</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>なぜマッサージだけでは肩こりが治らないのか？</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>マッサージは筋肉を「揉む・押す」ことで血行を促進し、一時的な緩和効果があります。しかし、<strong>筋肉の長さ（柔軟性）自体は変わらない</strong>ため、日常生活で再び硬くなってしまいます。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>一方、ストレッチは<strong>筋肉を「伸ばす」ことで柔軟性そのものを改善</strong>します。継続的なストレッチにより、筋肉が硬くなりにくい状態を作ることができます。</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>自宅でできる肩こり改善ストレッチ</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>1. 僧帽筋ストレッチ</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>右手で左側頭部を持ち、ゆっくり右に倒します。首の左側が伸びるのを感じながら30秒キープ。反対側も同様に行います。</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>2. 大胸筋ストレッチ</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>ドアの枠に前腕をつき、一歩前に踏み出します。胸の前側が伸びるのを感じながら30秒キープ。</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>3. 肩甲骨まわしストレッチ</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>両肩を大きく前回し10回、後ろ回し10回。肩甲骨が動くのを意識しましょう。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>セルフストレッチで改善が見られない場合は、<strong>プロによるパーソナルストレッチ</strong>がおすすめです。自分では伸ばしにくい深部の筋肉まで、しっかりアプローチできます。</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>甲府で肩こり改善ならストレッチゼロ</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>ストレッチゼロは、山梨県初のストレッチ専門店。<strong>理学療法士や柔道整復師の国家資格保有者</strong>が、あなたの肩こりの原因を見極め、最適なストレッチプログラムをご提案します。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>甲府市内からのアクセス：</p>
<!-- /wp:paragraph -->
<!-- wp:list -->
<ul>
<li><a href="/shop-kofu/">甲府上石田店</a>：甲府昭和ICから車約5分</li>
<li><a href="/shop-kai-hibikigaoka/">甲斐響が丘店</a>：響が丘エリア</li>
</ul>
<!-- /wp:list -->

<!-- wp:buttons -->
<div class="wp-block-buttons">
<!-- wp:button {"className":"is-style-fill"} -->
<div class="wp-block-button is-style-fill"><a class="wp-block-button__link" href="/contact/">肩こり改善の相談・予約はこちら</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->
`,
  },
];

// --- カテゴリ作成 ---

async function createCategory(name, slug) {
  const res = await wpApiPost('/wp/v2/categories', { name, slug });
  if (res) {
    console.log(`カテゴリ作成成功: ${name} (ID: ${res.id})`);
    return res.id;
  }
  // Already exists - fetch it
  const fetchRes = await request(WP_BASE + `/wp-json/wp/v2/categories?slug=${slug}`, {
    headers: { 'X-WP-Nonce': nonce },
  });
  if (fetchRes.status === 200) {
    const cats = JSON.parse(fetchRes.body);
    if (cats.length > 0) {
      console.log(`カテゴリ既存: ${name} (ID: ${cats[0].id})`);
      return cats[0].id;
    }
  }
  return null;
}

// --- メイン実行 ---

async function main() {
  console.log('========================================');
  console.log('ストレッチゼロ SEOページ一括投入開始');
  console.log('========================================\n');

  // Step 1: Login
  const loggedIn = await wpLogin();
  if (!loggedIn) {
    console.error('ログイン失敗。終了します。');
    process.exit(1);
  }

  // Step 2: Get nonce
  const gotNonce = await getNonce();
  if (!gotNonce) {
    console.error('Nonce取得失敗。終了します。');
    process.exit(1);
  }

  // Step 3: Create store pages (固定ページ)
  console.log('\n=== 店舗別ページ作成 ===');
  const parentPageId = 666; // shop page ID

  for (const page of STORE_PAGES) {
    console.log(`\n作成中: ${page.title}`);
    const result = await wpApiPost('/wp/v2/pages', {
      title: page.title,
      slug: page.slug,
      content: page.content,
      status: 'publish',
      parent: parentPageId,
      meta: {
        _aioseo_title: page.title,
        _aioseo_description: page.meta_description,
      },
    });
    if (result) {
      console.log(`✓ 作成成功: ${result.link} (ID: ${result.id})`);
    } else {
      console.log(`✗ 作成失敗: ${page.slug}`);
    }
  }

  // Step 4: Create symptom categories
  console.log('\n=== カテゴリ作成 ===');
  const symptomCatId = await createCategory('症状別コラム', 'symptom-column');
  const areaCatId = await createCategory('エリア情報', 'area-info');

  // Step 5: Create symptom posts (投稿)
  console.log('\n=== 症状別コンテンツ作成 ===');

  for (const post of SYMPTOM_POSTS) {
    console.log(`\n作成中: ${post.title}`);
    const categories = symptomCatId ? [symptomCatId] : [];
    const result = await wpApiPost('/wp/v2/posts', {
      title: post.title,
      slug: post.slug,
      content: post.content,
      status: 'publish',
      categories,
      meta: {
        _aioseo_title: post.title,
        _aioseo_description: post.meta_description,
      },
    });
    if (result) {
      console.log(`✓ 作成成功: ${result.link} (ID: ${result.id})`);
    } else {
      console.log(`✗ 作成失敗: ${post.slug}`);
    }
  }

  // Step 6: Delete hello-world post
  console.log('\n=== 不要投稿削除 ===');
  const deleteResult = await wpApiDelete('/wp/v2/posts/1?force=true');
  if (deleteResult) {
    console.log('✓ hello-world 投稿を削除しました');
  } else {
    console.log('✗ hello-world 削除失敗（既に削除済みの可能性）');
  }

  console.log('\n========================================');
  console.log('全処理完了');
  console.log('========================================');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
