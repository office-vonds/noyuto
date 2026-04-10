#!/usr/bin/env python3
"""X投稿に添付する画像カードを生成する。

ブランド統一・視認性UP・ブクマ率UP狙い。
1200x675 (X最適・16:9)。NOYUTOブランド（黒背景 + 白文字 + 右下に署名）。

使い方:
  python3 make_card.py "テキスト本文" [-o 出力パス] [-t テーマラベル]
  python3 make_card.py --from-post posts/YYYYMMDD_HHMMSS.json
"""
import argparse
import json
import sys
import textwrap
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).parent
FONT_BOLD = BASE_DIR / "assets" / "fonts" / "NotoSansJP-Bold.otf"
FONT_REG = BASE_DIR / "assets" / "fonts" / "NotoSansJP-Regular.otf"
CARDS_DIR = BASE_DIR / "assets" / "cards"

# X最適サイズ
W, H = 1200, 675
BG_COLOR = (10, 10, 12)  # ほぼ黒
TEXT_COLOR = (245, 245, 245)
ACCENT_COLOR = (180, 150, 90)  # 落ち着いたゴールド
SUB_COLOR = (140, 140, 140)

# 余白
PAD_X = 90
PAD_Y = 90


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int, draw: ImageDraw.ImageDraw) -> list[str]:
    """日本語対応のテキスト折り返し。単語境界ではなく文字単位で折り返す"""
    lines = []
    for paragraph in text.split("\n"):
        if not paragraph:
            lines.append("")
            continue
        current = ""
        for ch in paragraph:
            test = current + ch
            bbox = draw.textbbox((0, 0), test, font=font)
            w = bbox[2] - bbox[0]
            if w > max_width and current:
                lines.append(current)
                current = ch
            else:
                current = test
        if current:
            lines.append(current)
    return lines


def fit_font_size(text: str, max_w: int, max_h: int, draw: ImageDraw.ImageDraw,
                  font_path: str, start_size: int = 64, min_size: int = 32) -> tuple[ImageFont.FreeTypeFont, list[str]]:
    """テキストが枠に収まる最大サイズのフォントを見つける"""
    size = start_size
    while size >= min_size:
        font = ImageFont.truetype(font_path, size)
        lines = wrap_text(text, font, max_w, draw)
        line_h = int(size * 1.55)
        total_h = line_h * len(lines)
        if total_h <= max_h:
            return font, lines
        size -= 2
    font = ImageFont.truetype(font_path, min_size)
    return font, wrap_text(text, font, max_w, draw)


def render_card(text: str, out_path: Path, theme_label: str = "") -> Path:
    """カード画像を生成して保存する"""
    img = Image.new("RGB", (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # 左上のアクセントライン（ブランド要素）
    draw.rectangle([(PAD_X, PAD_Y - 20), (PAD_X + 80, PAD_Y - 12)], fill=ACCENT_COLOR)

    # テーマラベル（左上、小さく）
    if theme_label:
        try:
            label_font = ImageFont.truetype(str(FONT_REG), 24)
            draw.text((PAD_X, PAD_Y), theme_label, font=label_font, fill=SUB_COLOR)
        except Exception:
            pass

    # 本文領域の計算
    body_top = PAD_Y + 60
    body_bottom = H - PAD_Y - 60
    body_w = W - PAD_X * 2
    body_h = body_bottom - body_top

    # フィットするフォントサイズを決定
    font, lines = fit_font_size(text, body_w, body_h, draw, str(FONT_BOLD),
                                start_size=64, min_size=32)

    # 縦中央揃え
    line_h = int(font.size * 1.55)
    total_h = line_h * len(lines)
    y = body_top + (body_h - total_h) // 2

    for line in lines:
        draw.text((PAD_X, y), line, font=font, fill=TEXT_COLOR)
        y += line_h

    # 署名（右下）
    try:
        sig_font = ImageFont.truetype(str(FONT_REG), 22)
        sig = "— NOYUTO / noyuto.com"
        bbox = draw.textbbox((0, 0), sig, font=sig_font)
        sw = bbox[2] - bbox[0]
        draw.text((W - PAD_X - sw, H - PAD_Y - 10), sig, font=sig_font, fill=SUB_COLOR)
    except Exception:
        pass

    CARDS_DIR.mkdir(parents=True, exist_ok=True)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    return out_path


def extract_key_phrase(text: str, max_len: int = 80) -> str:
    """投稿本文からカード用のキーフレーズを抽出する。
    NOTE URL・ハッシュタグ・末尾の導線文を除外して、核となる1〜3文を取り出す。
    """
    # URL除去
    import re
    clean = re.sub(r"https?://\S+", "", text)
    # ハッシュタグ除去
    clean = re.sub(r"#\S+", "", clean)
    # 余計な空白整理
    clean = "\n".join(line.strip() for line in clean.split("\n") if line.strip())

    # 文を分割（。と？で区切る）
    sentences = re.split(r"(?<=[。？])", clean)
    sentences = [s.strip() for s in sentences if s.strip()]

    # 先頭から詰めて max_len に収まるまで
    out = ""
    for s in sentences:
        if len(out) + len(s) > max_len and out:
            break
        out += s + "\n"
    out = out.strip()
    if not out:
        out = clean[:max_len]
    return out


def main():
    parser = argparse.ArgumentParser(description="X投稿用カード画像生成")
    parser.add_argument("text", nargs="?", help="カードに載せるテキスト")
    parser.add_argument("--from-post", help="posts/*.json から読み込む")
    parser.add_argument("-o", "--output", help="出力パス（デフォルト: assets/cards/YYYYMMDD_HHMMSS.png）")
    parser.add_argument("-t", "--theme", default="", help="テーマラベル（左上に小さく表示）")
    parser.add_argument("--max-len", type=int, default=80, help="カードに載せる最大文字数")
    args = parser.parse_args()

    text = args.text
    theme = args.theme

    if args.from_post:
        with open(args.from_post, encoding="utf-8") as f:
            data = json.load(f)
        text = data.get("text", "")
        theme = theme or data.get("topic", "")

    if not text:
        print("エラー: テキストが指定されていません")
        sys.exit(1)

    phrase = extract_key_phrase(text, max_len=args.max_len)

    out = args.output
    if not out:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        out = CARDS_DIR / f"{ts}.png"
    else:
        out = Path(out)

    result = render_card(phrase, out, theme_label=theme)
    print(f"CARD:{result}")


if __name__ == "__main__":
    main()
