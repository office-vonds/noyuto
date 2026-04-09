#!/bin/bash
# VONDS 実績一覧ページ — スクリーンショット取得＋アップロード
set -e

FTP_HOST="sv1092.wpx.ne.jp"
FTP_USER="vonds.co.jp"
FTP_PASS="kiryu0902"
FTP_OPTS="set ftp:ssl-force true; set ssl:verify-certificate false"
PW_DIR=~/noyuto/vonds-site/past_work
IMG_DIR="$PW_DIR/images"

echo "=========================================="
echo "VONDS 実績一覧ページ アップロード"
echo "=========================================="

# 1. スクリーンショット取得
mkdir -p "$IMG_DIR"
echo "[1/3] スクリーンショットを取得中..."

# 各サイトのOGP画像 or スクリーンショットを取得（フォールバック用プレースホルダー）
for site in "atruck:https://www.a-truck.jp" "stretchzero:https://stretchzero.jp" "porta:https://www.porta-y.jp" "forcus:https://www.forcus.co.jp" "nagato:https://nagato-jinja.jp"; do
  name="${site%%:*}"
  url="${site##*:}"

  if [ ! -f "$IMG_DIR/${name}.webp" ] && [ ! -f "$IMG_DIR/${name}.png" ] && [ ! -f "$IMG_DIR/${name}.jpg" ]; then
    echo "  スクリーンショット取得: $name ($url)"
    # Chromeのheadlessモードでスクリーンショット
    google-chrome --headless --disable-gpu --screenshot="$IMG_DIR/${name}.png" --window-size=1280,800 "$url" 2>/dev/null || \
    chromium-browser --headless --disable-gpu --screenshot="$IMG_DIR/${name}.png" --window-size=1280,800 "$url" 2>/dev/null || \
    echo "    Chrome未インストール。手動で $IMG_DIR/${name}.png を配置してください"
  else
    echo "  スキップ（既存）: $name"
  fi
done

# 画像がない場合のプレースホルダー生成
for name in atruck stretchzero porta forcus nagato; do
  if [ ! -f "$IMG_DIR/${name}.webp" ] && [ ! -f "$IMG_DIR/${name}.png" ] && [ ! -f "$IMG_DIR/${name}.jpg" ]; then
    echo "  プレースホルダー生成: $name"
    # 640x400のSVGプレースホルダー
    cat > "$IMG_DIR/${name}.svg" << SVGEOF
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <rect fill="#e5e7eb" width="640" height="400"/>
  <text fill="#9ca3af" font-family="sans-serif" font-size="24" x="50%" y="50%" text-anchor="middle" dy=".3em">${name}</text>
</svg>
SVGEOF
  fi
done

echo ""
echo "[2/3] ファイル確認..."
echo "  HTMLファイル:"
ls -la "$PW_DIR/index.html"
echo "  画像ファイル:"
ls -la "$IMG_DIR/" 2>/dev/null || echo "  画像なし"

# 3. FTPアップロード
echo ""
echo "[3/3] FTPアップロード中..."
lftp -u "$FTP_USER","$FTP_PASS" -e "$FTP_OPTS; \
  mkdir -p past_work/images 2>/dev/null; \
  put $PW_DIR/index.html -o past_work/index.html; \
  lcd $IMG_DIR; \
  cd past_work/images; \
  mput * 2>/dev/null; \
  quit" "$FTP_HOST"

echo ""
echo "=========================================="
echo "アップロード完了！"
echo "=========================================="
echo ""
echo "確認: https://vonds.co.jp/past_work/"
echo ""
echo "※ スクリーンショットが取得できなかった場合:"
echo "   各サイトのスクリーンショットを手動で以下に配置してください:"
echo "   $IMG_DIR/atruck.webp (or .png/.jpg)"
echo "   $IMG_DIR/stretchzero.webp"
echo "   $IMG_DIR/porta.webp"
echo "   $IMG_DIR/forcus.webp"
echo "   $IMG_DIR/nagato.webp"
echo "   配置後、再度このスクリプトを実行してください。"
