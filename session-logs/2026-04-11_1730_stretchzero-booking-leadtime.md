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
**完了・本番検証済（NOYUTO 実機OK 2026-04-11 18:00）**

### 実装の変遷
1. v1: disabled 属性で時間オプションを無効化 → ブラウザで見えて「9:00以降出てる」指摘
2. v2: DOM 除去方式＋日付未選択時も today 基準で絞る → 「時間選べない」指摘
3. v3: 第1希望日を auto-fill → クライアント時計が狂っていて変な挙動
4. v4: 日付未選択時は time select を無効化して「先に日付を選択」表示
5. **v5（最終）: サーバー時刻（JST）をPHPからJSに埋め込み、クライアント時計を無視して JST 固定で計算**

### 最終仕様
- PHP で `SERVER_UNIX_MS` を毎回HTMLに埋め込み（Xserverキャッシュなし確認済）
- `unixNowMs()` = `SERVER_UNIX_MS + (Date.now() - LOAD_CLIENT_MS)`
- 時刻演算は全て unix ms ベース＋JST固定（`Date.UTC() - 9h` / `unixMs + 9h` で `getUTC*`）
- 日付 `min` 属性は `firstAvailableYmd()` で「今日に有効スロットがあれば今日、なければ明日」を動的計算
- 時間 select は日付未選択時 disabled＆「先に日付を選択してください」
- 日付選択後、その日付でJST現在時刻+3h以降のスロットだけDOMに残す
- 視認性のためフォーム上部にオレンジの注意書き（`#sz-leadtime-notice`）を挿入
- サーバー側バリデーション（`wpcf7_validate_select`）も JST 固定で二重チェック

### 動作確認（NOYUTO 18:00 JST）
- 今日(4/11)を選択 → 21:00 のみ表示（20:58 < 21:00 なので唯一有効）
- 明日以降を選択 → 09:00〜21:00 全選択可

## 次にやること
- 特になし。`SZ_LEAD_HOURS` 定数で調整可能（現状 3）

## 教訓（memory化候補）
- **クライアント `new Date()` を信頼するな** — ユーザーのPC時計は狂っていることがある。サーバータイムスタンプをJSに埋め込む方式が必要
- **`<option disabled>` は頼りない** — ブラウザによっては見える・選べる。DOM から削除する方が確実
- **CF7 の date+time 分離フィールド** の制約は JS で行う必要がある（標準機能では動的制約不可）
