#!/usr/bin/env python3
"""
NOYUTO Analytics Collector
X API v2 でツイートメトリクスを日次収集し、CSVに蓄積する。
cron 9:05 で auto_generate.py から呼び出される想定。

必要な環境変数:
  X_BEARER_TOKEN  - X API v2 Bearer Token
  X_USER_ID       - 対象ユーザーのXユーザーID
"""

import csv
import json
import os
import sys
from datetime import datetime, timedelta, timezone

import requests

# ── 設定 ────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data", "analytics")
DAILY_CSV = os.path.join(DATA_DIR, "daily_metrics.csv")
POST_PERF_JSON = os.path.join(DATA_DIR, "post_performance.json")

METRICS = [
    "impression_count",
    "like_count",
    "retweet_count",
    "reply_count",
    "quote_count",
    "bookmark_count",
    "url_link_clicks",
]

CSV_HEADERS = [
    "date",
    "tweet_id",
    "text_preview",
    "created_at",
    "impression_count",
    "like_count",
    "retweet_count",
    "reply_count",
    "quote_count",
    "bookmark_count",
    "url_link_clicks",
    "engagement_rate",
    "repost_rate",
]

JST = timezone(timedelta(hours=9))

# ── X API v2 ────────────────────────────────────────
BASE_URL = "https://api.twitter.com/2"


def get_bearer_token():
    token = os.environ.get("X_BEARER_TOKEN", "")
    if not token:
        print("ERROR: X_BEARER_TOKEN が設定されていません")
        sys.exit(1)
    return token


def get_user_id():
    uid = os.environ.get("X_USER_ID", "")
    if not uid:
        print("ERROR: X_USER_ID が設定されていません")
        sys.exit(1)
    return uid


def fetch_recent_tweets(bearer_token, user_id, since_hours=48):
    """直近 since_hours 時間のツイートとメトリクスを取得する。"""
    headers = {"Authorization": f"Bearer {bearer_token}"}

    since_time = datetime.now(timezone.utc) - timedelta(hours=since_hours)
    start_time = since_time.strftime("%Y-%m-%dT%H:%M:%SZ")

    params = {
        "max_results": 100,
        "start_time": start_time,
        "tweet.fields": "created_at,public_metrics,non_public_metrics,organic_metrics",
        "exclude": "retweets,replies",
    }

    url = f"{BASE_URL}/users/{user_id}/tweets"
    tweets = []
    next_token = None

    for _ in range(10):  # ページネーション上限
        if next_token:
            params["pagination_token"] = next_token

        resp = requests.get(url, headers=headers, params=params, timeout=30)

        if resp.status_code == 401:
            print("ERROR: 認証エラー。X_BEARER_TOKEN を確認してください")
            sys.exit(1)
        if resp.status_code == 403:
            print("ERROR: 403 Forbidden。APIアクセス権限を確認してください")
            print(f"Response: {resp.text[:300]}")
            sys.exit(1)
        if resp.status_code == 429:
            print("WARNING: レートリミット到達。次回実行で再取得します")
            break
        if resp.status_code != 200:
            print(f"ERROR: X API returned {resp.status_code}: {resp.text[:300]}")
            sys.exit(1)

        data = resp.json()
        if "data" not in data:
            break

        tweets.extend(data["data"])
        next_token = data.get("meta", {}).get("next_token")
        if not next_token:
            break

    return tweets


def extract_metrics(tweet):
    """ツイートからメトリクスを抽出する。public_metrics + organic_metrics を統合。"""
    pub = tweet.get("public_metrics", {})
    org = tweet.get("organic_metrics", {})
    non_pub = tweet.get("non_public_metrics", {})

    # organic_metrics が利用可能ならそちらを優先（より正確）
    metrics = {}
    for key in METRICS:
        metrics[key] = org.get(key) or non_pub.get(key) or pub.get(key, 0) or 0

    # 算出指標
    impressions = metrics.get("impression_count", 0)
    engagements = (
        metrics.get("like_count", 0)
        + metrics.get("retweet_count", 0)
        + metrics.get("reply_count", 0)
        + metrics.get("quote_count", 0)
        + metrics.get("bookmark_count", 0)
    )

    metrics["engagement_rate"] = (
        round(engagements / impressions * 100, 3) if impressions > 0 else 0.0
    )
    metrics["repost_rate"] = (
        round(metrics.get("retweet_count", 0) / impressions * 100, 4)
        if impressions > 0
        else 0.0
    )

    return metrics


# ── CSV 蓄積 ─────────────────────────────────────────
def load_existing_entries():
    """既存CSVから (date, tweet_id) のセットを返す。"""
    entries = set()
    if not os.path.exists(DAILY_CSV):
        return entries
    with open(DAILY_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            entries.add((row["date"], row["tweet_id"]))
    return entries


def append_to_csv(rows):
    """CSVにメトリクス行を追記する。"""
    file_exists = os.path.exists(DAILY_CSV)
    with open(DAILY_CSV, "a", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        if not file_exists:
            writer.writeheader()
        for row in rows:
            writer.writerow(row)


# ── 投稿別パフォーマンスDB ─────────────────────────────
def update_post_performance(tweets_with_metrics):
    """post_performance.json を更新する。"""
    perf = {}
    if os.path.exists(POST_PERF_JSON):
        with open(POST_PERF_JSON, "r", encoding="utf-8") as f:
            perf = json.load(f)

    for tweet_id, tweet, metrics in tweets_with_metrics:
        perf[tweet_id] = {
            "text": tweet.get("text", "")[:140],
            "created_at": tweet.get("created_at", ""),
            "last_updated": datetime.now(JST).isoformat(),
            "metrics": {k: metrics[k] for k in METRICS},
            "engagement_rate": metrics["engagement_rate"],
            "repost_rate": metrics["repost_rate"],
        }

    with open(POST_PERF_JSON, "w", encoding="utf-8") as f:
        json.dump(perf, f, ensure_ascii=False, indent=2)
        f.write("\n")

    return perf


# ── リポスト検出・構造分析 ─────────────────────────────
def detect_reposted_tweets(perf_db):
    """リポスト数 >= 1 の投稿を抽出する。"""
    reposted = []
    for tweet_id, data in perf_db.items():
        rt = data.get("metrics", {}).get("retweet_count", 0)
        qt = data.get("metrics", {}).get("quote_count", 0)
        if rt + qt >= 1:
            reposted.append({
                "tweet_id": tweet_id,
                "text": data.get("text", ""),
                "retweet_count": rt,
                "quote_count": qt,
                "engagement_rate": data.get("engagement_rate", 0),
                "repost_rate": data.get("repost_rate", 0),
            })
    return sorted(reposted, key=lambda x: x["retweet_count"] + x["quote_count"], reverse=True)


# ── 投稿時間帯別分析 ──────────────────────────────────
TIME_SLOTS = {
    "06-09": (6, 9),
    "09-12": (9, 12),
    "12-15": (12, 15),
    "15-18": (15, 18),
    "18-21": (18, 21),
    "21-24": (21, 24),
    "00-06": (0, 6),
}


def analyze_time_slots(perf_db):
    """投稿時間帯別のパフォーマンスを集計する。"""
    slots = {k: {"count": 0, "total_impressions": 0, "total_engagement_rate": 0.0}
             for k in TIME_SLOTS}

    for data in perf_db.values():
        created = data.get("created_at", "")
        if not created:
            continue
        try:
            dt = datetime.fromisoformat(created.replace("Z", "+00:00")).astimezone(JST)
        except (ValueError, TypeError):
            continue

        hour = dt.hour
        for slot_name, (start, end) in TIME_SLOTS.items():
            if start <= hour < end:
                slots[slot_name]["count"] += 1
                slots[slot_name]["total_impressions"] += (
                    data.get("metrics", {}).get("impression_count", 0)
                )
                slots[slot_name]["total_engagement_rate"] += data.get("engagement_rate", 0)
                break

    # 平均算出
    result = {}
    for slot_name, vals in slots.items():
        count = vals["count"]
        if count > 0:
            result[slot_name] = {
                "count": count,
                "avg_impressions": round(vals["total_impressions"] / count),
                "avg_engagement_rate": round(vals["total_engagement_rate"] / count, 3),
            }
        else:
            result[slot_name] = {"count": 0, "avg_impressions": 0, "avg_engagement_rate": 0.0}
    return result


# ── Gmail 通知用サマリー生成 ───────────────────────────
def generate_daily_summary(new_rows, reposted, time_analysis):
    """Gmail通知に含める前日メトリクスサマリーをテキストで返す。"""
    lines = []
    lines.append("=== 前日アナリティクスサマリー ===\n")

    if not new_rows:
        lines.append("新規メトリクスデータなし\n")
    else:
        total_imp = sum(r.get("impression_count", 0) for r in new_rows)
        total_like = sum(r.get("like_count", 0) for r in new_rows)
        total_rt = sum(r.get("retweet_count", 0) for r in new_rows)
        total_reply = sum(r.get("reply_count", 0) for r in new_rows)
        total_bm = sum(r.get("bookmark_count", 0) for r in new_rows)

        lines.append(f"対象ツイート数: {len(new_rows)}")
        lines.append(f"合計インプレッション: {total_imp:,}")
        lines.append(f"合計いいね: {total_like}")
        lines.append(f"合計リポスト: {total_rt}")
        lines.append(f"合計返信: {total_reply}")
        lines.append(f"合計ブックマーク: {total_bm}")

        if total_imp > 0:
            avg_eng = round(
                (total_like + total_rt + total_reply + total_bm) / total_imp * 100, 2
            )
            lines.append(f"平均エンゲージメント率: {avg_eng}%")

    if reposted:
        lines.append(f"\n--- リポストされた投稿 ({len(reposted)}件) ---")
        for rp in reposted[:5]:
            lines.append(f"  RT:{rp['retweet_count']} QT:{rp['quote_count']} | {rp['text'][:60]}...")

    if time_analysis:
        lines.append("\n--- 投稿時間帯別パフォーマンス ---")
        for slot, vals in sorted(time_analysis.items()):
            if vals["count"] > 0:
                lines.append(
                    f"  {slot}: {vals['count']}件 | "
                    f"平均imp:{vals['avg_impressions']:,} | "
                    f"平均ER:{vals['avg_engagement_rate']}%"
                )

    return "\n".join(lines)


# ── メイン処理 ─────────────────────────────────────
def collect(since_hours=48):
    """メトリクス収集のメインエントリーポイント。サマリーテキストを返す。"""
    os.makedirs(DATA_DIR, exist_ok=True)

    bearer_token = get_bearer_token()
    user_id = get_user_id()

    print(f"[analytics_collector] メトリクス収集開始 (直近{since_hours}h)")

    tweets = fetch_recent_tweets(bearer_token, user_id, since_hours)
    print(f"  取得ツイート数: {len(tweets)}")

    if not tweets:
        print("  対象ツイートなし。終了")
        return "新規メトリクスデータなし"

    today = datetime.now(JST).strftime("%Y-%m-%d")
    existing = load_existing_entries()

    new_rows = []
    tweets_with_metrics = []

    for tweet in tweets:
        tweet_id = tweet["id"]
        if (today, tweet_id) in existing:
            continue

        metrics = extract_metrics(tweet)
        row = {
            "date": today,
            "tweet_id": tweet_id,
            "text_preview": tweet.get("text", "")[:80].replace("\n", " "),
            "created_at": tweet.get("created_at", ""),
        }
        row.update({k: metrics[k] for k in CSV_HEADERS if k in metrics})

        new_rows.append(row)
        tweets_with_metrics.append((tweet_id, tweet, metrics))

    if new_rows:
        append_to_csv(new_rows)
        print(f"  CSV追記: {len(new_rows)}行")
    else:
        print("  新規データなし（全て記録済み）")

    # 投稿別パフォーマンスDB更新
    perf_db = update_post_performance(tweets_with_metrics)
    print(f"  パフォーマンスDB更新: {len(perf_db)}件")

    # リポスト検出
    reposted = detect_reposted_tweets(perf_db)
    if reposted:
        print(f"  リポスト検出: {len(reposted)}件")
        for rp in reposted[:3]:
            print(f"    RT:{rp['retweet_count']} QT:{rp['quote_count']} | {rp['text'][:50]}...")

    # 投稿時間帯分析
    time_analysis = analyze_time_slots(perf_db)

    # サマリー生成
    summary = generate_daily_summary(new_rows, reposted, time_analysis)
    print("\n" + summary)

    return summary


def main():
    collect()


if __name__ == "__main__":
    main()
