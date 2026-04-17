#!/bin/bash
# 別PCで `vc` を使えるようにする1コマンドセットアップ
# 別PCで: bash ~/projects/vonds/scripts/shell/setup-vc-on-new-pc.sh
# または: curl -s https://raw.githubusercontent.com/office-vonds/noyuto/main/scripts/shell/setup-vc-on-new-pc.sh | bash

set -e

echo "=== VONDS vc セットアップ ==="

# 1. ~/projects/vonds の clone (未clone時のみ)
if [ ! -d ~/projects/vonds ]; then
    echo "[1/3] git clone ~/projects/vonds"
    mkdir -p ~/projects
    git clone https://github.com/office-vonds/noyuto ~/projects/vonds
else
    echo "[1/3] ~/projects/vonds 既存 → git pull"
    (cd ~/projects/vonds && git pull)
fi

# 2. ~/.bashrc に source行を追加（既存でなければ）
BASHRC="$HOME/.bashrc"
SOURCE_LINE='[ -f ~/projects/vonds/scripts/shell/vc-alias.sh ] && source ~/projects/vonds/scripts/shell/vc-alias.sh'
if grep -qF "$SOURCE_LINE" "$BASHRC" 2>/dev/null; then
    echo "[2/3] .bashrc に source行あり → スキップ"
else
    echo "[2/3] .bashrc に source行追加"
    echo "" >> "$BASHRC"
    echo "# VONDS vc エイリアス (auto-added)" >> "$BASHRC"
    echo "$SOURCE_LINE" >> "$BASHRC"
fi

# 3. claude CLI 存在確認
if ! command -v claude &>/dev/null; then
    echo "[3/3] ⚠️ claude CLI 未インストール。以下を実行して:"
    echo "      npm install -g @anthropic-ai/claude-code"
    echo ""
    echo "Node.js がなければ先に: sudo apt install -y nodejs npm"
else
    echo "[3/3] ✅ claude CLI 検出: $(command -v claude)"
fi

# 即有効化
source ~/projects/vonds/scripts/shell/vc-alias.sh
echo ""
echo "✅ セットアップ完了！新しいターミナルで 'vc' と打つか、"
echo "   現セッションで source ~/.bashrc してから vc してください。"
