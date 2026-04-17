# VONDS Google Ads API 実装基盤

MCC `709-306-3546` 配下3クライアントのレポートをAPI経由で取得するための基盤。
Basic Access 承認後に本稼働する前提で、認証フロー・取得スクリプトを先に整備する。

## 前提

- MCC: `709-306-3546`（office.vonds@gmail.com）
- 配下クライアント:
  - `136-371-9642` 株式会社A-TRUCK
  - `854-911-4235` ストレッチゼロ
  - `681-110-5790` 本気ストレッチ
- アクセスレベル: Explorer → Basic Access **申請中**（2026-04-17）
- 対応SDK: `google-ads` Python SDK v24系

## 秘密情報の扱い

**コード・このREADME・memoryには文字列そのものを書かない。**

- Developer Token / OAuth client_id / client_secret / refresh_token は
  すべて `~/credentials/google-ads.yaml` に保管
- Pythonからは `GoogleAdsClient.load_from_storage("~/credentials/google-ads.yaml")` で読む
- `google-ads.yaml` は `.gitignore` 対象（本基盤には含めない）

## セットアップ手順（Basic Access承認後に実施）

### 1. Google Cloud プロジェクト作成

```
プロジェクト名: vonds-ads-api
APIs & Services → OAuth consent screen → 内部/外部どちらかで設定
Credentials → Create Credentials → OAuth 2.0 Client ID (Desktop app)
```

client_id / client_secret を取得 → Notion「各種アカウント」ページに保管。

### 2. Python環境

```bash
python3 -m venv ~/venvs/vonds-ads
source ~/venvs/vonds-ads/bin/activate
pip install -r scripts/vonds-ads-api/requirements.txt
```

### 3. google-ads.yaml テンプレ配置

`~/credentials/google-ads.yaml` に以下の構造で保存（値はNotionから埋める）:

```yaml
developer_token: "<Notionの機密DBから>"
client_id: "<Google Cloudから>"
client_secret: "<Google Cloudから>"
refresh_token: "<auth_setup.py で取得>"
login_customer_id: "7093063546"  # MCC (ハイフンなし)
use_proto_plus: True
```

### 4. Refresh Token 取得

```bash
python3 scripts/vonds-ads-api/auth_setup.py
```

ブラウザが起動→office.vonds@gmail.com で認可→ターミナルにrefresh_tokenが表示。
これを `google-ads.yaml` の `refresh_token` にコピー。

### 5. 疎通確認

```bash
python3 scripts/vonds-ads-api/test_connection.py
```

3クライアントのアカウント名が表示されれば成功。

## レポート取得

```bash
# 全クライアントの74チェック用CSV一括取得
python3 scripts/vonds-ads-api/fetch_reports.py --all --days 30

# 特定クライアントのみ
python3 scripts/vonds-ads-api/fetch_reports.py --customer 854-911-4235 --days 30
```

出力先: `ads-audit/samples/{client}/data/`（EXPORT_CHECKLIST.mdと同じ命名規則）

## 4/23 MTG（Kayoko Ando氏）対応

`mtg_0423_notes.md` に質問と現在地を整理。MTG前日に最終チェック。
