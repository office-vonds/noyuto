#!/bin/bash
# 記事生成キャッチアップ: 今日の記事がまだなら生成する
# auto-repairの10分cronから呼ばれるか、単独cronで実行

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE="$SCRIPT_DIR/state.json"
LOG="$SCRIPT_DIR/logs/catchup.log"
TODAY=$(TZ=Asia/Tokyo date +%Y-%m-%d)

# 今日の記事が既に生成済みか確認
if grep -q "\"date\": \"$TODAY\"" "$STATE" 2>/dev/null; then
    exit 0
fi

# 現在時刻が10時以降なら実行（早朝の誤爆防止）
HOUR=$(TZ=Asia/Tokyo date +%H)
if [ "$HOUR" -lt 10 ]; then
    exit 0
fi

echo "$(TZ=Asia/Tokyo date '+%Y-%m-%d %H:%M:%S') [CATCHUP] 本日の記事未生成。生成開始。" >> "$LOG"
cd "$SCRIPT_DIR" && /usr/bin/python3 generate_article.py >> "$LOG" 2>&1
echo "$(TZ=Asia/Tokyo date '+%Y-%m-%d %H:%M:%S') [CATCHUP] 記事生成完了。インデックスモニタリング開始。" >> "$LOG"

# 記事生成後にインデックス状態チェック（1日1回）
MONITOR_FLAG="$SCRIPT_DIR/logs/.monitor_done_$TODAY"
if [ ! -f "$MONITOR_FLAG" ]; then
    GOOGLE_APPLICATION_CREDENTIALS="$HOME/credentials/ga4-mcp.json" /usr/bin/python3 "$SCRIPT_DIR/index_monitor.py" >> "$LOG" 2>&1
    touch "$MONITOR_FLAG"
    echo "$(TZ=Asia/Tokyo date '+%Y-%m-%d %H:%M:%S') [CATCHUP] インデックスモニタリング完了。" >> "$LOG"
fi
