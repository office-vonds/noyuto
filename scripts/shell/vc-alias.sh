#!/bin/bash
# VONDS Claude Code エイリアス (全PC共通)
# 使い方: ~/.bashrc の末尾に以下1行を追加
#   [ -f ~/projects/vonds/scripts/shell/vc-alias.sh ] && source ~/projects/vonds/scripts/shell/vc-alias.sh
# → source ~/.bashrc または新しいターミナルで `vc` が使える

alias vc="cd ~/projects/vonds && git pull && claude --dangerously-skip-permissions"
alias vcexit="cd ~/projects/vonds && git add -A && git commit -m 'auto-save '\"\$(date +%Y%m%d-%H%M%S)\"' --no-edit 2>/dev/null; git push origin main"

# Claude Code がインストールされていない場合のヒント
vc-check() {
    if ! command -v claude &>/dev/null; then
        echo "⚠️ claude CLI が未インストール。以下で入れる:"
        echo "  npm install -g @anthropic-ai/claude-code"
        return 1
    fi
    if [ ! -d ~/projects/vonds ]; then
        echo "⚠️ ~/projects/vonds が未clone。以下で取得:"
        echo "  git clone https://github.com/office-vonds/noyuto ~/projects/vonds"
        return 1
    fi
    echo "✅ vc 環境OK: claude=$(command -v claude) / vonds=~/projects/vonds"
}
