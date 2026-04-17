# セッションログ: 2026-04-17 20:40 rina投稿パイプラインCookie移行

- ブランチ: main
- 指示元: NOYUTO
- 指揮: KIRYU

## NOYUTO指示

> rinaの投稿が60件ストック→未投稿など、現プロジェクトの稼働スピードの停滞を何とかしろ

## 事実診断

両アカウントとも401で完全停止中:

| アカウント | 認証方式 | ストック（未投稿） | 失敗原因 |
|---|---|---|---|
| @rina_xxxfree | X API v2 (tweepy) | 55本 | API key 401（X API課金化影響） |
| @unryuto_ai | Cookie | 6本 | Cookie期限切れ 401 |

rina本日8時投稿も401。unryuto本日20時投稿も401。両方同時期に切れた。

## 対応（完了）

### 1. rina を X API → Cookie方式に移行

- `rina/x-cookie-post.js` 新規作成（`unryuto/x-posts/x-cookie-post.js` ベース・JSON stock対応）
- `rina/cron_daily_post.sh` 書き換え（`post_tweet.py` → `node x-cookie-post.js`）
- エンゲージメント(engage.py)は401未解決のため一時停止
- テスト: `--count` で 60本/55本未投稿を正常認識

### 2. NOYUTO向け1分手順書

- `tasks/noyuto-cookie-setup.md` 新規
  - Chrome DevTools → Cookies → auth_token + ct0 コピー手順
  - 両アカウント分のWSLコマンド
  - 認証成功確認メッセージ
  - Cookie有効期限の目安（1-3ヶ月）と週次健康診断案
- `tasks/noyuto-1min-actions.md` に A-0.5 として最優先タスク追加

### 3. 投稿頻度加速の選択肢提示

| 案 | rina時刻 | 消化日数 | リスク |
|---|---|---|---|
| 現状 | 朝8 | 55日 | 極低 |
| 推奨 | 朝8+夜20 | 28日 | 低 |
| 加速 | 3回/日 | 19日 | 中 |

NOYUTO判断待ち。

## 現在の状態

- **実装完了・NOYUTOのCookie取得1分作業待ち**
- 両方のCookie登録後、即投稿再開可能
- 61本のストックが動き出す

## 次のアクション

1. **NOYUTO**: `tasks/noyuto-cookie-setup.md` 1分実行（2アカウント分）
2. **KIRYU**: Cookie登録後、dry-run検証 → 即1本投稿テスト → 問題なければ投稿頻度加速提案
3. 追加提案: Cookie週次健康診断cron・ストック残5本アラート

## 学び

- X API v2 無料/Basicプランはスパム判定と課金で実質使用不能
- Cookie方式のほうが安定（ただし1-3ヶ月で期限切れ）
- **両アカウント同時切れ**現象は今後も起きる → 週次健康診断の仕組み化が必要

## 関連ファイル

- rina/x-cookie-post.js（新規）
- rina/cron_daily_post.sh（書き換え）
- tasks/noyuto-cookie-setup.md（新規）
- tasks/noyuto-1min-actions.md（A-0.5追加）
