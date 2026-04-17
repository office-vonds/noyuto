# Google Ads API 認証セットアップ — 作業指示書

作成: 2026-04-17 / 起案: バナナ君 / 承認: NOYUTO
実装担当: **サム**（Phase 2以降）/ 管理画面作業: **NOYUTO**（Phase 1）

---

## 背景

- VONDSの広告運用代行(SANKEN×3 + A-TRUCK)を **プログラマティックAPI自動化**するため
- 現状: このマシン(家PC WSL)にGoogle Ads API認証ファイル無し・MCC自体も無し
- 既存Googleアカウント `office.vonds@gmail.com` に5アカウント紐付いているが、全てフラット構造（MCC不在）
- Google Cloud Project `potent-impulse-165116` を既存再利用（GA4で使用中）

---

## Phase 1: NOYUTO作業（管理画面・計25分）

### ステップ1-1. MCC新規作成（15分）

1. https://ads.google.com/home/tools/manager-accounts/ → 「**MCC アカウントを作成**」
2. ログイン状態: `office.vonds@gmail.com`
3. 設定:
   - **アカウント名**: `VONDS広告運用MCC`
   - **用途**: 「**他社のアカウントの管理**」を選択
   - **国**: 日本
   - **通貨**: JPY
   - **タイムゾーン**: (GMT+9:00) 東京
4. 作成完了後、発行された **新MCC顧客ID (XXX-XXX-XXXX)** をメモ

### ステップ1-2. 既存4アカウントをリンクリクエスト（5分）

新MCC画面で「**サブアカウント**」→「**+**」→「**リンクをリクエスト**」:

| 顧客ID | 名称 | 備考 |
|---|---|---|
| 136-371-9642 | 株式会社オフィスVONDS | 自社運用用 |
| 854-911-4235 | ストレッチゼロ | 今日KW投入予定 |
| 681-110-5790 | 本気ストレッチ | GTM整理と並行 |
| 781-096-6590 | お部屋ソムリエ 韮崎店 | ついでに組込み |

※ **198-432-2620 VONDS**（停止中旧AdWords）は除外

同一Googleアカウント `office.vonds@gmail.com` 管理下なので、別タブで該当顧客IDを開いて「リンクリクエストを承認」で即時リンク成立（ワンクリック）。

### ステップ1-3. Developer Token申請（5分）

新MCC選択中の状態で:

1. 左サイドバー「**ツール**」→「**API Center**」
2. 「**Basic access**」を選択してフォーム記入:
   - **アプリ名**: `VONDS Ads Management`
   - **連絡先メール**: `office.vonds@gmail.com`
   - **ビジネス用途**:
     ```
     広告運用代行事業における自動入札最適化・キーワード管理・
     パフォーマンスレポート自動生成。対象顧客はSANKEN株式会社
     およびA-TRUCK株式会社。運用代行契約に基づく業務自動化。
     ```
   - **API使用量（想定）**: 1日100-500リクエスト
3. 送信 → 通常数時間〜即日で承認メール受信

承認後、**Developer Token 文字列をバナナに共有**（この指示書のリポジトリには絶対書き込むな）

---

## Phase 2: サム作業（Token承認後・計45分）

### ステップ2-1. Google Cloud Console セットアップ（15分）

既存プロジェクト `potent-impulse-165116` (GA4用) を再利用:

1. https://console.cloud.google.com/ → プロジェクト `potent-impulse-165116` 選択
2. 左メニュー「**APIとサービス**」→「**ライブラリ**」
3. 「**Google Ads API**」を検索 → 「**有効にする**」
4. 「**APIとサービス**」→「**認証情報**」→「**+ 認証情報を作成**」→「**OAuth クライアント ID**」
5. アプリケーションの種類: **デスクトップアプリ**
6. 名前: `VONDS Ads Management Client`
7. 作成完了 → JSONをダウンロード（`client_secret_xxx.json`）
8. `~/credentials/ads-oauth-client.json` に配置（`.gitignore` 確認必須）

### ステップ2-2. OAuth認証フロー実行（10分）

Python環境セットアップ:
```bash
cd /home/ozawakiryu0902/projects/vonds
python3 -m venv .venv-ads
source .venv-ads/bin/activate
pip install google-ads google-auth-oauthlib
```

認証スクリプト作成・実行:
```bash
python scripts/ads-auth/generate_refresh_token.py
```
→ ブラウザが開く → `office.vonds@gmail.com` でログイン → 権限承認 → refresh_token取得

**スクリプト雛形（`scripts/ads-auth/generate_refresh_token.py`）**:
```python
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/adwords']
CLIENT_SECRET = '/home/ozawakiryu0902/credentials/ads-oauth-client.json'

flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET, SCOPES)
creds = flow.run_local_server(port=0)
print(f"refresh_token: {creds.refresh_token}")
print(f"client_id: {creds.client_id}")
print(f"client_secret: {creds.client_secret}")
```

### ステップ2-3. google-ads.yaml 配置（5分）

`~/credentials/google-ads.yaml` 作成:
```yaml
developer_token: {NOYUTOから受領}
client_id: {ステップ2-2で取得}
client_secret: {ステップ2-2で取得}
refresh_token: {ステップ2-2で取得}
login_customer_id: {MCC顧客ID（Phase 1-1で発行）}
use_proto_plus: True
```

**絶対条件**:
- `.gitignore` に `**/google-ads.yaml` を追加
- `/tmp/` 配下でテストしてから本番配置
- リポジトリにコミット禁止

### ステップ2-4. 疎通確認（15分）

```bash
python scripts/ads-auth/test_connection.py
```

**スクリプト雛形**:
```python
from google.ads.googleads.client import GoogleAdsClient

client = GoogleAdsClient.load_from_storage('/home/ozawakiryu0902/credentials/google-ads.yaml')
ga_service = client.get_service("GoogleAdsService")

query = """
    SELECT customer_client.descriptive_name, customer_client.id
    FROM customer_client
    WHERE customer_client.level = 1
"""

response = ga_service.search_stream(customer_id={MCC顧客ID}, query=query)
for batch in response:
    for row in batch.results:
        print(f"{row.customer_client.id}: {row.customer_client.descriptive_name}")
```

**成功判定**: 4サブアカウント（オフィスVONDS / ストレッチゼロ / 本気ストレッチ / お部屋ソムリエ）が表示される

---

## Phase 3: バナナ作業（サム完了後・30分）

### ステップ3-1. KW投入スクリプト（ストレッチゼロ）

`scripts/ads-ops/stretchzero_add_keywords.py`:

```python
# ads-audit/samples/stretchzero/editor_import_keywords.csv を読み込み
# 顧客ID 854-911-4235 に対してKeywordService でUPSERT
# ステータス Enabled で11本投入
# 実行ログを session-logs/ に記録
```

### ステップ3-2. 除外KW投入スクリプト
同様に `editor_import_negatives.csv` を processing。

### ステップ3-3. 今後の運用基盤
- 毎朝KPI取得 → Notion DB 自動更新
- CPA閾値超え時に Slack/Gmail 通知
- 週次でKW候補提案レポート

---

## セキュリティ・gitignore確認

**必須（Phase 2開始前に確認）**:
```bash
grep -E "google-ads|ads-oauth" .gitignore
```
以下3行がなければ追加:
```
**/google-ads.yaml
**/ads-oauth-client.json
.venv-ads/
```

---

## 完了判定

- [ ] Phase 1完了: Developer Token取得・MCC配下に4アカウント確認
- [ ] Phase 2完了: `python scripts/ads-auth/test_connection.py` で4サブアカウント表示
- [ ] Phase 3完了: ストレッチゼロ KW 11本がAPI経由で投入・Editor画面で確認
- [ ] 完了後: 今後の管理画面手作業が不要な状態

---

## 関連

- KWリスト: `ads-audit/samples/stretchzero/editor_import_*.csv`
- 既存GA4認証: `~/credentials/ga4-mcp.json`
- GCPプロジェクト: `potent-impulse-165116`
