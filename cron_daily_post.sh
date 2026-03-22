#!/bin/bash
# 毎朝cronで実行: 投稿生成 → X自動投稿 → 引用リポスト候補検索 → SMTP Gmail通知
cd ~/projects/noyuto

export PATH="$HOME/.local/bin:$PATH"

# noyuto_persona.txt を読み込んでプロンプトに注入
PERSONA=$(cat prompts/noyuto_persona.txt)

# ステップ1: 投稿生成 + 引用リポスト候補検索
/usr/bin/claude --print \
  --allowedTools "Bash,Read,Write,Edit,Glob,Grep" \
  -p "$(cat <<PROMPT
以下のペルソナ設定に従って全ての手順を実行してください。

【ペルソナ設定】
${PERSONA}

【ステップ1: オリジナル投稿生成（X スレッド4本 + note記事1本）】
1. python3 auto_generate.py を引数なしで実行してランダムなテーマを取得
2. 上記ペルソナ設定に厳密に従い、そのテーマでNOYUTOとしてXスレッド4本とnote記事1本を生成
3. generate_post.py --full を使って一括保存する。具体的には:
   python3 generate_post.py --full --topic "テーマ" --json '{"thread":["1/4フック文","2/4煽り文","3/4根拠文","4/4着地文"],"note":"note記事本文（1500〜2000文字）"}'
   ※ Xスレッドは各投稿3〜5文・敬語・断定フック・問いで着地
   ※ note記事はXスレッドと同テーマで深掘り。冒頭・原体験・核心・経営の事実・煽り・着地の構成

【ステップ2: 引用リポスト候補検索】
4. python3 search_quotes.py を実行して引用リポスト候補を取得
5. 結果を quotes_result.txt に書き出す
PROMPT
)" >> ~/claude_cron_post.log 2>&1

# ステップ2: X自動投稿（承認不要）
python3 approve_post.py --auto >> ~/claude_cron_post.log 2>&1

# ステップ3: note自動投稿（pending_notesから最新1件）
echo "[$(date)] note投稿開始" >> ~/claude_cron_post.log
python3 post_note.py >> ~/claude_cron_post.log 2>&1
echo "[$(date)] note投稿完了" >> ~/claude_cron_post.log

# ステップ4: Gmail通知（SMTP）
python3 - <<'PYEOF'
import json, glob, os, sys, subprocess

os.chdir(os.path.expanduser("~/projects/noyuto"))

# 最新のpostedファイルを取得
posts = sorted(glob.glob("posts/*.json"), reverse=True)
post_data = None
for p in posts:
    with open(p) as f:
        data = json.load(f)
    if data.get("status") in ("posted", "pending"):
        post_data = data
        break

if not post_data:
    print("投稿データが見つかりません", file=sys.stderr)
    sys.exit(1)

status_label = "投稿済み" if post_data.get("status") == "posted" else "pending（投稿失敗の可能性あり）"
tweet_id = post_data.get("tweet_id", "なし")

# 引用リポスト候補
quotes = ""
if os.path.exists("quotes_result.txt"):
    with open("quotes_result.txt") as f:
        quotes = f.read().strip()

# note投稿結果
note_status = "（未投稿）"
note_files = sorted(glob.glob("pending_notes/*.json"), reverse=True)
if note_files:
    with open(note_files[0]) as f:
        note_data = json.load(f)
    if note_data.get("status") == "published":
        note_status = f"投稿済み: {note_data.get('url', 'URL不明')}"
    else:
        note_status = f"pending（タイトル: {note_data.get('title', '不明')}）"

body = f"""━━━━━━━━━━━━━━━━━━
■ 本日のオリジナル投稿（X）
━━━━━━━━━━━━━━━━━━
テーマ: {post_data.get('topic', '不明')}
投稿文: {post_data.get('text', '')}
文字数: {len(post_data.get('text', ''))}文字
ステータス: {status_label}
tweet_id: {tweet_id}

━━━━━━━━━━━━━━━━━━
■ 本日のnote記事
━━━━━━━━━━━━━━━━━━
{note_status}

━━━━━━━━━━━━━━━━━━
■ 引用リポスト候補
━━━━━━━━━━━━━━━━━━
{quotes if quotes else '（取得なし）'}
"""

subject = "【NOYUTO日報】本日の投稿結果＋引用リポスト候補"
result = subprocess.run(
    ["python3", os.path.expanduser("~/notify.py"), "--subject", subject, "--body", body],
    capture_output=True, text=True
)
print(result.stdout)
if result.returncode != 0:
    print(result.stderr, file=sys.stderr)
    sys.exit(result.returncode)
PYEOF
