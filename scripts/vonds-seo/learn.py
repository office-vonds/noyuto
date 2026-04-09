#!/usr/bin/env python3
"""
記事学習スクリプト
1. 公開済み記事を品質チェッカーで分析
2. 高スコア記事の構造パターンを抽出してlearned_patterns.jsonに蓄積
3. 低スコア記事の問題点を避けるべきパターンとして記録
4. 次回の記事生成プロンプトに反映される
"""

import json
import re
import logging
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

from quality_checker import check_article, strip_html

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(Path(__file__).parent / "logs" / "learn.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)

BASE_DIR = Path(__file__).parent
PROJECT_DIR = BASE_DIR.parent.parent
COLUMN_DIR = PROJECT_DIR / "column"
STATE_PATH = BASE_DIR / "state.json"
PATTERNS_PATH = BASE_DIR / "learned_patterns.json"
JST = timezone(timedelta(hours=9))


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def extract_article_body(html):
    """HTMLからarticle-body部分を抽出"""
    match = re.search(r'<article[^>]*class="article-body"[^>]*>(.*?)</article>', html, re.DOTALL)
    return match.group(1) if match else html


def extract_structure_fingerprint(body_html):
    """記事の構造をフィンガープリント化"""
    h2s = re.findall(r"<h2[^>]*>(.*?)</h2>", body_html, re.DOTALL)
    h2_texts = [strip_html(h).strip() for h in h2s]

    # 各h2セクションの要素構成
    sections = re.split(r"<h2[^>]*>", body_html)[1:]  # 最初のh2以降
    section_patterns = []
    for sec in sections:
        pattern = {
            "h3_count": len(re.findall(r"<h3", sec)),
            "has_point_box": "point-box" in sec,
            "has_caution_box": "caution-box" in sec,
            "has_stat": "stat-highlight" in sec,
            "has_checklist": "check-list" in sec,
            "has_blockquote": "<blockquote" in sec,
            "paragraph_count": len(re.findall(r"<p[^>]*>", sec)),
        }
        section_patterns.append(pattern)

    return {
        "h2_titles": h2_texts,
        "section_count": len(sections),
        "sections": section_patterns,
    }


def analyze_all_articles():
    """全公開記事を分析してスコアリング"""
    state = load_json(STATE_PATH)
    published = state.get("published", [])

    if not published:
        logger.info("公開記事なし")
        return []

    results = []
    for article in published:
        slug = article["slug"]
        article_path = COLUMN_DIR / slug / "index.html"

        if not article_path.exists():
            logger.warning(f"記事ファイルなし: {article_path}")
            continue

        html = article_path.read_text(encoding="utf-8")
        body = extract_article_body(html)
        check = check_article(body)
        structure = extract_structure_fingerprint(body)

        results.append({
            "slug": slug,
            "title": article.get("title", ""),
            "keyword": article.get("keyword", ""),
            "category": article.get("category_label", ""),
            "score": check["score"],
            "metrics": check["metrics"],
            "issues": check["issues"],
            "structure": structure,
        })

        logger.info(f"[{check['score']}点] {article.get('title', slug)}")

    return results


def extract_winning_patterns(results):
    """高スコア記事（80点以上）から勝ちパターンを抽出"""
    winners = [r for r in results if r["score"] >= 80]
    if not winners:
        return []

    patterns = []
    for w in winners:
        s = w["structure"]
        metrics = w["metrics"]

        pattern = (
            f"「{w['title'][:30]}...」(スコア{w['score']}点): "
            f"h2={s['section_count']}個, "
            f"point-box={metrics.get('point_box', 0)}, "
            f"stat={metrics.get('stat_highlight', 0)}, "
            f"数値データ={metrics.get('data_points', 0)}個, "
            f"文字数={metrics.get('char_count', 0)}"
        )
        patterns.append(pattern)

    return patterns


def extract_failure_patterns(results):
    """低スコア記事（70点未満）から避けるべきパターンを抽出"""
    failures = [r for r in results if r["score"] < 70]
    if not failures:
        return []

    patterns = []
    for f in failures:
        for issue in f["issues"]:
            if issue not in patterns:
                patterns.append(issue)

    return patterns


def update_learned_patterns(results):
    """分析結果をlearned_patterns.jsonに反映"""
    patterns = load_json(PATTERNS_PATH)

    winning = extract_winning_patterns(results)
    failing = extract_failure_patterns(results)

    if winning:
        patterns["top_performing_patterns"] = winning
        logger.info(f"勝ちパターン更新: {len(winning)}件")

    if failing:
        # 既存のavoided_patternsに追加（重複排除）
        existing = set(patterns.get("avoided_patterns", []))
        for f in failing:
            existing.add(f)
        patterns["avoided_patterns"] = list(existing)
        logger.info(f"回避パターン更新: {len(failing)}件追加")

    # 全記事の平均スコアを記録
    if results:
        avg_score = sum(r["score"] for r in results) / len(results)
        patterns["feedback_history"].append({
            "date": datetime.now(JST).strftime("%Y-%m-%d"),
            "article_count": len(results),
            "avg_score": round(avg_score, 1),
            "top_score": max(r["score"] for r in results),
            "low_score": min(r["score"] for r in results),
        })
        # 直近10回分のみ保持
        patterns["feedback_history"] = patterns["feedback_history"][-10:]
        logger.info(f"平均スコア: {avg_score:.1f}点 ({len(results)}記事)")

    patterns["last_updated"] = datetime.now(JST).isoformat()
    patterns["version"] = patterns.get("version", 0) + 1
    save_json(PATTERNS_PATH, patterns)
    logger.info("learned_patterns.json更新完了")


def main():
    logger.info("=" * 60)
    logger.info("記事学習分析 開始")
    logger.info("=" * 60)

    results = analyze_all_articles()
    if not results:
        logger.info("分析対象の記事がありません")
        return

    update_learned_patterns(results)

    logger.info("=" * 60)
    logger.info("学習分析完了")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
