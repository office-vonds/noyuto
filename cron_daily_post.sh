#!/bin/bash
# 毎朝cronで実行: NOTE→X単発1本+画像カード の新パイプライン
# 戦略: 結果ファースト(金) / 不変6軸テーマ / 読者主語 / 単発投稿 / X→NOTE導線
# 朝9:05 → NOTE生成・投稿 + X単発1本目生成・投稿(画像付)
# 夕18:05 → X単発2本目生成・投稿(朝のNOTE URL再利用、別角度)

cd ~/projects/vonds

LOGFILE=~/claude_cron_post.log
OUTFILE=~/projects/vonds/daily_report.txt
NOTE_URL_FILE=~/projects/vonds/daily_note_url.txt
DATE=$(date +%Y/%m/%d)
TIME_SLOT="$1"  # "morning" or "evening"

if [ -z "$TIME_SLOT" ]; then
    TIME_SLOT="morning"
fi

echo "=== $DATE [$TIME_SLOT] 実行開始 ===" >> "$LOGFILE"

# ============================================================
# ステップ0: 前日エンゲージメント・NOTE遷移の参照用取得
# ============================================================
if [ "$TIME_SLOT" = "morning" ]; then
    echo "[分析] エンゲージメント取得開始..." >> "$LOGFILE"
    python3 track_engagement.py --update-weights >> "$LOGFILE" 2>&1 || echo "[警告] 分析スキップ" >> "$LOGFILE"
fi

# ============================================================
# ステップ1: NOTE記事生成・投稿 (朝のみ)
# ============================================================
NOTE_URL=""
if [ "$TIME_SLOT" = "morning" ]; then
    echo "[NOTE] 生成開始..." >> "$LOGFILE"

    NOTE_RESULT=$(/home/noyuto/.local/bin/claude --print "
prompts/noyuto_persona.txt を読み込み、そのペルソナ定義と新戦略（2026-04-10刷新版）に厳密に従ってください。

【タスク】
本日のテーマ軸を generate_post.py の THEME_TREE からローテーションで選び（直近3日と異なるカテゴリ）、
そのテーマでNOTE記事を1本生成し、pending_notes/ に保存してください。

【NOTE記事の要件】
- 扱うテーマ: 健康 / 金 / 人間関係 / 家族 / 精神 / 理想 の6軸のみ
- 文字数: 2,000〜3,500文字程度
- 構造: 冒頭(問いの提示) → 本文(観察→具体→再観察) → 結語(メンバーシップ or 対話への自然な招待)
- 主語は「あなた」「私たち」「多くの人」。NOYUTO個人史の前面化禁止
- 原体験は構造の証明材料として1〜2箇所だけ
- 結語に必ず『第3の視点・思考実験室』¥980/月メンバーシップへの招待を自然に織り込む
- 安っぽい売り込み禁止。存在を示唆し読者の選択に委ねる
- ## markdown見出しを使う
- 読後感として『何かが変わりそう』を残す
- タイトルは断定せず、読者の内面に問いを置く形式

【保存】
以下のPythonコードを生成して実行してください:

\`\`\`python
import json
from datetime import datetime
from pathlib import Path

title = '（ここに生成したタイトル）'
body = '''（ここに生成した記事本文・markdown）'''
theme = '（選んだテーマ軸: 健康/金/人間関係/家族/精神/理想）'
topic = '（選んだ具体テーマ）'

ts = datetime.now().strftime('%Y%m%d_%H%M%S')
pending = Path('pending_notes')
pending.mkdir(exist_ok=True)
filepath = pending / f'{ts}.json'
with open(filepath, 'w', encoding='utf-8') as f:
    json.dump({
        'timestamp': datetime.now().isoformat(),
        'title': title,
        'body': body,
        'theme': theme,
        'topic': topic,
        'status': 'pending',
    }, f, ensure_ascii=False, indent=2)
print(f'NOTE_SAVED:{filepath}')
print(f'THEME:{theme}')
print(f'TOPIC:{topic}')
print(f'TITLE:{title}')
\`\`\`

実行後、保存ファイルパス・テーマ・タイトルを出力してください。
" 2>>"$LOGFILE")

    echo "$NOTE_RESULT" >> "$LOGFILE"
    NOTE_TOPIC=$(echo "$NOTE_RESULT" | grep '^TOPIC:' | sed 's/^TOPIC://' | head -1)
    NOTE_THEME=$(echo "$NOTE_RESULT" | grep '^THEME:' | sed 's/^THEME://' | head -1)
    NOTE_TITLE=$(echo "$NOTE_RESULT" | grep '^TITLE:' | sed 's/^TITLE://' | head -1)

    echo "[NOTE] 投稿開始..." >> "$LOGFILE"
    NOTE_POST_OUTPUT=$(python3 post_note.py 2>&1)
    echo "$NOTE_POST_OUTPUT" >> "$LOGFILE"

    # NOTE URLを抽出
    NOTE_URL=$(echo "$NOTE_POST_OUTPUT" | grep -oE 'https://[^/]*note\.com/[^[:space:]]+' | tail -1)
    if [ -z "$NOTE_URL" ]; then
        NOTE_URL=$(echo "$NOTE_POST_OUTPUT" | grep -oE 'https://editor\.note\.com/notes/[a-zA-Z0-9]+' | tail -1 | sed 's|/publish/||; s|editor\.note\.com/notes|note\.com/noyuto/n|')
    fi
    if [ -n "$NOTE_URL" ]; then
        echo "$NOTE_URL" > "$NOTE_URL_FILE"
        echo "[NOTE] URL保存: $NOTE_URL" >> "$LOGFILE"
    fi
else
    # 夕方実行: 朝のNOTE URLを再利用
    if [ -f "$NOTE_URL_FILE" ]; then
        NOTE_URL=$(cat "$NOTE_URL_FILE")
        echo "[NOTE] 朝のURLを再利用: $NOTE_URL" >> "$LOGFILE"
    fi
    NOTE_THEME=""
    NOTE_TOPIC=""
    NOTE_TITLE=""
fi

# ============================================================
# ステップ2: X単発投稿 生成（新フォーマット：1投稿完結・100〜180字・読者主語・NOTE誘導）
# ============================================================
echo "[X] 単発投稿生成開始 [$TIME_SLOT]..." >> "$LOGFILE"

ANGLE_HINT=""
if [ "$TIME_SLOT" = "morning" ]; then
    ANGLE_HINT="朝(通勤前・出勤前)に読まれる想定。1日を始める前の静かな問い。"
else
    ANGLE_HINT="夕方〜夜(帰宅前後)に読まれる想定。1日を振り返る静かな問い。朝の投稿と同じテーマ軸だが切り口を変える。"
fi

X_POST=$(/home/noyuto/.local/bin/claude --print "
prompts/noyuto_persona.txt と prompts/learned_patterns.txt を両方読み込み、
2026-04-10刷新版の新ルールに厳密に従ってX単発投稿を1本生成してください。

【今日のNOTE情報】
- テーマ: $NOTE_THEME
- 具体テーマ: $NOTE_TOPIC
- NOTE記事タイトル: $NOTE_TITLE
- NOTE URL: $NOTE_URL

【角度】
$ANGLE_HINT

【X単発投稿の要件（絶対）】
- 形式: 単発1ポスト（スレッド不可・フックだけの投稿禁止）
- 文字数: 本文120〜180字 + NOTE導線1文 + URL 1本（合計200〜260字以内）
- 構造: 【観察】2〜3文 + 【問い】1文 + 【NOTE導線】1文 + URL
- 主語は『あなた』『私たち』『多くの人』。NOYUTO個人史禁止
- 『〜だ』『〜である』の断定口調禁止。敬語(です・ます調)
- 説教・上から目線・攻撃的フレーミング禁止
- 『続きはnoteで』『詳しくはnoteで』禁止
- 絵文字禁止。ハッシュタグは最大1個(思想の旗印として)
- 学習済みパターン(learned_patterns.txt)から『対比型』『常識破壊型』『パンチライン着地』のいずれかの構造を取り入れる
- 改行: 1〜2文ごとに空行。壁テキスト禁止
- 読後に読者が『自分のことだ』『もう少し深く読みたい』と感じる

【NOTE導線の文面パターン(どれか1つ選ぶ)】
- その答えを、今日のnoteに置いておきました。
- 同じことを、noteにもう少し深く書いています。
- この問いの先は、noteにあります。
- 続きは、今日のnoteに。

【出力フォーマット】
TOPIC: 具体テーマ名
THEME: 6軸カテゴリ名
POST:
（X投稿本文ここに。NOTE導線文とURLも含めた完成形）

【保存】
以下のPythonコードで posts/ に保存してください:

\`\`\`python
import json
from datetime import datetime
from pathlib import Path
import subprocess

text = '''（上で生成したPOST本文全体、URL含む）'''
topic = '（上のTOPIC）'
theme = '（上のTHEME）'

ts = datetime.now().strftime('%Y%m%d_%H%M%S')
filepath = Path('posts') / f'{ts}.json'
filepath.parent.mkdir(exist_ok=True)

# カード画像生成
card_path = Path('assets/cards') / f'{ts}.png'
card_path.parent.mkdir(parents=True, exist_ok=True)
result = subprocess.run(['python3', 'make_card.py', text, '-o', str(card_path), '-t', theme],
                        capture_output=True, text=True)
media_path = str(card_path) if card_path.exists() else None

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump({
        'timestamp': datetime.now().isoformat(),
        'text': text,
        'topic': topic,
        'theme': theme,
        'status': 'pending',
        'media_path': media_path,
        'slot': '$TIME_SLOT',
    }, f, ensure_ascii=False, indent=2)
print(f'POST_SAVED:{filepath}')
print(f'CARD:{media_path}')
print(f'LEN:{len(text)}')
\`\`\`
" 2>>"$LOGFILE")

echo "$X_POST" >> "$LOGFILE"

# ============================================================
# ステップ3: X単発投稿 実行（latest pending を1本だけ投稿）
# ============================================================
echo "[X] 自動投稿実行..." >> "$LOGFILE"
if python3 approve_post.py --auto >> "$LOGFILE" 2>&1; then
    echo "[X] 投稿完了 [$TIME_SLOT]" >> "$LOGFILE"
else
    echo "[X] 投稿失敗 [$TIME_SLOT]（APIキー or pending 要確認）" >> "$LOGFILE"
fi

# ============================================================
# ステップ4: 日報送信 (朝のみ)
# ============================================================
if [ "$TIME_SLOT" = "morning" ]; then
    cat > "$OUTFILE" << REPORT_EOF
━━━━━━━━━━━━━━━━━━
【NOYUTO日報】$DATE
━━━━━━━━━━━━━━━━━━

■ 本日のテーマ軸
$NOTE_THEME

■ 本日のNOTE記事
タイトル: $NOTE_TITLE
URL: $NOTE_URL

■ 本日のX単発投稿（朝）
$X_POST

■ 戦略状況
- 結果ファースト(金)KPI稼働中
- 不変6軸テーマ限定
- 単発1投稿×1日2本(朝・夕)
- 画像カード自動添付
- NOTE誘導必須

次の実行: 本日18:05 (X単発2本目・同じNOTE URLで別角度)
REPORT_EOF

    python3 send_gmail.py \
        --to office.vonds@gmail.com \
        --subject "【NOYUTO日報】$DATE 朝の投稿完了" \
        --body-file "$OUTFILE" >> "$LOGFILE" 2>&1 || echo "[Gmail] 送信失敗" >> "$LOGFILE"
fi

echo "=== $DATE [$TIME_SLOT] 実行完了 ===" >> "$LOGFILE"
