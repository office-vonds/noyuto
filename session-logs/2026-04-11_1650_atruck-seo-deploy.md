# セッションログ: 2026-04-11 A-TRUCK SEO改善 本番デプロイ

- **担当**: Claude Opus 4.6
- **クライアント**: 株式会社A-TRUCK (https://www.a-truck.jp/)
- **サーバー**: svw06.server-can.net (Plesk + nginx + PHP 7.4.33)
- **作業内容**: mu-plugins 経由でSEO強化コードをデプロイ
- **現在の状態**: **デプロイ済・キャッシュクリア待ち**（NOYUTOの手動操作待ち）

## やったこと

### Phase 1: 現状診断（GSC + curl + phply）
- GSC実データから既に出力されている要素を確認：title / description / OGP / canonical はほぼ全ページに存在（ただし一部ページでdescription欠落）
- 4/6時点の旧診断と異なり、AIOSEO + saswp による JSON-LD（Organization / WebSite / BreadcrumbList / WebPage）が既に出力済み
- LocalBusiness @type のスキーマだけ未実装、これが今回の最大機会

### Phase 2: バックアップ取得
- Python ftplib で `/httpdocs/wp/wp-content/themes/fcvanilla/` 全ファイルダウンロード
- wp-config.php / .htaccess も取得
- 保存先: `/tmp/atruck_backup_20260411_1640/` （62MB・ローカル保管・リポジトリコミットせず）

### Phase 3: mu-plugin 実装
ファイル: `seo/atruck-seo-enhance.php`（repo管理）→ 本番配置 `/httpdocs/wp/wp-content/mu-plugins/atruck-seo-enhance.php`

実装機能:
1. LocalBusinessスキーマ 全10拠点（座標・住所・電話・営業時間）
2. Serviceスキーマ 3本（レンタル / 鈑金 / 中古）
3. 画像 alt 属性自動補完（the_content / post_thumbnail_html / widget_text）
4. 日本語URL 23件の 301 リダイレクト
5. feature flag 緊急停止機能（`ATRUCK_SEO_ENHANCE_DISABLED` 定数）

実装を見送った機能（既存出力と干渉防止）:
- OGPフォールバック ── AIOSEOで既に出力済み
- title / description 上書き ── AIOSEO で管理、干渉回避
- FAQページ ── FAQ投稿タイプ既存（archive-faq.php あり）、別途活用検討
- h1改修 ── テーマテンプレート編集必要でリスク中、次回提案枠

### Phase 4: 安全デプロイ手順
1. `mu-plugins/` ディレクトリ新規作成（既存無し）
2. `placeholder-probe.php` 先行アップロード → HTTP 200 確認
3. `atruck-seo-enhance.php` 本コードアップロード（v1 → コンフリクト検証 → v2 改名 → 最終 v1 に戻す）
4. パーミッション 644 設定
5. `placeholder-probe.php` と `probe-cache-reset.php`（テーマ側のデバッグ用）削除
6. 最終クリーンアップ: `mu-plugins/atruck-seo-enhance.php` 1本のみ配置

### Phase 5: 動作検証 → キャッシュ問題発覚
- 複数回 curl で出力確認したが **ATRUCK マーカーも LocalBusinessスキーマも一切出力されない**
- 原因調査: phply でPHP構文OK / パーミッション644 / ファイル配置正常 / `X-Powered-By: PHP/7.4.33` レスポンス
- HTMLコメントが出ないのは PSN `removecomments: true` によるもの（既知・メモリ記載）
- JSON-LD スクリプトでマーカー差し替えても出力されない → **nginx fastcgi_cache or PSN HTMLキャッシュが実行結果を完全に固めている** ことが確定
- 既存の AIOSEO JSON-LD は出ているので、**WP自体は動作中だが古いHTMLをサーバー側キャッシュが返している**

## 現在の状態

- mu-plugin ファイル: 配置済み（`/httpdocs/wp/wp-content/mu-plugins/atruck-seo-enhance.php`）
- 本番出力: **未反映**（キャッシュ層で止まっている）
- 不具合: ゼロ（既存サイト動作に影響なし）
- 緊急停止: `wp-config.php` に `define('ATRUCK_SEO_ENHANCE_DISABLED', true);` 追加で全機能停止可能

## NOYUTOに依頼する作業

**いずれか1つで反映される見込み：**

1. **WP管理画面にログイン → PageSpeed Ninja → キャッシュクリア**（最推奨）
2. **Plesk管理パネルでnginxキャッシュクリア**
3. **A-TRUCK管理画面にログインして設定保存（タイムスタンプ更新でキャッシュ再生成）**

クリア後、俺が curl で動作確認してLocalBusiness/Service スキーマ出力を確認する。

## 動作確認コマンド（キャッシュクリア後に俺が実行）

```bash
V=$(date +%s)
curl -sL "https://www.a-truck.jp/?cb=$V" | grep -c "LocalBusiness\|ATRUCK:LB"
# 期待: 1以上
curl -sL "https://www.a-truck.jp/offices/osaka/?cb=$V" | grep -c "LocalBusiness"
# 期待: 1以上
```

## 緊急ロールバック手順（必要時）

```bash
python3 <<PY
from ftplib import FTP
ftp = FTP('svw06.server-can.net')
ftp.login('jhuv52pz', 'f8R=a*(8')
ftp.delete('/httpdocs/wp/wp-content/mu-plugins/atruck-seo-enhance.php')
ftp.rmd('/httpdocs/wp/wp-content/mu-plugins')
ftp.quit()
PY
```

## バックアップファイル

- `/tmp/atruck_backup_20260411_1640/` （62MB・ローカル）
- 主要: fcvanilla テーマ全ファイル + wp-config.php + .htaccess
- 次回セッションでも再取得可（FTP経由）

## 重要な発見メモ

- A-TRUCK は既に AIOSEO + saswp で **相当量の構造化データ出力済み**（Organization, WebSite, WebPage, BreadcrumbList）
- **LocalBusiness type のスキーマだけ未実装** → 今回の実装でローカルパック獲得を狙う最大機会
- nginx fastcgi_cache のTTLとPSNキャッシュの詳細は未確認（要社長Plesk権限）
- 4/6時点の診断「OGPタグ未設定」は現状改善済み（誰かが対応したか AIOSEO 更新で自動反映）

## 次にやること

1. NOYUTO にキャッシュクリア依頼（このセッション内 or 次回）
2. クリア後、curl で LocalBusiness / Service スキーマ反映確認
3. Google の構造化データテストツール（https://search.google.com/test/rich-results）で検証
4. 反映確認後、次の改善枠（AIOSEO管理画面経由での description欠落補完・title改善・h1改修）へ
