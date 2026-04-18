#!/bin/bash
# VONDS vc/vcexit エイリアス 全PC共通セットアップ
#
# 使い方（各PC初回1回だけ実行）:
#   bash ~/projects/vonds/scripts/shell/install-vc-alias.sh
#
# 動作:
#   1. ~/.bashrc から既存の vc/vcexit ハードコード行を削除（古い定義の残骸を抹殺）
#   2. ~/.bashrc 末尾に「scripts/shell/vc-alias.sh を source する1行」を追加
#   3. 冪等性: 何度実行しても結果は同じ
#
# 設計理由:
#   - vc/vcexit の定義は git管理された scripts/shell/vc-alias.sh の単一ソース
#   - ~/.bashrc に直書きすると別PCで古い定義が残り、更新漏れで事故になる
#     (2026-04-18 NOYUTO GALLERIA XTで vc 起動失敗事故発)
#   - source 方式なら git pull だけで全PC同期される

set -e

BASHRC="$HOME/.bashrc"
ALIAS_FILE="$HOME/projects/vonds/scripts/shell/vc-alias.sh"
SOURCE_LINE="[ -f $ALIAS_FILE ] && source $ALIAS_FILE"
MARKER="# VONDS vc/vcexit エイリアス (git管理された共通定義を読み込む / ハードコード禁止)"

if [ ! -f "$ALIAS_FILE" ]; then
    echo "エラー: $ALIAS_FILE が見つかりません" >&2
    echo "       git clone https://github.com/office-vonds/noyuto ~/projects/vonds を先に実行してください" >&2
    exit 1
fi

if [ ! -f "$BASHRC" ]; then
    touch "$BASHRC"
fi

# バックアップ（同日複数回実行でも上書き）
cp "$BASHRC" "$BASHRC.bak.$(date +%Y%m%d)"

# 既存の vc/vcexit ハードコード行を削除（古い定義の残骸抹殺）
sed -i '/^alias vc=/d' "$BASHRC"
sed -i '/^alias vcexit=/d' "$BASHRC"

# 既存の MARKER 行と直後の source 行を削除（重複防止）
sed -i "/$(echo "$MARKER" | sed 's/[]\/$*.^[]/\\&/g')/,+1d" "$BASHRC"

# 末尾に追加
{
    echo ""
    echo "$MARKER"
    echo "$SOURCE_LINE"
} >> "$BASHRC"

echo "✅ ~/.bashrc 更新完了"
echo "   バックアップ: $BASHRC.bak.$(date +%Y%m%d)"
echo ""
echo "次のステップ:"
echo "  source ~/.bashrc   # 即反映"
echo "  vc-check           # 環境チェック"
echo "  vc                 # Claude Code起動"
