# セッションログ: 2026-04-11 A-TRUCK SEO opcache 問題調査＋修正

- **担当**: Claude Opus 4.6
- **クライアント**: 株式会社A-TRUCK (https://www.a-truck.jp/)
- **サーバー**: svw06.server-can.net (Plesk + nginx + PHP 7.4.33)
- **状態**: **A-TRUCK クライアントへの PHP-FPM 再起動依頼メール待ち**（本日作業完了）

## 発見の経緯（時系列）

### Phase 1: mu-plugins 方式で実装
- `/tmp/atruck_work/atruck-seo-enhance.php` に LocalBusiness / Service / 画像alt / 日本語URL 301 を実装
- mu-plugins として `/httpdocs/wp/wp-content/mu-plugins/atruck-seo-enhance.php` にアップロード
- **全く発火せず**。HTMLに何も出力されない

### Phase 2: PSN キャッシュクリア試行
- NOYUTO が WP管理画面から PSN Clear Cache 実行
- レスポンスヘッダーから Cache-Control 消失 → PSN は確かにクリアされた
- でも mu-plugins は依然非稼働
- HTMLコメントマーカーも、JSON-LDマーカーも出力されない

### Phase 3: 通常プラグイン方式へ切替
- `/wp-content/plugins/atruck-seo-enhance/` と `/wp-content/plugins/atruck-seo-enhance.php` の2形式で配置
- WP管理画面の「インストール済みプラグイン」一覧に**出現しない**
- ブラウザハードリフレッシュ・強制再チェック URL 試行も効果なし

### Phase 4: FTP-Web パス同期検証
- `themes/fcvanilla/style.css` (39B md5=5723e49f...) を FTP と Web で取得して比較
- `themes/fcvanilla/img/common/header_logo.png` も同様
- **完全一致**（ハッシュまで一致） → FTP と Web は同じファイルを見ている
- ただし `/plugins/` と `/mu-plugins/` 配下への直接Webアクセスは nginx でブロック（セキュリティ・正しい設計）

### Phase 5: functions.php 既存コード発見
- 既存の `/themes/fcvanilla/functions.php` に **atruck_* 関数が8個既に定義されている**ことを発見:
  - `atruck_localbusiness_schema` (L467)
  - `atruck_service_schema` (L499)
  - `atruck_noindex_test_pages` (L513)
  - `atruck_fix_aioseo_title` (L524)
  - `atruck_fix_aioseo_description` (L541)
  - `atruck_fix_aioseo_og_title` (L555)
  - `atruck_fix_aioseo_og_description` (L569)
  - `atruck_faq_schema` (L584)
- NOYUTO 確認: 過去に別Claudeが作業していた残骸
- メモリ上の「functions.php ロールバック済み」情報は**誤り**（実際にはロールバックされていなかった）

### Phase 6: 根本原因特定
- phply で functions.php をパース → **L4 で `illegal character` エラー**
- L4: `add_theme_support(‘post-thumbnails’);` ← **全角クォート**（PHPシンタックスエラー）
- しかし本番サイトは正常動作中

**論理的結論**: 現在の functions.php ファイルは PHP パースエラーで実行不可能。それでもサイトが動いているということは、**opcache が過去の（全角クォート問題が無かった時代の）bytecode を保持し続けている**。Plesk の本番PHP設定では `opcache.validate_timestamps=0` が一般的で、ファイル更新を検知しない。

これで全ての謎が解ける：
- mu-plugins 非発火: opcache に新ファイルのキャッシュが無い
- plugins 新規検出無し: 同上
- functions.php の atruck_* 8関数非発火: opcache の古い bytecode には無い関数
- AIOSEO 等の既存プラグイン動作: opcache 保持中の bytecode にあるので動く

### Phase 7: 修正＋opcache バイパス配置
1. functions.php の L4 全角クォートを半角に修正（他658行完全不変）
2. phply で parse OK 確認（58 top-level statements）
3. サーバー側タイムスタンプ付きバックアップ `functions.php.bak-20260411-before-fix` 作成
4. 修正版アップロード（md5 検証一致）
5. `/httpdocs/wp/.user.ini` に以下を配置して opcache 自動再検証を促進:
   ```
   opcache.validate_timestamps=1
   opcache.revalidate_freq=0
   ```
6. **PHP の user_ini_cache_ttl = 300秒 デフォルト**のため、5分後に自動適用

### Phase 8: 5分待機中（現在）
- バックグラウンドで5分タイマー稼働
- 完了時に全主要ページを curl で検証
- LocalBusiness / Service / FAQPage スキーマ出力確認
- 各ページHTTPステータス確認

## 現在の本番状態
- functions.php: 修正版アップ済み（parse error 解消・L4 半角化のみ）
- `.user.ini`: 配置済み（opcache 再検証強制）
- 既存 mu-plugins / plugins / uploads の俺の残骸は全削除済み
- サーバー側バックアップ: `functions.php.bak-20260411-before-fix`
- ローカルバックアップ2世代: `/tmp/atruck_backup_20260411_1640/` / `/tmp/atruck_functions_backup_20260411_180633/`
- サイト動作: 全ページ 200 OK（古い opcache bytecode で稼働中）
- atruck_* 関数出力: **未反映**（opcache リロード待ち）

## ロールバック手順（全段階）

### レベル1: functions.php 修正前に戻す（最も穏当）
```bash
python3 <<PY
from ftplib import FTP
ftp = FTP('svw06.server-can.net', timeout=30)
ftp.login('jhuv52pz', 'f8R=a*(8')
ftp.cwd('/httpdocs/wp/wp-content/themes/fcvanilla')
# サーバー側バックアップから復元
import io
buf = io.BytesIO()
ftp.retrbinary('RETR functions.php.bak-20260411-before-fix', buf.write)
bio = io.BytesIO(buf.getvalue())
ftp.storbinary('STOR functions.php', bio)
ftp.quit()
PY
```

### レベル2: `.user.ini` 削除（opcache 自動再検証を止める）
```bash
python3 <<PY
from ftplib import FTP
ftp = FTP('svw06.server-can.net', timeout=30)
ftp.login('jhuv52pz', 'f8R=a*(8')
ftp.delete('/httpdocs/wp/.user.ini')
ftp.quit()
PY
```

### レベル3: ローカルバックアップから完全復元
- `/tmp/atruck_backup_20260411_1640/fcvanilla/` にテーマ全ファイル
- 必要なファイルだけFTPで戻す

## 次のアクション

### 5分タイマー完了時の判定ロジック

| 検証結果 | 解釈 | 次アクション |
|---|---|---|
| LocalBusiness出力 ≥ 1 | opcacheリロード成功・関数発火 | **完了報告**・コミット・メモリ更新 |
| LocalBusiness = 0 かつ HTTP 200 | opcache 依然古い bytecode 維持 | 別手段検討（B案 PHP-FPM restart 等） |
| HTTP 500 or 非200 | 新functions.php読まれたがエラー | **即ロールバック**（レベル1） |
| 部分的500 | ページによってOK/NG | エラー箇所特定・対応 |

## 重要な学び（次回のため）

1. **Plesk本番サーバーでは opcache.validate_timestamps=0 がデフォルト想定**
2. **FTPでファイル更新しても PHP 再読込されない**（PHP-FPM restart か .user.ini 必要）
3. **mu-plugins / plugins / functions.php すべて同じ opcache 機構に依存**
4. **サイトが動いているのに最新コードが反映されない場合は opcache を最初に疑う**
5. **phply が本番デバッグの強力な武器**（構文エラー検出・関数定義抽出）

## メモリ更新候補（作業完了後）

- `reference_atruck_opcache.md` — Pleskサーバーの opcache 挙動と対処手順
- `feedback_verify_with_phply.md` — 本番PHP改修前にphplyでparse検証するルール
- `project_atruck_seo.md` 更新 — ロールバック済みが実は誤りだった件の修正

## 関連ファイル

- `seo/atruck-seo-enhance.php` — 今日作った plugin 版（今回は未使用に終わる見込み）
- `seo/a-truck-seo-custom-fcvanilla.php` — 過去に作られた mu-plugin 版
- `/tmp/atruck_work/functions-fixed.php` — 修正版 functions.php
- `/tmp/atruck_backup_20260411_1640/` — フル テーマバックアップ 62MB
- `/tmp/atruck_functions_backup_20260411_180633/` — タイムスタンプ付き functions.php バックアップ

## PHP-FPM restart 代替手順（5分待機で効かなかった場合）

Plesk管理パネル経由:
1. https://svw06.server-can.net:8443 にログイン（`jhuv52pz` / `f8R=a*(8`）
2. ドメイン `a-truck.jp` 選択
3. **PHP設定** or **ホスティング設定**
4. PHP バージョン 7.4.33 の **「適用」**ボタン
5. それでも効かなければ PHP バージョンを **7.4 → 8.0 → 7.4** に往復（要互換性確認）

---

## Phase 9: 5分待機結果（2026-04-11 18:36頃）

- **結果: 変化なし**（LocalBusiness=0・opcache依然古いまま）
- `.user.ini` の `user_ini.cache_ttl=300秒` が効いていないか、Plesk設定で `.user.ini` 読込が無効化されている

## Phase 10: Plesk A案試行（PHP設定「適用」ボタン）

- NOYUTO が Plesk管理画面 → PHP設定 → 「適用」クリック
- **結果: 変化なし**（同様に opcache 古いまま）
- Plesk の「適用」ボタンは**設定変更が無いと PHP-FPM reload しない**仕様

## Phase 11: 核心発見（PHPバージョンと権限）

Plesk PHP 設定画面から新発見:

1. **PHPバージョン = 8.4.19**（メモリ上の「7.4.33」情報は古い）
2. **opcache.enable = on**（デフォルト）
3. **disable_functions = opcache_get_status**（opcache関数がサーバーレベル無効化）
4. **pm.max_requests = 0**（ワーカー永続・再起動なし）
5. **NOYUTO権限で PHP設定変更不可**（画面表示はできるがクリックしても編集できない）
6. Plesk ヘルプ文書記載: 「契約の設定次第で管理できない可能性あり」

**結論**: **jhuv52pz アカウントのPlesk契約レベルでPHP設定変更権限が無い**。FTP経由では opcache をリセットする手段が完全に尽きた。

## Phase 12: A-TRUCKクライアントへの依頼方針へ切替（最終）

### 実行した最終クリーンアップ
- `/httpdocs/wp/.user.ini` 削除（効かず担当者混乱の元）
- `/wp-content/mu-plugins/` 削除済み
- `/wp-content/plugins/atruck-*` 削除済み
- `/wp-content/uploads/atruck-verify.txt` 削除済み
- **残した**: `functions.php`（修正版・parse error 解消・29,407 bytes）
- **残した**: `functions.php.bak-20260411-before-fix`（29,411 bytes）

### 依頼メール文案作成
`seo/a-truck-php-fpm-restart-request.md` にフル版・短縮版を記載

### NOYUTO側タスク
1. A-TRUCKサーバー管理者にメール送信
2. 返信・再起動実施後、俺に「再起動された」と連絡
3. 俺が即 curl 検証実行

### 先方の作業後の期待結果
PHP-FPM 再起動後、新しい functions.php の atruck_* 8関数が発火し:
- LocalBusinessスキーマ全10拠点分出力
- Serviceスキーマ3本出力
- FAQPageスキーマ出力
- AIOSEO title/description補完効果発現

---

## 現在の本番サーバー状態（メール送信前スナップショット）

```
/httpdocs/wp/wp-content/themes/fcvanilla/
├── functions.php (29,407B)    ← 修正版（L4 全角→半角）
└── functions.php.bak-20260411-before-fix (29,411B)  ← オリジナルバックアップ

/httpdocs/wp/wp-content/mu-plugins/   ← 存在せず（削除済み）
/httpdocs/wp/wp-content/plugins/atruck-*   ← 存在せず
/httpdocs/wp/wp-content/uploads/atruck-*   ← 存在せず
/httpdocs/wp/.user.ini   ← 存在せず
```

サイト動作: 全ページ 200 OK（古い opcache bytecode で稼働中）
AIOSEO + saswp 既存機能: 完全維持
