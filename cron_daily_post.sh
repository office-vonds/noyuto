#!/bin/bash
# 毎朝cronで実行: インフルエンサー分析 + オリジナル投稿生成 + 引用リポスト候補検索 → Gmail通知
cd ~/projects/vonds

LOGFILE=~/claude_cron_post.log
OUTFILE=~/projects/vonds/daily_report.txt
DATE=$(date +%Y/%m/%d)

echo "=== $DATE 実行開始 ===" >> "$LOGFILE"

# ステップ0: インフルエンサー構造分析（週1回: 月曜のみ）
if [ "$(date +%u)" = "1" ]; then
    python3 analyze_influencers.py --update-prompt >> "$LOGFILE" 2>&1
fi

# ステップ1: 引用リポスト候補検索（Python直接実行、MCP不要）
QUOTES=$(python3 search_quotes.py --top 5 2>/dev/null)

# ステップ1.5: リプライ候補検索＋生成
REPLIES=$(python3 search_reply_targets.py --section --no-email 2>/dev/null)

# ステップ2: Claude Codeで投稿文を生成（Gmail送信はしない）
POST=$(/home/noyuto/.local/bin/claude --print "
以下の手順を実行し、結果をテキストで出力してください。Gmailは送信しないでください。

【ステップ1: オリジナル投稿生成（スレッド4本）】
1. auto_generate.py を引数なしで実行してランダムなテーマを取得
2. prompts/noyuto_persona.txt を読み、そのテーマでNOYUTOとしてXスレッド4本を生成
   - 1本目: フック（断定・インパクトでスクロールを止める）
   - 2本目: 煽り（反論を先回りして挑発する）
   - 3本目: 根拠（体験・事実で証明する）
   - 4本目: 着地（答えは出さず問いで終わる）
3. prompts/learned_patterns.txt を読み、構造パターンを参考にする
4. generate_post.py --topic テーマ --text 生成文 で保存

以下のフォーマットで出力してください:

テーマ: （テーマ名）
構造パターン: （使用した構造）

【1/4 フック】
（投稿文）

【2/4 煽り】
（投稿文）

【3/4 根拠】
（投稿文）

【4/4 着地】
（投稿文）
" 2>>"$LOGFILE")

# ステップ3: レポートをファイルに保存
cat > "$OUTFILE" << REPORT_EOF
━━━━━━━━━━━━━━━━━━
【NOYUTO日報】$DATE
━━━━━━━━━━━━━━━━━━

■ 本日のオリジナル投稿案（スレッド4本）
━━━━━━━━━━━━━━━━━━
$POST

━━━━━━━━━━━━━━━━━━
■ 引用リポスト候補 TOP5
━━━━━━━━━━━━━━━━━━
$QUOTES

$REPLIES

━━━━━━━━━━━━━━━━━━
■ 使い方
━━━━━━━━━━━━━━━━━━
【投稿】承認する場合は approve_post.py を実行
【引用RT】URLを開いて引用リポスト
【リプライ】URLを開いてパターンA or Bをコピペ→送信
REPORT_EOF

# ステップ4: Gmail送信（Python直接、MCP不要）
python3 send_gmail.py \
    --to office.vonds@gmail.com \
    --subject "【NOYUTO日報】本日の投稿案＋引用リポスト候補（$DATE）" \
    --body-file "$OUTFILE" >> "$LOGFILE" 2>&1

# Gmail送信失敗時のフォールバック: ファイルは残るので手動確認可能
if [ $? -ne 0 ]; then
    echo "Gmail送信失敗。レポートは $OUTFILE に保存済み" >> "$LOGFILE"
fi

echo "=== $DATE 実行完了 ===" >> "$LOGFILE"
