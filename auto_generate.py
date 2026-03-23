#!/usr/bin/env python3
"""毎朝cron実行用: テーマプールからランダムにテーマを選び、投稿文を生成してpendingに保存する。
Claude Code経由で実行されることを前提とする。"""

import json
import random
import sys
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).parent
POSTS_DIR = BASE_DIR / "posts"

# テーマプール（断定型タイトル・不変テーマのみ）
THEME_POOL = [
    # 健康
    "医者に従う人間ほど自分の身体を知らない",
    "薬を捨てた日から人生が始まった",
    "健康は管理するものではなく取り戻すものだ",
    # お金
    "金の奴隷は一生金に困る",
    "売上を追う会社は必ず信用を失う",
    # 信頼
    "信頼は通貨より重い",
    "裏切られても信じる人間だけが本物の仲間を得る",
    "評価基準を売上にした瞬間、組織は腐る",
    # 志
    "志のない成功は最も醜い失敗だ",
    "夢を語れない人間に人はついてこない",
    "志の質だけは絶対に負けてはならない",
    # 矛盾
    "矛盾を隠す人間ほど脆く壊れる",
    "完璧主義が人間を一番壊す",
    # 人間性
    "貧しさは美しい。心が貧しい方がよほど醜い",
    "考えすぎる人間は行動する人間に一生勝てない",
    # 覚悟
    "常識を捨てた人間だけが常識を変えられる",
    "孤独を選べない人間に覚悟はない",
]

# noyuto_persona.txt を読み込み（Claude Code実行時のプロンプト参照用）
PERSONA_FILE = BASE_DIR / "prompts" / "noyuto_persona.txt"


def pick_theme() -> str:
    return random.choice(THEME_POOL)


def save_post(text: str, topic: str) -> Path:
    POSTS_DIR.mkdir(exist_ok=True)
    now = datetime.now()
    filename = now.strftime("%Y%m%d_%H%M%S") + ".json"
    filepath = POSTS_DIR / filename

    data = {
        "timestamp": now.isoformat(),
        "text": text,
        "topic": topic,
        "status": "pending",
        "posted_at": None,
        "tweet_id": None,
    }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return filepath


def main():
    theme = sys.argv[1] if len(sys.argv) > 1 else pick_theme()

    # Claude Codeから--textで投稿文を受け取る
    text = None
    for i, arg in enumerate(sys.argv):
        if arg == "--text" and i + 1 < len(sys.argv):
            text = sys.argv[i + 1]
            break

    if not text:
        # テーマだけ出力してClaude Codeに生成を委譲
        print(f"THEME:{theme}")
        print("投稿文を--textで渡してください。")
        sys.exit(0)

    filepath = save_post(text, theme)
    print(f"THEME:{theme}")
    print(f"TEXT:{text}")
    print(f"FILE:{filepath}")
    print(f"CHARS:{len(text)}")


if __name__ == "__main__":
    main()
