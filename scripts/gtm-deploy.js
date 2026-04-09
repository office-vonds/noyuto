/**
 * GTM-PKQDTD2Q タグ・トリガー自動実装
 *
 * 実装内容:
 * - トリガー2つ: trigger_tel_tap (リンククリック), trigger_form_submit (PV)
 * - GA4タグ2つ: TELタップ / フォーム送信
 * - Google Adsタグ2つ: TELタップ / フォーム送信
 * - バージョン作成＆公開
 */
const { google } = require('googleapis');
const path = require('path');

const KEY_FILE = '/home/ozawakiryu0902/noyuto/gtm-key.json';
const GTM_ID = 'GTM-PKQDTD2Q';

// 設定情報
// 指示書のGT-5NTTPDBHはGoogleタグID（gtag.js形式）なので、GA4測定ID(G-XXX)に変換
// 既存GTMのgoogtagから確認: G-FN41FNZK8V が現行のGA4測定ID
const CONFIG = {
  GA4_MEASUREMENT_ID: 'G-FN41FNZK8V',
  GADS_CONVERSION_ID: 'AW-17857466060',
  LABEL_TEL_TAP: 'B-njCNDG15gcEMydjcNC',
  LABEL_FORM_SUBMIT: 'nHhKCNvz8ZgcEMydjcNC',
};

async function main() {
  console.log('=== GTM API 認証 ===');
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: [
      'https://www.googleapis.com/auth/tagmanager.edit.containers',
      'https://www.googleapis.com/auth/tagmanager.edit.containerversions',
      'https://www.googleapis.com/auth/tagmanager.publish',
      'https://www.googleapis.com/auth/tagmanager.readonly',
    ],
  });

  const authClient = await auth.getClient();
  const tagmanager = google.tagmanager({ version: 'v2', auth: authClient });

  // ===== 1. アカウント・コンテナ情報取得 =====
  console.log('\n=== アカウント一覧取得 ===');
  const accountsRes = await tagmanager.accounts.list();
  const accounts = accountsRes.data.account || [];

  if (accounts.length === 0) {
    console.error('アクセス可能なGTMアカウントがありません');
    process.exit(1);
  }

  // GTM-PKQDTD2Qコンテナを探す
  let targetContainer = null;
  let accountId = null;

  for (const account of accounts) {
    console.log(`  Account: ${account.name} (${account.accountId})`);
    const containersRes = await tagmanager.accounts.containers.list({
      parent: account.path,
    });
    const containers = containersRes.data.container || [];
    for (const c of containers) {
      console.log(`    Container: ${c.name} (${c.publicId}) path: ${c.path}`);
      if (c.publicId === GTM_ID) {
        targetContainer = c;
        accountId = account.accountId;
      }
    }
  }

  if (!targetContainer) {
    console.error(`GTMコンテナ ${GTM_ID} が見つかりません`);
    process.exit(1);
  }

  console.log(`\n✓ Target: ${targetContainer.path}`);

  // ===== 2. ワークスペース取得（デフォルトワークスペース使用）=====
  console.log('\n=== ワークスペース取得 ===');
  const workspacesRes = await tagmanager.accounts.containers.workspaces.list({
    parent: targetContainer.path,
  });
  const workspaces = workspacesRes.data.workspace || [];
  if (workspaces.length === 0) {
    console.error('ワークスペースがありません');
    process.exit(1);
  }
  // 最初のワークスペース（通常は Default Workspace）を使用
  const workspace = workspaces[0];
  console.log(`✓ Workspace: ${workspace.name} (${workspace.workspaceId})`);

  const parentPath = workspace.path;

  // ===== 3. 既存タグ・トリガー・変数の確認 =====
  console.log('\n=== 既存要素チェック ===');
  const existingTagsRes = await tagmanager.accounts.containers.workspaces.tags.list({ parent: parentPath });
  const existingTriggersRes = await tagmanager.accounts.containers.workspaces.triggers.list({ parent: parentPath });

  const existingTags = existingTagsRes.data.tag || [];
  const existingTriggers = existingTriggersRes.data.trigger || [];

  console.log(`  既存タグ: ${existingTags.length}件`);
  existingTags.forEach(t => console.log(`    - ${t.name} (${t.type})`));
  console.log(`  既存トリガー: ${existingTriggers.length}件`);
  existingTriggers.forEach(t => console.log(`    - ${t.name} (${t.type})`));

  // ===== 4. トリガー作成 =====
  console.log('\n=== トリガー作成 ===');

  // 既存の trigger_tel_tap があれば削除せずそれを使う
  let triggerTelTap = existingTriggers.find(t => t.name === 'trigger_tel_tap');
  if (!triggerTelTap) {
    const res = await tagmanager.accounts.containers.workspaces.triggers.create({
      parent: parentPath,
      requestBody: {
        name: 'trigger_tel_tap',
        type: 'linkClick',
        // 「リンクのみ」に相当
        waitForTags: { type: 'boolean', value: 'false' },
        checkValidation: { type: 'boolean', value: 'false' },
        // Click URL / 含む / tel:
        filter: [
          {
            type: 'contains',
            parameter: [
              { type: 'template', key: 'arg0', value: '{{Click URL}}' },
              { type: 'template', key: 'arg1', value: 'tel:' },
            ],
          },
        ],
      },
    });
    triggerTelTap = res.data;
    console.log(`  ✓ 作成: trigger_tel_tap (${triggerTelTap.triggerId})`);
  } else {
    console.log(`  - 既存使用: trigger_tel_tap (${triggerTelTap.triggerId})`);
  }

  let triggerFormSubmit = existingTriggers.find(t => t.name === 'trigger_form_submit');
  if (!triggerFormSubmit) {
    const res = await tagmanager.accounts.containers.workspaces.triggers.create({
      parent: parentPath,
      requestBody: {
        name: 'trigger_form_submit',
        type: 'pageview',
        // Page URL / 含む / contact-thanks
        filter: [
          {
            type: 'contains',
            parameter: [
              { type: 'template', key: 'arg0', value: '{{Page URL}}' },
              { type: 'template', key: 'arg1', value: 'contact-thanks' },
            ],
          },
        ],
      },
    });
    triggerFormSubmit = res.data;
    console.log(`  ✓ 作成: trigger_form_submit (${triggerFormSubmit.triggerId})`);
  } else {
    console.log(`  - 既存使用: trigger_form_submit (${triggerFormSubmit.triggerId})`);
  }

  // ===== 5. タグ作成 =====
  console.log('\n=== タグ作成 ===');

  // GA4タグA: TELタップ計測
  let tagGa4TelTap = existingTags.find(t => t.name === 'GA4 - tel_tap');
  if (!tagGa4TelTap) {
    const res = await tagmanager.accounts.containers.workspaces.tags.create({
      parent: parentPath,
      requestBody: {
        name: 'GA4 - tel_tap',
        type: 'gaawe', // GA4 Event
        parameter: [
          { type: 'template', key: 'eventName', value: 'tel_tap' },
          { type: 'template', key: 'measurementIdOverride', value: CONFIG.GA4_MEASUREMENT_ID },
        ],
        firingTriggerId: [triggerTelTap.triggerId],
      },
    });
    tagGa4TelTap = res.data;
    console.log(`  ✓ 作成: GA4 - tel_tap`);
  } else {
    console.log(`  - 既存: GA4 - tel_tap`);
  }

  // GA4タグB: フォーム送信計測
  let tagGa4FormSubmit = existingTags.find(t => t.name === 'GA4 - form_submit');
  if (!tagGa4FormSubmit) {
    const res = await tagmanager.accounts.containers.workspaces.tags.create({
      parent: parentPath,
      requestBody: {
        name: 'GA4 - form_submit',
        type: 'gaawe',
        parameter: [
          { type: 'template', key: 'eventName', value: 'form_submit' },
          { type: 'template', key: 'measurementIdOverride', value: CONFIG.GA4_MEASUREMENT_ID },
        ],
        firingTriggerId: [triggerFormSubmit.triggerId],
      },
    });
    tagGa4FormSubmit = res.data;
    console.log(`  ✓ 作成: GA4 - form_submit`);
  } else {
    console.log(`  - 既存: GA4 - form_submit`);
  }

  // Google AdsタグA: TELタップ
  let tagGadsTelTap = existingTags.find(t => t.name === 'Google Ads CV - tel_tap');
  if (!tagGadsTelTap) {
    const res = await tagmanager.accounts.containers.workspaces.tags.create({
      parent: parentPath,
      requestBody: {
        name: 'Google Ads CV - tel_tap',
        type: 'awct', // Google Ads Conversion Tracking
        parameter: [
          { type: 'template', key: 'conversionId', value: CONFIG.GADS_CONVERSION_ID.replace('AW-', '') },
          { type: 'template', key: 'conversionLabel', value: CONFIG.LABEL_TEL_TAP },
        ],
        firingTriggerId: [triggerTelTap.triggerId],
      },
    });
    tagGadsTelTap = res.data;
    console.log(`  ✓ 作成: Google Ads CV - tel_tap`);
  } else {
    console.log(`  - 既存: Google Ads CV - tel_tap`);
  }

  // Google AdsタグB: フォーム送信
  let tagGadsFormSubmit = existingTags.find(t => t.name === 'Google Ads CV - form_submit');
  if (!tagGadsFormSubmit) {
    const res = await tagmanager.accounts.containers.workspaces.tags.create({
      parent: parentPath,
      requestBody: {
        name: 'Google Ads CV - form_submit',
        type: 'awct',
        parameter: [
          { type: 'template', key: 'conversionId', value: CONFIG.GADS_CONVERSION_ID.replace('AW-', '') },
          { type: 'template', key: 'conversionLabel', value: CONFIG.LABEL_FORM_SUBMIT },
        ],
        firingTriggerId: [triggerFormSubmit.triggerId],
      },
    });
    tagGadsFormSubmit = res.data;
    console.log(`  ✓ 作成: Google Ads CV - form_submit`);
  } else {
    console.log(`  - 既存: Google Ads CV - form_submit`);
  }

  // ===== 6. バージョン作成＆公開 =====
  console.log('\n=== バージョン作成＆公開 ===');
  const versionRes = await tagmanager.accounts.containers.workspaces.create_version({
    path: workspace.path,
    requestBody: {
      name: 'GA4+Google Ads CV計測 自動実装',
      notes: 'VONDS/Claude Code によるAPI自動実装\n' +
             '- trigger_tel_tap (リンククリック tel:)\n' +
             '- trigger_form_submit (PV contact-thanks)\n' +
             '- GA4: tel_tap / form_submit\n' +
             '- Google Ads: AW-17857466060 の2ラベル',
    },
  });

  if (versionRes.data.containerVersion) {
    const version = versionRes.data.containerVersion;
    console.log(`  ✓ バージョン作成: ${version.name} (${version.containerVersionId})`);

    // 公開
    const publishRes = await tagmanager.accounts.containers.versions.publish({
      path: version.path,
    });
    console.log(`  ✓ 公開完了: バージョン ${version.containerVersionId}`);
  } else {
    console.log('  レスポンス:', JSON.stringify(versionRes.data, null, 2));
  }

  console.log('\n========================================');
  console.log('GTM 自動実装完了');
  console.log('========================================');
  console.log('\n確認URL: https://tagmanager.google.com/#/container/accounts/' + accountId + '/containers/' + targetContainer.containerId + '/workspaces');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  if (err.errors) {
    err.errors.forEach(e => console.error('  ' + JSON.stringify(e)));
  }
  if (err.response && err.response.data) {
    console.error('  response:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
