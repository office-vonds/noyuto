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
WEIGHTS_FILE = BASE_DIR / "theme_weights.json"

# テーマプールはgenerate_post.pyのTHEME_TREEに統合済み
# 後方互換のためフラットなリストも維持
from generate_post import THEME_TREE, THEME_TO_CATEGORY, pick_rotated_theme

THEME_POOL = []
for _themes in THEME_TREE.values():
    THEME_POOL.extend(_themes)

# noyuto_persona.txt を読み込み（Claude Code実行時のプロンプト参照用）
PERSONA_FILE = BASE_DIR / "prompts" / "noyuto_persona.txt"

# スレッド4本のラベル（毒→反論→体験→問い）
THREAD_LABELS = ["スレッド1/4：毒で切り込む", "スレッド2/4：反論を編む", "スレッド3/4：体験・数字で黙らせる", "スレッド4/4：問いで着地"]


def load_weights():
    """テーマ重みを読み込む（バナナ君PDCAで自動更新される）"""
    if WEIGHTS_FILE.exists():
        try:
            with open(WEIGHTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, ValueError):
            pass
    return {}


def pick_theme() -> str:
    """テーマツリーローテーション付きの選択。直近3件のカテゴリを回避する"""
    theme, category = pick_rotated_theme()
    print(f"CATEGORY:{category}")
    return theme


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


def determine_post_count():
    """前日エンゲージメントに基づいて本日の投稿本数を決定する。
    スコア < 10 → 1本、スコア >= 10 → 2本、データなし → 1本
    """
    from generate_post import get_engagement_summary
    from datetime import datetime, timedelta

    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y%m%d")
    scores = []

    for filepath in sorted(POSTS_DIR.glob("*.json")):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, ValueError):
            continue

        eng = data.get("engagement")
        if not eng:
            continue

        posted_at = data.get("posted_at", "")
        if not posted_at or not posted_at.startswith(
            (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        ):
            continue

        score = (eng.get("likes", 0) + eng.get("retweets", 0) * 2
                 + eng.get("replies", 0) * 3 + eng.get("bookmarks", 0) * 3)
        scores.append(score)

    if not scores:
        return 1  # デフォルト

    avg_score = sum(scores) / len(scores)
    return 2 if avg_score >= 10 else 1


def main():
    post_count = determine_post_count()
    print(f"POST_COUNT:{post_count}")

    theme = sys.argv[1] if len(sys.argv) > 1 else pick_theme()

    # Claude Codeから--textで投稿文を受け取る
    text = None
    for i, arg in enumerate(sys.argv):
        if arg == "--text" and i + 1 < len(sys.argv):
            text = sys.argv[i + 1]
            break

    if not text:
        # エンゲージメント要約をプロンプト参照用に出力
        from generate_post import get_engagement_summary
        eng_summary = get_engagement_summary()

        print(f"THEME:{theme}")
        if eng_summary:
            print(f"\n{eng_summary}\n")
        print("投稿文を--textで渡してください。")
        sys.exit(0)

    filepath = save_post(text, theme)
    print(f"THEME:{theme}")
    print(f"TEXT:{text}")
    print(f"FILE:{filepath}")
    print(f"CHARS:{len(text)}")


if __name__ == "__main__":
    main()
