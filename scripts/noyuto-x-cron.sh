#!/bin/bash
# noyutoブランド X自動投稿 cronラッパー
# 1日2回（朝8:00/夜20:00）実行
#
# パイプライン:
#   1. generate_post.py でスレッド生成（pending在庫なければ）
#   2. noyuto-x-post.js で X投稿
#
# cron登録例:
#   0 8,20 * * * /home/ozawakiryu0902/projects/vonds/scripts/noyuto-x-cron.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/data/noyuto-x/cron.log"
NODE_BIN="/usr/bin/node"

# ログディレクトリ確保
mkdir -p "$(dirname "$LOG_FILE")"

{
  echo "========================================"
  echo "[$(date '+%Y-%m-%d %H:%M:%S JST')] noyuto X投稿 cron開始"
  echo "========================================"

  # ANTHROPIC_API_KEY が必要（generate_post.py用）
  # .env ファイルがあれば読み込む（複数候補）
  for envfile in "$HOME/.env" "$HOME/projects/vonds/.env" "$HOME/projects/noyuto/.env"; do
    if [ -f "$envfile" ]; then
      export $(grep -v '^#' "$envfile" | xargs)
    fi
  done

  if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
    echo "WARNING: ANTHROPIC_API_KEY 未設定。generate_post.py によるスレッド生成は失敗します"
    echo "  ~/.env に ANTHROPIC_API_KEY=sk-... を設定してください"
  fi

  # Node.js パス確認
  if ! command -v node &>/dev/null; then
    echo "ERROR: node が見つかりません"
    exit 1
  fi

  # 実行
  cd "$SCRIPT_DIR"
  node noyuto-x-post.js --full

  echo "[$(date '+%Y-%m-%d %H:%M:%S JST')] noyuto X投稿 cron完了"
  echo ""

} >> "$LOG_FILE" 2>&1
