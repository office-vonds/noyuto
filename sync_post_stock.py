#!/usr/bin/env python3
"""過去の高パフォーマンス投稿パターンをNotionの「参考投稿ストック」ページに同期する。

使い方:
  python3 sync_post_stock.py           # 全投稿から高パフォーマンスを抽出してNotionに保存
  python3 sync_post_stock.py --dry-run # 実際にはNotionに書き込まない

前提:
  - NOTION_API_KEY が .env に設定されていること
  - 参考投稿ストックページID: 339b652777f581809ea7c92fab0c606d
"""

import argparse
import glob
import json
import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
POSTS_DIR = BASE_DIR / "posts"
ENGAGEMENT_DIR = BASE_DIR / "engagement"

load_dotenv(BASE_DIR / ".env")

# Notion 参考投稿ストックページID
STOCK_PAGE_ID = "339b652777f581809ea7c92fab0c606d"


def load_all_posts():
    """全投稿データを読み込む"""
    posts = []
    if not POSTS_DIR.exists():
        return posts

    for f in sorted(glob.glob(str(POSTS_DIR / "*.json"))):
        try:
            with open(f, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            data["_file"] = os.path.basename(f)
            posts.append(data)
        except (json.JSONDecodeError, ValueError):
            continue
    return posts


def load_engagement():
    """エンゲージメントデータを読み込む"""
    engagement = {}
    if not ENGAGEMENT_DIR.exists():
        return engagement

    for f in glob.glob(str(ENGAGEMENT_DIR / "*.json")):
        try:
            with open(f, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            if isinstance(data, list):
                for item in data:
                    tid = item.get("tweet_id")
                    if tid:
                        engagement[tid] = item
            elif isinstance(data, dict):
                tid = data.get("tweet_id")
                if tid:
                    engagement[tid] = data
        except (json.JSONDecodeError, ValueError):
            continue
    return engagement


def extract_high_performers(posts, engagement, top_n=10):
    """エンゲージメントスコア上位の投稿を抽出する"""
    scored = []
    for post in posts:
        tweet_id = post.get("tweet_id")
        if not tweet_id or tweet_id not in engagement:
            continue

        eng = engagement[tweet_id]
        likes = eng.get("likes", 0) or 0
        retweets = eng.get("retweets", 0) or 0
        replies = eng.get("replies", 0) or 0
        bookmarks = eng.get("bookmarks", 0) or 0
        impressions = eng.get("impressions", 1) or 1

        score = likes + retweets * 2 + replies * 3 + bookmarks * 3
        rate = score / impressions if impressions > 0 else 0

        scored.append({
            "text": post.get("text", ""),
            "topic": post.get("topic", ""),
            "timestamp": post.get("timestamp", ""),
            "tweet_id": tweet_id,
            "impressions": impressions,
            "likes": likes,
            "retweets": retweets,
            "replies": replies,
            "bookmarks": bookmarks,
            "score": score,
            "rate": round(rate * 100, 2),
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_n]


def build_notion_content(top_posts):
    """Notion用マークダウンを生成する"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [
        f"> 最終同期: {now}",
        f"> 対象: エンゲージメントスコア上位{len(top_posts)}件",
        "",
        "---",
        "",
    ]

    if not top_posts:
        lines.append("**エンゲージメントデータがまだありません。**")
        lines.append("投稿してエンゲージメントが蓄積されたら、このページが自動更新されます。")
        return "\n".join(lines)

    for i, post in enumerate(top_posts, 1):
        lines.append(f"## {i}. {post['topic'][:50]}")
        lines.append("")
        lines.append(f"**スコア:** {post['score']} / **エンゲージメント率:** {post['rate']}%")
        lines.append(f"**imp:** {post['impressions']} / **likes:** {post['likes']} / **RT:** {post['retweets']} / **replies:** {post['replies']} / **bookmarks:** {post['bookmarks']}")
        lines.append("")
        lines.append(f"> {post['text'][:300]}")
        lines.append("")
        lines.append(f"投稿日: {post['timestamp'][:10]}")
        lines.append("")
        lines.append("---")
        lines.append("")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="高パフォーマンス投稿をNotionに同期")
    parser.add_argument("--dry-run", action="store_true", help="Notionに書き込まない")
    parser.add_argument("--top", type=int, default=10, help="上位N件を抽出（デフォルト: 10）")
    args = parser.parse_args()

    posts = load_all_posts()
    engagement = load_engagement()
    top_posts = extract_high_performers(posts, engagement, top_n=args.top)

    content = build_notion_content(top_posts)

    print(f"投稿数: {len(posts)}件 / エンゲージメントデータ: {len(engagement)}件")
    print(f"高パフォーマンス投稿: {len(top_posts)}件抽出")

    if args.dry_run:
        print("\n--- Notion書き込み内容（dry-run） ---")
        print(content)
        print("--- dry-run完了 ---")
        return

    # Notion APIで参考投稿ストックページを更新
    # Claude Code MCP経由で更新されるため、ここではコンテンツをファイルに保存
    stock_file = BASE_DIR / "post_stock_content.md"
    with open(stock_file, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"コンテンツ保存: {stock_file}")
    print(f"Notion同期対象ページ: {STOCK_PAGE_ID}")
    print("完了")


if __name__ == "__main__":
    main()
