/**
 * 1. 「施術の様子」→「店舗イメージ」に変更
 * 2. 口コミソース表示を変更 + Schema.org Reviewマークアップ追加
 */
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const WP_BASE = 'https://stretchzero.jp';
const FTP = { user: 'stlab@stretchlabo.jp', pass: 'Stretchlabo0501', host: 'sv14862.xserver.jp' };

async function getContent(postId) {
  const php = `<?php
require_once dirname(__FILE__) . '/wp-load.php';
if (($_GET['t'] ?? '') !== 'sz2026') { http_response_code(403); exit; }
echo base64_encode(get_post(${postId})->post_content);
unlink(__FILE__);
`;
  const tmp = `/tmp/sz_g_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_g_${postId}.php"`, { timeout: 15000 });
  return new Promise((resolve) => {
    https.get(`${WP_BASE}/sz_g_${postId}.php?t=sz2026`, (res) => {
      let body = ''; res.on('data', c => body += c);
      res.on('end', () => { try { fs.unlinkSync(tmp); } catch(e) {} resolve(Buffer.from(body, 'base64').toString('utf-8')); });
    }).on('error', () => resolve(''));
  });
}

async function dbUpdate(postId, content) {
  const b64 = Buffer.from(content, 'utf-8').toString('base64');
  const php = `<?php
require_once dirname(__FILE__) . '/wp-load.php';
if (($_GET['t'] ?? '') !== 'sz2026') { http_response_code(403); exit; }
$content = base64_decode('${b64}');
global $wpdb;
$r = $wpdb->update($wpdb->posts, array('post_content' => $content), array('ID' => ${postId}), array('%s'), array('%d'));
clean_post_cache(${postId});
echo ($r !== false) ? 'OK:${postId}:'.strlen($content) : 'ERR:'.$wpdb->last_error;
unlink(__FILE__);
`;
  const tmp = `/tmp/sz_u2_${postId}.php`;
  fs.writeFileSync(tmp, php);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_u2_${postId}.php"`, { timeout: 15000 });
  return new Promise((resolve) => {
    https.get(`${WP_BASE}/sz_u2_${postId}.php?t=sz2026`, (res) => {
      let body = ''; res.on('data', c => body += c);
      res.on('end', () => { try { fs.unlinkSync(tmp); } catch(e) {} resolve(body); });
    }).on('error', (e) => resolve('ERR:' + e.message));
  });
}

// Schema.org Review構造化データ
const SCHEMA = {
  3056: { name: 'ストレッチゼロ 甲府上石田店', rating: '4.52', count: '65', address: '山梨県甲府市上石田3-7-7', phone: '055-288-9827' },
  3057: { name: 'ストレッチゼロ 南アルプス店', rating: '4.50', count: '27', address: '山梨県南アルプス市小笠原1281-8', phone: '055-284-1824' },
  3058: { name: 'ストレッチゼロ 韮崎店', rating: '4.65', count: '26', address: '山梨県韮崎市若宮2-2-43', phone: '0551-45-6560' },
  3059: { name: 'ストレッチゼロ 甲斐響が丘店', rating: '5.00', count: '2', address: '山梨県甲斐市竜王新町1981-10', phone: '' },
};

async function main() {
  console.log('=== 店舗ページ修正 ===\n');

  const pageIds = [3056, 3057, 3058, 3059];

  for (const id of pageIds) {
    console.log(`ID:${id}`);
    let content = await getContent(id);
    console.log(`  取得: ${content.length}文字`);

    if (content.length < 100) {
      console.log(`  ✗ コンテンツが空。スキップ`);
      continue;
    }

    let changed = false;

    // 1. 「施術の様子」→「店舗イメージ」
    if (content.includes('施術の様子')) {
      content = content.replace(/施術の様子/g, '店舗イメージ');
      console.log(`  ✓ 「施術の様子」→「店舗イメージ」`);
      changed = true;
    }

    // 2. 口コミソース表示変更
    if (content.includes('ホットペッパービューティー')) {
      content = content.replace(
        '<p class="sz-review-src">出典：ホットペッパービューティー</p>',
        '<p class="sz-review-src">※ 実際にご来店いただいたお客様からの口コミです</p>'
      );
      console.log(`  ✓ 口コミソース表示変更`);
      changed = true;
    }

    // 3. 既存のLocalBusiness JSON-LDにAggregateRatingを追加
    const s = SCHEMA[id];
    if (s) {
      // 既存のJSON-LDを置換（AggregateRating付きに）
      const oldSchemaRegex = /<script type="application\/ld\+json">[\s\S]*?<\/script>/;
      const newSchema = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"${s.name}","description":"${s.name.split(' ').pop().replace('店','')}のストレッチ専門店。理学療法士在籍。","address":{"@type":"PostalAddress","streetAddress":"${s.address}","addressRegion":"山梨県","addressCountry":"JP"}${s.phone?`,"telephone":"${s.phone}"`:''},"url":"https://stretchzero.jp/shop/shop-${id === 3056 ? 'kofu' : id === 3057 ? 'minami-alps' : id === 3058 ? 'nirasaki' : 'kai-hibikigaoka'}/","openingHours":"Mo-Su 09:00-22:00","aggregateRating":{"@type":"AggregateRating","ratingValue":"${s.rating}","reviewCount":"${s.count}","bestRating":"5"}}</script>`;

      if (content.match(oldSchemaRegex)) {
        content = content.replace(oldSchemaRegex, newSchema);
        console.log(`  ✓ Schema.org AggregateRating追加`);
        changed = true;
      }
    }

    if (changed) {
      const result = await dbUpdate(id, content);
      console.log(`  ${result}\n`);
    } else {
      console.log(`  変更なし\n`);
    }
  }

  console.log('完了');
}

main().catch(console.error);
