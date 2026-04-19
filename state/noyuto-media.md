# NOYUTO Media (X/NOTE) 戦略状態

最終更新: 2026-04-19 / 更新者: KIRYU（自律監査）
スキル: `.claude/skills/noyuto-media/SKILL.md`

---

## 🚨 2026-04-19 現在の緊急事項

### 1. X投稿ストック切れ（次回8:00で空振り）

- `scripts/data/noyuto-x/pending_posts/` が**存在しない or 空**
- 今朝8:00で最後の1スレッド投稿（4本）→ ストック0本
- 次回cron発火（4/19 20:00）で何も投稿されない
- **即時対応必要**: pending_posts/ に新スレッド生成（KIRYU or サム or 手動）

### 2. NOTE週次記事が一度も生成されていない

- `scripts/data/noyuto-note/posted/` **空**
- `scripts/data/noyuto-note/cron.log` **不在**（cron発火の痕跡ゼロ）
- 最近の月曜10:00（4/13, 4/14?）cronが何らかの理由で失敗 or 未起動
- 次回: 2026-04-20(月) 10:00 が次のチャンス
- **即時対応必要**: cron手動発火テスト or 週明け月曜まで待って動作確認

### 3. X Tweet ID が全て "unknown"

- 本日3投稿（X.com/noyuto）全てのTweet ID が取得失敗
- URL追跡不可（`https://x.com/noyuto/status/unknown`）
- 2026-04-19 KIRYUがdebug log追加済み（line 294-306） → 次回投稿時にraw JSONが保存される
- 次回投稿後ログ確認 → 正しいパース位置判明 → 恒久修正

---

## スケジュール（cron設定）

| スケジュール | コマンド | 用途 |
|---|---|---|
| `0 8,20 * * *` | `scripts/noyuto-x-cron.sh` | X毎日朝8時・夜20時 |
| `0 10 * * 1` | `scripts/noyuto-note-cron.sh` | NOTE毎週月曜10時 |
| `0 7 * * *` | `scripts/daily-morning-digest.py` | 朝7時ダイジェスト |

## 関連ファイル

| パス | 役割 |
|---|---|
| `scripts/noyuto-x-post.js` | X投稿本体（Cookie方式・GraphQL API・本日Tweet ID取得bug修正中） |
| `scripts/noyuto-x-cron.sh` | X投稿cron wrapper |
| `scripts/noyuto-note-generate.js` | NOTE下書き保存（note.com UI経由） |
| `scripts/noyuto-note-cron.sh` | NOTE生成cron wrapper |
| `scripts/data/noyuto-x/pending_posts/` | 投稿待ちJSONスレッド在庫 |
| `scripts/data/noyuto-x/posted/` | 投稿済みアーカイブ |
| `scripts/data/noyuto-x/used-themes.json` | 使用済みテーマ記録（重複回避） |
| `scripts/data/noyuto-x/cron.log` | cron実行ログ |
| `scripts/data/noyuto-x/post.log` | 投稿詳細ログ |

## 認証

- X: Cookie方式（`~/credentials/x-noyuto.env` の `auth_token` / `ct0`）
- NOTE: `ANTHROPIC_API_KEY` (~/.env) + note.com Cookie
- Gmail送信（ダイジェスト用）: `~/credentials/gmail-app-password.txt` ※**App Password失効中**

## pending_posts スレッド生成の流れ

1. テーマ選定（`used-themes.json` で重複回避）
2. 4本構成で生成（hook / provoke / evidence / landing）
3. JSON で `pending_posts/thread_TIMESTAMP.json` に保存
4. cron発火時に `noyuto-x-post.js` が読み込み → 投稿 → posted/ へ移動

## 直近の完了

- 2026-04-17 11:03 noyuto-note-cron.sh 整備
- 2026-04-17 11:54 noyuto-x-post.js 最新更新（本日まで稼働）
- 2026-04-19 00:00 本日分X 1スレッド投稿（4本連投・Tweet ID unknown）
- 2026-04-19 00:50 KIRYU: Tweet IDデバッグログ強化（`json.create_tweet.tweet_results.result.rest_id`以外のパスも試行）

## 次のアクション

### 緊急（本日中）

- [ ] **X pending_posts/ に新スレッド5-7本ストック**（1週間分・KIRYU or サム）
- [ ] NOTE cron手動発火テスト（月曜まで待たずに動作確認）
- [ ] Gmail App Password再発行（NOYUTO 1分作業）→ daily-digest送信有効化

### 今週中

- [ ] 次回X投稿後ログでTweet ID正しいパース位置確認 → 恒久修正
- [ ] NOTE初回投稿（月曜10:00）が成功したか確認
- [ ] X/NOTE両方の週次エンゲージメント測定フロー構築

### 継続監視

- pending_posts残数が3本を下回ったら補充cronで自動生成するフローの検討
- Tweet ID欠損時のSlack/Gmail通知

## noyuto-media スキルとの関係

`.claude/skills/noyuto-media/SKILL.md` — X/NOTE戦略・KPI・収益化モデルの全体設計書。
このstateは「運用インフラの現在地」を追跡。戦略はスキル側、実装はstate側で分担。
