# A-TRUCK SEO

## 現在地（2026-04-15更新）

- **状態**: サーバー移行済み — SEOコード再デプロイ待ち
- **旧サーバー**: svw06.server-can.net (IP: 218.216.115.36) — ここにSEOコードをアップした
- **新サーバー**: IP 218.216.115.31 (www) / 218.216.115.70 (naked) — 相沢さん連絡で移行完了
- **PHP**: 本番レスポンス X-Powered-By: PHP/7.4.33
- **functions.php**: 旧サーバーに修正版あり。新サーバー未確認

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

## 次のアクション

1. **相沢さんから新サーバーFTP/Plesk情報取得**（NOYUTO依頼）
2. 新サーバーのfunctions.phpを確認（SEOコード有無）
3. 無ければ再デプロイ → 新サーバーならopcache問題なしで即反映の可能性大
4. curl検証 → LocalBusinessスキーマ発火確認

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
