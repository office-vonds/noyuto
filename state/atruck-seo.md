# A-TRUCK SEO

## 現在地（2026-04-15更新）

- **状態**: 本番稼働中 — SEOコード全機能発火確認済み（2026-04-15 10:45）
- **新サーバー**: IP 218.216.115.31 (www) / FTP同じ認証情報で接続可
- **旧サーバー**: svw06.server-can.net (IP: 218.216.115.36) — 移行元
- **PHP**: X-Powered-By: PHP/7.4.33
- **functions.php**: 29,407B（修正版）デプロイ済み / バックアップ: functions.php.bak-before-seo-20260415

## 実装済みSEOコード（functions.php内 atruck_*関数8個）

1. LocalBusinessスキーマ全10拠点（座標・住所・電話・営業時間）
2. Serviceスキーマ3本（レンタル・鈑金・中古車）
3. FAQPageスキーマ
4. AIOSEO title/description/OG補完
5. テストページ3件noindex
6. 画像alt自動補完
7. 日本語URL 301リダイレクト（23件マッピング済み）

## 未実施（別途対応）

- GTM3重読込の統合（コンテナID確認後） → `tasks/sam-queue.md` #2（**同様にクライアント事前承認が必要か要検討**）
- header.phpのハードコード`<title>`削除 → `tasks/sam-queue.md` #3（同上）
- 鈑金塗装ページのコンテンツ拡充 → **⚠️ 承認待ち（2026-04-17 NOYUTO送付完了）**
  - コンテンツ作成済: `seo/atruck-repair-content.php`（210行・約3,200字）
  - プレビューHTML（合体版・メール送付済）: `seo/atruck-repair-preview-full.html`
  - 承認依頼メール: 2026-04-17 NOYUTOがA-TRUCK担当者へ送付完了
  - **次のアクション**: A-TRUCKからの返信受領待ち
    - 承認あり → `tasks/sam-queue.md` P0#1 を再発注（料金修正指示あれば反映後）
    - 料金修正要請 → コンテンツ修正→再送付 or 即反映
    - 保留・却下 → 鈑金改修案を凍結

## GTM調査結果（2026-04-15 KIRYU調査）

3重読込 確定。以下のIDがhead内に並列埋込み:

| # | ID | 種別 |
|---|---|---|
| 1 | GTM-5X6GWL4 | GTMコンテナ |
| 2 | GTM-PG3FF87 | GTMコンテナ |
| 3 | GTM-5PNW7CC3 | GTMコンテナ |
| 4 | UA-47832247-1 | Universal Analytics（HTML直書き・GTM外） |
| 5 | AW-817161945 | Google Ads（HTML直書き・GTM外・CV重複あり） |

**追加発見:**
- GA4 (G-XXXXXXX) が**未導入**（UAは2024/7終了済み）
- コンバージョンタグ `q3qDCIrW9_cBENnN04UD` が2回発火（重複）
- SSL証明書期限切れ

**対応方針（NOYUTO確認後）:**
1. GTM管理画面で3コンテナの中身を確認→1つに統合
2. UA/AWの直書きタグを削除→GTM内で一元管理
3. GA4新規設定→GTM経由で配信
4. CV重複修正

## 構造化データ検証結果（2026-04-15 KIRYU検証）

**総合判定: デプロイ成功。新規SEOコード全て正常発火。**

| スキーマ | 状態 | 備考 |
|---|---|---|
| LocalBusiness x10 | ✅ 正常 | 全拠点: 名前・住所・座標・電話・営業時間あり |
| Service x3 | ✅ 正常 | レンタル・鈑金・中古車 |
| FAQPage (8問) | ✅ 正常 | Q&A構造正しい |
| BreadcrumbList | ✅ 正常 | ページ階層正しい |
| Organization | ✅ 正常 | |
| WebPage / WebSite | ✅ 正常 | |

**軽微な重複（致命的ではない・余裕があれば対応）:**
- WebSite+Organization: トップで2回出力（SEOプラグイン + テーマ/別プラグイン）
- BreadcrumbList: 下層ページで2回出力（同上）
- LocalBusiness: 全拠点が全ページに出力（拠点ページは当該拠点のみにすべき）
- FAQPage: /rental/にもトップと同一FAQ出力（同一FAQ重複はGoogle非推奨）

**SSL証明書期限切れ** — 相沢さんに連絡して更新依頼が必要

## デプロイ結果（2026-04-15）

- LocalBusiness: 10拠点全て出力
- Service: 3本（レンタル・鈑金・中古車）出力
- FAQPage: 出力
- 既存スキーマ（BreadcrumbList/Organization/WebPage/WebSite）: 維持

## 次のアクション（残タスク）

1. GTM3重読込の統合（コンテナID確認後）
2. header.phpのハードコード`<title>`削除（AIOSEOに委任）
3. 鈑金塗装ページのコンテンツ拡充（要コンテンツ作成）
4. Google構造化データテストツールで検証 → LocalBusinessスキーマ発火確認

## 旧サーバー情報（使えなくなった可能性あり）

- FTP: svw06.server-can.net / jhuv52pz / f8R=a*(8
- Plesk: https://svw06.server-can.net:8443（PHP設定変更権限なし）

## サーバー移行の経緯

- 4/11: opcache問題でSEOコード発火せず → PHP-FPM再起動依頼メール作成
- 4/15: 相沢さんから「新サーバーのウェブサイト確認の件、サーバー側の作業完了」メール
- DNS確認でIPが旧サーバーと異なることを確認 → サーバー移行だった

## 鈑金ページ調査結果（2026-04-15 KIRYU調査）

- URL: https://a-truck.jp/repair/
- テキスト量: **約1,200文字（極端に薄い・最低2,000-3,000文字必要）**
- 画像: 53枚（before/after事例は充実）
- h1: 英語のみ「REPAIR & CUSTOMIZATION」→ SEO弱
- FAQ: JSON-LDに2問あるが画面上に非表示
- 代車料金表: 画像のみ（クローラー読めない）

**不足要素:** 料金目安 / 対応車種一覧 / 対応メーカー一覧 / FAQ画面表示 / お客様の声 / 保険対応説明 / 対応エリア / 実績数

## 関連ファイル

- seo/a-truck-seo-report-20260406.md — SEO診断レポート
- seo/a-truck-php-fpm-restart-request.md — 再起動依頼メール文案
- seo/atruck-seo-enhance.php — mu-plugin版（未使用）
- session-logs/2026-04-11_1700_atruck-seo-opcache-investigation.md
- session-logs/2026-04-11_1650_atruck-seo-deploy.md
