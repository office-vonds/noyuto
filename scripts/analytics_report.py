#!/usr/bin/env python3
"""
NOYUTO Analytics Report
weekly_reports/ に週次レポート（Markdown）を自動生成する。
リポスト率トップ投稿の構造分析を含む。

必要な環境変数（改善提案機能を使う場合）:
  ANTHROPIC_API_KEY - Claude API キー

使い方:
  python analytics_report.py              # 直近7日の週次レポート
  python analytics_report.py --days 30    # 直近30日のレポート
"""

import argparse
import csv
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data", "analytics")
DAILY_CSV = os.path.join(DATA_DIR, "daily_metrics.csv")
POST_PERF_JSON = os.path.join(DATA_DIR, "post_performance.json")
WEEKLY_DIR = os.path.join(DATA_DIR, "weekly_reports")

JST = timezone(timedelta(hours=9))


# ── CSV読み込み ───────────────────────────────────────
def load_metrics(days=7):
    """daily_metrics.csv から直近 days 日のデータを読み込む。"""
    if not os.path.exists(DAILY_CSV):
        print(f"ERROR: {DAILY_CSV} が見つかりません。analytics_collector.py を先に実行してください")
        sys.exit(1)

    cutoff = (datetime.now(JST) - timedelta(days=days)).strftime("%Y-%m-%d")
    rows = []

    with open(DAILY_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["date"] >= cutoff:
                # 数値変換
                for key in [
                    "impression_count", "like_count", "retweet_count",
                    "reply_count", "quote_count", "bookmark_count", "url_link_clicks",
                ]:
                    row[key] = int(row.get(key, 0) or 0)
                for key in ["engagement_rate", "repost_rate"]:
                    row[key] = float(row.get(key, 0) or 0)
                rows.append(row)

    return rows


def load_post_performance():
    """post_performance.json を読み込む。"""
    if not os.path.exists(POST_PERF_JSON):
        return {}
    with open(POST_PERF_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


# ── 集計 ─────────────────────────────────────────────
def aggregate(rows):
    """メトリクスを集計する。"""
    if not rows:
        return None

    stats = {
        "period_days": len(set(r["date"] for r in rows)),
        "total_tweets": len(set(r["tweet_id"] for r in rows)),
        "total_impressions": sum(r["impression_count"] for r in rows),
        "total_likes": sum(r["like_count"] for r in rows),
        "total_retweets": sum(r["retweet_count"] for r in rows),
        "total_replies": sum(r["reply_count"] for r in rows),
        "total_quotes": sum(r["quote_count"] for r in rows),
        "total_bookmarks": sum(r["bookmark_count"] for r in rows),
    }

    imp = stats["total_impressions"]
    engagements = (
        stats["total_likes"] + stats["total_retweets"]
        + stats["total_replies"] + stats["total_quotes"]
        + stats["total_bookmarks"]
    )
    stats["overall_engagement_rate"] = round(engagements / imp * 100, 3) if imp > 0 else 0
    stats["overall_repost_rate"] = round(stats["total_retweets"] / imp * 100, 4) if imp > 0 else 0

    return stats


def top_posts_by_repost(rows, n=3):
    """リポスト率トップN投稿を返す。"""
    best = {}
    for r in rows:
        tid = r["tweet_id"]
        rt = r["retweet_count"] + r.get("quote_count", 0)
        if tid not in best or rt > best[tid]["total_reposts"]:
            best[tid] = {
                "tweet_id": tid,
                "text_preview": r.get("text_preview", ""),
                "total_reposts": rt,
                "impression_count": r["impression_count"],
                "repost_rate": r["repost_rate"],
                "engagement_rate": r["engagement_rate"],
            }

    sorted_posts = sorted(best.values(), key=lambda x: x["total_reposts"], reverse=True)
    return sorted_posts[:n]


def daily_trend(rows):
    """日別メトリクス推移を返す。"""
    by_date = defaultdict(lambda: {
        "impressions": 0, "likes": 0, "retweets": 0, "tweets": set()
    })
    for r in rows:
        d = r["date"]
        by_date[d]["impressions"] += r["impression_count"]
        by_date[d]["likes"] += r["like_count"]
        by_date[d]["retweets"] += r["retweet_count"]
        by_date[d]["tweets"].add(r["tweet_id"])

    trend = []
    for d in sorted(by_date.keys()):
        vals = by_date[d]
        imp = vals["impressions"]
        eng = vals["likes"] + vals["retweets"]
        trend.append({
            "date": d,
            "tweets": len(vals["tweets"]),
            "impressions": imp,
            "likes": vals["likes"],
            "retweets": vals["retweets"],
            "engagement_rate": round(eng / imp * 100, 2) if imp > 0 else 0,
        })
    return trend


# ── Claude API 改善提案 ───────────────────────────────
def generate_improvement_suggestions(stats, top_posts, trend):
    """Claude APIで改善提案を生成する。APIキーがなければスキップ。"""
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return "（ANTHROPIC_API_KEY 未設定のため、改善提案はスキップ）"

    try:
        import anthropic
    except ImportError:
        return "（anthropic パッケージ未インストール）"

    client = anthropic.Anthropic()

    context = f"""以下はNOYUTO（X: @noyuto_0902）の週次アナリティクスデータです。

## 集計サマリー
- 対象期間: {stats['period_days']}日間
- 投稿数: {stats['total_tweets']}
- 合計インプレッション: {stats['total_impressions']:,}
- 合計いいね: {stats['total_likes']}
- 合計リポスト: {stats['total_retweets']}
- エンゲージメント率: {stats['overall_engagement_rate']}%
- リポスト率: {stats['overall_repost_rate']}%

## リポスト率トップ投稿
"""
    for i, p in enumerate(top_posts, 1):
        context += f"{i}. RT:{p['total_reposts']} ER:{p['engagement_rate']}% | {p['text_preview']}\n"

    context += "\n## 日別推移\n"
    for t in trend[-7:]:
        context += f"  {t['date']}: imp={t['impressions']:,} like={t['likes']} RT={t['retweets']} ER={t['engagement_rate']}%\n"

    prompt = """上記データを分析し、以下の3点を簡潔に提案してください：
1. リポスト率を改善するための具体的なコンテンツ構造の提案（v4リポスト誘発構造に基づく）
2. エンゲージメント率改善のための投稿時間・頻度の提案
3. 次週のテーマ・切り口の具体的提案（3つ）

各提案は3行以内で。"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": context + "\n\n" + prompt}],
        )
        return response.content[0].text.strip()
    except Exception as e:
        return f"（Claude API呼び出しエラー: {e}）"


# ── レポート生成 ───────────────────────────────────────
def build_report(stats, top_posts, trend, suggestions, days):
    """Markdownレポートを組み立てる。"""
    now = datetime.now(JST)
    report_date = now.strftime("%Y-%m-%d")

    lines = []
    lines.append(f"# NOYUTO 週次アナリティクスレポート")
    lines.append(f"")
    lines.append(f"**生成日時:** {now.strftime('%Y-%m-%d %H:%M JST')}")
    lines.append(f"**対象期間:** 直近{days}日間（{stats['period_days']}日分のデータ）")
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")

    # KPIサマリー
    lines.append(f"## KPIサマリー")
    lines.append(f"")
    lines.append(f"| 指標 | 値 |")
    lines.append(f"|---|---|")
    lines.append(f"| 投稿数 | {stats['total_tweets']} |")
    lines.append(f"| インプレッション | {stats['total_impressions']:,} |")
    lines.append(f"| いいね | {stats['total_likes']} |")
    lines.append(f"| リポスト | {stats['total_retweets']} |")
    lines.append(f"| 返信 | {stats['total_replies']} |")
    lines.append(f"| 引用RT | {stats['total_quotes']} |")
    lines.append(f"| ブックマーク | {stats['total_bookmarks']} |")
    lines.append(f"| **エンゲージメント率** | **{stats['overall_engagement_rate']}%** |")
    lines.append(f"| **リポスト率（最重要KPI）** | **{stats['overall_repost_rate']}%** |")
    lines.append(f"")

    # リポスト率トップ
    lines.append(f"## リポスト率トップ投稿")
    lines.append(f"")
    if top_posts:
        for i, p in enumerate(top_posts, 1):
            lines.append(f"### {i}位 (RT:{p['total_reposts']} / ER:{p['engagement_rate']}%)")
            lines.append(f"")
            lines.append(f"> {p['text_preview']}")
            lines.append(f"")
            lines.append(f"- インプレッション: {p['impression_count']:,}")
            lines.append(f"- リポスト率: {p['repost_rate']}%")
            lines.append(f"")
    else:
        lines.append(f"（対象期間内にリポストされた投稿なし）")
        lines.append(f"")

    # 日別推移
    lines.append(f"## 日別推移")
    lines.append(f"")
    lines.append(f"| 日付 | 投稿数 | imp | like | RT | ER |")
    lines.append(f"|---|---|---|---|---|---|")
    for t in trend:
        lines.append(
            f"| {t['date']} | {t['tweets']} | {t['impressions']:,} | "
            f"{t['likes']} | {t['retweets']} | {t['engagement_rate']}% |"
        )
    lines.append(f"")

    # 改善提案
    lines.append(f"## 改善提案（AI分析）")
    lines.append(f"")
    lines.append(suggestions)
    lines.append(f"")

    lines.append(f"---")
    lines.append(f"*自動生成 by analytics_report.py*")

    return "\n".join(lines)


# ── メイン ─────────────────────────────────────────────
def generate_report(days=7):
    """週次レポート生成のメインエントリーポイント。レポートパスを返す。"""
    os.makedirs(WEEKLY_DIR, exist_ok=True)

    rows = load_metrics(days)
    if not rows:
        print("対象期間にデータがありません")
        return None

    print(f"[analytics_report] {len(rows)}行のデータでレポート生成中...")

    stats = aggregate(rows)
    top_posts = top_posts_by_repost(rows)
    trend = daily_trend(rows)
    suggestions = generate_improvement_suggestions(stats, top_posts, trend)

    report = build_report(stats, top_posts, trend, suggestions, days)

    # ファイル保存
    now = datetime.now(JST)
    week_start = (now - timedelta(days=now.weekday())).strftime("%Y-%m-%d")
    filename = f"week_{week_start}.md"
    filepath = os.path.join(WEEKLY_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"レポート保存: {filepath}")
    return filepath


def main():
    parser = argparse.ArgumentParser(description="NOYUTO 週次アナリティクスレポート生成")
    parser.add_argument("--days", type=int, default=7, help="対象日数（デフォルト7日）")
    args = parser.parse_args()

    path = generate_report(args.days)
    if path:
        print(f"\n完了: {path}")


if __name__ == "__main__":
    main()
