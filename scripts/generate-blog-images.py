#!/usr/bin/env python3
"""
バニラ・ガールズヘブン用 ブログ画像自動生成
バニラ: 300x300px, ≤500KB
ガールズヘブン: 240x320px, ≤1MB
"""
import os
from PIL import Image, ImageDraw, ImageFont
import random

FONT_PATH = os.path.expanduser("~/.local/share/fonts/NotoSansCJKjp-Bold.otf")
OUT_DIR = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(OUT_DIR, exist_ok=True)

# カラーパレット（7テーマ対応）
THEMES = [
    {  # 給料系
        "name": "salary",
        "bg_colors": [(255, 240, 245), (255, 228, 235)],
        "accent": (255, 105, 180),
        "text_color": (80, 0, 40),
        "lines": ["高収入", "日払い対応", "業界トップの\nバック率"],
        "sub": "週3日で月収40万円超も！",
    },
    {  # 身バレ対策
        "name": "privacy",
        "bg_colors": [(230, 240, 255), (220, 235, 250)],
        "accent": (70, 130, 220),
        "text_color": (20, 40, 80),
        "lines": ["身バレ対策", "徹底サポート", "顔出しNG\n完全対応"],
        "sub": "7つの対策で安心して働ける",
    },
    {  # 未経験
        "name": "beginner",
        "bg_colors": [(255, 250, 230), (255, 245, 220)],
        "accent": (255, 165, 0),
        "text_color": (80, 50, 0),
        "lines": ["未経験\n大歓迎", "丁寧サポート", "7割が\n未経験スタート"],
        "sub": "初日の流れも全部教えます！",
    },
    {  # Q&A
        "name": "qa",
        "bg_colors": [(240, 255, 240), (230, 250, 230)],
        "accent": (60, 180, 100),
        "text_color": (20, 60, 30),
        "lines": ["Q&A", "よくある\n質問", "疑問を\nぜんぶ解決"],
        "sub": "応募前の不安をゼロに！",
    },
    {  # 出稼ぎ
        "name": "dekasegi",
        "bg_colors": [(250, 240, 255), (240, 230, 250)],
        "accent": (150, 80, 200),
        "text_color": (50, 20, 80),
        "lines": ["出稼ぎ\n歓迎", "寮完備", "交通費\nサポート"],
        "sub": "1泊2日〜長期までOK！",
    },
    {  # 待遇
        "name": "benefits",
        "bg_colors": [(255, 245, 238), (255, 240, 230)],
        "accent": (255, 99, 71),
        "text_color": (80, 30, 20),
        "lines": ["充実の\n待遇", "自由出勤", "罰金\nノルマなし"],
        "sub": "他店と比べてください！",
    },
    {  # 季節系
        "name": "seasonal",
        "bg_colors": [(255, 248, 240), (255, 242, 230)],
        "accent": (255, 140, 105),
        "text_color": (80, 40, 20),
        "lines": ["今が\nチャンス", "入店特典\nあり", "新生活\n応援"],
        "sub": "まずはお気軽にお問い合わせ",
    },
]


def draw_gradient(draw, width, height, color1, color2):
    """縦グラデーション背景"""
    for y in range(height):
        r = int(color1[0] + (color2[0] - color1[0]) * y / height)
        g = int(color1[1] + (color2[1] - color1[1]) * y / height)
        b = int(color1[2] + (color2[2] - color1[2]) * y / height)
        draw.line([(0, y), (width, y)], fill=(r, g, b))


def draw_decorative_circles(draw, width, height, accent):
    """装飾的な円"""
    r, g, b = accent
    for _ in range(5):
        x = random.randint(-30, width)
        y = random.randint(-30, height)
        size = random.randint(40, 120)
        opacity = random.randint(20, 50)
        color = (r, g, b, opacity)
        draw.ellipse([x, y, x + size, y + size], fill=None, outline=(*accent, 80), width=2)


def create_image(width, height, theme, variant=0):
    """画像生成"""
    img = Image.new("RGB", (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # 背景グラデーション
    draw_gradient(draw, width, height, theme["bg_colors"][0], theme["bg_colors"][1])

    # アクセントバー（上部）
    bar_h = int(height * 0.12)
    draw.rectangle([0, 0, width, bar_h], fill=theme["accent"])

    # 「絆」ロゴテキスト（上部バー内）
    try:
        logo_font = ImageFont.truetype(FONT_PATH, int(bar_h * 0.6))
    except:
        logo_font = ImageFont.load_default()
    logo_text = "山梨デリヘル 絆"
    logo_bbox = draw.textbbox((0, 0), logo_text, font=logo_font)
    logo_w = logo_bbox[2] - logo_bbox[0]
    draw.text(((width - logo_w) // 2, int(bar_h * 0.15)), logo_text, fill=(255, 255, 255), font=logo_font)

    # メインテキスト（テーマごとにバリエーション）
    text_idx = variant % len(theme["lines"])
    main_text = theme["lines"][text_idx]

    try:
        main_font_size = int(min(width, height) * 0.18)
        main_font = ImageFont.truetype(FONT_PATH, main_font_size)
    except:
        main_font = ImageFont.load_default()

    # メインテキスト描画（中央）
    lines = main_text.split("\n")
    total_h = sum(draw.textbbox((0, 0), l, font=main_font)[3] for l in lines) + (len(lines) - 1) * 10
    y_start = (height - total_h) // 2

    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=main_font)
        line_w = bbox[2] - bbox[0]
        draw.text(((width - line_w) // 2, y_start), line, fill=theme["text_color"], font=main_font)
        y_start += bbox[3] + 10

    # サブテキスト（下部）
    try:
        sub_font = ImageFont.truetype(FONT_PATH, int(min(width, height) * 0.065))
    except:
        sub_font = ImageFont.load_default()

    sub_bbox = draw.textbbox((0, 0), theme["sub"], font=sub_font)
    sub_w = sub_bbox[2] - sub_bbox[0]
    sub_y = height - int(height * 0.18)
    draw.text(((width - sub_w) // 2, sub_y), theme["sub"], fill=theme["accent"], font=sub_font)

    # 下部アクセントバー
    draw.rectangle([0, height - int(height * 0.06), width, height], fill=theme["accent"])

    # 下部テキスト
    try:
        bottom_font = ImageFont.truetype(FONT_PATH, int(height * 0.035))
    except:
        bottom_font = ImageFont.load_default()
    bottom_text = "LINEでお気軽にお問い合わせ♪"
    bb = draw.textbbox((0, 0), bottom_text, font=bottom_font)
    bw = bb[2] - bb[0]
    draw.text(((width - bw) // 2, height - int(height * 0.055)), bottom_text, fill=(255, 255, 255), font=bottom_font)

    return img


def main():
    generated = {"vanilla": [], "girlsheaven": []}

    for i, theme in enumerate(THEMES):
        for v in range(len(theme["lines"])):  # テーマごとに複数バリエーション
            # バニラ用 300x300
            vanilla_img = create_image(300, 300, theme, variant=v)
            vanilla_path = os.path.join(OUT_DIR, f"vanilla_{theme['name']}_{v}.jpg")
            vanilla_img.save(vanilla_path, "JPEG", quality=85, optimize=True)
            size_kb = os.path.getsize(vanilla_path) / 1024
            generated["vanilla"].append(vanilla_path)
            print(f"  バニラ: {vanilla_path} ({size_kb:.0f}KB)")

            # ガールズヘブン用 240x320
            gh_img = create_image(240, 320, theme, variant=v)
            gh_path = os.path.join(OUT_DIR, f"gh_{theme['name']}_{v}.jpg")
            gh_img.save(gh_path, "JPEG", quality=85, optimize=True)
            size_kb = os.path.getsize(gh_path) / 1024
            generated["girlsheaven"].append(gh_path)
            print(f"  GH:     {gh_path} ({size_kb:.0f}KB)")

    # マニフェストファイル出力
    import json
    manifest = {
        "vanilla": [os.path.basename(p) for p in generated["vanilla"]],
        "girlsheaven": [os.path.basename(p) for p in generated["girlsheaven"]],
    }
    manifest_path = os.path.join(OUT_DIR, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"\n生成完了: バニラ{len(generated['vanilla'])}枚, GH{len(generated['girlsheaven'])}枚")
    print(f"マニフェスト: {manifest_path}")


if __name__ == "__main__":
    main()
