#!/bin/bash
# VONDS vc コマンド 別PC永久解決セットアップ (Bash/Zsh/WSL/Linux/Mac対応)
# 実行: bash <(curl -s https://raw.githubusercontent.com/office-vonds/noyuto/main/scripts/shell/setup-vc-on-new-pc.sh)
# または: bash ~/projects/vonds/scripts/shell/setup-vc-on-new-pc.sh

set -e

RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GRN}✅${NC} $1"; }
warn() { echo -e "${YLW}⚠️${NC} $1"; }
err()  { echo -e "${RED}❌${NC} $1"; }

echo "═══════════════════════════════════════"
echo "  VONDS vc 別PCセットアップ"
echo "═══════════════════════════════════════"

# 1. OS判定
UNAME=$(uname -s)
IS_WSL=$([[ -f /proc/version && $(cat /proc/version 2>/dev/null) == *Microsoft* ]] || [[ $(uname -r) == *microsoft* ]] && echo 1 || echo 0)
ok "OS: $UNAME (WSL=$IS_WSL)"

# 2. 必要ツール検出
missing=()
command -v git     &>/dev/null || missing+=("git")
command -v node    &>/dev/null || missing+=("node")
command -v claude  &>/dev/null || missing+=("claude")

if [ ${#missing[@]} -gt 0 ]; then
    warn "未インストール: ${missing[*]}"
    for tool in "${missing[@]}"; do
        case "$tool" in
            git)
                if [[ "$UNAME" == "Linux" ]]; then
                    echo "  → sudo apt update && sudo apt install -y git"
                elif [[ "$UNAME" == "Darwin" ]]; then
                    echo "  → brew install git  (またはXcodeコマンドラインツール)"
                fi
                ;;
            node)
                if [[ "$UNAME" == "Linux" ]]; then
                    echo "  → curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
                    echo "    sudo apt install -y nodejs"
                elif [[ "$UNAME" == "Darwin" ]]; then
                    echo "  → brew install node"
                fi
                ;;
            claude)
                echo "  → npm install -g @anthropic-ai/claude-code"
                ;;
        esac
    done
    echo ""
    err "上記コマンドを実行してから再度このスクリプトを叩いてください"
    exit 1
fi

ok "git / node / claude すべて利用可"

# 3. リポジトリ取得
if [ ! -d ~/projects/vonds ]; then
    echo "[clone] ~/projects/vonds を新規取得..."
    mkdir -p ~/projects
    if git clone https://github.com/office-vonds/noyuto ~/projects/vonds 2>/dev/null; then
        ok "git clone 成功"
    else
        warn "git clone 失敗。GitHub認証が必要な可能性"
        echo "  → gh auth login  （または SSH key設定）"
        exit 1
    fi
else
    echo "[pull] ~/projects/vonds 既存 → 最新化"
    (cd ~/projects/vonds && git pull --rebase 2>&1) || warn "pull失敗（conflictあるかも）"
    ok "最新取得OK"
fi

# 4. shell設定ファイル特定（bash/zsh両対応）
SHELL_RC=""
CURRENT_SHELL=$(basename "${SHELL:-bash}")
if [[ "$CURRENT_SHELL" == "zsh" ]]; then SHELL_RC="$HOME/.zshrc"
elif [[ "$CURRENT_SHELL" == "bash" ]]; then SHELL_RC="$HOME/.bashrc"
else SHELL_RC="$HOME/.profile"
fi
[ -f "$SHELL_RC" ] || touch "$SHELL_RC"

# 5. source行追加
SOURCE_LINE='[ -f ~/projects/vonds/scripts/shell/vc-alias.sh ] && source ~/projects/vonds/scripts/shell/vc-alias.sh'
if grep -qF "$SOURCE_LINE" "$SHELL_RC"; then
    ok "$SHELL_RC に source行あり（スキップ）"
else
    {
        echo ""
        echo "# VONDS vc エイリアス (auto-added by setup-vc-on-new-pc.sh)"
        echo "$SOURCE_LINE"
    } >> "$SHELL_RC"
    ok "$SHELL_RC に source行追加"
fi

# 6. 即有効化＋起動テスト
source ~/projects/vonds/scripts/shell/vc-alias.sh
vc-check

# 7. 最終チェック
echo ""
echo "═══════════════════════════════════════"
if type vc &>/dev/null; then
    ok "vc alias 定義確認: $(type vc)"
else
    err "vc alias が未定義（想定外）"
fi
echo "═══════════════════════════════════════"
echo ""
echo "✅ 次のステップ:"
echo "  1. 新しいターミナルを開く  （または: source $SHELL_RC）"
echo "  2. vc  と打つ  （= cd ~/projects/vonds && git pull && claude起動）"
echo ""
echo "起きる可能性のある問題と対処:"
echo "  - claude起動で認証要求 → API key 入力（anthropic console）"
echo "  - git pull conflict → cd ~/projects/vonds && git status で確認"
echo ""
