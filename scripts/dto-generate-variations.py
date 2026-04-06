#!/usr/bin/env python3
"""
デリヘルタウン写メ日記用 画像バリエーション自動生成
元写真から加工パターンを生成し、「新しい画像」として投稿可能にする

加工パターン:
1. 明るさ調整（明るめ/暗め）
2. 色温度変更（暖色/寒色）
3. コントラスト強弱
4. トリミング位置変更（上/中/下）
5. ソフトフォーカス
6. テキスト重ね
"""
import os
import sys
import random
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageFont

FONT_PATH = os.path.expanduser("~/.local/share/fonts/NotoSansCJKjp-Bold.otf")
INPUT_DIR = os.path.join(os.path.dirname(__file__), "dto-images")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "dto-variations")

# テキストオーバーレイのバリエーション
TEXT_OVERLAYS = [
    "出勤しました♡", "待ってるね♡", "今日もよろしく♪",
    "会いに来てね💕", "お待ちしてます♡", "今日も元気♪",
    "遊びに来てね💗", "ドキドキ♡", "甘えさせて♡",
    "今日はいい天気♪", "よろしくね💕", "癒してあげる♡",
]


def adjust_brightness(img, factor):
    return ImageEnhance.Brightness(img).enhance(factor)


def adjust_color_temp(img, warm=True):
    """色温度変更（暖色/寒色）"""
    r, g, b = img.split()
    if warm:
        r = r.point(lambda x: min(255, int(x * 1.08)))
        b = b.point(lambda x: int(x * 0.92))
    else:
        r = r.point(lambda x: int(x * 0.92))
        b = b.point(lambda x: min(255, int(x * 1.08)))
    return Image.merge("RGB", (r, g, b))


def adjust_contrast(img, factor):
    return ImageEnhance.Contrast(img).enhance(factor)


def crop_variation(img, position):
    """トリミング位置変更（元画像の90%を切り出し）"""
    w, h = img.size
    crop_w = int(w * 0.9)
    crop_h = int(h * 0.9)

    if position == "top":
        box = ((w - crop_w) // 2, 0, (w + crop_w) // 2, crop_h)
    elif position == "bottom":
        box = ((w - crop_w) // 2, h - crop_h, (w + crop_w) // 2, h)
    else:  # center
        box = ((w - crop_w) // 2, (h - crop_h) // 2, (w + crop_w) // 2, (h + crop_h) // 2)

    return img.crop(box).resize((w, h), Image.LANCZOS)


def soft_focus(img):
    return img.filter(ImageFilter.GaussianBlur(radius=1.2))


def add_text_overlay(img, text):
    """テキスト重ね（下部に半透明バー＋テキスト）"""
    img = img.copy()
    draw = ImageDraw.Draw(img)
    w, h = img.size

    # 半透明バー
    bar_h = int(h * 0.1)
    bar_y = h - bar_h
    overlay = Image.new("RGBA", (w, bar_h), (255, 255, 255, 140))
    img_rgba = img.convert("RGBA")
    img_rgba.paste(overlay, (0, bar_y), overlay)
    img = img_rgba.convert("RGB")

    # テキスト
    draw = ImageDraw.Draw(img)
    try:
        font_size = int(bar_h * 0.5)
        font = ImageFont.truetype(FONT_PATH, font_size)
    except:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_x = (w - text_w) // 2
    text_y = bar_y + (bar_h - (bbox[3] - bbox[1])) // 2
    draw.text((text_x, text_y), text, fill=(255, 105, 180), font=font)

    return img


def generate_variations(input_path, cast_name, base_idx):
    """1枚の元写真から10パターンを生成"""
    img = Image.open(input_path).convert("RGB")
    variations = []

    patterns = [
        ("bright", lambda i: adjust_brightness(i, 1.15)),
        ("dark", lambda i: adjust_brightness(i, 0.88)),
        ("warm", lambda i: adjust_color_temp(i, warm=True)),
        ("cool", lambda i: adjust_color_temp(i, warm=False)),
        ("contrast_hi", lambda i: adjust_contrast(i, 1.2)),
        ("contrast_lo", lambda i: adjust_contrast(i, 0.85)),
        ("crop_top", lambda i: crop_variation(i, "top")),
        ("crop_bottom", lambda i: crop_variation(i, "bottom")),
        ("soft", lambda i: soft_focus(i)),
        ("text", lambda i: add_text_overlay(i, TEXT_OVERLAYS[base_idx % len(TEXT_OVERLAYS)])),
    ]

    for suffix, transform in patterns:
        try:
            result = transform(img)
            filename = f"{cast_name}_{base_idx}_{suffix}.jpg"
            out_path = os.path.join(OUTPUT_DIR, filename)
            result.save(out_path, "JPEG", quality=85, optimize=True)
            size_kb = os.path.getsize(out_path) / 1024
            variations.append(out_path)
        except Exception as e:
            print(f"  エラー ({suffix}): {e}")

    return variations


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 指定キャストの画像を処理（デフォルト: きみ）
    cast_name = sys.argv[1] if len(sys.argv) > 1 else "きみ"

    # 入力画像を収集（サムネイルっぽい小さい画像は除外）
    input_files = []
    for f in sorted(os.listdir(INPUT_DIR)):
        if f.startswith(cast_name) and f.endswith(".jpg"):
            fpath = os.path.join(INPUT_DIR, f)
            size = os.path.getsize(fpath)
            if size > 15000:  # 15KB以上（サムネイル除外）
                input_files.append(fpath)

    print(f"元写真: {len(input_files)}枚 ({cast_name})")

    total = 0
    for idx, fpath in enumerate(input_files):
        print(f"\n[{idx+1}/{len(input_files)}] {os.path.basename(fpath)}")
        variations = generate_variations(fpath, cast_name, idx)
        total += len(variations)
        for v in variations:
            size_kb = os.path.getsize(v) / 1024
            print(f"  ✓ {os.path.basename(v)} ({size_kb:.0f}KB)")

    print(f"\n生成完了: 元{len(input_files)}枚 → {total}バリエーション")
    print(f"出力先: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
