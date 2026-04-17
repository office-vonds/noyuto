#!/bin/bash
# noyutoブランド NOTE記事 週次生成cronラッパー
# 毎週月曜10:00に実行
#
# パイプライン:
#   1. generate_post.py でnote記事生成（pending在庫なければ）
#   2. noyuto-note-generate.js で note.com に下書き保存
#
# cron登録例:
#   0 10 * * 1 /home/ozawakiryu0902/projects/vonds/scripts/noyuto-note-cron.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/data/noyuto-note/cron.log"

# ログディレクトリ確保
mkdir -p "$(dirname "$LOG_FILE")"

{
  echo "========================================"
  echo "[$(date '+%Y-%m-%d %H:%M:%S JST')] noyuto NOTE生成 cron開始"
  echo "========================================"

  # ANTHROPIC_API_KEY が必要（generate_post.py用）
  for envfile in "$HOME/.env" "$HOME/projects/vonds/.env" "$HOME/projects/noyuto/.env"; do
    if [ -f "$envfile" ]; then
      export $(grep -v '^#' "$envfile" | xargs)
    fi
  done

  if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
    echo "WARNING: ANTHROPIC_API_KEY 未設定"
  fi

  # Node.js パス確認
  if ! command -v node &>/dev/null; then
    echo "ERROR: node が見つかりません"
    exit 1
  fi

  # 実行
  cd "$SCRIPT_DIR"
  node noyuto-note-generate.js --full

  echo "[$(date '+%Y-%m-%d %H:%M:%S JST')] noyuto NOTE生成 cron完了"
  echo ""

} >> "$LOG_FILE" 2>&1
