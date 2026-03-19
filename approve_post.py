#!/usr/bin/env python3
"""承認待ちの投稿文を一覧表示し、承認→X投稿を行う。（X API v2）

使い方:
  python3 approve_post.py           # 対話モード（番号選択）
  python3 approve_post.py --thread  # スレッド投稿モード（pending全件をリプライチェーンで投稿）
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import tweepy
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
POSTS_DIR = BASE_DIR / "posts"


def get_x_client() -> tweepy.Client:
    load_dotenv(BASE_DIR / ".env")

    required_keys = [
        "X_API_KEY",
        "X_API_SECRET",
        "X_ACCESS_TOKEN",
        "X_ACCESS_TOKEN_SECRET",
    ]
    keys = {}
    for key in required_keys:
        value = os.getenv(key)
        if not value:
            print(f"エラー: {key}が.envに設定されていません")
            sys.exit(1)
        keys[key] = value

    return tweepy.Client(
        consumer_key=keys["X_API_KEY"],
        consumer_secret=keys["X_API_SECRET"],
        access_token=keys["X_ACCESS_TOKEN"],
        access_token_secret=keys["X_ACCESS_TOKEN_SECRET"],
    )


def get_pending_posts() -> list[tuple[Path, dict]]:
    if not POSTS_DIR.exists():
        return []

    posts = []
    for filepath in sorted(POSTS_DIR.glob("*.json")):
        with open(filepath, encoding="utf-8") as f:
            data = json.load(f)
        if data.get("status") == "pending":
            posts.append((filepath, data))
    return posts


def post_to_x(client: tweepy.Client, text: str, reply_to: str | None = None) -> str:
    kwargs = {"text": text}
    if reply_to:
        kwargs["in_reply_to_tweet_id"] = reply_to
    response = client.create_tweet(**kwargs)
    return response.data["id"]


def update_post_status(filepath: Path, tweet_id: str):
    with open(filepath, encoding="utf-8") as f:
        data = json.load(f)

    data["status"] = "posted"
    data["posted_at"] = datetime.now().isoformat()
    data["tweet_id"] = tweet_id

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def display_posts(posts: list[tuple[Path, dict]]):
    print(f"承認待ちの投稿: {len(posts)}件\n")
    for i, (filepath, data) in enumerate(posts, 1):
        topic = data.get("topic") or "指定なし"
        print(f"[{i}] {filepath.name}")
        print(f"    テーマ: {topic}")
        print(f"    本文: {data['text']}")
        print(f"    ({len(data['text'])}文字)")
        print()


def thread_mode(posts: list[tuple[Path, dict]]):
    """pending全件をリプライチェーン（スレッド）として投稿する。"""
    display_posts(posts)

    confirm = input(f"上記{len(posts)}件をスレッドとして投稿しますか？ (y/N): ").strip()
    if confirm.lower() != "y":
        print("中止しました。")
        return

    client = get_x_client()
    prev_tweet_id = None

    for i, (filepath, data) in enumerate(posts, 1):
        print(f"\n[{i}/{len(posts)}] 投稿中: {data['text'][:50]}...")

        try:
            tweet_id = post_to_x(client, data["text"], reply_to=prev_tweet_id)
            update_post_status(filepath, tweet_id)
            prev_tweet_id = tweet_id
            print(f"投稿完了 (tweet_id: {tweet_id})")
        except tweepy.TweepyException as e:
            print(f"投稿失敗: {e}")
            print("スレッド投稿を中断します。")
            return

    print(f"\nスレッド{len(posts)}件の投稿が完了しました。")


def interactive_mode(posts: list[tuple[Path, dict]]):
    """対話モードで番号選択→単発投稿。"""
    display_posts(posts)

    choice = input("投稿する番号を入力（0で終了, allで全件投稿）: ").strip()

    if choice == "0":
        print("終了します。")
        return

    if choice == "all":
        targets = list(range(len(posts)))
    else:
        try:
            idx = int(choice) - 1
            if idx < 0 or idx >= len(posts):
                print("無効な番号です。")
                return
            targets = [idx]
        except ValueError:
            print("無効な入力です。")
            return

    client = get_x_client()

    for idx in targets:
        filepath, data = posts[idx]
        print(f"\n投稿中: {data['text'][:50]}...")

        try:
            tweet_id = post_to_x(client, data["text"])
            update_post_status(filepath, tweet_id)
            print(f"投稿完了 (tweet_id: {tweet_id})")
        except tweepy.TweepyException as e:
            print(f"投稿失敗: {e}")


def main():
    parser = argparse.ArgumentParser(description="X投稿の承認・投稿")
    parser.add_argument("--thread", action="store_true", help="スレッドモード（全件をリプライチェーンで投稿）")
    parser.add_argument("--dry-run", action="store_true", help="投稿せずに確認のみ")
    args = parser.parse_args()

    pending = get_pending_posts()

    if not pending:
        print("承認待ちの投稿はありません。")
        return

    if args.dry_run:
        display_posts(pending)
        print("（dry-runモード: 投稿はしていません）")
        return

    if args.thread:
        thread_mode(pending)
    else:
        interactive_mode(pending)


if __name__ == "__main__":
    main()
