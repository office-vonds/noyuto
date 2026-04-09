/**
 * FTP経由で .htaccess に301リダイレクトルールを追加
 * 旧URL /2026/04/07/slug/ → 新URL /column/slug/ への301リダイレクト
 */

const { Client } = require('basic-ftp');
const { Readable } = require('stream');

const FTP_HOST = 'sv14862.xserver.jp';
const FTP_USER = 'stlab@stretchlabo.jp';
const FTP_PASS = 'Stretchlabo0501';
const HTACCESS_PATH = '/stretchlabo.jp/public_html/.htaccess';

async function main() {
  const client = new Client();
  client.ftp.verbose = false;

  try {
    console.log('=== FTP接続 ===');
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASS,
      secure: true,
      secureOptions: { rejectUnauthorized: false },
    });
    console.log('FTP接続成功');

    // 1. 現在の.htaccessをダウンロード
    console.log('\n=== .htaccess ダウンロード ===');
    let currentContent = '';
    const chunks = [];

    await client.downloadTo({
      write(chunk) { chunks.push(chunk); },
      end() {},
      on() { return this; },
      once() { return this; },
      emit() { return this; },
    }, HTACCESS_PATH).catch(async () => {
      // Streamベースのダウンロードが難しい場合、一時ファイル経由
      const fs = require('fs');
      const tmpFile = '/tmp/htaccess_backup';
      await client.downloadTo(tmpFile, HTACCESS_PATH);
      currentContent = fs.readFileSync(tmpFile, 'utf-8');
    });

    if (chunks.length > 0) {
      currentContent = Buffer.concat(chunks).toString('utf-8');
    }

    if (!currentContent) {
      // 一時ファイルアプローチ
      const fs = require('fs');
      const tmpFile = '/tmp/htaccess_backup';
      try {
        await client.downloadTo(tmpFile, HTACCESS_PATH);
        currentContent = fs.readFileSync(tmpFile, 'utf-8');
      } catch (e) {
        console.log('ダウンロード失敗、新規作成します:', e.message);
      }
    }

    console.log(`.htaccess取得 (${currentContent.length}文字)`);
    console.log('--- 現在の内容 ---');
    console.log(currentContent.substring(0, 500));
    console.log('--- end ---');

    // 2. リダイレクトルール追加
    const redirectRules = `
# === ストレッチゼロ SEOリダイレクト（旧パーマリンク→新パーマリンク）===
# 旧日付ベースURL /YYYY/MM/DD/slug/ → 新URL /column/slug/
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule ^2026/04/07/(.+)$ /column/$1 [R=301,L]
# 他の年月日パターンも念のため
RewriteRule ^[0-9]{4}/[0-9]{2}/[0-9]{2}/(.+)$ /column/$1 [R=301,L]
</IfModule>
# === END SEOリダイレクト ===
`;

    // 既にリダイレクトルールがあれば追加しない
    if (currentContent.includes('SEOリダイレクト')) {
      console.log('リダイレクトルールは既に存在します');
    } else {
      const newContent = redirectRules + '\n' + currentContent;

      // 3. アップロード
      console.log('\n=== .htaccess アップロード ===');
      const fs = require('fs');
      const tmpUpload = '/tmp/htaccess_new';
      fs.writeFileSync(tmpUpload, newContent);
      await client.uploadFrom(tmpUpload, HTACCESS_PATH);
      console.log('.htaccess更新成功');

      // cleanup
      fs.unlinkSync(tmpUpload);
    }

    // 4. 確認
    console.log('\n=== リダイレクト確認 ===');
    // FTPを閉じてからHTTPで確認
    client.close();

    const https = require('https');
    const checkUrl = (url) => new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      https.get({
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname,
        headers: { 'User-Agent': 'VONDS-Check' },
      }, (res) => {
        resolve({ status: res.statusCode, location: res.headers.location });
      }).on('error', reject);
    });

    const tests = [
      'https://stretchzero.jp/2026/04/07/nekoze-stretch-yamanashi/',
      'https://stretchzero.jp/2026/04/07/katakori-kofu-stretch/',
      'https://stretchzero.jp/2026/04/07/yotsu-kofu-stretch/',
    ];

    for (const url of tests) {
      const result = await checkUrl(url);
      console.log(`  ${url.split('.jp')[1]}`);
      console.log(`    → [${result.status}] ${result.location || '(no redirect)'}`);
    }

    console.log('\n完了');
    return;

  } catch (err) {
    console.error('エラー:', err.message);
    console.log('\n代替手段: WordPress functions.phpにリダイレクトコードを追加します');
  }

  client.close();
}

main().catch(console.error);
