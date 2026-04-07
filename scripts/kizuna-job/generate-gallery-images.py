#!/usr/bin/env python3
"""トップページギャラリー用の画像3枚を生成"""

from PIL import Image, ImageDraw, ImageFont
import os

IMG_DIR = '/home/ozawakiryu0902/projects/vonds/kizuna-job/wordpress-theme/kizuna-job-theme/images'
W, H = 800, 500

# フォント
FONT_BOLD = '/home/ozawakiryu0902/.local/share/fonts/NotoSansCJKjp-Bold.otf'
FONT_REG = FONT_BOLD  # Regularがなければ同じ

def draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rectangle([x0+radius, y0, x1-radius, y1], fill=fill)
    draw.rectangle([x0, y0+radius, x1, y1-radius], fill=fill)
    draw.pieslice([x0, y0, x0+2*radius, y0+2*radius], 180, 270, fill=fill)
    draw.pieslice([x1-2*radius, y0, x1, y0+2*radius], 270, 360, fill=fill)
    draw.pieslice([x0, y1-2*radius, x0+2*radius, y1], 90, 180, fill=fill)
    draw.pieslice([x1-2*radius, y1-2*radius, x1, y1], 0, 90, fill=fill)

def text_center(draw, text, font, y, fill, img_width):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (img_width - tw) // 2
    draw.text((x, y), text, font=font, fill=fill)

def create_gradient(w, h, color1, color2, direction='diagonal'):
    img = Image.new('RGB', (w, h))
    for y in range(h):
        for x in range(w):
            if direction == 'diagonal':
                t = (x / w * 0.5 + y / h * 0.5)
            else:
                t = y / h
            r = int(color1[0] + (color2[0] - color1[0]) * t)
            g = int(color1[1] + (color2[1] - color1[1]) * t)
            b = int(color1[2] + (color2[2] - color1[2]) * t)
            img.putpixel((x, y), (r, g, b))
    return img


# ===== 1. 清潔感のある環境 =====
img = create_gradient(W, H, (245, 240, 248), (230, 210, 240))
draw = ImageDraw.Draw(img)

# 装飾: 大きな円
draw.ellipse([W-300, -100, W+100, 300], fill=(220, 195, 230, 50))
draw.ellipse([-80, H-250, 250, H+80], fill=(210, 180, 220, 40))

# アイコン風の円
draw.ellipse([W//2-60, 80, W//2+60, 200], fill=(176, 48, 112))

# チェックマーク風のテキスト
icon_font = ImageFont.truetype(FONT_BOLD, 60)
text_center(draw, '✓', icon_font, 95, (255, 255, 255), W)

# メインテキスト
title_font = ImageFont.truetype(FONT_BOLD, 48)
sub_font = ImageFont.truetype(FONT_BOLD, 24)

text_center(draw, '清潔感のある環境', title_font, 230, (42, 42, 62), W)

# サブテキスト
draw_rounded_rect(draw, [W//2-220, 310, W//2+220, 360], 8, (176, 48, 112))
text_center(draw, 'Wi-Fi完備・個室待機・完全プライベート', sub_font, 318, (255, 255, 255), W)

# 3つのポイント
point_font = ImageFont.truetype(FONT_BOLD, 20)
points = ['🏠 個室ワンルーム寮', '🛋️ 完全個室待機所', '🔒 プライバシー厳守']
for i, pt in enumerate(points):
    x = 100 + i * 220
    draw.text((x, 400), pt, font=point_font, fill=(80, 60, 100))

img.save(os.path.join(IMG_DIR, 'gallery-clean.jpg'), 'JPEG', quality=90)
print('OK: gallery-clean.jpg')


# ===== 2. 体験入店からスタートOK =====
img = create_gradient(W, H, (255, 240, 245), (255, 220, 235))
draw = ImageDraw.Draw(img)

# 装飾
draw.ellipse([W-280, -80, W+80, 280], fill=(255, 210, 225))
draw.ellipse([-60, H-200, 200, H+60], fill=(255, 205, 220))

# 大きな数字
big_font = ImageFont.truetype(FONT_BOLD, 120)
text_center(draw, '¥35,000〜', big_font, 40, (176, 48, 112), W)

# サブライン
sub2_font = ImageFont.truetype(FONT_BOLD, 28)
text_center(draw, '体験入店の日給', sub2_font, 170, (100, 60, 80), W)

# メインテキスト
title_font2 = ImageFont.truetype(FONT_BOLD, 44)
text_center(draw, '体験入店からスタートOK', title_font2, 230, (42, 42, 62), W)

# ポイント枠
draw_rounded_rect(draw, [80, 310, W-80, 460], 16, (255, 255, 255))
draw.rectangle([80, 310, W-80, 312], fill=(176, 48, 112))

point_items = [
    '✅ 即日体験OK・当日お給料GET',
    '✅ 続ける義務なし・辞退も自由',
    '✅ 女性スタッフが丁寧にサポート',
]
item_font = ImageFont.truetype(FONT_BOLD, 22)
for i, item in enumerate(point_items):
    draw.text((120, 330 + i * 40), item, font=item_font, fill=(60, 40, 70))

img.save(os.path.join(IMG_DIR, 'gallery-trial.jpg'), 'JPEG', quality=90)
print('OK: gallery-trial.jpg')


# ===== 3. 30代〜50代も活躍中 =====
img = create_gradient(W, H, (250, 245, 255), (235, 225, 250))
draw = ImageDraw.Draw(img)

# 装飾
draw.ellipse([W-250, -60, W+60, 250], fill=(240, 230, 248))
draw.ellipse([-40, H-180, 180, H+40], fill=(235, 220, 245))

# 大きな数字
big_font2 = ImageFont.truetype(FONT_BOLD, 100)
text_center(draw, '採用率 90%', big_font2, 30, (176, 48, 112), W)

# サブ
sub3_font = ImageFont.truetype(FONT_BOLD, 26)
text_center(draw, '年齢・容姿・体型 一切不問', sub3_font, 150, (100, 70, 110), W)

# メインテキスト
title_font3 = ImageFont.truetype(FONT_BOLD, 44)
text_center(draw, '30代〜50代も活躍中', title_font3, 210, (42, 42, 62), W)

# 年代バー
bar_y = 290
ages = [('10代', 4, (255, 150, 180)), ('20代', 13, (176, 48, 112)), ('30代', 9, (140, 40, 100)), ('40代', 4, (100, 35, 80))]
total = sum(a[1] for a in ages)
x_start = 80
bar_w = W - 160
label_font = ImageFont.truetype(FONT_BOLD, 18)
num_font = ImageFont.truetype(FONT_BOLD, 24)

for label, count, color in ages:
    seg_w = int(bar_w * count / total)
    draw_rounded_rect(draw, [x_start, bar_y, x_start + seg_w - 4, bar_y + 50], 6, color)
    # ラベル
    text_x = x_start + seg_w // 2 - 20
    draw.text((text_x, bar_y + 8), label, font=label_font, fill=(255, 255, 255))
    draw.text((text_x, bar_y + 28), f'{count}人', font=label_font, fill=(255, 255, 255))
    x_start += seg_w

# 下のポイント
draw_rounded_rect(draw, [80, 370, W-80, 470], 16, (255, 255, 255))
points3 = [
    '👩 主婦・Wワーク歓迎',
    '💰 60〜100分で8,000〜14,000円',
    '🕐 完全自由出勤・週1日〜OK',
]
for i, pt in enumerate(points3):
    draw.text((120, 385 + i * 30), pt, font=item_font, fill=(60, 40, 70))

img.save(os.path.join(IMG_DIR, 'gallery-mature.jpg'), 'JPEG', quality=90)
print('OK: gallery-mature.jpg')

print('\n3枚の画像生成完了')
