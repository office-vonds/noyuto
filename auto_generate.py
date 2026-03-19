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

# noyuto_thoughts_v3.py の THEME_POOL から抽出
THEME_POOL = [
    "矛盾と人間性",
    "行動 vs 思考停止",
    "権威への依存と自己決定",
    "心の積極化と消極化",
    "些事に気を込める生き方",
    "執着を手放す技術",
    "志の質で勝負は決まる",
    "信頼という通貨",
    "評価基準の転換（売上ではなく信用）",
    "完璧主義の罠",
    "AIと人間の境界線",
    "貧しさの美しさと富の醜さ",
    "感謝が運命を変える構造",
    "孤独と愛",
    "常識を捨てる覚悟",
    "考えるより感じること",
    "弱者に寄り添う社会",
]


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
