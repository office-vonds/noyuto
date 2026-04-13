#!/bin/bash
# UNRYUTO マニュアル変換ツール
#
# 使い方:
#   ./convert-manual.sh input.html output.pdf
#
# 前提:
#   - wkhtmltopdf がインストール済み（apt install wkhtmltopdf）
#   - 入力はテンプレートの {{}} を埋めたHTMLファイル
#
# NOYUTOの口述フロー:
#   1. NOYUTOが口述（テキスト or 音声→テキスト変換）
#   2. Claude Code が口述内容をテーマ別に分類・構造化
#   3. manual-template.html の {{}} を埋めてHTMLを生成
#   4. このスクリプトでPDF化
#   5. Stripe経由で自動配信

INPUT="$1"
OUTPUT="${2:-manual.pdf}"

if [ -z "$INPUT" ]; then
  echo "Usage: ./convert-manual.sh input.html [output.pdf]"
  exit 1
fi

if ! command -v wkhtmltopdf &> /dev/null; then
  echo "wkhtmltopdf が未インストール。インストール:"
  echo "  sudo apt install wkhtmltopdf"
  exit 1
fi

wkhtmltopdf \
  --page-size A4 \
  --margin-top 20mm \
  --margin-bottom 20mm \
  --margin-left 15mm \
  --margin-right 15mm \
  --encoding utf-8 \
  --enable-local-file-access \
  --print-media-type \
  "$INPUT" "$OUTPUT"

echo "PDF生成完了: $OUTPUT"
