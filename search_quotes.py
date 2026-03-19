#!/usr/bin/env python3
"""引用リポスト候補をX API v2で検索し、結果を返す。

使い方:
  python3 search_quotes.py              # 結果をターミナルに表示
  python3 search_quotes.py --json       # JSON形式で出力（他スクリプト連携用）
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import tweepy
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")

# キーワード定義
KEYWORDS = {
    "攻撃型": [
        '"売上が全て"',
        '"結果を出せ"',
        '"効率化"',
        '"正解は"',
        '"成功するには"',
    ],
    "共鳴型": [
        '"信頼" "経済"',
        '"行動" "変わる"',
        '"矛盾" "人間"',
        '"志"',
        '"些事"',
        '"感謝" "生き方"',
    ],
    "時事フック": [
        '"AI" "仕事"',
        '"健康" "正解"',
        '"副業"',
    ],
}

# 引用スタイルの提案テンプレート
QUOTE_STYLES = {
    "攻撃型": "反論・切り込み型（「本当にそうでしょうか」で始めて思想をぶつける）",
    "共鳴型": "共鳴・深掘り型（「同じ景色を見ています」と共感し、体験で上乗せする）",
    "時事フック": "思考起動型（時事をフックに「私はこう考えます」と独自視点を展開する）",
}


def get_client() -> tweepy.Client:
    bearer = os.getenv("X_BEARER_TOKEN")
    if not bearer:
        print("エラー: X_BEARER_TOKENが.envに設定されていません")
        sys.exit(1)
    return tweepy.Client(bearer_token=bearer)


def search_keyword(client: tweepy.Client, query: str, max_results: int = 10) -> list[dict]:
    """キーワードで直近24時間の投稿を検索し、いいね数上位3件を返す。"""
    # 日本語の投稿、リツイートを除外
    full_query = f"{query} lang:ja -is:retweet"

    since = datetime.now(timezone.utc) - timedelta(hours=24)

    try:
        response = client.search_recent_tweets(
            query=full_query,
            max_results=max_results,
            start_time=since.isoformat(),
            tweet_fields=["public_metrics", "created_at", "author_id"],
            user_fields=["username", "name"],
            expansions=["author_id"],
            sort_order="relevancy",
        )
    except tweepy.TweepyException as e:
        return [{"error": str(e), "query": query}]

    if not response.data:
        return []

    # ユーザー情報のマッピング
    users = {}
    if response.includes and "users" in response.includes:
        for user in response.includes["users"]:
            users[user.id] = {"username": user.username, "name": user.name}

    # いいね数でソート、上位3件
    tweets = []
    for tweet in response.data:
        metrics = tweet.public_metrics or {}
        user_info = users.get(tweet.author_id, {})
        tweets.append({
            "id": str(tweet.id),
            "text": tweet.text,
            "likes": metrics.get("like_count", 0),
            "retweets": metrics.get("retweet_count", 0),
            "username": user_info.get("username", "unknown"),
            "name": user_info.get("name", ""),
            "url": f"https://x.com/{user_info.get('username', 'i')}/status/{tweet.id}",
            "created_at": tweet.created_at.isoformat() if tweet.created_at else "",
        })

    tweets.sort(key=lambda t: t["likes"], reverse=True)
    return tweets[:3]


def search_all(client: tweepy.Client) -> dict:
    """全カテゴリのキーワードで検索を実行。"""
    results = {}
    for category, keywords in KEYWORDS.items():
        results[category] = {}
        for keyword in keywords:
            hits = search_keyword(client, keyword)
            if hits:
                results[category][keyword] = hits
    return results


def format_results(results: dict) -> str:
    """検索結果を読みやすいテキストに整形する。"""
    lines = []
    lines.append("=" * 50)
    lines.append("引用リポスト候補レポート")
    lines.append(f"検索日時: {datetime.now().strftime('%Y/%m/%d %H:%M')}")
    lines.append("=" * 50)

    total = 0
    for category, keywords in results.items():
        style = QUOTE_STYLES.get(category, "")
        lines.append(f"\n■ {category}（推奨スタイル: {style}）")
        lines.append("-" * 40)

        if not keywords:
            lines.append("  該当なし")
            continue

        for keyword, tweets in keywords.items():
            lines.append(f"\n  キーワード: {keyword}")
            for i, tweet in enumerate(tweets, 1):
                if "error" in tweet:
                    lines.append(f"    検索エラー: {tweet['error']}")
                    continue
                total += 1
                lines.append(f"    [{i}] @{tweet['username']} (♥{tweet['likes']} RT{tweet['retweets']})")
                lines.append(f"        {tweet['text'][:80]}...")
                lines.append(f"        {tweet['url']}")

    lines.append(f"\n合計: {total}件の候補")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="引用リポスト候補を検索")
    parser.add_argument("--json", action="store_true", help="JSON形式で出力")
    args = parser.parse_args()

    client = get_client()
    results = search_all(client)

    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print(format_results(results))


if __name__ == "__main__":
    main()
