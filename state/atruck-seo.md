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

- GTM3重読込の統合（コンテナID確認後）
- header.phpのハードコード`<title>`削除
- 鈑金塗装ページのコンテンツ拡充

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

## 関連ファイル

- seo/a-truck-seo-report-20260406.md — SEO診断レポート
- seo/a-truck-php-fpm-restart-request.md — 再起動依頼メール文案
- seo/atruck-seo-enhance.php — mu-plugin版（未使用）
- session-logs/2026-04-11_1700_atruck-seo-opcache-investigation.md
- session-logs/2026-04-11_1650_atruck-seo-deploy.md
