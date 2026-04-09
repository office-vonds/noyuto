#!/bin/bash
# 本気ストレッチLP — 修正ファイルアップロード
# メインPCで実行: bash ~/noyuto/upload_lp.sh

set -e

FTP_HOST="sv1092.wpx.ne.jp"
FTP_USER="majistretch.com"
FTP_PASS="uv3ihpxcmhlg"
FTP_OPTS="set ftp:ssl-force true; set ssl:verify-certificate false"
LP_DIR=~/noyuto/majistretch/lp
PUBLIC_HTML="majistretch.com/public_html/lp"

echo "=========================================="
echo "本気ストレッチLP — FTPアップロード"
echo "=========================================="

echo "[1/1] アップロード中..."
lftp -u "$FTP_USER","$FTP_PASS" -e "$FTP_OPTS; \
  put $LP_DIR/index.html -o $PUBLIC_HTML/index.html; \
  put $LP_DIR/css/style.css -o $PUBLIC_HTML/css/style.css; \
  put $LP_DIR/js/main.js -o $PUBLIC_HTML/js/main.js; \
  quit" "$FTP_HOST"

echo ""
echo "=========================================="
echo "アップロード完了！"
echo "=========================================="
echo ""
echo "確認: https://majistretch.com/lp/"
echo ""
echo "修正内容:"
echo "  1. PC表示: 480px中央寄せ、背景グレー"
echo "  2. サイドナビ: 768-1099px間はnone"
echo "  3. スクロールフェードイン: 全セクション"
echo "  4. CTAパルスアニメーション"
echo "  5. FV初期ロードアニメーション"
