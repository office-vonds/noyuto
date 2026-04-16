#!/bin/bash
# ============================================================
# KIRYU Notion深夜巡回スクリプト
# 実行: 月・水・金 深夜1:00 (JST) via cron
# ============================================================

set -euo pipefail

# --- 設定 ---
PROJECT_DIR="/home/ozawakiryu0902/projects/vonds"
SCRIPT_DIR="${PROJECT_DIR}/scripts"
PROMPT_FILE="${SCRIPT_DIR}/kiryu-notion-patrol-prompt.md"
REPORT_DIR="${SCRIPT_DIR}/kiryu-patrol-reports"
LOG_FILE="${SCRIPT_DIR}/kiryu-patrol.log"
CLAUDE_BIN="/usr/bin/claude"
DATE_TAG=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)

# --- ログ関数 ---
log() {
    echo "[${TIMESTAMP}] $1" >> "${LOG_FILE}"
}

# --- 事前チェック ---
if [ ! -f "${CLAUDE_BIN}" ]; then
    log "ERROR: Claude CLI not found at ${CLAUDE_BIN}"
    exit 1
fi

if [ ! -f "${PROMPT_FILE}" ]; then
    log "ERROR: Prompt file not found at ${PROMPT_FILE}"
    exit 1
fi

# レポートディレクトリ作成
mkdir -p "${REPORT_DIR}"

log "=== KIRYU巡回開始 ==="

# --- プロンプト読み込み ---
PROMPT=$(cat "${PROMPT_FILE}")

# --- Claude Code実行 ---
# --model haiku: コスト効率重視（タスク洗い出し・判断はhaikuで十分）
# -p: 非対話モード
# --dangerously-skip-permissions: cron実行のため許可ダイアログをスキップ
# --max-budget-usd 0.50: コスト上限（暴走防止）
# プロジェクトディレクトリから実行することで .mcp.json のMCP設定が自動読み込みされる

cd "${PROJECT_DIR}"

RESULT=$(${CLAUDE_BIN} -p \
    --model haiku \
    --dangerously-skip-permissions \
    --max-budget-usd 0.50 \
    "${PROMPT}" \
    2>> "${LOG_FILE}") || {
    log "ERROR: Claude CLI execution failed (exit code: $?)"
    # 失敗してもレポートファイルにエラーを記録
    echo "# KIRYU巡回エラー ${DATE_TAG}" > "${REPORT_DIR}/${DATE_TAG}_patrol-report.md"
    echo "" >> "${REPORT_DIR}/${DATE_TAG}_patrol-report.md"
    echo "Claude CLI実行に失敗しました。ログを確認してください。" >> "${REPORT_DIR}/${DATE_TAG}_patrol-report.md"
    echo "ログ: ${LOG_FILE}" >> "${REPORT_DIR}/${DATE_TAG}_patrol-report.md"
    exit 1
}

# --- 結果をレポートファイルに保存 ---
REPORT_FILE="${REPORT_DIR}/${DATE_TAG}_patrol-report.md"
echo "${RESULT}" > "${REPORT_FILE}"
log "Report saved: ${REPORT_FILE}"

# --- Gmail送信（Python smtplib フォールバック） ---
# Gmail MCPがcronから使えない場合のフォールバック
# App Passwordが設定されている場合のみ動作
GMAIL_APP_PASSWORD_FILE="/home/ozawakiryu0902/credentials/gmail-app-password.txt"

if [ -f "${GMAIL_APP_PASSWORD_FILE}" ]; then
    APP_PASSWORD=$(cat "${GMAIL_APP_PASSWORD_FILE}" | tr -d '[:space:]')

    python3 - "${REPORT_FILE}" "${APP_PASSWORD}" <<'PYTHON_EOF'
import sys
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

report_file = sys.argv[1]
app_password = sys.argv[2]

with open(report_file, 'r', encoding='utf-8') as f:
    report_content = f.read()

weekday_ja = ['月', '火', '水', '木', '金', '土', '日']
now = datetime.now()
date_str = now.strftime('%Y-%m-%d') + f'({weekday_ja[now.weekday()]})'

msg = MIMEMultipart()
msg['From'] = 'office.vonds@gmail.com'
msg['To'] = 'office.vonds@gmail.com'
msg['Subject'] = f'[KIRYU巡回報告] {date_str} 深夜巡回'

body = MIMEText(report_content, 'plain', 'utf-8')
msg.attach(body)

try:
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login('office.vonds@gmail.com', app_password)
        server.send_message(msg)
    print('Email sent successfully')
except Exception as e:
    print(f'Email failed: {e}', file=sys.stderr)
    sys.exit(1)
PYTHON_EOF

    if [ $? -eq 0 ]; then
        log "Email sent successfully"
    else
        log "WARNING: Email send failed. Report saved locally at ${REPORT_FILE}"
    fi
else
    log "INFO: Gmail App Password not configured. Report saved locally only at ${REPORT_FILE}"
    log "INFO: To enable email, create ${GMAIL_APP_PASSWORD_FILE} with your Gmail App Password"
fi

# --- Git自動コミット（レポートファイル） ---
cd "${PROJECT_DIR}"
if git diff --quiet "${REPORT_DIR}" 2>/dev/null && git diff --cached --quiet "${REPORT_DIR}" 2>/dev/null; then
    # 新規ファイルの場合
    if [ -n "$(git ls-files --others --exclude-standard "${REPORT_DIR}")" ]; then
        git add "${REPORT_DIR}/"
        git commit -m "[kiryu-patrol] 巡回報告 ${DATE_TAG}" 2>> "${LOG_FILE}" || true
        timeout 30 git push origin main 2>> "${LOG_FILE}" || log "WARNING: git push failed"
    fi
else
    git add "${REPORT_DIR}/"
    git commit -m "[kiryu-patrol] 巡回報告 ${DATE_TAG}" 2>> "${LOG_FILE}" || true
    timeout 30 git push origin main 2>> "${LOG_FILE}" || log "WARNING: git push failed"
fi

log "=== KIRYU巡回完了 ==="
