#!/usr/bin/env python3
"""X投稿の添付カード生成（強化版 2026-04-10）

戦略: Xテキストは短いフック(50-90字)、カードが本体(150-250字、構造化された内容)。
成功アカウント分析(@oshige_writing, @naomicoach7, @thug_business)の知見を反映。

テンプレート自動判別:
  - listカード: 「・」「①②③」などのリスト形式
  - contrastカード: 「❌/⭕️」「NG/OK」「三流/一流」の対比
  - observationカード: 通常の観察・エッセイ

使い方:
  python3 make_card.py "カード本文" [-o out.png] [-t 健康] [--hook "短いフック"]
"""
import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).parent
FONT_BOLD = BASE_DIR / "assets" / "fonts" / "NotoSansJP-Bold.otf"
FONT_REG = BASE_DIR / "assets" / "fonts" / "NotoSansJP-Regular.otf"
CARDS_DIR = BASE_DIR / "assets" / "cards"

W, H = 1200, 675
BG_COLOR = (10, 10, 12)
TEXT_COLOR = (245, 245, 245)
ACCENT_COLOR = (180, 150, 90)
SUB_COLOR = (140, 140, 140)
NG_COLOR = (232, 90, 90)
OK_COLOR = (108, 206, 140)

PAD_X = 80
PAD_Y = 70


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int, draw: ImageDraw.ImageDraw) -> list[str]:
    lines = []
    for paragraph in text.split("\n"):
        if not paragraph:
            lines.append("")
            continue
        current = ""
        for ch in paragraph:
            test = current + ch
            bbox = draw.textbbox((0, 0), test, font=font)
            if (bbox[2] - bbox[0]) > max_width and current:
                lines.append(current)
                current = ch
            else:
                current = test
        if current:
            lines.append(current)
    return lines


def fit_font(text: str, max_w: int, max_h: int, draw: ImageDraw.ImageDraw,
             font_path: str, start: int = 56, low: int = 24) -> tuple[ImageFont.FreeTypeFont, list[str]]:
    """文字数に応じた最大フォントを見つける"""
    size = start
    while size >= low:
        font = ImageFont.truetype(font_path, size)
        lines = wrap_text(text, font, max_w, draw)
        line_h = int(size * 1.5)
        if line_h * len(lines) <= max_h:
            return font, lines
        size -= 2
    font = ImageFont.truetype(font_path, low)
    return font, wrap_text(text, font, max_w, draw)


def detect_template(text: str) -> str:
    """テキスト構造から適切なテンプレートを判別"""
    if re.search(r"(❌|✕|✖|NG).*?(⭕|○|✓|OK)", text, re.DOTALL):
        return "contrast"
    if re.search(r"[❌✕✖]|[⭕○✓]", text):
        return "contrast"
    bullet_lines = len(re.findall(r"^\s*[・•①②③④⑤⑥⑦⑧⑨⑩\d][\.\)]?\s*", text, re.MULTILINE))
    if bullet_lines >= 3:
        return "list"
    return "observation"


def draw_header(draw: ImageDraw.ImageDraw, theme_label: str):
    """左上のアクセントライン + テーマラベル"""
    draw.rectangle([(PAD_X, PAD_Y - 18), (PAD_X + 70, PAD_Y - 12)], fill=ACCENT_COLOR)
    if theme_label:
        try:
            label_font = ImageFont.truetype(str(FONT_REG), 22)
            draw.text((PAD_X, PAD_Y - 6), theme_label, font=label_font, fill=SUB_COLOR)
        except Exception:
            pass


def draw_signature(draw: ImageDraw.ImageDraw):
    try:
        sig_font = ImageFont.truetype(str(FONT_REG), 20)
        sig = "— NOYUTO"
        bbox = draw.textbbox((0, 0), sig, font=sig_font)
        sw = bbox[2] - bbox[0]
        draw.text((W - PAD_X - sw, H - PAD_Y - 10), sig, font=sig_font, fill=SUB_COLOR)
    except Exception:
        pass


def render_observation(draw, img, text: str, theme_label: str):
    """標準の観察・エッセイカード"""
    draw_header(draw, theme_label)
    body_top = PAD_Y + 40
    body_bottom = H - PAD_Y - 40
    body_w = W - PAD_X * 2
    body_h = body_bottom - body_top

    font, lines = fit_font(text, body_w, body_h, draw, str(FONT_BOLD),
                           start=60, low=28)

    line_h = int(font.size * 1.55)
    total_h = line_h * len(lines)
    y = body_top + (body_h - total_h) // 2

    for line in lines:
        draw.text((PAD_X, y), line, font=font, fill=TEXT_COLOR)
        y += line_h

    draw_signature(draw)


def render_list(draw, img, text: str, theme_label: str):
    """リスト型カード: タイトル1行 + 箇条書き"""
    draw_header(draw, theme_label)

    lines_raw = [l for l in text.split("\n") if l.strip()]
    title = ""
    items = []
    for l in lines_raw:
        if re.match(r"^\s*[・•①②③④⑤⑥⑦⑧⑨⑩\d][\.\)]?\s*", l):
            items.append(re.sub(r"^\s*[・•①②③④⑤⑥⑦⑧⑨⑩\d][\.\)]?\s*", "• ", l.strip()))
        elif not title:
            title = l.strip()
        else:
            # 2つ目以降の非箇条書きはフッター扱いで捨てる or タイトルに追加
            pass

    body_top = PAD_Y + 30
    body_w = W - PAD_X * 2

    # タイトル
    try:
        title_font = ImageFont.truetype(str(FONT_BOLD), 44)
        draw.text((PAD_X, body_top), title, font=title_font, fill=ACCENT_COLOR)
        body_top += 70
    except Exception:
        pass

    # 箇条書き
    available_h = H - PAD_Y - 60 - body_top
    if items:
        item_text = "\n".join(items)
        font, wrapped = fit_font(item_text, body_w, available_h, draw, str(FONT_BOLD),
                                 start=40, low=24)
        line_h = int(font.size * 1.45)
        y = body_top
        for line in wrapped:
            draw.text((PAD_X, y), line, font=font, fill=TEXT_COLOR)
            y += line_h

    draw_signature(draw)


def render_contrast(draw, img, text: str, theme_label: str):
    """対比型カード: 左❌/右⭕ または NG/OK 分割"""
    draw_header(draw, theme_label)

    # 分割マーカーで左右に分ける
    ng_part = ""
    ok_part = ""

    ng_match = re.search(r"(?:❌|✕|✖|NG)(.*?)(?=⭕|○|✓|OK)", text, re.DOTALL)
    ok_match = re.search(r"(?:⭕|○|✓|OK)(.*)", text, re.DOTALL)
    if ng_match:
        ng_part = ng_match.group(1).strip()
    if ok_match:
        ok_part = ok_match.group(1).strip()

    # マーカー直後のラベル行（例: 「やりがちだけどNG」「正解の対応」）を削る
    def _strip_label(section: str) -> str:
        lines = [l for l in section.split("\n") if l.strip()]
        if lines and not lines[0].startswith(("・", "•", "①", "②")):
            lines = lines[1:]
        return "\n".join(lines)

    ng_part = _strip_label(ng_part)
    ok_part = _strip_label(ok_part)

    if not ng_part or not ok_part:
        # フォールバック: 標準レンダリング
        render_observation(draw, img, text, theme_label)
        return

    col_w = (W - PAD_X * 2 - 40) // 2
    body_top = PAD_Y + 30
    body_h = H - PAD_Y - 60 - body_top

    # 左カラム（NG）
    try:
        ng_title_font = ImageFont.truetype(str(FONT_BOLD), 36)
        draw.text((PAD_X, body_top), "✕ やりがち", font=ng_title_font, fill=NG_COLOR)
    except Exception:
        pass

    ng_font, ng_lines = fit_font(ng_part, col_w, body_h - 60, draw, str(FONT_BOLD), start=32, low=20)
    y = body_top + 50
    for line in ng_lines:
        draw.text((PAD_X, y), line, font=ng_font, fill=TEXT_COLOR)
        y += int(ng_font.size * 1.4)

    # 右カラム（OK）
    right_x = PAD_X + col_w + 40
    try:
        ok_title_font = ImageFont.truetype(str(FONT_BOLD), 36)
        draw.text((right_x, body_top), "○ 正解", font=ok_title_font, fill=OK_COLOR)
    except Exception:
        pass

    ok_font, ok_lines = fit_font(ok_part, col_w, body_h - 60, draw, str(FONT_BOLD), start=32, low=20)
    y = body_top + 50
    for line in ok_lines:
        draw.text((right_x, y), line, font=ok_font, fill=TEXT_COLOR)
        y += int(ok_font.size * 1.4)

    # 中央仕切り
    draw.line([(right_x - 20, body_top + 10), (right_x - 20, body_top + body_h - 20)],
              fill=SUB_COLOR, width=2)

    draw_signature(draw)


def clean_text_for_card(text: str) -> str:
    """URL・ハッシュタグ・導線定型文を除去"""
    clean = re.sub(r"https?://\S+", "", text)
    clean = re.sub(r"#\S+", "", clean)
    # NOTE導線定型文の除去
    removal_phrases = [
        r"その答えを、今日のnoteに置いておきました。?",
        r"同じことを、noteにもう少し深く書いています。?",
        r"この問いの先は、noteにあります。?",
        r"続きは、今日のnoteに。?",
        r"続きは.*?noteに。?",
    ]
    for phrase in removal_phrases:
        clean = re.sub(phrase, "", clean)
    clean = "\n".join(line.strip() for line in clean.split("\n") if line.strip())
    return clean.strip()


def render_card(text: str, out_path: Path, theme_label: str = "",
                template: str = "auto") -> tuple[Path, str]:
    """カード画像を生成。テンプレート自動判別可。"""
    img = Image.new("RGB", (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)

    clean = clean_text_for_card(text)
    if template == "auto":
        template = detect_template(clean)

    if template == "list":
        render_list(draw, img, clean, theme_label)
    elif template == "contrast":
        render_contrast(draw, img, clean, theme_label)
    else:
        render_observation(draw, img, clean, theme_label)

    CARDS_DIR.mkdir(parents=True, exist_ok=True)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    return out_path, template


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("text", nargs="?", help="カード本文（150〜250字想定）")
    parser.add_argument("--from-post", help="posts/*.json から読み込む")
    parser.add_argument("-o", "--output", help="出力パス")
    parser.add_argument("-t", "--theme", default="", help="テーマラベル")
    parser.add_argument("--template", default="auto",
                        choices=["auto", "observation", "list", "contrast"])
    args = parser.parse_args()

    text = args.text
    theme = args.theme
    template = args.template

    if args.from_post:
        with open(args.from_post, encoding="utf-8") as f:
            data = json.load(f)
        text = data.get("card_text") or data.get("text", "")
        theme = theme or data.get("theme") or data.get("topic", "")

    if not text:
        print("エラー: テキスト未指定")
        sys.exit(1)

    out = Path(args.output) if args.output else (
        CARDS_DIR / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    )
    result, used_template = render_card(text, out, theme_label=theme, template=template)
    print(f"CARD:{result}")
    print(f"TEMPLATE:{used_template}")


if __name__ == "__main__":
    main()
