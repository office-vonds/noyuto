/**
 * フォーム動作テスト + 75分コース削除
 * 1. 実際にCF7フォームに送信テストを実行
 * 2. 75分コースをCF7設定から削除
 */
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');
const querystring = require('querystring');

const WP_BASE = 'https://stretchzero.jp';
const FTP = { user: 'stlab@stretchlabo.jp', pass: 'Stretchlabo0501', host: 'sv14862.xserver.jp' };

// ===== Test: フォーム送信テスト =====
async function testFormSubmission() {
  console.log('=== フォーム送信テスト ===\n');

  // まず/contact/ページを取得してCF7 nonceとform IDを取得
  const pageRes = await new Promise(r=>{
    https.get(`${WP_BASE}/contact/`, res=>{
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>r(b));
    });
  });

  // _wpcf7 form ID 抽出
  const formIdMatch = pageRes.match(/name="_wpcf7"[^>]*value="(\d+)"/);
  const nonceMatch = pageRes.match(/name="_wpnonce"[^>]*value="([^"]+)"/);
  const unitTagMatch = pageRes.match(/name="_wpcf7_unit_tag"[^>]*value="([^"]+)"/);
  const versionMatch = pageRes.match(/name="_wpcf7_version"[^>]*value="([^"]+)"/);
  const localeMatch = pageRes.match(/name="_wpcf7_locale"[^>]*value="([^"]+)"/);
  const containerMatch = pageRes.match(/name="_wpcf7_container_post"[^>]*value="(\d+)"/);

  console.log(`  Form ID: ${formIdMatch ? formIdMatch[1] : '取得失敗'}`);
  console.log(`  Nonce: ${nonceMatch ? nonceMatch[1] : '取得失敗'}`);
  console.log(`  Unit tag: ${unitTagMatch ? unitTagMatch[1] : '取得失敗'}`);

  if (!formIdMatch || !nonceMatch) {
    console.log('  ✗ フォーム情報取得失敗\n');
    return;
  }

  const formId = formIdMatch[1];

  // CF7 REST APIにテスト送信
  const boundary = '----TestBoundary' + Math.random().toString(36).substring(2);
  const testData = {
    '_wpcf7': formId,
    '_wpcf7_version': versionMatch ? versionMatch[1] : '5.4',
    '_wpcf7_locale': localeMatch ? localeMatch[1] : 'ja',
    '_wpcf7_unit_tag': unitTagMatch ? unitTagMatch[1] : 'wpcf7-f' + formId + '-p1406-o1',
    '_wpcf7_container_post': containerMatch ? containerMatch[1] : '1406',
    '_wpnonce': nonceMatch[1],
    'your-name': '【テスト】Claude Code 動作確認',
    'your-furigana': 'テスト ドウサカクニン',
    'your-tel': '090-0000-0000',
    'your-email': 'office.vonds@gmail.com',
    'your-email-confirm': 'office.vonds@gmail.com',
    'your-store': '甲府上石田店',
    'your-date1': '2026-04-20',
    'your-time1': '14:00',
    'your-date2': '',
    'your-time2': '',
    'your-date3': '',
    'your-time3': '',
    'your-course': '60分コース',
    'your-message': '【自動テスト送信】これはClaude Codeによる動作確認テストです。実際の予約ではありません。',
    'your-acceptance': '1',
  };

  // multipart/form-dataの構築
  let body = '';
  for (const [key, value] of Object.entries(testData)) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    body += `${value}\r\n`;
  }
  body += `--${boundary}--\r\n`;

  const bodyBuffer = Buffer.from(body, 'utf-8');

  const result = await new Promise(r=>{
    const req = https.request({
      hostname: 'stretchzero.jp', port: 443,
      path: `/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length,
        'User-Agent': 'Mozilla/5.0 VONDS-Test',
        'Referer': `${WP_BASE}/contact/`,
      },
    }, res => {
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>r({status:res.statusCode, body:b}));
    });
    req.on('error', e => r({status:0, body:e.message}));
    req.write(bodyBuffer);
    req.end();
  });

  console.log(`\n  送信結果: [${result.status}]`);
  try {
    const parsed = JSON.parse(result.body);
    console.log(`  status: ${parsed.status}`);
    console.log(`  message: ${parsed.message || '(なし)'}`);
    if (parsed.invalid_fields && parsed.invalid_fields.length > 0) {
      console.log(`  ✗ バリデーションエラー:`);
      parsed.invalid_fields.forEach(f => console.log(`    - ${f.field}: ${f.message}`));
    } else if (parsed.status === 'mail_sent') {
      console.log(`  ✓ メール送信成功！`);
    } else if (parsed.status === 'spam') {
      console.log(`  ✗ スパム判定`);
    }
  } catch (e) {
    console.log(`  レスポンス: ${result.body.substring(0, 500)}`);
  }
}

// ===== Fix: 75分コース削除 =====
async function removeCourse75() {
  console.log('\n=== 75分コース削除 ===\n');

  // PHPスクリプトでCF7フォーム設定を直接更新
  const phpScript = `<?php
require_once dirname(__FILE__) . '/wp-load.php';
if (($_GET['t'] ?? '') !== 'sz2026') { http_response_code(403); exit; }

$form_id = 1354;
$contact_form = wpcf7_contact_form($form_id);
if (!$contact_form) { echo 'Form not found'; exit; }

$props = $contact_form->get_properties();
$form = $props['form'];

// 75分コースを削除
$form = str_replace(' "75分コース"', '', $form);
$form = str_replace('"75分コース" ', '', $form);
$form = str_replace('"75分コース"', '', $form);

$props['form'] = $form;
$contact_form->set_properties($props);
$contact_form->save();

echo 'OK: 75分コース削除完了';
unlink(__FILE__);
`;

  const tmp = '/tmp/sz_fix_course.php';
  fs.writeFileSync(tmp, phpScript);
  execSync(`curl -s --ftp-ssl --insecure -u "${FTP.user}:${FTP.pass}" -T ${tmp} "ftp://${FTP.host}/stretchzero.jp/public_html/sz_fix_course.php"`, {timeout:15000});

  const result = await new Promise(r=>{
    https.get(`${WP_BASE}/sz_fix_course.php?t=sz2026`, res=>{
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{fs.unlinkSync(tmp)}catch(e){}r(b)});
    });
  });

  console.log(`  ${result}`);
}

async function main() {
  await removeCourse75();
  await testFormSubmission();
  console.log('\n完了');
}

main().catch(console.error);
