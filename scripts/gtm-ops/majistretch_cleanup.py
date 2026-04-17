#!/usr/bin/env python3
"""
本気ストレッチ GTM コンテナ整理・CVタグ実装
2026-04-17 バナナ作成

対象: GTM-K32XLKXH
作業:
  1. 旧タグ「Google 広告経由でのTELタップ」を一時停止
  2. 旧タグ「コンバージョン リンカー」(4/02作成版) を一時停止
  3. トリガー「予約ボタン_トリガー」のフィルタを修正 (airrsv.net → #reservation)
  4. 新規タグ「Google広告_メールタップ」追加 (AW-18057524680 / FpUuCN7tzp0cEMjrv6JD)
  5. 新規トリガー「メールタップ_トリガー」追加
  6. バージョン作成 → Publish
  7. 最新コンテナをJSONエクスポートして gtm_container_majistretch.json 更新

前提:
  - GTM側で ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com を「公開」権限で追加済み
  - 実行環境: .venv-ga4 (google-api-python-client)

実行:
  source ~/projects/vonds/.venv-ga4/bin/activate
  python scripts/gtm-ops/majistretch_cleanup.py
"""

import sys
import json
from pathlib import Path
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SA_KEY = '/home/ozawakiryu0902/credentials/ga4-mcp.json'
GTM_PUBLIC_ID = 'GTM-K32XLKXH'

CV_MAIL_ID = '18057524680'
CV_MAIL_LABEL = 'FpUuCN7tzp0cEMjrv6JD'

CONTAINER_JSON_PATH = Path('/home/ozawakiryu0902/projects/vonds/majistretch/gtm_container_majistretch.json')


def build_service():
    creds = service_account.Credentials.from_service_account_file(
        SA_KEY,
        scopes=['https://www.googleapis.com/auth/tagmanager.edit.containers',
                'https://www.googleapis.com/auth/tagmanager.publish']
    )
    return build('tagmanager', 'v2', credentials=creds)


def find_container(svc):
    """全アカウント走査して GTM-K32XLKXH を特定"""
    accounts = svc.accounts().list().execute().get('account', [])
    if not accounts:
        print("❌ Service Accountがどのアカウントにも属していない")
        print("   GTM管理画面 → 管理 → ユーザー管理 で以下を追加:")
        print(f"   メール: ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com")
        print(f"   アカウント権限: ユーザー / コンテナ権限: 公開")
        sys.exit(1)

    for acc in accounts:
        acc_path = acc['path']
        containers = svc.accounts().containers().list(parent=acc_path).execute().get('container', [])
        for c in containers:
            if c.get('publicId') == GTM_PUBLIC_ID:
                return c
    print(f"❌ {GTM_PUBLIC_ID} が見つからない")
    sys.exit(1)


def get_default_workspace(svc, container_path):
    workspaces = svc.accounts().containers().workspaces().list(parent=container_path).execute().get('workspace', [])
    default = next((w for w in workspaces if w.get('name') == 'Default Workspace'), None)
    return default or workspaces[0]


def list_all(svc, ws_path, resource):
    """タグ/トリガー/変数一覧取得"""
    method = getattr(svc.accounts().containers().workspaces(), resource)()
    result = method.list(parent=ws_path).execute()
    return result.get(resource[:-1] if resource.endswith('s') else resource, []) or result.get(resource, [])


def pause_tag(svc, ws_path, tag):
    """タグを一時停止"""
    tag_path = tag['path']
    tag['paused'] = True
    return svc.accounts().containers().workspaces().tags().update(
        path=tag_path, body=tag
    ).execute()


def update_reservation_trigger(svc, ws_path, trigger):
    """予約ボタン_トリガーのフィルタを #reservation に修正"""
    trigger['filter'] = [
        {
            'type': 'contains',
            'parameter': [
                {'type': 'template', 'key': 'arg0', 'value': '{{Click URL}}'},
                {'type': 'template', 'key': 'arg1', 'value': '#reservation'}
            ]
        }
    ]
    trigger['type'] = 'linkClick'
    trigger['waitForTags'] = {'type': 'boolean', 'value': 'false'}
    trigger['checkValidation'] = {'type': 'boolean', 'value': 'false'}
    trigger['waitForTagsTimeout'] = {'type': 'template', 'value': '2000'}
    return svc.accounts().containers().workspaces().triggers().update(
        path=trigger['path'], body=trigger
    ).execute()


def create_mail_trigger(svc, ws_path):
    body = {
        'name': 'メールタップ_トリガー',
        'type': 'linkClick',
        'filter': [
            {
                'type': 'contains',
                'parameter': [
                    {'type': 'template', 'key': 'arg0', 'value': '{{Click URL}}'},
                    {'type': 'template', 'key': 'arg1', 'value': 'mailto:'}
                ]
            }
        ],
        'waitForTags': {'type': 'boolean', 'value': 'false'},
        'checkValidation': {'type': 'boolean', 'value': 'false'},
        'waitForTagsTimeout': {'type': 'template', 'value': '2000'}
    }
    return svc.accounts().containers().workspaces().triggers().create(
        parent=ws_path, body=body
    ).execute()


def create_mail_tag(svc, ws_path, mail_trigger_id):
    body = {
        'name': 'Google広告_メールタップ',
        'type': 'awct',
        'parameter': [
            {'type': 'template', 'key': 'conversionId', 'value': CV_MAIL_ID},
            {'type': 'template', 'key': 'conversionLabel', 'value': CV_MAIL_LABEL},
            {'type': 'template', 'key': 'conversionValue', 'value': '500'},
            {'type': 'template', 'key': 'currencyCode', 'value': 'JPY'}
        ],
        'firingTriggerId': [mail_trigger_id],
        'tagFiringOption': 'oncePerEvent'
    }
    return svc.accounts().containers().workspaces().tags().create(
        parent=ws_path, body=body
    ).execute()


def create_version_and_publish(svc, ws_path):
    """現ワークスペースからバージョン作成 → Publish"""
    version_resp = svc.accounts().containers().workspaces().create_version(
        path=ws_path,
        body={
            'name': 'バナナ自動整理: 旧タグ停止+予約トリガー修正+メールCV追加',
            'notes': '2026-04-17 バナナが自動実行'
        }
    ).execute()
    version = version_resp.get('containerVersion')
    if not version:
        print("⚠️ バージョン作成失敗:", version_resp)
        return None

    version_path = version['path']
    published = svc.accounts().containers().versions().publish(path=version_path).execute()
    return published


def export_container(svc, container_path):
    """最新バージョンを取得してJSON形式で保存"""
    live = svc.accounts().containers().versions().live(parent=container_path).execute()
    CONTAINER_JSON_PATH.write_text(json.dumps(live, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✅ {CONTAINER_JSON_PATH} 更新完了")


def main():
    svc = build_service()
    container = find_container(svc)
    container_path = container['path']
    print(f"✅ コンテナ特定: {container.get('name')} ({GTM_PUBLIC_ID})")

    ws = get_default_workspace(svc, container_path)
    ws_path = ws['path']
    print(f"✅ ワークスペース: {ws.get('name')}")

    # 現状取得
    tags = svc.accounts().containers().workspaces().tags().list(parent=ws_path).execute().get('tag', [])
    triggers = svc.accounts().containers().workspaces().triggers().list(parent=ws_path).execute().get('trigger', [])

    print(f"\n現状: タグ {len(tags)}本 / トリガー {len(triggers)}本")

    # ① 旧タグ停止
    for target_name in ['Google 広告経由でのTELタップ', 'コンバージョン リンカー']:
        tag = next((t for t in tags if t.get('name') == target_name), None)
        if tag and not tag.get('paused'):
            pause_tag(svc, ws_path, tag)
            print(f"  ✅ 停止: {target_name}")
        elif tag and tag.get('paused'):
            print(f"  ⏭ 既停止: {target_name}")
        else:
            print(f"  ⚠️ 未検出: {target_name}")

    # ② 予約ボタン_トリガー修正
    trg = next((t for t in triggers if t.get('name') == '予約ボタン_トリガー'), None)
    if trg:
        update_reservation_trigger(svc, ws_path, trg)
        print(f"  ✅ 予約ボタン_トリガー フィルタ修正")
    else:
        print(f"  ⚠️ 予約ボタン_トリガー 未検出")

    # ③ メールタップ_トリガー新規作成 (既存チェック)
    mail_trg = next((t for t in triggers if t.get('name') == 'メールタップ_トリガー'), None)
    if not mail_trg:
        mail_trg = create_mail_trigger(svc, ws_path)
        print(f"  ✅ メールタップ_トリガー 新規作成")
    else:
        print(f"  ⏭ メールタップ_トリガー 既存")
    mail_trigger_id = mail_trg['triggerId']

    # ④ Google広告_メールタップ タグ新規作成
    mail_tag = next((t for t in tags if t.get('name') == 'Google広告_メールタップ'), None)
    if not mail_tag:
        create_mail_tag(svc, ws_path, mail_trigger_id)
        print(f"  ✅ Google広告_メールタップ 新規作成")
    else:
        print(f"  ⏭ Google広告_メールタップ 既存")

    # ⑤ バージョン作成 + Publish
    print("\nバージョン作成 + Publish 中...")
    result = create_version_and_publish(svc, ws_path)
    if result:
        print(f"✅ Publish 完了: version {result.get('containerVersion', {}).get('containerVersionId')}")
    else:
        print("⚠️ Publish失敗")

    # ⑥ エクスポート
    export_container(svc, container_path)


if __name__ == '__main__':
    main()
