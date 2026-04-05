#!/usr/bin/env python3
"""Claude Codeが生成したコンテンツを受け取り、承認待ちとして保存する。

使い方:
  python3 generate_post.py --topic "テーマ" --text "投稿文"
  python3 generate_post.py --note --topic "テーマ" --text "note記事本文"
  python3 generate_post.py --full --topic "テーマ" --json '{"thread":[...], "note":"..."}'
  echo "投稿文" | python3 generate_post.py --topic "テーマ"
"""

import argparse
import glob
import json
import os
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).parent
POSTS_DIR = BASE_DIR / "posts"
NOTES_DIR = BASE_DIR / "pending_notes"
ENGAGEMENT_DIR = BASE_DIR / "engagement"

THREAD_LABELS = ["スレッド1/4：毒で切り込む", "スレッド2/4：反論を編む", "スレッド3/4：体験・数字で黙らせる", "スレッド4/4：問いで着地"]


def save_post(text: str, topic: str | None = None) -> Path:
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


def save_note(text: str, topic: str | None = None) -> Path:
    NOTES_DIR.mkdir(exist_ok=True)
    now = datetime.now()
    filename = now.strftime("%Y%m%d_%H%M%S") + ".json"
    filepath = NOTES_DIR / filename

    data = {
        "timestamp": now.isoformat(),
        "title": topic or "無題",
        "body": text,
        "topic": topic,
        "status": "pending",
        "published_at": None,
        "note_url": None,
    }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return filepath


def full_mode(topic: str, json_str: str):
    """Xスレッド4本 + note記事を一括保存する。"""
    payload = json.loads(json_str)
    thread = payload["thread"]
    note_body = payload["note"]

    if len(thread) != 4:
        print(f"エラー: スレッドは4本必要です（{len(thread)}本渡されました）")
        sys.exit(1)

    # スレッド4本を保存（タイムスタンプをずらす）
    thread_files = []
    for i, text in enumerate(thread):
        label = THREAD_LABELS[i]
        filepath = save_post(text, f"{topic}（{label}）")
        thread_files.append((filepath, text))
        time.sleep(1)  # ファイル名の重複回避

    # note記事を保存
    note_filepath = save_note(note_body, topic)

    # サマリー表示
    print(f"=== 一括生成完了 ===")
    print(f"テーマ: {topic}\n")
    print(f"【Xスレッド 4本】")
    for i, (fp, text) in enumerate(thread_files):
        print(f"  {THREAD_LABELS[i]}: {text[:20]}... ({len(text)}文字) → {fp.name}")
    print(f"\n【note記事】")
    print(f"  {note_body[:30]}... ({len(note_body)}文字) → {note_filepath.name}")
    print(f"\n全5件をpending保存しました。")


def fetch_engagement_data():
    """X APIで前日投稿のインプレッション・エンゲージメントを取得し、posts/内のJSONに追記する。

    前提: .envに X_BEARER_TOKEN が設定されていること（X API v2 OAuth 2.0）
    """
    from dotenv import load_dotenv

    load_dotenv(BASE_DIR / ".env")
    bearer_token = os.getenv("X_BEARER_TOKEN")
    if not bearer_token:
        print("[SKIP] X_BEARER_TOKEN が .env に未設定のためエンゲージメント取得をスキップ")
        return []

    import requests

    ENGAGEMENT_DIR.mkdir(exist_ok=True)

    # 前日に投稿された（posted状態の）投稿を取得
    yesterday = datetime.now() - timedelta(days=1)
    yesterday_str = yesterday.strftime("%Y%m%d")
    results = []

    for filepath in sorted(POSTS_DIR.glob("*.json")):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, ValueError):
            continue

        if data.get("status") != "posted" or not data.get("tweet_id"):
            continue

        posted_at = data.get("posted_at", "")
        if not posted_at or not posted_at.startswith(yesterday.strftime("%Y-%m-%d")):
            continue

        tweet_id = data["tweet_id"]

        # X API v2でツイートメトリクスを取得
        url = f"https://api.twitter.com/2/tweets/{tweet_id}"
        params = {"tweet.fields": "public_metrics,non_public_metrics,organic_metrics"}
        headers = {"Authorization": f"Bearer {bearer_token}"}

        try:
            resp = requests.get(url, params=params, headers=headers, timeout=10)
            if resp.status_code != 200:
                print(f"[WARN] tweet {tweet_id}: API応答 {resp.status_code}")
                continue

            tweet_data = resp.json().get("data", {})
            public = tweet_data.get("public_metrics", {})
            non_public = tweet_data.get("non_public_metrics", {})

            engagement = {
                "tweet_id": tweet_id,
                "fetched_at": datetime.now().isoformat(),
                "impressions": non_public.get("impression_count", public.get("impression_count", 0)),
                "likes": public.get("like_count", 0),
                "retweets": public.get("retweet_count", 0),
                "replies": public.get("reply_count", 0),
                "bookmarks": public.get("bookmark_count", 0),
                "quote_count": public.get("quote_count", 0),
            }

            # posts/のJSONにエンゲージメントデータを追記
            data["engagement"] = engagement
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            # engagement/にも保存
            eng_file = ENGAGEMENT_DIR / f"{yesterday_str}_{tweet_id}.json"
            with open(eng_file, "w", encoding="utf-8") as f:
                json.dump(engagement, f, ensure_ascii=False, indent=2)

            results.append(engagement)
            print(f"[OK] tweet {tweet_id}: imp={engagement['impressions']} likes={engagement['likes']} rt={engagement['retweets']} bm={engagement['bookmarks']}")

        except requests.RequestException as e:
            print(f"[ERROR] tweet {tweet_id}: {e}")
            continue

    print(f"エンゲージメント取得完了: {len(results)}件")
    return results


def get_engagement_summary(days=7):
    """直近N日間のエンゲージメントデータを要約し、投稿生成プロンプトに反映するためのテキストを返す。"""
    cutoff = datetime.now() - timedelta(days=days)
    top_posts = []

    for filepath in sorted(POSTS_DIR.glob("*.json")):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, ValueError):
            continue

        eng = data.get("engagement")
        if not eng:
            continue

        ts = datetime.fromisoformat(data.get("timestamp", "2000-01-01"))
        if ts < cutoff:
            continue

        score = (eng.get("likes", 0) + eng.get("retweets", 0) * 2
                 + eng.get("replies", 0) * 3 + eng.get("bookmarks", 0) * 3)
        top_posts.append({
            "topic": data.get("topic", ""),
            "text": data.get("text", "")[:80],
            "score": score,
            "impressions": eng.get("impressions", 0),
        })

    if not top_posts:
        return ""

    top_posts.sort(key=lambda x: x["score"], reverse=True)
    top3 = top_posts[:3]

    lines = [
        "## 直近のエンゲージメント分析（投稿生成に反映）",
        f"分析期間: 直近{days}日間 / 対象: {len(top_posts)}件",
        "",
        "### 高パフォーマンス投稿TOP3:",
    ]
    for i, p in enumerate(top3, 1):
        lines.append(f"{i}. [{p['topic'][:30]}] スコア:{p['score']} imp:{p['impressions']}")
        lines.append(f"   → {p['text']}")
    lines.append("")
    lines.append("上記の傾向を踏まえて、同様の構造・テーマを優先的に採用すること。")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="投稿文・note記事を保存する")
    parser.add_argument("--topic", type=str, default=None, help="テーマ")
    parser.add_argument("--text", type=str, default=None, help="本文（省略時はstdinから読み取り）")
    parser.add_argument("--note", action="store_true", help="note記事モード")
    parser.add_argument("--full", action="store_true", help="一括生成モード（スレッド4本+note）")
    parser.add_argument("--json", type=str, default=None, help="一括生成用JSON（--fullと併用）")
    parser.add_argument("--fetch-engagement", action="store_true", help="前日投稿のエンゲージメントを取得")
    parser.add_argument("--engagement-summary", action="store_true", help="直近のエンゲージメント要約を表示")
    args = parser.parse_args()

    if args.fetch_engagement:
        fetch_engagement_data()
        return

    if args.engagement_summary:
        summary = get_engagement_summary()
        if summary:
            print(summary)
        else:
            print("エンゲージメントデータがまだありません。")
        return

    if args.full:
        if not args.topic:
            print("エラー: --full には --topic が必須です")
            sys.exit(1)
        json_str = args.json
        if json_str is None:
            if sys.stdin.isatty():
                print("エラー: --json または標準入力でJSONを渡してください")
                sys.exit(1)
            json_str = sys.stdin.read().strip()
        full_mode(args.topic, json_str)
        return

    text = args.text
    if text is None:
        if sys.stdin.isatty():
            print("エラー: --text または標準入力で本文を渡してください")
            sys.exit(1)
        text = sys.stdin.read().strip()

    if not text:
        print("エラー: 本文が空です")
        sys.exit(1)

    if args.note:
        filepath = save_note(text, args.topic)
        print(f"--- 保存されたnote記事 ---")
        print(text)
        print(f"--- ({len(text)}文字) ---")
        print(f"保存先: {filepath}")
        print("状態: pending（承認待ち）")
    else:
        filepath = save_post(text, args.topic)
        print(f"--- 保存された投稿文 ---")
        print(text)
        print(f"--- ({len(text)}文字) ---")
        print(f"保存先: {filepath}")
        print("状態: pending（承認待ち）")


if __name__ == "__main__":
    main()
