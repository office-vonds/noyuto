# CLAUDE.md - 本気ストレッチLP プロジェクト指示書
# NOYUTO（Claude Code）向け作業マニュアル

## プロジェクト概要
- クライアント：SANKEN株式会社（中込社長）
- 案件名：本気ストレッチ 甲府上阿原店 LP制作
- 管理：株式会社オフィスVONDS（小沢）

## サーバー情報
- ドメイン：majistretch.com
- サーバー：WPXサーバー sv1092.wpx.ne.jp
- FTPホスト：sv1092.wpx.ne.jp
- FTPアカウント：majistretch.com
- FTPパスワード：uv3ihpxcmhlg
- サーバーIP：183.181.91.93

## ディレクトリ構成
- ~/noyuto/majistretch/tasks/ → 作業指示ファイルを置く場所
- ~/noyuto/majistretch/files/ → アップロード用ファイル置き場

## FTPアップロード手順
Cloudflare経由ダウンロードはHTMLが破損するため、必ずFTPで直接アップロードする。
```bash
ftp sv1092.wpx.ne.jp
# user: majistretch.com
# pass: uv3ihpxcmhlg
# アップロード先: /majistretch.com/public_html/
```

## 子ページURL構成（アップロード済み）
- https://majistretch.com/privacy/
- https://majistretch.com/tokushoho/
- https://majistretch.com/terms/
- https://majistretch.com/faq/
- https://majistretch.com/company/

## GTM情報（未作成・今後設定）
- 買取コンシェルジュ（GTM-ML88PJXH）と同様の設計で新規作成予定
- data-gtm属性はコーダー（シン）実装済み

## 作業ルール
- タスクは tasks/ 以下の .md ファイルで受け取る
- 完了したタスクは tasks/done/ に移動する
- 作業完了後は必ず git add . && git commit && git push する
- 確認が必要な場合は tasks/pending.md に記録する
