#!/bin/bash
# 毎朝cronで実行: オリジナル投稿生成 + 引用リポスト候補検索 → Gmail1通で通知
cd ~/projects/noyuto

export PATH="$HOME/.local/bin:$PATH"

/usr/bin/claude --print \
  --allowedTools "Bash,Read,Write,Edit,Glob,Grep,mcp__claude_ai_Gmail__gmail_create_draft,mcp__claude_ai_Gmail__gmail_search_messages" \
  -p "$(cat <<'PROMPT'
以下の手順をすべて実行し、最後にGmail1通にまとめて通知してください。

【ステップ1: オリジナル投稿生成】
1. auto_generate.py を引数なしで実行してランダムなテーマを取得
2. prompts/noyuto_persona.txt を読み、そのテーマでNOYUTOとしてX投稿文を生成
3. generate_post.py --topic テーマ --text 生成文 で保存
4. テーマ・投稿文・文字数を控えておく

【ステップ2: 引用リポスト候補検索】
5. python3 search_quotes.py を実行して引用リポスト候補を取得
6. 結果を控えておく

【ステップ3: Gmail通知（1通にまとめる）】
7. Gmailで office.vonds@gmail.com 宛に以下を送信：
   件名: 【NOYUTO日報】本日の投稿案＋引用リポスト候補
   本文:

   ━━━━━━━━━━━━━━━━━━
   ■ 本日のオリジナル投稿案
   ━━━━━━━━━━━━━━━━━━
   テーマ: （選ばれたテーマ）
   投稿文: （生成した投稿文）
   文字数: （文字数）
   ステータス: pending（承認待ち）

   ━━━━━━━━━━━━━━━━━━
   ■ 引用リポスト候補
   ━━━━━━━━━━━━━━━━━━
   （search_quotes.py の結果をそのまま貼り付け）

   ━━━━━━━━━━━━━━━━━━
   承認する場合は approve_post.py を実行してください。
PROMPT
)" >> ~/claude_cron_post.log 2>&1
