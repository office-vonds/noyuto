#!/usr/bin/env python3
"""フォロワー数の日次トラッキング（X API v2 Bearer認証）

朝のcronで1回実行してCSVに追記する。死んでいるアカウントの生存兆候を測る唯一の指標。
ユーザーID or screen_nameから取得。screen_nameは.envの X_USERNAME を優先。
"""
import csv
import os
import sys
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
CSV_PATH = BASE_DIR / "follower_history.csv"


def main():
    load_dotenv(BASE_DIR / ".env")
    bearer = os.getenv("X_BEARER_TOKEN")
    if not bearer:
        print("[track_followers] X_BEARER_TOKEN 未設定、スキップ")
        sys.exit(0)

    username = os.getenv("X_USERNAME", "noyuto_official").lstrip("@")

    url = f"https://api.x.com/2/users/by/username/{username}"
    params = {"user.fields": "public_metrics"}
    headers = {"Authorization": f"Bearer {bearer}"}

    try:
        r = requests.get(url, params=params, headers=headers, timeout=15)
    except requests.RequestException as e:
        print(f"[track_followers] network error: {e}")
        sys.exit(0)

    if r.status_code != 200:
        print(f"[track_followers] API {r.status_code}: {r.text[:200]}")
        sys.exit(0)

    data = r.json().get("data", {})
    metrics = data.get("public_metrics", {})
    followers = metrics.get("followers_count", 0)
    following = metrics.get("following_count", 0)
    tweets = metrics.get("tweet_count", 0)

    # 前日比
    prev = None
    if CSV_PATH.exists():
        with open(CSV_PATH, encoding="utf-8") as f:
            rows = list(csv.reader(f))
        if len(rows) >= 2:
            try:
                prev = int(rows[-1][1])
            except (IndexError, ValueError):
                prev = None

    diff = followers - prev if prev is not None else 0
    ts = datetime.now().strftime("%Y-%m-%d")

    new_file = not CSV_PATH.exists()
    with open(CSV_PATH, "a", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        if new_file:
            w.writerow(["date", "followers", "following", "tweets", "diff"])
        w.writerow([ts, followers, following, tweets, diff])

    sign = "+" if diff > 0 else ("" if diff == 0 else "")
    print(f"[track_followers] {ts} @{username}: {followers}フォロワー (前日比 {sign}{diff})")


if __name__ == "__main__":
    main()
