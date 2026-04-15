---
name: catchup
description: セッション再開時に現在のプロジェクト状態を自動把握する。セッション開始時、「続きやって」「前回の続き」「catchup」等の指示時に使用。
argument-hint: "[対象プロジェクトパス（省略時はカレントディレクトリ）]"
---

# セッション復帰（/catchup）

**STATE.md は session-start hook で自動注入済み。再度読むな。**

/catchup が呼ばれた時は、STATE.md の情報（既にコンテキストにある）を元に、以下だけ実行：

1. `git status --porcelain` で未コミット変更確認（5秒）
2. STATE.md の内容を1行サマリーで出力（読み込み不要・既にある）
3. 「何をやる？」とNOYUTOに聞く

**session-logs を読むな。Notion を叩くな。Calendar を叩くな。**
必要になったらその時だけ取りに行け。
