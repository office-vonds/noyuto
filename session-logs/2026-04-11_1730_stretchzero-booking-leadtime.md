# セッションログ: 2026-04-11 17:30 ストレッチゼロ予約フォーム リードタイム制限

- ブランチ: main
- 担当: Claude Opus 4.6

## 依頼
`stretchzero.jp/contact/` の予約フォームで「ご希望日時」（第1〜第3希望）を、現在時刻から3時間後以降しか選択できないように制限する。

## 現地フォーム構造（CF7 フォームID:1354）
- `your-date1/2/3` : `<input type="date">`
- `your-time1/2/3` : `<select>`（30分刻み 09:00〜21:00）

## 実装
新規 mu-plugin を追加（既存 `stretchzero-booking.php` と衝突なし・責務分離）。

- ファイル: `scripts/stretchzero-booking-system/cf7-booking-lead-time.php`
- 本番配置: `/stretchzero.jp/public_html/wp-content/mu-plugins/stretchzero-booking-leadtime.php`
- アップロード: curl FTPS / HTTP 226 / 4278 bytes

### 中身
1. `/contact/` ページのフッターに JS を出力
   - `your-date1/2/3` の `min` を「今日（= 現在時刻 + 3h の日付）」にセット
   - 選択日が「今日」のとき、時間 select の 3h 未満スロットを `disabled`
   - 選択日が過去なら全スロット `disabled`
   - 1分ごとに再評価（開きっぱなし対策）
2. サーバー側バリデーション（`wpcf7_validate_select`）
   - 第1希望は必須：日付+時間の結合が `now + 3h` 未満ならエラー
   - 第2/第3希望は入力時のみチェック
   - タイムゾーン: `Asia/Tokyo`
   - エラーメッセージ: 「現在時刻から3時間後以降の日時をご選択ください。」

### 定数
- `SZ_LEAD_HOURS = 3`
- `SZ_FORM_ID = 1354`

## 本番反映確認
- `curl https://stretchzero.jp/contact/` で `LEAD_HOURS = 3` と `applyConstraints` を検出済み
- mu-plugin ディレクトリ listing で 4278 bytes 配置確認

## 現在の状態
完了。NOYUTO による実機 UI 目視チェック推奨。

## 次にやること
- NOYUTO 実機確認（スマホ Safari / PC Chrome 両方で date picker 最小値と time 選択肢の disable 挙動）
- 問題あれば `SZ_LEAD_HOURS` 変更のみで調整可能
