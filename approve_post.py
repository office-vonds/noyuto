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


def auto_mode(posts: list[tuple[Path, dict]], latest_only: bool = True):
    """承認不要で自動投稿する。"""
    targets = [posts[-1]] if latest_only else posts
    client = get_x_client()

    for filepath, data in targets:
        print(f"自動投稿中: {data['text'][:50]}...")
        try:
            tweet_id = post_to_x(client, data["text"])
            update_post_status(filepath, tweet_id)
            print(f"投稿完了 (tweet_id: {tweet_id})")
        except tweepy.TweepyException as e:
            print(f"投稿失敗: {e}")

    print(f"\n自動投稿 {len(targets)}件完了。")


def is_rate_limit_error(error: tweepy.TweepyException) -> bool:
    """403 spend cap や 429 rate limit など、リトライ不能なAPIエラーを判定。"""
    error_str = str(error)
    return "403" in error_str or "429" in error_str or "spend cap" in error_str.lower()


def skip_old_pending(posts: list[tuple[Path, dict]], max_age_days: int = 3):
    """古すぎるpendingをskippedに変更して溜まり続けるのを防ぐ。"""
    from datetime import datetime, timedelta
    cutoff = datetime.now() - timedelta(days=max_age_days)
    skipped = 0
    for filepath, data in posts:
        ts = data.get("timestamp", "")
        if ts:
            post_time = datetime.fromisoformat(ts)
            if post_time < cutoff and data.get("status") == "pending":
                data["status"] = "skipped"
                data["skipped_reason"] = "too_old_pending"
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                skipped += 1
    if skipped:
        print(f"  古いpending {skipped}件をskippedに変更しました（{max_age_days}日以上前）")


def auto_thread_mode(posts: list[tuple[Path, dict]]):
    """最新のスレッド（同一テーマの連続pending）をリプライチェーンで自動投稿する。"""
    if not posts:
        return

    # 古いpendingを整理（3日以上前のものはskip）
    skip_old_pending(posts)

    # pending再取得（skipped分を除外）
    posts = [(fp, d) for fp, d in posts if d.get("status") == "pending"]
    if not posts:
        print("承認待ちの投稿はありません。")
        return

    # 最新の投稿のテーマを基準に、同一テーマの連続pendingをグループ化
    latest_topic_base = (posts[-1][1].get("topic") or "").split("（")[0].strip()
    thread_posts = []
    for filepath, data in posts:
        topic_base = (data.get("topic") or "").split("（")[0].strip()
        if topic_base == latest_topic_base:
            thread_posts.append((filepath, data))

    if len(thread_posts) < 2:
        # スレッドではない場合は通常のautoモードにフォールバック
        auto_mode(posts, latest_only=True)
        return

    client = get_x_client()
    prev_tweet_id = None

    print(f"スレッド自動投稿: {len(thread_posts)}件（テーマ: {latest_topic_base}）")
    for i, (filepath, data) in enumerate(thread_posts, 1):
        print(f"  [{i}/{len(thread_posts)}] 投稿中: {data['text'][:50]}...")
        try:
            tweet_id = post_to_x(client, data["text"], reply_to=prev_tweet_id)
            update_post_status(filepath, tweet_id)
            prev_tweet_id = tweet_id
            print(f"  投稿完了 (tweet_id: {tweet_id})")
        except tweepy.TweepyException as e:
            print(f"  投稿失敗: {e}")
            if is_rate_limit_error(e):
                print("  APIリミットエラー。残りのpendingは次回実行時に再試行します。")
            else:
                print("  スレッド投稿を中断します。")
            return

    print(f"\nスレッド{len(thread_posts)}件の自動投稿が完了しました。")


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
    parser.add_argument("--auto", action="store_true", help="自動モード（最新1件を承認不要で即投稿）")
    parser.add_argument("--auto-thread", action="store_true", help="自動スレッドモード（最新テーマの全件をリプライチェーンで投稿）")
    parser.add_argument("--auto-all", action="store_true", help="自動モード（pending全件を即投稿）")
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

    if args.auto:
        auto_mode(pending, latest_only=True)
    elif args.auto_thread:
        auto_thread_mode(pending)
    elif args.auto_all:
        auto_mode(pending, latest_only=False)
    elif args.thread:
        thread_mode(pending)
    else:
        interactive_mode(pending)


if __name__ == "__main__":
    main()
