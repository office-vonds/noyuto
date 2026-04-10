#!/bin/bash
# NOYUTO X/NOTE 結果ファースト戦略 cron パイプライン
# 戦略: テキスト=短いフック / カード画像=本体 / NOTE=金化
# 朝7:15 = NOTE生成・投稿 + X単発1本目
# 夜21:30 = X単発2本目（朝のNOTE URL再利用・別角度）

set -u
cd ~/projects/vonds

LOGFILE=~/claude_cron_post.log
OUTFILE=~/projects/vonds/daily_report.txt
NOTE_URL_FILE=~/projects/vonds/daily_note_url.txt
ALERT_FLAG=~/projects/vonds/cron_alert.flag
DATE=$(date +%Y/%m/%d)
TIME_SLOT="${1:-morning}"

mkdir -p posts pending_notes assets/cards
: > "$ALERT_FLAG"  # リセット

log() { echo "[$(date +%H:%M:%S)] $*" >> "$LOGFILE"; }
alert() { echo "$*" >> "$ALERT_FLAG"; log "ALERT: $*"; }

log "=== $DATE [$TIME_SLOT] 実行開始 ==="

# ============================================================
# ステップ0: 環境チェック
# ============================================================
for f in assets/fonts/NotoSansJP-Bold.otf prompts/noyuto_persona.txt \
         prompts/learned_patterns.txt prompts/competitor_exemplars.txt \
         make_card.py approve_post.py post_note.py; do
    if [ ! -f "$f" ]; then
        alert "必須ファイル欠落: $f"
    fi
done

if [ ! -f .env ]; then
    alert ".env ファイル不在"
fi

# ============================================================
# ステップ1: 朝のみ NOTE生成・投稿
# ============================================================
NOTE_URL=""
NOTE_THEME=""
NOTE_TOPIC=""
NOTE_TITLE=""

if [ "$TIME_SLOT" = "morning" ]; then
    log "[NOTE] 生成開始..."

    NOTE_JSON=$(/home/noyuto/.local/bin/claude --print "
prompts/noyuto_persona.txt と prompts/competitor_exemplars.txt を読み込んでから作業してください。

【タスク】本日のNOTE記事を1本生成し、JSONのみを出力してください。

【テーマ選定】
generate_post.py の THEME_TREE（6軸: 健康/金/人間関係/家族/精神/理想）から、
posts/post_history.jsonl の直近3件と異なるカテゴリを選び、その中からテーマを1つピックしてください。

【記事要件】
- 2,000〜3,500字
- 主語は読者（あなた・私たち）、NOYUTO個人史禁止
- 構造: 冒頭(問い) → 本文(観察→具体→再観察) → 結語（メンバーシップへの自然な招待）
- 結語に必ず『第3の視点・思考実験室 ¥980/月』への自然な招待文
- ## markdown見出しを使う
- 読後感として『何かが変わりそう』を残す
- タイトルは読者の内面に問いを置く形

【出力】
以下のJSONのみを出力してください。余計な説明・markdownフェンス不要。生JSONのみ:

{
  \"theme\": \"6軸のカテゴリ名\",
  \"topic\": \"具体テーマ名\",
  \"title\": \"記事タイトル\",
  \"body\": \"記事本文全体（markdown）\"
}
" 2>>"$LOGFILE")

    # JSON をファイルに保存（shell内での扱いを安定させる）
    echo "$NOTE_JSON" > /tmp/note_gen.json

    # Pythonで抽出・保存
    python3 - <<'PYEOF' >> "$LOGFILE" 2>&1
import json, re, sys
from datetime import datetime
from pathlib import Path

raw = open('/tmp/note_gen.json', encoding='utf-8').read()
# JSONブロックを抽出（余計なmarkdown fence があっても拾う）
m = re.search(r'\{[\s\S]*\}', raw)
if not m:
    print("ERROR: No JSON in NOTE generation output", file=sys.stderr)
    sys.exit(2)
try:
    data = json.loads(m.group(0))
except json.JSONDecodeError as e:
    print(f"ERROR: Invalid JSON: {e}", file=sys.stderr)
    sys.exit(2)

ts = datetime.now().strftime('%Y%m%d_%H%M%S')
path = Path('pending_notes') / f'{ts}.json'
path.parent.mkdir(exist_ok=True)
payload = {
    'timestamp': datetime.now().isoformat(),
    'title': data.get('title', ''),
    'body': data.get('body', ''),
    'theme': data.get('theme', ''),
    'topic': data.get('topic', ''),
    'status': 'pending',
}
path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"NOTE_SAVED:{path}")
print(f"NOTE_THEME:{data.get('theme','')}")
print(f"NOTE_TOPIC:{data.get('topic','')}")
print(f"NOTE_TITLE:{data.get('title','')}")
Path('/tmp/note_meta.json').write_text(json.dumps({
    'theme': data.get('theme',''),
    'topic': data.get('topic',''),
    'title': data.get('title',''),
}, ensure_ascii=False), encoding='utf-8')
PYEOF

    NOTE_STEP=$?
    if [ $NOTE_STEP -ne 0 ]; then
        alert "NOTE生成失敗（JSON parse error）"
    else
        NOTE_THEME=$(python3 -c "import json; print(json.load(open('/tmp/note_meta.json')).get('theme',''))" 2>/dev/null)
        NOTE_TOPIC=$(python3 -c "import json; print(json.load(open('/tmp/note_meta.json')).get('topic',''))" 2>/dev/null)
        NOTE_TITLE=$(python3 -c "import json; print(json.load(open('/tmp/note_meta.json')).get('title',''))" 2>/dev/null)

        log "[NOTE] 投稿開始..."
        NOTE_POST_OUT=$(python3 post_note.py 2>&1)
        echo "$NOTE_POST_OUT" >> "$LOGFILE"

        NOTE_URL=$(echo "$NOTE_POST_OUT" | grep -oE 'https://editor\.note\.com/notes/[a-zA-Z0-9]+' | tail -1 | sed 's|editor\.note\.com/notes|note\.com/noyuto/n|; s|/publish/||')
        if [ -z "$NOTE_URL" ]; then
            NOTE_URL=$(echo "$NOTE_POST_OUT" | grep -oE 'https://note\.com/[^[:space:]]+' | tail -1)
        fi
        if [ -n "$NOTE_URL" ]; then
            echo "$NOTE_URL" > "$NOTE_URL_FILE"
            log "[NOTE] URL保存: $NOTE_URL"
        else
            alert "NOTE投稿URLの取得に失敗"
        fi
    fi
else
    # 夜の実行: 朝のNOTE URLを再利用
    if [ -f "$NOTE_URL_FILE" ]; then
        NOTE_URL=$(cat "$NOTE_URL_FILE")
        log "[NOTE] 朝のURL再利用: $NOTE_URL"
    else
        alert "朝のNOTE URLがない（朝の実行が失敗した可能性）"
    fi
    if [ -f /tmp/note_meta.json ]; then
        NOTE_THEME=$(python3 -c "import json; print(json.load(open('/tmp/note_meta.json')).get('theme',''))" 2>/dev/null)
        NOTE_TOPIC=$(python3 -c "import json; print(json.load(open('/tmp/note_meta.json')).get('topic',''))" 2>/dev/null)
        NOTE_TITLE=$(python3 -c "import json; print(json.load(open('/tmp/note_meta.json')).get('title',''))" 2>/dev/null)
    fi
fi

# ============================================================
# ステップ2: X単発投稿生成
# ============================================================
log "[X] 生成開始 [$TIME_SLOT]..."

if [ "$TIME_SLOT" = "morning" ]; then
    ANGLE="朝7時台・通勤前の静かな時間に読まれる想定。一日を始める前の小さな問い。"
else
    ANGLE="夜21時台・就寝前の静かな時間に読まれる想定。一日を振り返る静かな問い。朝と同じテーマ軸だが別角度。"
fi

X_JSON=$(/home/noyuto/.local/bin/claude --print "
prompts/noyuto_persona.txt と prompts/competitor_exemplars.txt と prompts/learned_patterns.txt の3ファイルを読み込んでから作業してください。

【今日のNOTE情報】
- テーマ軸: $NOTE_THEME
- 具体テーマ: $NOTE_TOPIC
- NOTE記事タイトル: $NOTE_TITLE
- NOTE URL: $NOTE_URL

【角度】
$ANGLE

【タスク】X単発投稿を1本生成し、JSONのみを出力してください。

【戦略ポイント（競合分析の結論）】
- X本文テキスト(text)は50〜90字の短いフック
- カード画像本体(card_text)は150〜250字の構造化された本体
- card_text には以下3形式のどれかを選ぶ:
  * observation: 4〜6文の静かな観察（精神・理想・家族軸に向く）
  * list: 『・』で始まる5〜8項目の箇条書き+タイトル1行（人間関係・金・健康に向く・保存率最高）
  * contrast: ❌やりがち ⭕正解 の2カラム対比（人間関係・精神・家族に向く・拡散最強）
- 偉そうな断定禁止。読者主語。敬語。

【X本文(text)の例】
- 朝: 眠れない夜を『気のせい』で片付けて、もう10年。その沈黙の代償を、見たことがありますか。
- 夜: 人が離れていく人には、共通点があります。気づかない本人ほど、その輪の外に立っています。

【NOTE導線（text末尾に1行必須、以下から1つ）】
- その答えを、今日のnoteに置いておきました。
- 同じことを、noteにもう少し深く書いています。
- この問いの先は、noteにあります。
- 続きは、今日のnoteに。

【X本文の最終構造】
(フック50〜90字)

(NOTE導線1文)
(NOTE URL)

全体で200〜280字以内に収める。

【出力（生JSONのみ、markdown fence不要）】

{
  \"theme\": \"6軸カテゴリ名\",
  \"topic\": \"具体テーマ\",
  \"text\": \"X本文完成形（フック+導線+URL）\",
  \"card_text\": \"カード画像に載せる本体テキスト150〜250字\",
  \"card_template\": \"observation or list or contrast\"
}
" 2>>"$LOGFILE")

echo "$X_JSON" > /tmp/x_gen.json

python3 - "$TIME_SLOT" <<'PYEOF' >> "$LOGFILE" 2>&1
import json, re, sys, subprocess
from datetime import datetime
from pathlib import Path

slot = sys.argv[1]
raw = open('/tmp/x_gen.json', encoding='utf-8').read()
m = re.search(r'\{[\s\S]*\}', raw)
if not m:
    print("ERROR: No JSON in X generation output", file=sys.stderr)
    sys.exit(2)
try:
    data = json.loads(m.group(0))
except json.JSONDecodeError as e:
    print(f"ERROR: Invalid JSON in X: {e}", file=sys.stderr)
    sys.exit(2)

text = data.get('text', '').strip()
card_text = data.get('card_text', '').strip()
theme = data.get('theme', '')
topic = data.get('topic', '')
template = data.get('card_template', 'auto')

if not text or not card_text:
    print("ERROR: text or card_text is empty", file=sys.stderr)
    sys.exit(2)

if len(text) > 280:
    print(f"WARNING: text is {len(text)} chars, truncating", file=sys.stderr)
    text = text[:275] + "..."

ts = datetime.now().strftime('%Y%m%d_%H%M%S')
post_path = Path('posts') / f'{ts}.json'
card_path = Path('assets/cards') / f'{ts}.png'

# カード生成
result = subprocess.run(
    ['python3', 'make_card.py', card_text, '-o', str(card_path),
     '-t', theme, '--template', template],
    capture_output=True, text=True
)
print("card stdout:", result.stdout.strip())
if result.stderr:
    print("card stderr:", result.stderr.strip())

media_path = str(card_path) if card_path.exists() else None

post_path.write_text(json.dumps({
    'timestamp': datetime.now().isoformat(),
    'text': text,
    'card_text': card_text,
    'topic': topic,
    'theme': theme,
    'status': 'pending',
    'media_path': media_path,
    'slot': slot,
    'strategy_version': '2026-04-10-v2',
}, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"POST_SAVED:{post_path}")
print(f"TEXT_LEN:{len(text)}")
print(f"CARD_LEN:{len(card_text)}")
print(f"MEDIA:{media_path}")
PYEOF

X_GEN_STEP=$?
if [ $X_GEN_STEP -ne 0 ]; then
    alert "X投稿生成失敗（JSON parse or card error）"
fi

# ============================================================
# ステップ3: X自動投稿
# ============================================================
log "[X] 自動投稿実行..."
if python3 approve_post.py --auto >> "$LOGFILE" 2>&1; then
    log "[X] 投稿完了 [$TIME_SLOT]"
else
    alert "X投稿APIエラー（APIキー・レート上限・ネット環境を確認）"
fi

# ============================================================
# ステップ4: フォロワー数トラッキング + リプライ候補検索（朝のみ）
# ============================================================
REPLY_CANDIDATES=""
if [ "$TIME_SLOT" = "morning" ]; then
    if [ -f track_followers.py ]; then
        python3 track_followers.py >> "$LOGFILE" 2>&1 || log "[warn] フォロワー追跡スキップ"
    fi

    # リプライ候補検索（6軸テーマに基づく大型アカウント投稿検索）
    if [ -f search_reply_targets.py ]; then
        log "[reply] 候補検索..."
        REPLY_CANDIDATES=$(python3 search_reply_targets.py --top 3 --no-email --section 2>/dev/null || echo "")
    fi
fi

# ============================================================
# ステップ5: 日報送信（朝のみ）+ アラート通知
# ============================================================
if [ "$TIME_SLOT" = "morning" ]; then
    ALERT_MSG=""
    if [ -s "$ALERT_FLAG" ]; then
        ALERT_MSG=$(cat "$ALERT_FLAG")
    fi

    cat > "$OUTFILE" << REPORT_EOF
━━━━━━━━━━━━━━━━━━
【NOYUTO日報】$DATE 朝
━━━━━━━━━━━━━━━━━━

■ 本日のテーマ
$NOTE_THEME / $NOTE_TOPIC

■ 本日のNOTE記事
$NOTE_TITLE
$NOTE_URL

■ 戦略状況
- 結果ファースト(金)KPI稼働中
- 不変6軸テーマ限定
- 単発1投稿×1日2本(朝7:15・夜21:30)
- 画像カード自動添付（テキスト=フック / 画像=本体）
- 競合分析exemplar反映済み

■ リプライ候補（大型アカウントへの手動リプライ用、5分で着地）
${REPLY_CANDIDATES:-なし（APIレート or キーワードhit 0）}

■ アラート
${ALERT_MSG:-なし}

次の実行: 本日21:30 (X単発2本目・別角度)
REPORT_EOF

    python3 send_gmail.py \
        --to office.vonds@gmail.com \
        --subject "【NOYUTO日報】$DATE 朝 ${ALERT_MSG:+【要確認】}" \
        --body-file "$OUTFILE" >> "$LOGFILE" 2>&1 || log "[Gmail] 送信失敗"
fi

log "=== $DATE [$TIME_SLOT] 実行完了 ==="
