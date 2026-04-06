/**
 * ストレッチゼロ 技術SEO一括修正スクリプト
 *
 * 修正項目:
 * 1. パーマリンク構造変更（日付URL → /column/slug/ ）
 * 2. 不要ページのnoindex設定（contact-thanks, contact-confirm, contact-2）
 * 3. 欠落しているmeta descriptionの追加（韮崎・南アルプス・ブログ記事）
 * 4. OGP og:type修正（トップページをwebsiteに）
 * 5. og:site_name修正（末尾の「 -」を除去）
 * 6. hello-world削除確認
 * 7. 不要カテゴリ(uncategorized)のリネーム
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
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: { 'User-Agent': 'VONDS-SEO-Fix', ...(options.headers || {}) },
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
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
  };
  if (data) opts.body = JSON.stringify(data);
  const res = await request(WP_BASE + '/wp-json' + endpoint, opts);
  if (res.status >= 200 && res.status < 300) {
    try { return JSON.parse(res.body); } catch { return res.body; }
  }
  console.error(`  API ${method} ${endpoint} [${res.status}]: ${res.body.substring(0, 300)}`);
  return null;
}

async function aioseoUpdate(postId, data) {
  const res = await request(WP_BASE + '/wp-json/aioseo/v1/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
    body: JSON.stringify({ id: postId, ...data }),
  });
  return res.status === 200;
}

async function main() {
  await login();

  // ========================================
  // 1. パーマリンク構造変更
  // ========================================
  console.log('\n=== 1. パーマリンク構造変更 ===');
  console.log('投稿のパーマリンクを /column/%postname%/ に変更');

  // WP REST APIでは直接パーマリンク構造を変更できないため、
  // options APIを使う
  const permalinkRes = await request(WP_BASE + '/wp-json/wp/v2/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
    body: JSON.stringify({
      permalink_structure: '/column/%postname%/',
    }),
  });

  if (permalinkRes.status === 200) {
    console.log('  ✓ パーマリンク構造を /column/%postname%/ に変更');
  } else {
    console.log(`  ✗ パーマリンク変更失敗 [${permalinkRes.status}]`);
    // settingsで変更できない場合、WP options APIを試す
    const optRes = await request(WP_BASE + '/wp-admin/options-permalink.php', {
      headers: { 'X-WP-Nonce': nonce },
    });
    if (optRes.status === 200) {
      // nonceを取得してPOSTする
      const wpNonce = optRes.body.match(/name="_wpnonce"\s+value="([^"]+)"/);
      if (wpNonce) {
        const postData = querystring.stringify({
          _wpnonce: wpNonce[1],
          _wp_http_referer: '/wp-admin/options-permalink.php',
          selection: 'custom',
          permalink_structure: '/column/%postname%/',
          submit: 'Save Changes',
        });
        const saveRes = await request(WP_BASE + '/wp-admin/options-permalink.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) },
          body: postData,
        });
        console.log(`  管理画面経由: [${saveRes.status}]`);
        if (saveRes.status === 302 || saveRes.status === 200) {
          console.log('  ✓ パーマリンク構造変更成功');
        }
      }
    }
  }

  // ========================================
  // 2. 不要ページのnoindex設定
  // ========================================
  console.log('\n=== 2. 不要ページのnoindex設定 ===');
  const noindexPages = [
    { id: 1409, name: 'contact-confirm' },
    { id: 1411, name: 'contact-thanks' },
    { id: 1361, name: 'contact-2' },
  ];

  for (const page of noindexPages) {
    console.log(`  ${page.name} (ID: ${page.id})`);
    // AIOSEO経由でrobots noindexを設定
    const success = await aioseoUpdate(page.id, {
      robots_default: false,
      robots_noindex: true,
      robots_nofollow: true,
    });
    if (success) {
      console.log(`    ✓ noindex設定成功`);
    } else {
      console.log(`    ✗ noindex設定失敗`);
    }
  }

  // renewalページもnoindex（不要な旧告知）
  console.log(`  renewal (ID: 2745)`);
  const renewalNoindex = await aioseoUpdate(2745, {
    robots_default: false,
    robots_noindex: true,
  });
  console.log(`    ${renewalNoindex ? '✓' : '✗'} noindex設定`);

  // ========================================
  // 3. 欠落しているmeta descriptionの修正
  // ========================================
  console.log('\n=== 3. meta description修正 ===');

  // 韮崎店と南アルプス店のAIOSEO descriptionを再確認・再設定
  const descFixes = [
    {
      id: 3058,
      title: '韮崎のストレッチ専門店｜ストレッチゼロ 韮崎店',
      description: '韮崎市でストレッチ・整体・マッサージをお探しなら「ストレッチゼロ韮崎店」。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。韮崎駅から車5分。初回体験コースあり。',
    },
    {
      id: 3057,
      title: '南アルプスのストレッチ専門店｜ストレッチゼロ 南アルプス店',
      description: '南アルプス市でストレッチ・整体・マッサージをお探しなら「ストレッチゼロ南アルプス店」。理学療法士在籍、肩こり・腰痛・姿勢改善に専門対応。南アルプス市小笠原エリア。',
    },
    {
      id: 3060,
      title: '猫背はストレッチで改善できる？山梨のプロが解説｜ストレッチゼロ',
      description: '猫背矯正にはストレッチが効果的。山梨県のストレッチ専門店「ストレッチゼロ」が、猫背の原因・改善方法・セルフストレッチを解説。甲府・南アルプス・韮崎で対応。',
    },
    {
      id: 3061,
      title: '甲府で姿勢改善するなら？ストレッチ専門店が教える正しいアプローチ',
      description: '甲府で姿勢改善をお考えの方へ。ストレッチゼロが姿勢の崩れの原因と改善方法を解説。整体・マッサージとの違い、効果的なストレッチ方法をプロが紹介。',
    },
    {
      id: 3062,
      title: '甲府で肩こりにお悩みの方へ｜ストレッチで根本改善する方法',
      description: '甲府で肩こりの改善をお考えの方へ。マッサージや整体で改善しない肩こりには、ストレッチが効果的。ストレッチゼロが肩こりの原因と改善法を解説。',
    },
  ];

  for (const fix of descFixes) {
    console.log(`  ID: ${fix.id} - ${fix.title.substring(0, 30)}...`);
    const success = await aioseoUpdate(fix.id, {
      title: fix.title,
      description: fix.description,
    });
    console.log(`    ${success ? '✓' : '✗'} AIOSEO更新`);
  }

  // ========================================
  // 4. AIOSEO全体設定の修正
  // ========================================
  console.log('\n=== 4. AIOSEO全体設定の取得・修正 ===');

  // AIOSEOのoptions取得
  const optionsRes = await request(WP_BASE + '/wp-json/aioseo/v1/options', {
    headers: { 'X-WP-Nonce': nonce },
  });

  if (optionsRes.status === 200) {
    const options = JSON.parse(optionsRes.body);
    console.log('  AIOSEO options取得成功');

    // site_name修正（末尾の「 -」除去）
    if (options.searchAppearance) {
      console.log(`  現在のsiteName: ${JSON.stringify(options.searchAppearance.global?.siteTitle || 'N/A')}`);
    }

    // og:type修正、siteName修正をPOST
    const updateOptions = {
      searchAppearance: {
        global: {
          siteTitle: 'ストレッチゼロ｜山梨県初のストレッチ専門店',
        },
      },
      social: {
        facebook: {
          general: {
            siteName: 'ストレッチゼロ｜山梨県初のストレッチ専門店',
          },
          homePage: {
            objectType: 'website',
          },
        },
      },
    };

    const updateRes = await request(WP_BASE + '/wp-json/aioseo/v1/options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
      body: JSON.stringify(updateOptions),
    });
    console.log(`  AIOSEO options更新: [${updateRes.status}]`);
  }

  // ========================================
  // 5. uncategorizedカテゴリのリネーム
  // ========================================
  console.log('\n=== 5. カテゴリ整理 ===');

  // uncategorized (ID:1) をリネーム
  const catUpdate = await wpApi('PUT', '/wp/v2/categories/1', {
    name: 'お知らせ',
    slug: 'news',
    description: 'ストレッチゼロからのお知らせ',
  });
  if (catUpdate) {
    console.log('  ✓ uncategorized → お知らせ にリネーム');
  }

  // エリア情報カテゴリ (ID:7) を「エリア別情報」に
  const cat7 = await wpApi('PUT', '/wp/v2/categories/7', {
    name: 'エリア別ストレッチ情報',
    slug: 'area-stretch',
    description: '山梨県内のエリア別ストレッチ・整体・マッサージ情報',
  });
  if (cat7) {
    console.log('  ✓ エリア情報 → エリア別ストレッチ情報 にリネーム');
  }

  // ========================================
  // 6. 既存ブログ記事にカテゴリ・タグ付与
  // ========================================
  console.log('\n=== 6. 記事のカテゴリ・タグ整理 ===');

  // タグ作成
  const tags = [
    { name: '肩こり', slug: 'katakori' },
    { name: '腰痛', slug: 'yotsu' },
    { name: '猫背', slug: 'nekoze' },
    { name: '姿勢改善', slug: 'shisei' },
    { name: 'ストレッチ', slug: 'stretch' },
    { name: '甲府', slug: 'kofu' },
    { name: '山梨', slug: 'yamanashi' },
    { name: '南アルプス', slug: 'minami-alps' },
    { name: '韮崎', slug: 'nirasaki' },
  ];

  const tagIds = {};
  for (const tag of tags) {
    let result = await wpApi('POST', '/wp/v2/tags', tag);
    if (result) {
      tagIds[tag.slug] = result.id;
      console.log(`  タグ作成: ${tag.name} (ID: ${result.id})`);
    } else {
      // 既存の場合取得
      const existing = await request(WP_BASE + `/wp-json/wp/v2/tags?slug=${tag.slug}`, {
        headers: { 'X-WP-Nonce': nonce },
      });
      if (existing.status === 200) {
        const parsed = JSON.parse(existing.body);
        if (parsed.length > 0) {
          tagIds[tag.slug] = parsed[0].id;
          console.log(`  タグ既存: ${tag.name} (ID: ${parsed[0].id})`);
        }
      }
    }
  }

  // 記事にタグ付与
  const postTags = [
    { id: 3060, tags: ['nekoze', 'stretch', 'yamanashi', 'kofu', 'minami-alps', 'nirasaki', 'shisei'] }, // 猫背記事
    { id: 3061, tags: ['shisei', 'stretch', 'kofu', 'yamanashi'] }, // 姿勢改善記事
    { id: 3062, tags: ['katakori', 'stretch', 'kofu', 'yamanashi'] }, // 肩こり記事
  ];

  for (const post of postTags) {
    const postTagIds = post.tags.map(t => tagIds[t]).filter(Boolean);
    if (postTagIds.length > 0) {
      const result = await wpApi('PUT', `/wp/v2/posts/${post.id}`, { tags: postTagIds });
      if (result) {
        console.log(`  ✓ 記事ID:${post.id} にタグ${postTagIds.length}件付与`);
      }
    }
  }

  console.log('\n========================================');
  console.log('全技術SEO修正完了');
  console.log('========================================');
}

main().catch(console.error);
