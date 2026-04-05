#!/usr/bin/env python3
"""Generate a 20-slide RIWAY presentation."""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Constants
SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)
NAVY = RGBColor(0x1B, 0x2A, 0x4A)
NAVY_LIGHT = RGBColor(0x24, 0x3B, 0x65)
GOLD = RGBColor(0xC9, 0xA8, 0x4C)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GRAY = RGBColor(0xCC, 0xCC, 0xCC)

prs = Presentation()
prs.slide_width = SLIDE_W
prs.slide_height = SLIDE_H

# Use blank layout
blank_layout = prs.slide_layouts[6]


def add_bg(slide):
    """Add navy background rectangle."""
    shape = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_W, SLIDE_H
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = NAVY
    shape.line.fill.background()


def add_slide_number(slide, num):
    """Add slide number at bottom right."""
    txBox = slide.shapes.add_textbox(
        Inches(12.2), Inches(7.0), Inches(1.0), Inches(0.4)
    )
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.text = str(num)
    p.font.size = Pt(12)
    p.font.color.rgb = LIGHT_GRAY
    p.alignment = PP_ALIGN.RIGHT


def add_gold_line(slide, top, left=Inches(1.0), width=Inches(11.333)):
    """Add a gold accent line."""
    shape = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, left, top, width, Pt(3)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = GOLD
    shape.line.fill.background()


def add_title_text(slide, text, top=Inches(0.6), font_size=Pt(40)):
    """Add a title textbox."""
    txBox = slide.shapes.add_textbox(
        Inches(1.0), top, Inches(11.333), Inches(1.2)
    )
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = font_size
    p.font.color.rgb = WHITE
    p.font.bold = True
    p.alignment = PP_ALIGN.LEFT
    return txBox


def add_body_text(slide, text, left=Inches(1.0), top=Inches(2.2),
                  width=Inches(11.333), height=Inches(4.5),
                  font_size=Pt(22), color=WHITE, alignment=PP_ALIGN.LEFT,
                  bold=False):
    """Add body text box."""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = font_size
    p.font.color.rgb = color
    p.font.bold = bold
    p.alignment = alignment
    return txBox


def add_multiline_body(slide, lines, left=Inches(1.0), top=Inches(2.2),
                       width=Inches(11.333), height=Inches(4.5),
                       font_size=Pt(22), color=WHITE, alignment=PP_ALIGN.LEFT,
                       line_spacing=1.5, bold=False):
    """Add multi-line text box."""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = line
        p.font.size = font_size
        p.font.color.rgb = color
        p.font.bold = bold
        p.alignment = alignment
        p.space_after = Pt(6)
    return txBox


def add_rounded_box(slide, left, top, width, height, text_lines,
                    font_size=Pt(18), fill_color=NAVY_LIGHT,
                    border_color=GOLD, text_color=WHITE, alignment=PP_ALIGN.CENTER):
    """Add a rounded rectangle box with text."""
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    shape.line.color.rgb = border_color
    shape.line.width = Pt(2)
    tf = shape.text_frame
    tf.word_wrap = True
    tf.paragraphs[0].alignment = alignment
    for i, line in enumerate(text_lines):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = line
        p.font.size = font_size
        p.font.color.rgb = text_color
        p.alignment = alignment
        p.space_after = Pt(4)
    shape.text_frame.paragraphs[0].space_before = Pt(8)
    return shape


def new_slide():
    return prs.slides.add_slide(blank_layout)


# ============================================================
# SLIDE 1 - Title
# ============================================================
slide = new_slide()
add_bg(slide)
add_gold_line(slide, Inches(3.0), Inches(2.0), Inches(9.333))
add_body_text(slide, "あなたの人生を変える、たった一つの選択",
              left=Inches(1.0), top=Inches(1.5), width=Inches(11.333), height=Inches(2.0),
              font_size=Pt(44), color=WHITE, alignment=PP_ALIGN.CENTER, bold=True)
add_body_text(slide, "RIWAY Business Presentation",
              left=Inches(1.0), top=Inches(3.5), width=Inches(11.333), height=Inches(1.0),
              font_size=Pt(28), color=GOLD, alignment=PP_ALIGN.CENTER)
add_body_text(slide, "Confidential | For Invited Guests Only",
              left=Inches(1.0), top=Inches(6.5), width=Inches(11.333), height=Inches(0.6),
              font_size=Pt(14), color=LIGHT_GRAY, alignment=PP_ALIGN.CENTER)
add_slide_number(slide, 1)

# ============================================================
# SLIDE 2 - Hook
# ============================================================
slide = new_slide()
add_bg(slide)
add_multiline_body(slide,
    ["日本人の2人に1人が、がんになる時代。", "", "あなたの健康対策は、本当に十分ですか？"],
    left=Inches(1.5), top=Inches(2.0), width=Inches(10.333), height=Inches(3.5),
    font_size=Pt(36), alignment=PP_ALIGN.CENTER, bold=True)
add_slide_number(slide, 2)

# ============================================================
# SLIDE 3 - Stats
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "知っていますか？この現実を。")
add_gold_line(slide, Inches(1.5))

box_w = Inches(3.4)
box_h = Inches(3.5)
box_top = Inches(2.5)
gap = Inches(0.5)
start_left = Inches(1.0)

stats = [
    ["平均寿命と健康寿命の差", "男性9年・女性12年"],
    ["生涯医療費", "約2,800万円"],
    ["退職後の収入源を持つ人", "わずか3%"],
]
for i, (title, value) in enumerate(stats):
    left = start_left + i * (box_w + gap)
    box = add_rounded_box(slide, left, box_top, box_w, box_h,
                          [title, "", value], font_size=Pt(22))
    # Make value line gold
    tf = box.text_frame
    for p in tf.paragraphs:
        if p.text == value:
            p.font.color.rgb = GOLD
            p.font.size = Pt(30)
            p.font.bold = True
add_slide_number(slide, 3)

# ============================================================
# SLIDE 4 - Two fears
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "現代人が抱える「2つの不安」")
add_gold_line(slide, Inches(1.5))

col_w = Inches(5.2)
col_h = Inches(4.2)
col_top = Inches(2.3)

# Left column
add_rounded_box(slide, Inches(1.0), col_top, col_w, col_h, [
    "健康の不安", "",
    "・サプリは多すぎて選べない",
    "・高額な健康法は続かない",
    "・何が本物かわからない"
], font_size=Pt(20), alignment=PP_ALIGN.LEFT)

# Right column
add_rounded_box(slide, Inches(7.133), col_top, col_w, col_h, [
    "経済の不安", "",
    "・給料は上がらず物価は上がる",
    "・年金だけでは不安",
    "・副業したいが時間がない"
], font_size=Pt(20), alignment=PP_ALIGN.LEFT)

# Make headers gold
for shape in slide.shapes:
    if hasattr(shape, 'text_frame'):
        for p in shape.text_frame.paragraphs:
            if p.text in ("健康の不安", "経済の不安"):
                p.font.color.rgb = GOLD
                p.font.size = Pt(26)
                p.font.bold = True
add_slide_number(slide, 4)

# ============================================================
# SLIDE 5 - Barriers
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "なぜ、普通の選択肢では解決できないのか")
add_gold_line(slide, Inches(1.5))

barriers = [
    "時間の壁：忙しくて健康管理ができない",
    "コストの壁：良いものほど高額で続かない",
    "情報の壁：何が本物かわからない",
]
for i, text in enumerate(barriers):
    add_rounded_box(slide, Inches(1.5), Inches(2.5 + i * 1.5), Inches(10.333), Inches(1.2),
                    [text], font_size=Pt(24), alignment=PP_ALIGN.LEFT)
add_slide_number(slide, 5)

# ============================================================
# SLIDE 6 - Turning point
# ============================================================
slide = new_slide()
add_bg(slide)
add_body_text(slide, "もし「健康」と「収入」を\n同時に手に入れる方法があるとしたら？",
              left=Inches(1.5), top=Inches(2.0), width=Inches(10.333), height=Inches(3.5),
              font_size=Pt(36), color=GOLD, alignment=PP_ALIGN.CENTER, bold=True)
add_slide_number(slide, 6)

# ============================================================
# SLIDE 7 - RIWAY intro
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "RIWAY とは", font_size=Pt(44))
add_gold_line(slide, Inches(1.5))
add_multiline_body(slide, [
    "・2008年シンガポール設立",
    "・アジア15カ国以上に展開",
    "・ブランドメッセージ「Live Young」",
    "・唯一無二の製品力で急成長",
], top=Inches(2.3), font_size=Pt(24), line_spacing=1.8)
add_slide_number(slide, 7)

# ============================================================
# SLIDE 8 - Trust
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "RIWAY の信頼性")
add_gold_line(slide, Inches(1.5))
add_multiline_body(slide, [
    "・ニュージーランド自社工場",
    "・GMP認証取得",
    "・世界各国の政府認可",
    "・15年以上の実績",
    "・日本法人設立済み",
], top=Inches(2.3), font_size=Pt(24))
add_slide_number(slide, 8)

# ============================================================
# SLIDE 9 - Awards
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "受賞・メディア実績")
add_gold_line(slide, Inches(1.5))
add_multiline_body(slide, [
    "・アジア太平洋トップ企業賞受賞",
    "・各種ビジネスアワード多数",
    "・世界15カ国以上で政府認可",
    "・累計販売実績 数百万箱突破",
], top=Inches(2.3), font_size=Pt(24))
add_slide_number(slide, 9)

# ============================================================
# SLIDE 10 - Product
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "PURTIER PLACENTA", font_size=Pt(44))
add_body_text(slide, "世界唯一の「生きた細胞」カプセル技術",
              left=Inches(1.0), top=Inches(1.5), width=Inches(11.333), height=Inches(0.8),
              font_size=Pt(24), color=GOLD, alignment=PP_ALIGN.LEFT)
add_gold_line(slide, Inches(2.2))
add_multiline_body(slide, [
    "・ニュージーランド産 鹿プラセンタ使用",
    "・特許技術による生細胞カプセル化",
    "・9つの厳選された天然成分を配合",
    "・1箱60カプセル（1ヶ月分）",
], top=Inches(2.8), font_size=Pt(24))
add_slide_number(slide, 10)

# ============================================================
# SLIDE 11 - Ingredients
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "PURTIER の主要成分")
add_gold_line(slide, Inches(1.5))

left_items = ["・鹿プラセンタエキス", "・海洋コラーゲンペプチド", "・大豆イソフラボン", "・アロエベラエキス"]
right_items = ["・マリンコラーゲン", "・ボラージオイル", "・アビジン", "・リコピン", "・ルテイン"]

add_multiline_body(slide, left_items,
                   left=Inches(1.0), top=Inches(2.3), width=Inches(5.5), font_size=Pt(22))
add_multiline_body(slide, right_items,
                   left=Inches(6.8), top=Inches(2.3), width=Inches(5.5), font_size=Pt(22))
add_slide_number(slide, 11)

# ============================================================
# SLIDE 12 - Testimonials
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "愛用者の声")
add_gold_line(slide, Inches(1.5))

testimonials = [
    ["50代女性", "「3ヶ月で肌のハリが戻り、\n周りから若返ったと言われます」"],
    ["60代男性", "「毎朝の目覚めが劇的に\n変わりました。ゴルフの\nスコアも改善」"],
    ["40代女性", "「疲れにくくなり、仕事と\n育児の両立が楽になりました」"],
]
for i, (who, quote) in enumerate(testimonials):
    left = Inches(1.0) + i * (Inches(3.6) + Inches(0.4))
    box = add_rounded_box(slide, left, Inches(2.3), Inches(3.6), Inches(3.5),
                          [who, "", quote], font_size=Pt(16), alignment=PP_ALIGN.CENTER)
    tf = box.text_frame
    for p in tf.paragraphs:
        if p.text == who:
            p.font.color.rgb = GOLD
            p.font.bold = True
            p.font.size = Pt(20)

add_body_text(slide, "※個人の感想です。効果には個人差があります。",
              left=Inches(1.0), top=Inches(6.3), width=Inches(11.333), height=Inches(0.5),
              font_size=Pt(14), color=LIGHT_GRAY, alignment=PP_ALIGN.CENTER)
add_slide_number(slide, 12)

# ============================================================
# SLIDE 13 - Business model
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "消費しながら収益を生む仕組み")
add_gold_line(slide, Inches(1.5))

steps13 = [
    "STEP 1: 自分で使う → 健康を実感する",
    "STEP 2: 良さを伝える → 共感が広がる",
    "STEP 3: チームで広がる → 収益が生まれる",
]
for i, text in enumerate(steps13):
    add_rounded_box(slide, Inches(2.0), Inches(2.5 + i * 1.5), Inches(9.333), Inches(1.2),
                    [text], font_size=Pt(24), alignment=PP_ALIGN.CENTER)
add_slide_number(slide, 13)

# ============================================================
# SLIDE 14 - Compensation
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "7つの報酬プラン")
add_gold_line(slide, Inches(1.5))
add_multiline_body(slide, [
    "1. リテールプロフィット",
    "2. パーソナルボーナス",
    "3. チームボーナス",
    "4. リーダーシップボーナス",
    "5. グローバルプールボーナス",
    "6. トラベルファンド",
    "7. カーファンド",
], top=Inches(2.3), font_size=Pt(22))
add_body_text(slide, "※詳細は紹介者にお問い合わせください",
              left=Inches(1.0), top=Inches(6.3), width=Inches(11.333), height=Inches(0.5),
              font_size=Pt(14), color=LIGHT_GRAY, alignment=PP_ALIGN.CENTER)
add_slide_number(slide, 14)

# ============================================================
# SLIDE 15 - Simulation
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "収入シミュレーション")
add_gold_line(slide, Inches(1.5))

sim_rows = [
    "3人に紹介　→　月収 約5〜10万円",
    "9人のチーム　→　月収 約20〜50万円",
    "27人の組織　→　月収 約100万円以上",
]
for i, text in enumerate(sim_rows):
    add_rounded_box(slide, Inches(2.0), Inches(2.5 + i * 1.4), Inches(9.333), Inches(1.1),
                    [text], font_size=Pt(24), alignment=PP_ALIGN.CENTER)

add_body_text(slide, "※シミュレーション例です。収入を保証するものではありません。",
              left=Inches(1.0), top=Inches(6.3), width=Inches(11.333), height=Inches(0.5),
              font_size=Pt(14), color=LIGHT_GRAY, alignment=PP_ALIGN.CENTER)
add_slide_number(slide, 15)

# ============================================================
# SLIDE 16 - Success
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "成功者の軌跡")
add_gold_line(slide, Inches(1.5))

timeline = [
    "1ヶ月目：製品を体感、3人に紹介",
    "3ヶ月目：チーム9人、月収30万円達成",
    "6ヶ月目：組織拡大、月収100万円突破",
    "12ヶ月目：海外旅行ファンド獲得",
]
for i, text in enumerate(timeline):
    # Gold circle marker
    circle_left = Inches(1.5)
    circle_top = Inches(2.5 + i * 1.1)
    marker = slide.shapes.add_shape(
        MSO_SHAPE.OVAL, circle_left, circle_top, Inches(0.3), Inches(0.3)
    )
    marker.fill.solid()
    marker.fill.fore_color.rgb = GOLD
    marker.line.fill.background()
    # Text
    add_body_text(slide, text,
                  left=Inches(2.2), top=Inches(2.4 + i * 1.1),
                  width=Inches(9.0), height=Inches(0.6),
                  font_size=Pt(22))

add_body_text(slide, "※個人の成果例です。成果には個人差があります。",
              left=Inches(1.0), top=Inches(6.5), width=Inches(11.333), height=Inches(0.5),
              font_size=Pt(14), color=LIGHT_GRAY, alignment=PP_ALIGN.CENTER)
add_slide_number(slide, 16)

# ============================================================
# SLIDE 17 - Why now
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "なぜ「今」なのか")
add_gold_line(slide, Inches(1.5))

why_now = [
    "日本市場はまだ初期段階 → 先行者利益が最大",
    "超高齢化社会 → 健康需要は拡大し続ける",
    "円安時代 → 外貨建て収入の価値が高まる",
]
for i, text in enumerate(why_now):
    add_rounded_box(slide, Inches(1.5), Inches(2.5 + i * 1.5), Inches(10.333), Inches(1.2),
                    [text], font_size=Pt(24), alignment=PP_ALIGN.CENTER)
add_slide_number(slide, 17)

# ============================================================
# SLIDE 18 - How to start
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "始め方は、驚くほど簡単です")
add_gold_line(slide, Inches(1.5))

start_steps = [
    "STEP 1：今日、紹介者と話す",
    "STEP 2：製品を体感する",
    "STEP 3：ビジネスをスタート",
]
for i, text in enumerate(start_steps):
    add_rounded_box(slide, Inches(2.5), Inches(2.5 + i * 1.5), Inches(8.333), Inches(1.2),
                    [text], font_size=Pt(28), alignment=PP_ALIGN.CENTER)
add_slide_number(slide, 18)

# ============================================================
# SLIDE 19 - FAQ
# ============================================================
slide = new_slide()
add_bg(slide)
add_title_text(slide, "よくある質問")
add_gold_line(slide, Inches(1.5))

faqs = [
    ("Q: 営業経験がなくても大丈夫？", "A: 充実したチームサポート体制があります"),
    ("Q: いくらから始められる？", "A: 製品購入からスタート。詳細は紹介者へ"),
    ("Q: 本業と両立できる？", "A: スキマ時間で取り組めます"),
]
for i, (q, a) in enumerate(faqs):
    box = add_rounded_box(slide, Inches(1.5), Inches(2.3 + i * 1.5), Inches(10.333), Inches(1.3),
                          [q, a], font_size=Pt(20), alignment=PP_ALIGN.LEFT)
    tf = box.text_frame
    for p in tf.paragraphs:
        if p.text.startswith("Q:"):
            p.font.color.rgb = GOLD
            p.font.bold = True
add_slide_number(slide, 19)

# ============================================================
# SLIDE 20 - CTA
# ============================================================
slide = new_slide()
add_bg(slide)
add_body_text(slide, "あなたの人生を変える一歩は、\n今日ここから始まります。",
              left=Inches(1.5), top=Inches(1.8), width=Inches(10.333), height=Inches(2.5),
              font_size=Pt(38), color=WHITE, alignment=PP_ALIGN.CENTER, bold=True)
add_gold_line(slide, Inches(4.0), Inches(3.0), Inches(7.333))
add_body_text(slide, "今すぐ、紹介者にご連絡ください。",
              left=Inches(1.5), top=Inches(4.3), width=Inches(10.333), height=Inches(1.2),
              font_size=Pt(30), color=GOLD, alignment=PP_ALIGN.CENTER, bold=True)
add_body_text(slide, "本日の資料に関するお問い合わせは、お近くのスタッフまで",
              left=Inches(1.0), top=Inches(6.3), width=Inches(11.333), height=Inches(0.6),
              font_size=Pt(16), color=LIGHT_GRAY, alignment=PP_ALIGN.CENTER)
add_slide_number(slide, 20)

# ============================================================
# Save
# ============================================================
output_path = "/home/user/noyuto/RIWAY_Presentation.pptx"
prs.save(output_path)
print(f"Presentation saved to {output_path}")
print(f"Total slides: {len(prs.slides)}")
