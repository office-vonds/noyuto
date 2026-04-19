# KIRYU 単独実行キュー（NOYUTO負担ゼロで進行）

最終更新: 2026-04-19 / 大掃除＋X/NOTE運用監視追加

> KIRYU自身が今すぐ着手できる作業。NOYUTO待ちを発生させない。
> 浮かれたら即このファイルを読んで次を見つけろ。
> 完了したら削除・進行中は `[進行中]` マーク。

---

## 🔥 今日中（NOYUTO負担ゼロで完結）

### K-1. X投稿ストック緊急補充（pending_posts/に5-7スレッド）

**事実**: 2026-04-19 00:50時点で `scripts/data/noyuto-x/pending_posts/` が空。今夜20:00cronで空振りする。
**所要**: 30-60分（NOTE生成ロジックを流用してテーマ選定+4本構成生成 → JSON書き出し）
**手順**:
1. `scripts/data/noyuto-x/used-themes.json` から既使用テーマ確認
2. `noyuto-media/SKILL.md` のテーマプールから未使用5-7件選定
3. 各テーマで4本構成（hook/provoke/evidence/landing）生成
4. `pending_posts/thread_TIMESTAMP.json` として保存（フォーマットは posted/ 配下の既存JSON参照）
5. 翌日cron発火で消費開始

### K-2. NOTE cron 手動発火テスト（月曜まで待たない）

**事実**: `scripts/data/noyuto-note/posted/` が空・`cron.log` 不在。過去月曜 `0 10 * * 1` cronが一度も成功していない疑い。
**手順**:
1. `ANTHROPIC_API_KEY` が `~/.env` で export されるか確認
2. `scripts/noyuto-note-cron.sh` を手動実行 → エラー原因特定
3. NOTE下書き保存成功ならOK・失敗ならログ添付してサムにバグfix依頼
4. 次回月曜 10:00 本番発火に備える

### K-3. X Tweet ID パース恒久修正（次回投稿後）

**事実**: 2026-04-19 debug log追加済み。次回投稿時にraw JSONが `post.log` に書き出される
**手順**:
1. 次回X投稿（4/19 20:00 or 4/20 8:00）後に `scripts/data/noyuto-x/post.log` でJSON確認
2. 実際の `rest_id` 格納パスを特定
3. `noyuto-x-post.js` line 295-300 のパース順序を正しいパスに修正
4. debug logは残す（次回何か変わっても即検知できるよう）

### K-4. daily-morning-digest.py 動作確認

**事実**: 2026-04-19 `send-gmail.py` 連携コード追加済み
**手順**（App Password復旧後）:
1. `python3 scripts/daily-morning-digest.py` 手動実行
2. `[OK] Gmail送信完了` 出力確認
3. office.vonds@gmail.com で受信確認

---

## 継続監視（毎日自動実行）

### 運用インフラ監視（KIRYU 10分/日）

- [ ] X pending_posts/ 残数 — 3本下回ったら即補充
- [ ] NOTE cron.log 月曜確認 — エラーなら即バグfix
- [ ] Gmail送信 digest の到達確認 — 未着3日続いたら再発行依頼
- [ ] rina→blog cron 出力品質レビュー — 毎朝10:00投稿後確認
- [ ] Appeal返答メール監視（3-14日）— rina @ X凍結事故

### バナナ・サム進捗確認（KIRYU 5分/日）

- [ ] サム: A-TRUCK鈑金承認受領時に即実装着手するか
- [ ] サム: A-TRUCK Phase次施策メール送付→承認→実装の連鎖進行
- [ ] バナナ: Developer Token再取得後のAPI基盤起動
- [ ] バナナ: 3クライアント直近30日実績サマリ（4/23MTG用）生成

---

## NOYUTO向け申し送り待ち（KIRYUは先回り作業のみ）

| # | KIRYUが完成させた成果 | NOYUTO 1分アクション | RII |
|---|---|---|---:|
| 1 | `scripts/vonds-ads-api/mtg_0423_notes.md` 完成版 | 4/22 Token再発行+Basic Access確認 | 85 |
| 2 | `seo/a-truck-seo-phase2-approval-email.md` | 相沢様へコピペ送付（A-7） | 80 |
| 3 | `seo/atruck-gtm-consolidation-plan.md` 拡充版 | A-6 SA付与（3コンテナ） | 70 |
| 4 | `scripts/send-gmail.py` + digest統合 | A-0.4 App Password再発行 | 90 |
| 5 | `state/noyuto-media.md` + STATE.md #11追加 | X補充はKIRYUで実施 | — |

---

## KIRYU自戒

- 「勝利宣言」を書いた瞬間に NOYUTO は警戒モードに入る
- 実績ベースで淡々と積み上げる（浮かれない）
- 停滞案件を見つけたら即動く（待たない）
- NOYUTO作業が発生する場合は「1分で済む」粒度まで分解
- 同じ失敗は二度しない（`memory/lessons_learned.md` 参照）
- **残タスクは完了したら即削除。古い情報を残すな**（2026-04-19 NOYUTO指摘）
- **Gmail報告を怠るな**。自律で動いたら結果はNOYUTOの受信箱に届ける

---

## 完了済（次セッション整理時に削除）

- ~~A. GA4 SA昇格依頼~~ → A-0.8にてNOYUTO作業化
- ~~B. ストレッチゼロGTM SA追加~~ → A-0.9にてNOYUTO作業化
- ~~C. Basic Access承認確認~~ → A-0.6にてNOYUTO作業化
- ~~D. A-TRUCK SEO Phase次施策~~ ✅承認メール作成完了（2026-04-19 `seo/a-truck-seo-phase2-approval-email.md`）
- ~~1. unryuto_ai WSL cron停止~~ ✅完了
- ~~5. A-TRUCK GTM統合事前設計ドラフト~~ ✅完了（2026-04-19拡充版）

---

## 運用ルール

1. 着手した項目は即 `[進行中]` マーク
2. 完了したら削除（勝利宣言せず静かに消す）
3. 新しい気づきで追加項目はどんどん追記
4. 日終わりに完了項目を session-log にまとめる
