#!/usr/bin/env python3
"""投稿済みツイートのエンゲージメントを取得し、テーマ別スコアリングを行う。

投稿→分析→改善の循環ループの「分析」部分。
投稿後48時間以上経過したツイートの最終的なエンゲージメントを取得し、
テーマごとのパフォーマンスをスコアリングする。

使い方:
  python3 track_engagement.py                  # 全投稿の最新エンゲージメント取得
  python3 track_engagement.py --report         # テーマ別パフォーマンスレポート出力
  python3 track_engagement.py --update-weights # テーマプールの重みを更新
  python3 track_engagement.py --json           # JSON形式で出力
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import tweepy
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
POSTS_DIR = BASE_DIR / "posts"
ENGAGEMENT_FILE = BASE_DIR / "engagement_scores.json"
THEME_WEIGHTS_FILE = BASE_DIR / "theme_weights.json"

load_dotenv(BASE_DIR / ".env")


def get_client() -> tweepy.Client:
    bearer = os.getenv("X_BEARER_TOKEN")
    if not bearer:
        print("エラー: X_BEARER_TOKENが.envに設定されていません")
        sys.exit(1)
    return tweepy.Client(bearer_token=bearer)


def get_posted_tweets() -> list[tuple[Path, dict]]:
    """投稿済み（tweet_idあり）のツイートを取得。"""
    if not POSTS_DIR.exists():
        return []
    posts = []
    for filepath in sorted(POSTS_DIR.glob("*.json")):
        with open(filepath, encoding="utf-8") as f:
            data = json.load(f)
        if data.get("status") == "posted" and data.get("tweet_id"):
            posts.append((filepath, data))
    return posts


def extract_base_theme(topic: str) -> str:
    """テーマ名からスレッド番号などを除去してベーステーマを抽出。"""
    if not topic:
        return "不明"
    # 「金の奴隷は一生金に困る（スレッド1/4：フック）」→「金の奴隷は一生金に困る」
    cleaned = re.sub(r"（スレッド\d+/\d+[：:].+?）$", "", topic)
    return cleaned.strip()


def fetch_tweet_metrics(client: tweepy.Client, tweet_ids: list[str]) -> dict[str, dict]:
    """ツイートIDリストからエンゲージメントメトリクスを一括取得。"""
    if not tweet_ids:
        return {}

    metrics = {}
    # X API v2は1リクエスト100件まで
    for i in range(0, len(tweet_ids), 100):
        batch = tweet_ids[i : i + 100]
        try:
            response = client.get_tweets(
                ids=batch,
                tweet_fields=["public_metrics", "created_at"],
            )
            if response.data:
                for tweet in response.data:
                    m = tweet.public_metrics or {}
                    metrics[str(tweet.id)] = {
                        "impressions": m.get("impression_count", 0),
                        "likes": m.get("like_count", 0),
                        "retweets": m.get("retweet_count", 0),
                        "replies": m.get("reply_count", 0),
                        "bookmarks": m.get("bookmark_count", 0),
                        "quotes": m.get("quote_count", 0),
                        "fetched_at": datetime.now(timezone.utc).isoformat(),
                    }
        except tweepy.TweepyException as e:
            print(f"API取得エラー (batch {i}): {e}")

    return metrics


def update_post_engagement(filepath: Path, data: dict, metrics: dict):
    """ポストファイルにエンゲージメントデータを追記。"""
    data["engagement"] = metrics
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def calc_engagement_score(metrics: dict) -> float:
    """エンゲージメントの総合スコアを計算。
    インプレッションあたりのエンゲージメント率を重視。"""
    impressions = metrics.get("impressions", 0)
    likes = metrics.get("likes", 0)
    retweets = metrics.get("retweets", 0)
    replies = metrics.get("replies", 0)
    bookmarks = metrics.get("bookmarks", 0)
    quotes = metrics.get("quotes", 0)

    # 絶対値スコア（小規模アカウント初期はこちらが重要）
    abs_score = (
        likes * 1.0
        + retweets * 3.0
        + replies * 2.0
        + bookmarks * 4.0
        + quotes * 3.5
    )

    # エンゲージメント率スコア（インプレッションがある場合）
    if impressions > 0:
        eng_rate = (likes + retweets + replies + bookmarks + quotes) / impressions
        rate_score = eng_rate * 1000  # 0.05 = 50点
    else:
        rate_score = 0

    # 総合: 絶対値70% + レート30%
    return round(abs_score * 0.7 + rate_score * 0.3, 1)


def build_theme_scores(posts: list[tuple[Path, dict]]) -> dict:
    """テーマ別のエンゲージメントスコアを集計。"""
    theme_data = {}

    for filepath, data in posts:
        engagement = data.get("engagement")
        if not engagement:
            continue

        theme = extract_base_theme(data.get("topic", ""))
        if theme not in theme_data:
            theme_data[theme] = {
                "posts": 0,
                "total_score": 0,
                "total_impressions": 0,
                "total_likes": 0,
                "total_retweets": 0,
                "total_bookmarks": 0,
                "total_replies": 0,
                "scores": [],
            }

        score = calc_engagement_score(engagement)
        td = theme_data[theme]
        td["posts"] += 1
        td["total_score"] += score
        td["total_impressions"] += engagement.get("impressions", 0)
        td["total_likes"] += engagement.get("likes", 0)
        td["total_retweets"] += engagement.get("retweets", 0)
        td["total_bookmarks"] += engagement.get("bookmarks", 0)
        td["total_replies"] += engagement.get("replies", 0)
        td["scores"].append(score)

    # 平均スコアを計算
    for theme, td in theme_data.items():
        td["avg_score"] = round(td["total_score"] / td["posts"], 1) if td["posts"] > 0 else 0
        td["avg_impressions"] = round(td["total_impressions"] / td["posts"]) if td["posts"] > 0 else 0

    return theme_data


def update_theme_weights(theme_scores: dict):
    """テーマ別スコアから重み（選択確率）を計算してファイルに保存。"""
    if not theme_scores:
        print("スコアデータがありません。先にエンゲージメントを取得してください。")
        return

    # 平均スコアでランキング
    ranked = sorted(theme_scores.items(), key=lambda x: x[1]["avg_score"], reverse=True)

    # 重み計算: スコアに比例（最低値は1.0を保証して完全排除はしない）
    max_score = ranked[0][1]["avg_score"] if ranked else 1
    weights = {}
    for theme, data in ranked:
        if max_score > 0:
            raw_weight = max(data["avg_score"] / max_score, 0.2)  # 最低20%の確率は残す
        else:
            raw_weight = 1.0
        weights[theme] = {
            "weight": round(raw_weight, 2),
            "avg_score": data["avg_score"],
            "posts": data["posts"],
            "avg_impressions": data["avg_impressions"],
        }

    # 未使用テーマ（データなし）はweight=1.0で探索枠として残す
    result = {
        "updated_at": datetime.now().isoformat(),
        "themes": weights,
        "default_weight": 1.0,  # データなしテーマのデフォルト
    }

    with open(THEME_WEIGHTS_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"テーマ重み更新完了: {THEME_WEIGHTS_FILE}")
    return result


def format_report(theme_scores: dict) -> str:
    """テーマ別パフォーマンスレポートをテキストで出力。"""
    lines = []
    lines.append("=" * 60)
    lines.append("テーマ別パフォーマンスレポート")
    lines.append(f"分析日時: {datetime.now().strftime('%Y/%m/%d %H:%M')}")
    lines.append("=" * 60)

    if not theme_scores:
        lines.append("\nエンゲージメントデータがありません。")
        lines.append("投稿済みのツイートが必要です（approve_post.pyで投稿後に実行）。")
        return "\n".join(lines)

    ranked = sorted(theme_scores.items(), key=lambda x: x[1]["avg_score"], reverse=True)

    lines.append(f"\n分析対象テーマ: {len(ranked)}件")
    lines.append("-" * 60)

    for i, (theme, data) in enumerate(ranked, 1):
        medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"  {i}."
        lines.append(f"\n{medal} {theme}")
        lines.append(f"    総合スコア: {data['avg_score']} (投稿{data['posts']}件)")
        lines.append(f"    平均imp: {data['avg_impressions']} / ♥{data['total_likes']} / RT{data['total_retweets']} / 🔖{data['total_bookmarks']}")

        if data["posts"] > 0 and data["total_impressions"] > 0:
            eng_rate = (data["total_likes"] + data["total_retweets"] + data["total_bookmarks"]) / data["total_impressions"] * 100
            lines.append(f"    エンゲージメント率: {eng_rate:.2f}%")

    # 改善提案
    lines.append("\n" + "=" * 60)
    lines.append("改善ポイント")
    lines.append("=" * 60)

    if len(ranked) >= 3:
        top = ranked[0]
        bottom = ranked[-1]
        lines.append(f"\n■ 最強テーマ: {top[0]} (スコア: {top[1]['avg_score']})")
        lines.append(f"  → このテーマの頻度を上げる")
        lines.append(f"\n■ 要改善テーマ: {bottom[0]} (スコア: {bottom[1]['avg_score']})")
        lines.append(f"  → 構成・フックの見直し、または頻度を下げる")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="エンゲージメント追跡・テーマ分析")
    parser.add_argument("--report", action="store_true", help="テーマ別パフォーマンスレポート")
    parser.add_argument("--update-weights", action="store_true", help="テーマプール重みを更新")
    parser.add_argument("--json", action="store_true", help="JSON出力")
    args = parser.parse_args()

    posts = get_posted_tweets()

    if not posts:
        print("投稿済みツイートがありません（tweet_idが必要です）。")
        print("approve_post.py で投稿後に再実行してください。")
        if not args.report:
            sys.exit(0)

    # ステップ1: エンゲージメント取得
    if posts:
        # 未取得 or 24時間以上経過した投稿のみ再取得
        needs_fetch = []
        for filepath, data in posts:
            eng = data.get("engagement")
            if not eng:
                needs_fetch.append((filepath, data))
            else:
                fetched = eng.get("fetched_at", "")
                if fetched:
                    last = datetime.fromisoformat(fetched.replace("Z", "+00:00"))
                    if datetime.now(timezone.utc) - last > timedelta(hours=12):
                        needs_fetch.append((filepath, data))

        if needs_fetch:
            print(f"エンゲージメント取得中... ({len(needs_fetch)}件)")
            client = get_client()
            tweet_ids = [d.get("tweet_id") for _, d in needs_fetch if d.get("tweet_id")]
            metrics = fetch_tweet_metrics(client, tweet_ids)

            updated = 0
            for filepath, data in needs_fetch:
                tid = data.get("tweet_id")
                if tid and tid in metrics:
                    update_post_engagement(filepath, data, metrics[tid])
                    updated += 1
            print(f"更新完了: {updated}件")
        else:
            print("全投稿のエンゲージメントは最新です。")

    # 最新データで再読み込み
    posts = get_posted_tweets()
    theme_scores = build_theme_scores(posts)

    # ステップ2: レポート or 重み更新
    if args.update_weights:
        result = update_theme_weights(theme_scores)
        if args.json and result:
            print(json.dumps(result, ensure_ascii=False, indent=2))
    elif args.report:
        report = format_report(theme_scores)
        if args.json:
            print(json.dumps(theme_scores, ensure_ascii=False, indent=2, default=str))
        else:
            print(report)
    else:
        # デフォルト: 取得のみ（サマリー表示）
        if theme_scores:
            print(f"\nテーマ数: {len(theme_scores)}")
            ranked = sorted(theme_scores.items(), key=lambda x: x[1]["avg_score"], reverse=True)
            for theme, data in ranked[:5]:
                print(f"  {theme}: スコア{data['avg_score']} ({data['posts']}件)")
        print("\n詳細は --report、重み更新は --update-weights")


if __name__ == "__main__":
    main()
