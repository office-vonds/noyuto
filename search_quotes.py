#!/usr/bin/env python3
"""引用リポスト候補をX API v2で検索し、精度の高い候補を返す。

使い方:
  python3 search_quotes.py              # 結果をターミナルに表示
  python3 search_quotes.py --json       # JSON形式で出力（他スクリプト連携用）
  python3 search_quotes.py --top 5      # 総合スコア上位5件だけ表示
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

# ============================================================
# 検索キーワード（NOYUTOの視野 + 社会の広い文脈）
# ============================================================
KEYWORDS = {
    "攻撃型": {
        "description": "常識・構造を切る（人ではなく仕組みを切る）→ 最も拡散する",
        "style": "「本当にそうでしょうか」で始めて思想をぶつける",
        "queries": [
            # NOYUTOの得意領域（既存）
            '"売上が全て"',
            '"結果を出せ"',
            '"正解は" "成功"',
            # 権威・常識への盲従
            '"専門家が言うから"',
            '"普通は" "べき"',
            '"常識的に考えて"',
            '"エビデンス" "正しい"',
            # 効率至上主義・数字信仰
            '"コスパ" "人生"',
            '"生産性" "高める"',
            '"タイパ" "無駄"',
            # 教育・子育ての固定観念
            '"学歴" "必要"',
            '"偏差値" "将来"',
            '"子供のため" "我慢"',
            # 労働観
            '"石の上にも三年"',
            '"我慢" "社会人"',
            '"安定した仕事"',
        ],
    },
    "思考起動型": {
        "description": "問いだけ置く → フォロワー転換率が最も高い",
        "style": "時事や他者の問いをフックに「私はこう考えます」と独自視点を展開",
        "queries": [
            # AI・テクノロジーと人間
            '"AI" "仕事" "なくなる"',
            '"AI" "教育"',
            '"ChatGPT" "使い方"',
            '"人間にしかできない"',
            # メンタルヘルス・生き方
            '"うつ" "克服"',
            '"メンタル" "弱い"',
            '"自己肯定感" "低い"',
            '"生きづらさ"',
            '"居場所がない"',
            # 社会問題
            '"貧困" "子供"',
            '"児童養護" OR "養護施設"',
            '"孤独" "社会"',
            '"格差" "広がる"',
            # 経営・リーダーシップ
            '"経営者" "孤独"',
            '"リーダー" "覚悟"',
            '"部下" "信頼"',
            '"組織" "崩壊"',
        ],
    },
    "共鳴型": {
        "description": "本質を肯定して体験を乗せる → 信頼残高を積む",
        "style": "「同じ景色を見ています」と共感し、体験で上乗せする",
        "queries": [
            # NOYUTOの思想と共鳴するワード
            '"信頼" "経済"',
            '"行動" "変わった"',
            '"矛盾" "人間"',
            '"感謝" "生き方"',
            '"些事" OR "小さなこと" "大切"',
            # 挫折と再起
            '"失敗" "感謝"',
            '"どん底" "這い上がる"',
            '"裏切られ" "学んだ"',
            '"全て失った"',
            # 志・夢
            '"志" "高い"',
            '"夢" "諦めない"',
            '"使命" "見つけた"',
            # 家族・愛
            '"子供" "教えてくれた"',
            '"親" "背中"',
            '"家族" "支え"',
        ],
    },
}

# ============================================================
# 監視アカウント（影響力のある発信者）
# ============================================================
WATCH_ACCOUNTS = [
    "CS60osaka1",       # 健康・自然療法（ブクマ率24%）
    "ujontaka",         # 自己成長・図解（ブクマ率35%）
    "chokki_hansei",    # AI×哲学（ブクマ率25%）
    "thug_business",    # 自己啓発・覚悟論（ブクマ率18%）
    "oshige_writing",   # メンタル・人間関係（ブクマ率18%）
    "fit_masa110",      # 覚悟・孤独・習慣（平均♥325）
    "naomicoach7",      # 経営コーチ・組織開発（37Kフォロワー）
]

# ============================================================
# スコアリング設定
# ============================================================
# 最低エンゲージメント（ノイズ除去）
MIN_LIKES = 5
MIN_ENGAGEMENT = 10  # likes + retweets + replies

# スコア重み
SCORE_WEIGHTS = {
    "likes": 1.0,
    "retweets": 2.0,       # RTは拡散力の証
    "replies": 1.5,        # リプは議論性の証
    "bookmarks": 3.0,      # ブクマは「保存したい」＝深い共感
    "quote_count": 2.5,    # 引用数は「語りたい」＝議論性
}


def get_client() -> tweepy.Client:
    bearer = os.getenv("X_BEARER_TOKEN")
    if not bearer:
        print("エラー: X_BEARER_TOKENが.envに設定されていません")
        sys.exit(1)
    return tweepy.Client(bearer_token=bearer)


def calc_score(metrics: dict) -> float:
    """エンゲージメントの総合スコアを計算。"""
    score = 0.0
    for key, weight in SCORE_WEIGHTS.items():
        score += metrics.get(f"{key}_count", metrics.get(key, 0)) * weight
    return round(score, 1)


def passes_quality_filter(metrics: dict, text: str) -> bool:
    """低品質ツイートを除外。"""
    likes = metrics.get("like_count", 0)
    retweets = metrics.get("retweet_count", 0)
    replies = metrics.get("reply_count", 0)
    total = likes + retweets + replies

    if likes < MIN_LIKES:
        return False
    if total < MIN_ENGAGEMENT:
        return False

    # 短すぎるツイートは引用しづらい
    if len(text) < 30:
        return False

    # URLだけ、宣伝臭い投稿を除外
    if text.count("http") >= 2:
        return False

    return True


def search_keyword(client: tweepy.Client, query: str, max_results: int = 15) -> list[dict]:
    """キーワードで直近24時間の投稿を検索し、スコア上位を返す。"""
    full_query = f"{query} lang:ja -is:retweet -is:reply"

    since = datetime.now(timezone.utc) - timedelta(hours=24)

    try:
        response = client.search_recent_tweets(
            query=full_query,
            max_results=max_results,
            start_time=since.isoformat(),
            tweet_fields=["public_metrics", "created_at", "author_id"],
            user_fields=["username", "name", "public_metrics"],
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
            user_metrics = user.public_metrics or {}
            users[user.id] = {
                "username": user.username,
                "name": user.name,
                "followers": user_metrics.get("followers_count", 0),
            }

    tweets = []
    for tweet in response.data:
        metrics = tweet.public_metrics or {}

        # 品質フィルタ
        if not passes_quality_filter(metrics, tweet.text):
            continue

        user_info = users.get(tweet.author_id, {})
        score = calc_score(metrics)

        # フォロワー数ボーナス（影響力のある投稿を優先）
        followers = user_info.get("followers", 0)
        if followers >= 10000:
            score *= 1.5
        elif followers >= 1000:
            score *= 1.2

        tweets.append({
            "id": str(tweet.id),
            "text": tweet.text,
            "likes": metrics.get("like_count", 0),
            "retweets": metrics.get("retweet_count", 0),
            "replies": metrics.get("reply_count", 0),
            "bookmarks": metrics.get("bookmark_count", 0),
            "score": round(score, 1),
            "username": user_info.get("username", "unknown"),
            "name": user_info.get("name", ""),
            "followers": followers,
            "url": f"https://x.com/{user_info.get('username', 'i')}/status/{tweet.id}",
            "created_at": tweet.created_at.isoformat() if tweet.created_at else "",
        })

    tweets.sort(key=lambda t: t["score"], reverse=True)
    return tweets[:3]


def search_watch_accounts(client: tweepy.Client) -> list[dict]:
    """監視アカウントの直近投稿を取得。"""
    if not WATCH_ACCOUNTS:
        return []

    accounts_query = " OR ".join(f"from:{acc}" for acc in WATCH_ACCOUNTS)
    full_query = f"({accounts_query}) lang:ja -is:retweet -is:reply"

    since = datetime.now(timezone.utc) - timedelta(hours=48)

    try:
        response = client.search_recent_tweets(
            query=full_query,
            max_results=20,
            start_time=since.isoformat(),
            tweet_fields=["public_metrics", "created_at", "author_id"],
            user_fields=["username", "name", "public_metrics"],
            expansions=["author_id"],
            sort_order="relevancy",
        )
    except tweepy.TweepyException as e:
        return [{"error": str(e)}]

    if not response.data:
        return []

    users = {}
    if response.includes and "users" in response.includes:
        for user in response.includes["users"]:
            user_metrics = user.public_metrics or {}
            users[user.id] = {
                "username": user.username,
                "name": user.name,
                "followers": user_metrics.get("followers_count", 0),
            }

    tweets = []
    for tweet in response.data:
        metrics = tweet.public_metrics or {}
        user_info = users.get(tweet.author_id, {})
        score = calc_score(metrics)

        tweets.append({
            "id": str(tweet.id),
            "text": tweet.text,
            "likes": metrics.get("like_count", 0),
            "retweets": metrics.get("retweet_count", 0),
            "replies": metrics.get("reply_count", 0),
            "bookmarks": metrics.get("bookmark_count", 0),
            "score": round(score, 1),
            "username": user_info.get("username", "unknown"),
            "name": user_info.get("name", ""),
            "followers": user_info.get("followers", 0),
            "url": f"https://x.com/{user_info.get('username', 'i')}/status/{tweet.id}",
            "created_at": tweet.created_at.isoformat() if tweet.created_at else "",
        })

    tweets.sort(key=lambda t: t["score"], reverse=True)
    return tweets[:5]


def search_all(client: tweepy.Client) -> dict:
    """全カテゴリのキーワードで検索を実行。"""
    results = {}
    for category, config in KEYWORDS.items():
        results[category] = {"hits": {}, "style": config["style"], "description": config["description"]}
        for query in config["queries"]:
            hits = search_keyword(client, query)
            if hits and not any("error" in h for h in hits):
                results[category]["hits"][query] = hits

    # 監視アカウント
    watch_hits = search_watch_accounts(client)
    if watch_hits:
        results["監視アカウント"] = {
            "hits": {"watch": watch_hits},
            "style": "アカウントの文脈に合わせて攻撃・共鳴・思考起動を選択",
            "description": "影響力のあるアカウントの直近投稿",
        }

    return results


def get_top_candidates(results: dict, n: int = 10) -> list[dict]:
    """全カテゴリからスコア上位N件を抽出。"""
    all_tweets = []
    for category, data in results.items():
        for query, tweets in data.get("hits", {}).items():
            for tweet in tweets:
                if "error" not in tweet:
                    tweet["category"] = category
                    tweet["query"] = query
                    all_tweets.append(tweet)

    # 重複排除（同じツイートID）
    seen = set()
    unique = []
    for t in all_tweets:
        if t["id"] not in seen:
            seen.add(t["id"])
            unique.append(t)

    unique.sort(key=lambda t: t["score"], reverse=True)
    return unique[:n]


def format_results(results: dict, top_n: int = 0) -> str:
    """検索結果を読みやすいテキストに整形する。"""
    lines = []
    lines.append("=" * 60)
    lines.append("引用リポスト候補レポート")
    lines.append(f"検索日時: {datetime.now().strftime('%Y/%m/%d %H:%M')}")
    lines.append("=" * 60)

    if top_n > 0:
        # スコア上位だけ表示
        top = get_top_candidates(results, top_n)
        lines.append(f"\n★ 総合スコアTOP{top_n}")
        lines.append("-" * 50)
        for i, tweet in enumerate(top, 1):
            lines.append(f"\n  [{i}] スコア:{tweet['score']} | {tweet['category']}")
            lines.append(f"      @{tweet['username']} ({tweet['followers']:,}フォロワー)")
            lines.append(f"      ♥{tweet['likes']} RT{tweet['retweets']} 💬{tweet['replies']} 🔖{tweet['bookmarks']}")
            lines.append(f"      {tweet['text'][:120]}")
            lines.append(f"      {tweet['url']}")
        return "\n".join(lines)

    # 全カテゴリ表示
    total = 0
    for category, data in results.items():
        style = data.get("style", "")
        desc = data.get("description", "")
        lines.append(f"\n■ {category}")
        lines.append(f"  {desc}")
        lines.append(f"  推奨スタイル: {style}")
        lines.append("-" * 50)

        hits = data.get("hits", {})
        if not hits:
            lines.append("  該当なし")
            continue

        for query, tweets in hits.items():
            lines.append(f"\n  キーワード: {query}")
            for i, tweet in enumerate(tweets, 1):
                if "error" in tweet:
                    lines.append(f"    検索エラー: {tweet['error']}")
                    continue
                total += 1
                lines.append(f"    [{i}] スコア:{tweet['score']} @{tweet['username']} ({tweet.get('followers', 0):,}フォロワー)")
                lines.append(f"        ♥{tweet['likes']} RT{tweet['retweets']} 💬{tweet.get('replies', 0)} 🔖{tweet.get('bookmarks', 0)}")
                lines.append(f"        {tweet['text'][:120]}")
                lines.append(f"        {tweet['url']}")

    # 最後にTOP5を追加
    lines.append("\n" + "=" * 60)
    lines.append("★ 本日のベスト5（総合スコア順）")
    lines.append("=" * 60)
    top5 = get_top_candidates(results, 5)
    for i, tweet in enumerate(top5, 1):
        lines.append(f"\n  [{i}] スコア:{tweet['score']} | {tweet['category']}")
        lines.append(f"      @{tweet['username']} ({tweet.get('followers', 0):,}フォロワー)")
        lines.append(f"      {tweet['text'][:120]}")
        lines.append(f"      {tweet['url']}")

    lines.append(f"\n合計: {total}件の候補")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="引用リポスト候補を検索")
    parser.add_argument("--json", action="store_true", help="JSON形式で出力")
    parser.add_argument("--top", type=int, default=0, help="スコア上位N件だけ表示")
    args = parser.parse_args()

    client = get_client()
    results = search_all(client)

    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print(format_results(results, top_n=args.top))


if __name__ == "__main__":
    main()
