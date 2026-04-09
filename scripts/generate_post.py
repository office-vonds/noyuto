#!/usr/bin/env python3
"""
NOYUTO X Thread + Note Article Generator (v4)
思想DB v3注入済みシステムプロンプト + リポスト誘発構造v4 で
Xスレッド4本 + note記事1本を生成し、pending_posts/ pending_notes/ に保存する。

必要な環境変数:
  ANTHROPIC_API_KEY - Claude API キー

使い方:
  python generate_post.py                  # テーマプールからランダム選択
  python generate_post.py --theme 0        # テーマインデックス指定
  python generate_post.py --topic "信頼"    # テーマキーワード指定
"""

import argparse
import json
import os
import random
import re
import sys
from datetime import datetime, timedelta, timezone

JST = timezone(timedelta(hours=9))
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PENDING_POSTS_DIR = os.path.join(SCRIPT_DIR, "data", "generated", "pending_posts")
PENDING_NOTES_DIR = os.path.join(SCRIPT_DIR, "data", "generated", "pending_notes")

# ── テーマプール（17テーマ・断定型）──────────────────────
THEME_POOL = [
    {
        "id": 1,
        "theme": "信頼の消費構造",
        "angle": "信頼を語る人間の9割が、信頼を消費している事実",
        "arrow": "B",  # 横方向（同業者/仲間に共有したい）
    },
    {
        "id": 2,
        "theme": "善意の搾取構造",
        "angle": "善意で動く人間ほど搾取される仕組み",
        "arrow": "A",  # 上方向（上司/経営者に読ませたい）
    },
    {
        "id": 3,
        "theme": "効率化の逆説",
        "angle": "効率化を語る経営者が、社員の非効率を生んでいる構造",
        "arrow": "A",
    },
    {
        "id": 4,
        "theme": "努力の自己消費ループ",
        "angle": "努力を続ける人間が報われない構造的理由",
        "arrow": "C",  # 下方向（部下/後輩に教えたい）
    },
    {
        "id": 5,
        "theme": "正解依存症",
        "angle": "正解を求める人間が正解から最も遠い理由",
        "arrow": "C",
    },
    {
        "id": 6,
        "theme": "矛盾を抱える強さ",
        "angle": "矛盾を許容できない人間は強くなれない",
        "arrow": "B",
    },
    {
        "id": 7,
        "theme": "些事の力",
        "angle": "些事に気を込められない人間が大事を成せるわけがない",
        "arrow": "C",
    },
    {
        "id": 8,
        "theme": "心の積極化",
        "angle": "積極的な心を持つと決めた人間だけが見える景色",
        "arrow": "B",
    },
    {
        "id": 9,
        "theme": "評価経済の崩壊",
        "angle": "評価を追う人間が信用を失う構造",
        "arrow": "A",
    },
    {
        "id": 10,
        "theme": "健康の自己欺瞞",
        "angle": "健康を語りながら体を壊す矛盾を直視できるか",
        "arrow": "B",
    },
    {
        "id": 11,
        "theme": "金と志の関係",
        "angle": "金を稼ぐ理由が自分のためだけなら、その金は腐る",
        "arrow": "A",
    },
    {
        "id": 12,
        "theme": "恩義の循環",
        "angle": "恩を返すのではなく、次に渡す人間が強い",
        "arrow": "C",
    },
    {
        "id": 13,
        "theme": "少数派の生存戦略",
        "angle": "人がやらないことだけを探す人間の共通点",
        "arrow": "B",
    },
    {
        "id": 14,
        "theme": "負の感情の処理構造",
        "angle": "負の感情を人に話す人間は、自分の弱さを増幅している",
        "arrow": "C",
    },
    {
        "id": 15,
        "theme": "自然と不自然",
        "angle": "自然に逆らう生き方が病を生む構造",
        "arrow": "B",
    },
    {
        "id": 16,
        "theme": "結果を出す前に辞める構造",
        "angle": "結果を出す前に辞める人間の共通点",
        "arrow": "C",
    },
    {
        "id": 17,
        "theme": "貧しさの美学",
        "angle": "貧しさは美しい。心が貧しくなければ生きていける",
        "arrow": "A",
    },
]

ARROW_DESCRIPTIONS = {
    "A": "上方向：「上司/経営者に読ませたい」→ 自分では言えないことの代弁",
    "B": "横方向：「同業者/仲間に共有したい」→ 共感の増幅・仲間内の議論起動",
    "C": "下方向：「部下/後輩に教えたい」→ 指導・教育のツールとして利用",
}

# ── システムプロンプト（思想DB v3 + リポスト誘発構造v4）──
SYSTEM_PROMPT = """あなたはNOYUTO（小沢宗弘）のゴーストライターです。
小沢の思想・信念・口調を完全に再現し、Xスレッド4本とnote記事1本を生成します。

## 小沢宗弘の思想データベース（v3）

### 最上位の信念
- 答えは渡さない。判断の基準だけ置く
- 矛盾したまま前に進めるのが強さ
- 毒にも薬にもならない思考はクソ

### 精神の土台
- 中村天風の心身統一法（10年以上実践）
- 心の積極化が全ての起点
- 些事に気を込める

### 志の本質
- 富を得たいのは弱者を助けたいからのみ
- 評価基準は信用の量
- 行き場のない子供・弱者と寄り添える施設が究極の夢

### 他者との向き合い方
- 正しさは自分にだけ課す。人に課すなら楽しさを課す
- 恩義は他者に還元しろ
- 貧しさは美しい。心が貧しくなければ生きていける

### MYルール
1. 負の感情は人に話さない
2. 通勤退勤の車で自分と対話
3. やることやってからご褒美
4. 少数派・人がやらない事だけ探す
5. 仲間の陰口は絶対言わない

## コンテンツ生成ルール

### 基本ルール
- 敬語（です・ます調）必須
- 絵文字不使用
- ハッシュタグ1〜2個（思想の旗印のみ。例：#信頼経済）
- 5年・10年・20年後も色褪せない普遍性を持つテーマのみ
- 情報サイクルに乗らない。不変の本質だけを売る
- 自己語り・過去の苦労話は主コンテンツ禁止（構造的証拠として1〜2行のみ許可）
- 角度は常に「矛盾を隠す人間の構造を切る」→ 読者が「俺のことか？」と思う設計

### Xスレッド構造（4本構成）
1本目（フック）：断定。毒/インパクトでスクロール停止。必ず「構造名」を提示する（例：「善意の搾取構造」「努力の自己消費ループ」）
2本目（煽り）：反論を先回りして挑発。敵と味方を明確化
3本目（根拠）：体験・数字・事実で証明
4本目（着地）：断定しない。他者参照の問いで終わる → noteへの自然導線

### 【重要】リポスト誘発構造v4

#### 矢印の向き
読者が「これを誰に見せたいか」が明確になる構造を設計すること。

3つの矢印パターン：
A：上方向 →「上司/経営者に読ませたい」→ 自分では言えないことの代弁
B：横方向 →「同業者/仲間に共有したい」→ 共感の増幅・仲間内の議論起動
C：下方向 →「部下/後輩に教えたい」→ 指導・教育のツールとして利用

#### 生成時の必須チェック
1. この投稿を読んだ人は「誰に」見せたくなるか？ → A/B/Cのいずれかが明確でなければ書き直し
2. 4本目の問いかけは「送りたくなる問い」か？ → 他者参照を含める
3. 1本目のフックに「構造名」があるか？ → 名前を付けた構造を提示（リポスト時に引用しやすい）

#### 4本目の着地テンプレート（v4）
「この構造に気づいている人間は、もう動いています。
 あなたの隣にいる〇〇は、まだ気づいていないかもしれません。
 その答えは、もうここにある。」
→ 他者参照 + note導線。リポスト動機あり

### 禁止事項
1. 自己語り・苦労話を主題にした投稿
2. 絵文字の使用
3. ハッシュタグ3個以上
4. 「続きはnoteで」型の直接CTA
5. 情報サイクル依存テーマ
6. 読者に直接答えを与える内容
7. 感情的な自己肯定・自己啓発テンプレ

## 出力形式

以下のJSON形式で返してください：
{
  "thread": [
    {"position": 1, "type": "hook", "text": "1本目のテキスト"},
    {"position": 2, "type": "provoke", "text": "2本目のテキスト"},
    {"position": 3, "type": "evidence", "text": "3本目のテキスト"},
    {"position": 4, "type": "landing", "text": "4本目のテキスト"}
  ],
  "hashtags": ["#タグ1"],
  "arrow_direction": "A/B/C",
  "arrow_target": "誰に見せたくなるかの説明",
  "structure_name": "この投稿で提示した構造名",
  "note_article": {
    "title": "note記事タイトル",
    "body": "note記事本文（Markdown形式、1500〜2500文字）",
    "membership_cta": "思考実験室（メンバーシップ¥980/月）への自然導線テキスト"
  }
}"""


# ── テーマ選択 ─────────────────────────────────────────
def select_theme(theme_index=None, topic_keyword=None):
    """テーマプールからテーマを選択する。"""
    if theme_index is not None:
        if 0 <= theme_index < len(THEME_POOL):
            return THEME_POOL[theme_index]
        print(f"ERROR: テーマインデックス {theme_index} は範囲外（0-{len(THEME_POOL)-1}）")
        sys.exit(1)

    if topic_keyword:
        matches = [t for t in THEME_POOL if topic_keyword in t["theme"] or topic_keyword in t["angle"]]
        if matches:
            return random.choice(matches)
        print(f"WARNING: '{topic_keyword}' に一致するテーマなし。ランダム選択")

    return random.choice(THEME_POOL)


# ── Claude API 呼び出し ──────────────────────────────
def generate_with_claude(theme):
    """Claude APIでXスレッド + note記事を生成する。"""
    try:
        import anthropic
    except ImportError:
        print("ERROR: anthropic パッケージ未インストール。pip install anthropic")
        sys.exit(1)

    client = anthropic.Anthropic()

    arrow_desc = ARROW_DESCRIPTIONS.get(theme["arrow"], "")

    user_prompt = f"""以下のテーマでXスレッド4本 + note記事1本を生成してください。

テーマ: {theme['theme']}
切り口: {theme['angle']}
矢印の向き: {theme['arrow']}（{arrow_desc}）

【重要確認事項】
1. 1本目のフックに「{theme['theme']}」という構造名が含まれていること
2. 4本目の着地に他者参照（「あなたの周りにいませんか？」「思い浮かぶ顔はありませんか？」型）が含まれていること
3. 矢印の向き{theme['arrow']}に沿って、読者が「{arrow_desc.split('→')[0].strip()}」と思う設計になっていること

JSONのみで回答してください。"""

    print(f"  Claude API 呼び出し中...")
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    response_text = response.content[0].text.strip()

    # JSON パース（複数パターン対応）
    for parser in [
        lambda t: json.loads(t),
        lambda t: json.loads(re.search(r"```(?:json)?\s*\n?(.*?)\n?```", t, re.DOTALL).group(1).strip()),
        lambda t: json.loads(re.search(r"\{.*\}", t, re.DOTALL).group(0)),
    ]:
        try:
            return parser(response_text)
        except (json.JSONDecodeError, AttributeError):
            continue

    print(f"ERROR: Claude レスポンスをJSONとしてパースできません")
    print(f"Response: {response_text[:500]}")
    sys.exit(1)


# ── バリデーション ──────────────────────────────────────
def validate_output(data, theme):
    """生成結果をv4ルールに基づいてバリデーションする。"""
    warnings = []

    thread = data.get("thread", [])
    if len(thread) != 4:
        warnings.append(f"スレッドが4本ではなく{len(thread)}本")

    # 1本目に構造名があるか
    if thread:
        hook_text = thread[0].get("text", "")
        if theme["theme"] not in hook_text and "構造" not in hook_text and "ループ" not in hook_text:
            warnings.append("1本目に構造名が含まれていない可能性")

    # 4本目に他者参照があるか
    if len(thread) >= 4:
        landing_text = thread[3].get("text", "")
        other_ref_keywords = ["周り", "隣", "あの人", "思い浮かぶ", "誰か", "いませんか"]
        if not any(kw in landing_text for kw in other_ref_keywords):
            warnings.append("4本目に他者参照が不足している可能性")

    # 絵文字チェック
    full_text = " ".join(t.get("text", "") for t in thread)
    emoji_pattern = re.compile(
        "[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U000024C2-\U0001F251]"
    )
    if emoji_pattern.search(full_text):
        warnings.append("絵文字が検出されました（禁止事項）")

    # ハッシュタグ数チェック
    hashtags = data.get("hashtags", [])
    if len(hashtags) > 2:
        warnings.append(f"ハッシュタグが{len(hashtags)}個（上限2個）")

    # 「続きはnoteで」チェック
    if "続きはnote" in full_text:
        warnings.append("「続きはnoteで」型の直接CTAが含まれています（禁止事項）")

    return warnings


# ── ファイル保存 ───────────────────────────────────────
def save_pending(data, theme):
    """pending_posts/ と pending_notes/ に保存する。"""
    os.makedirs(PENDING_POSTS_DIR, exist_ok=True)
    os.makedirs(PENDING_NOTES_DIR, exist_ok=True)

    now = datetime.now(JST)
    timestamp = now.strftime("%Y%m%d_%H%M%S")
    date_str = now.strftime("%Y-%m-%d")

    # Xスレッド保存
    post_data = {
        "generated_at": now.isoformat(),
        "theme_id": theme["id"],
        "theme": theme["theme"],
        "arrow_direction": data.get("arrow_direction", theme["arrow"]),
        "arrow_target": data.get("arrow_target", ""),
        "structure_name": data.get("structure_name", theme["theme"]),
        "hashtags": data.get("hashtags", []),
        "thread": data.get("thread", []),
        "status": "pending",
    }

    post_path = os.path.join(PENDING_POSTS_DIR, f"{timestamp}_{theme['id']}.json")
    with open(post_path, "w", encoding="utf-8") as f:
        json.dump(post_data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"  Xスレッド保存: {post_path}")

    # note記事保存
    note_data = data.get("note_article", {})
    if note_data:
        note_output = {
            "generated_at": now.isoformat(),
            "theme_id": theme["id"],
            "theme": theme["theme"],
            "title": note_data.get("title", ""),
            "body": note_data.get("body", ""),
            "membership_cta": note_data.get("membership_cta", ""),
            "status": "pending",
        }

        note_path = os.path.join(PENDING_NOTES_DIR, f"{timestamp}_{theme['id']}.json")
        with open(note_path, "w", encoding="utf-8") as f:
            json.dump(note_output, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"  note記事保存: {note_path}")

    return post_path


# ── メイン ─────────────────────────────────────────────
def generate(theme_index=None, topic_keyword=None):
    """投稿生成のメインエントリーポイント。生成データを返す。"""
    theme = select_theme(theme_index, topic_keyword)

    print(f"[generate_post] テーマ: {theme['theme']}")
    print(f"  切り口: {theme['angle']}")
    print(f"  矢印: {theme['arrow']} ({ARROW_DESCRIPTIONS[theme['arrow']]})")

    data = generate_with_claude(theme)

    # バリデーション
    warnings = validate_output(data, theme)
    if warnings:
        print(f"\n  ⚠ バリデーション警告:")
        for w in warnings:
            print(f"    - {w}")

    # プレビュー表示
    print(f"\n--- Xスレッドプレビュー ---")
    for item in data.get("thread", []):
        print(f"\n[{item.get('position', '?')}] {item.get('type', '')}")
        print(f"  {item.get('text', '')[:120]}...")

    print(f"\n構造名: {data.get('structure_name', 'N/A')}")
    print(f"矢印: {data.get('arrow_direction', 'N/A')} → {data.get('arrow_target', 'N/A')}")
    print(f"ハッシュタグ: {' '.join(data.get('hashtags', []))}")

    if data.get("note_article"):
        print(f"\n--- note記事プレビュー ---")
        print(f"タイトル: {data['note_article'].get('title', '')}")
        body_preview = data['note_article'].get('body', '')[:200]
        print(f"本文冒頭: {body_preview}...")

    # 保存
    save_pending(data, theme)

    return data


def main():
    parser = argparse.ArgumentParser(description="NOYUTO Xスレッド + note記事生成 (v4)")
    parser.add_argument("--theme", type=int, default=None, help="テーマインデックス（0-16）")
    parser.add_argument("--topic", type=str, default=None, help="テーマキーワード検索")
    args = parser.parse_args()

    generate(theme_index=args.theme, topic_keyword=args.topic)


if __name__ == "__main__":
    main()
