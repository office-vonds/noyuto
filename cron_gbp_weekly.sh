#!/bin/bash
# 毎週月曜 9:30に実行: GBP投稿リマインダー + NAP監視
# crontab: 30 9 * * 1 /path/to/cron_gbp_weekly.sh
cd ~/projects/noyuto

LOGFILE=~/gbp_weekly.log
DATE=$(date +%Y/%m/%d)
WEEK_NUM=$(( ($(date +%j) / 7) % 4 + 1 ))

echo "=== $DATE GBP週次チェック ===" >> "$LOGFILE"

# GBP投稿リマインダーをGmail送信
BODY=$(cat <<EOF
━━━━━━━━━━━━━━━━━━
【VONDS】GBP週次投稿リマインダー $DATE
━━━━━━━━━━━━━━━━━━

今週はWeek ${WEEK_NUM}の投稿です。

gbp_content/weekly_posts.txt のWeek ${WEEK_NUM}の文面を
GBP管理画面 → 投稿 → 最新情報を追加 で投稿してください。

チェックリスト:
[ ] 投稿文をコピペ
[ ] 写真を1枚添付
[ ] CTAボタンを設定（URL確認）
[ ] プレビュー確認 → 投稿

所要時間: 5分

━━━━━━━━━━━━━━━━━━
EOF
)

python3 send_gmail.py \
    --to office.vonds@gmail.com \
    --subject "【VONDS】GBP投稿リマインダー Week${WEEK_NUM}（$DATE）" \
    --body "$BODY" >> "$LOGFILE" 2>&1

echo "=== $DATE 完了 ===" >> "$LOGFILE"
