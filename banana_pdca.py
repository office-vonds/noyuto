#!/usr/bin/env python3
"""
バナナ君 PDCA エンジン — 週次自動実行
cron: 0 8 * * 1  cd ~/noyuto && python3 banana_pdca.py

Check  → 過去7日間の投稿エンゲージメントを分析
Act    → theme_weights.json を自動更新
Plan   → 来週の投稿戦略メモを生成
Report → PDCAレポートをGmail配信
"""

import json
import os
import glob
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict
from notify import send_notify

BASE_DIR = Path(__file__).parent
POSTS_DIR = BASE_DIR / "posts"
ENGAGEMENT_DIR = BASE_DIR / "engagement"
WEIGHTS_FILE = BASE_DIR / "theme_weights.json"
PDCA_LOG_DIR = BASE_DIR / "banana_pdca_logs"


def load_posts(days=7):
    """過去N日間の投稿データを読み込む"""
    cutoff = datetime.now() - timedelta(days=days)
    posts = []

    for f in sorted(glob.glob(str(POSTS_DIR / "*.json"))):
        try:
            with open(f, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            ts = datetime.fromisoformat(data.get("timestamp", "2000-01-01"))
            if ts >= cutoff:
                data["_file"] = os.path.basename(f)
                posts.append(data)
        except (json.JSONDecodeError, ValueError):
            continue

    return posts


def load_engagement():
    """エンゲージメントデータを読み込む"""
    ENGAGEMENT_DIR.mkdir(exist_ok=True)
    engagement = {}

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


def load_weights():
    """現在のテーマ重みを読み込む"""
    if WEIGHTS_FILE.exists():
        with open(WEIGHTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_weights(weights):
    """テーマ重みを保存"""
    with open(WEIGHTS_FILE, "w", encoding="utf-8") as f:
        json.dump(weights, f, ensure_ascii=False, indent=2)


def extract_theme_category(topic):
    """投稿のtopicからテーマカテゴリを抽出"""
    if not topic:
        return "不明"
    # 「金の奴隷は一生金に困る（スレッド1/4：フック）」→「金の奴隷は一生金に困る」
    theme = topic.split("（")[0].split("(")[0].strip()
    return theme


def calculate_engagement_score(data):
    """エンゲージメントスコアを計算"""
    likes = data.get("likes", 0) or 0
    retweets = data.get("retweets", 0) or 0
    replies = data.get("replies", 0) or 0
    bookmarks = data.get("bookmarks", 0) or 0
    impressions = data.get("impressions", 1) or 1

    # エンゲージメント数
    total_engagement = likes + retweets * 2 + replies * 3 + bookmarks * 3
    # エンゲージメント率
    rate = total_engagement / impressions if impressions > 0 else 0

    return {
        "total": total_engagement,
        "rate": round(rate * 100, 2),
        "impressions": impressions,
        "likes": likes,
        "retweets": retweets,
        "replies": replies,
        "bookmarks": bookmarks,
    }


# ============================================================
# CHECK: 過去の投稿を分析
# ============================================================
def check_phase(posts, engagement):
    """Check: 何が効いたか・効かなかったかを分析"""
    theme_stats = defaultdict(lambda: {
        "count": 0,
        "total_impressions": 0,
        "total_engagement": 0,
        "best_score": 0,
        "best_text": "",
    })

    posted_count = 0
    unposted_count = 0

    for post in posts:
        theme = extract_theme_category(post.get("topic", ""))
        tweet_id = post.get("tweet_id")

        if tweet_id and tweet_id in engagement:
            posted_count += 1
            score = calculate_engagement_score(engagement[tweet_id])
            stats = theme_stats[theme]
            stats["count"] += 1
            stats["total_impressions"] += score["impressions"]
            stats["total_engagement"] += score["total"]
            if score["total"] > stats["best_score"]:
                stats["best_score"] = score["total"]
                stats["best_text"] = post.get("text", "")[:80]
        elif post.get("status") == "pending":
            unposted_count += 1

    return {
        "theme_stats": dict(theme_stats),
        "posted_count": posted_count,
        "unposted_count": unposted_count,
        "total_posts": len(posts),
    }


# ============================================================
# ACT: テーマ重みを自動調整
# ============================================================
def act_phase(check_result, current_weights):
    """Act: 分析結果に基づいてテーマ重みを更新"""
    theme_stats = check_result["theme_stats"]
    new_weights = dict(current_weights)

    # デフォルトの全テーマ（auto_generate.pyから）
    from auto_generate import THEME_POOL
    for theme in THEME_POOL:
        if theme not in new_weights:
            new_weights[theme] = 1.0

    if not theme_stats:
        return new_weights, "データ不足のため重み変更なし（均等維持）"

    # エンゲージメント率でランキング
    ranked = []
    for theme, stats in theme_stats.items():
        if stats["count"] > 0:
            avg_engagement = stats["total_engagement"] / stats["count"]
            avg_impressions = stats["total_impressions"] / stats["count"]
            ranked.append((theme, avg_engagement, avg_impressions))

    ranked.sort(key=lambda x: x[1], reverse=True)

    adjustments = []
    for theme, avg_eng, avg_imp in ranked:
        # 重みに一致するキーを探す
        matching_key = None
        for key in new_weights:
            if key in theme or theme in key:
                matching_key = key
                break

        if matching_key:
            old_weight = new_weights[matching_key]
            if avg_eng > 0:
                # エンゲージメントがあったテーマ → 重みを上げる（最大3.0）
                new_weights[matching_key] = min(old_weight * 1.3, 3.0)
                adjustments.append(f"  UP   {matching_key[:20]}... {old_weight:.1f} → {new_weights[matching_key]:.1f}")
            else:
                # エンゲージメント0のテーマ → 重みを下げる（最小0.3）
                new_weights[matching_key] = max(old_weight * 0.8, 0.3)
                adjustments.append(f"  DOWN {matching_key[:20]}... {old_weight:.1f} → {new_weights[matching_key]:.1f}")

    save_weights(new_weights)

    if adjustments:
        return new_weights, "\n".join(adjustments)
    return new_weights, "調整対象テーマなし"


# ============================================================
# PLAN: 来週の戦略メモ生成
# ============================================================
def plan_phase(check_result, new_weights):
    """Plan: 来週の投稿戦略を立てる"""
    theme_stats = check_result["theme_stats"]

    # 重みが高い順にソート
    sorted_themes = sorted(new_weights.items(), key=lambda x: x[1], reverse=True)
    top_themes = sorted_themes[:5]

    lines = []
    lines.append("来週の重点テーマ（重み順 TOP5）:")
    for i, (theme, weight) in enumerate(top_themes, 1):
        lines.append(f"  {i}. [{weight:.1f}] {theme[:40]}")

    # 改善ポイント
    lines.append("")
    lines.append("改善アクション:")

    total_posts = check_result["total_posts"]
    posted = check_result["posted_count"]
    unposted = check_result["unposted_count"]

    if unposted > posted:
        lines.append("  - 未投稿が多い → 承認フローの簡略化を検討")
    if posted > 0 and not any(s["total_engagement"] > 0 for s in theme_stats.values()):
        lines.append("  - 全投稿エンゲージメント0 → 引用RTでの露出増加が最優先")
        lines.append("  - 投稿時間の変更を検討（現在の時間帯で届いていない可能性）")
    if total_posts < 7:
        lines.append("  - 投稿数が少ない → 毎日最低1投稿の維持を目標に")

    lines.append("  - フォロワー0〜100フェーズ: 量より「絡み」が重要")
    lines.append("  - 引用RT 1-2件/日を継続（人が絡みに行く行動）")

    return "\n".join(lines)


# ============================================================
# REPORT: PDCAレポート生成＆配信
# ============================================================
def build_report(check_result, weight_changes, plan_text):
    """PDCAレポートを組み立て"""
    now = datetime.now()
    week_start = (now - timedelta(days=7)).strftime("%m/%d")
    week_end = now.strftime("%m/%d")

    lines = []
    lines.append(f"バナナ君 PDCA週次レポート（{week_start}〜{week_end}）")
    lines.append("=" * 45)
    lines.append("")

    # CHECK
    lines.append("[ CHECK: 今週の結果 ]")
    lines.append(f"  投稿数: {check_result['total_posts']}件")
    lines.append(f"    投稿済み: {check_result['posted_count']}件")
    lines.append(f"    未投稿: {check_result['unposted_count']}件")
    lines.append("")

    theme_stats = check_result["theme_stats"]
    if theme_stats:
        lines.append("  テーマ別パフォーマンス:")
        for theme, stats in sorted(theme_stats.items(), key=lambda x: x[1]["total_engagement"], reverse=True):
            avg_imp = stats["total_impressions"] / max(stats["count"], 1)
            lines.append(f"    {theme[:30]}")
            lines.append(f"      投稿数:{stats['count']} / imp平均:{avg_imp:.0f} / eng合計:{stats['total_engagement']}")
    else:
        lines.append("  ※ エンゲージメントデータなし（track_engagement.py要実行）")
    lines.append("")

    # ACT
    lines.append("[ ACT: テーマ重み調整 ]")
    lines.append(weight_changes)
    lines.append("")

    # PLAN
    lines.append("[ PLAN: 来週の戦略 ]")
    lines.append(plan_text)
    lines.append("")

    lines.append("---")
    lines.append("バナナ君（マーケティング部長） / PDCA自動レポート")

    return "\n".join(lines)


def save_pdca_log(report):
    """PDCAログをファイルに保存"""
    PDCA_LOG_DIR.mkdir(exist_ok=True)
    filename = datetime.now().strftime("%Y-%m-%d") + "_pdca.md"
    filepath = PDCA_LOG_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(report)
    return filepath


def main():
    print("バナナ君 PDCA エンジン起動...")

    # CHECK
    posts = load_posts(days=7)
    engagement = load_engagement()
    check_result = check_phase(posts, engagement)
    print(f"  CHECK完了: {check_result['total_posts']}件の投稿を分析")

    # ACT
    current_weights = load_weights()
    new_weights, weight_changes = act_phase(check_result, current_weights)
    print(f"  ACT完了: テーマ重み更新")

    # PLAN
    plan_text = plan_phase(check_result, new_weights)
    print(f"  PLAN完了: 来週の戦略生成")

    # REPORT
    report = build_report(check_result, weight_changes, plan_text)
    log_path = save_pdca_log(report)
    print(f"  ログ保存: {log_path}")

    # Gmail配信
    subject = f"【バナナ君】{datetime.now().strftime('%m/%d')} PDCA週次レポート"
    success = send_notify(subject, report)

    if success:
        print("PDCA レポート配信完了")
    else:
        print(f"Gmail送信失敗。ログは {log_path} に保存済み")


if __name__ == "__main__":
    main()
