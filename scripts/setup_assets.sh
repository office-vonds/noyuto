#!/bin/bash
# 初期セットアップ: カード生成に必要な日本語フォントをダウンロードする。
# fonts/ は .gitignore 対象（サイズが大きいため）。新しい環境で1回だけ実行する。

set -e
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FONTS_DIR="$BASE_DIR/assets/fonts"

mkdir -p "$FONTS_DIR"

if [ ! -f "$FONTS_DIR/NotoSansJP-Bold.otf" ]; then
    echo "[setup] NotoSansJP-Bold.otf ダウンロード中..."
    curl -sL -o "$FONTS_DIR/NotoSansJP-Bold.otf" \
        "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf"
fi

if [ ! -f "$FONTS_DIR/NotoSansJP-Regular.otf" ]; then
    echo "[setup] NotoSansJP-Regular.otf ダウンロード中..."
    curl -sL -o "$FONTS_DIR/NotoSansJP-Regular.otf" \
        "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf"
fi

# 動作確認
python3 -c "
from PIL import ImageFont
f1 = ImageFont.truetype('$FONTS_DIR/NotoSansJP-Bold.otf', 40)
f2 = ImageFont.truetype('$FONTS_DIR/NotoSansJP-Regular.otf', 24)
print('[setup] フォント読み込みOK')
"

echo "[setup] 完了。make_card.py が使えます。"
