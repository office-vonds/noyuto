#!/usr/bin/env python3
"""
記事品質チェッカー
生成された記事をルールベース + AI評価で採点し、基準未達ならリジェクト→再生成を指示する
"""

import re
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

PATTERNS_PATH = Path(__file__).parent / "learned_patterns.json"

# 品質基準の閾値
MIN_CHAR_COUNT = 4500
MAX_CHAR_COUNT = 12000
MIN_H2_COUNT = 4
MAX_H2_COUNT = 8
MIN_H3_COUNT = 6
MIN_POINT_BOX = 2
MIN_STAT_HIGHLIGHT = 1
MIN_CHECK_LIST = 1
MIN_PARAGRAPH_COUNT = 15


def load_patterns():
    with open(PATTERNS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def strip_html(html):
    return re.sub(r"<[^>]+>", "", html)


def check_article(html_body: str) -> dict:
    """
    記事HTMLを検査し、スコアと問題点を返す
    Returns: {"score": 0-100, "passed": bool, "issues": [...], "metrics": {...}}
    """
    text = strip_html(html_body)
    issues = []
    metrics = {}

    # --- 文字数チェック ---
    char_count = len(text)
    metrics["char_count"] = char_count
    if char_count < MIN_CHAR_COUNT:
        issues.append(f"文字数不足: {char_count}文字（最低{MIN_CHAR_COUNT}文字）")
    elif char_count > MAX_CHAR_COUNT:
        issues.append(f"文字数超過: {char_count}文字（上限{MAX_CHAR_COUNT}文字）")

    # --- 見出し構造チェック ---
    h2_count = len(re.findall(r"<h2[^>]*>", html_body))
    h3_count = len(re.findall(r"<h3[^>]*>", html_body))
    metrics["h2_count"] = h2_count
    metrics["h3_count"] = h3_count
    if h2_count < MIN_H2_COUNT:
        issues.append(f"h2見出し不足: {h2_count}個（最低{MIN_H2_COUNT}個）")
    elif h2_count > MAX_H2_COUNT:
        issues.append(f"h2見出し過多: {h2_count}個（上限{MAX_H2_COUNT}個）")
    if h3_count < MIN_H3_COUNT:
        issues.append(f"h3見出し不足: {h3_count}個（最低{MIN_H3_COUNT}個）")

    # --- 装飾要素チェック ---
    point_box = len(re.findall(r'class="point-box"', html_body))
    caution_box = len(re.findall(r'class="caution-box"', html_body))
    stat_highlight = len(re.findall(r'class="stat-highlight"', html_body))
    check_list = len(re.findall(r'class="check-list"', html_body))
    blockquote = len(re.findall(r"<blockquote", html_body))
    metrics["point_box"] = point_box
    metrics["caution_box"] = caution_box
    metrics["stat_highlight"] = stat_highlight
    metrics["check_list"] = check_list
    metrics["blockquote"] = blockquote

    if point_box < MIN_POINT_BOX:
        issues.append(f"point-box不足: {point_box}個（最低{MIN_POINT_BOX}個）")
    if stat_highlight < MIN_STAT_HIGHLIGHT:
        issues.append(f"stat-highlight不足: {stat_highlight}個（最低{MIN_STAT_HIGHLIGHT}個）")
    if check_list < MIN_CHECK_LIST:
        issues.append(f"check-list不足: {check_list}個（最低{MIN_CHECK_LIST}個）")

    # --- 段落数チェック ---
    p_count = len(re.findall(r"<p[^>]*>", html_body))
    metrics["paragraph_count"] = p_count
    if p_count < MIN_PARAGRAPH_COUNT:
        issues.append(f"段落数不足: {p_count}個（最低{MIN_PARAGRAPH_COUNT}個）")

    # --- NGパターンチェック ---
    patterns = load_patterns()
    for avoided in patterns.get("avoided_patterns", []):
        # 「いかがでしたか」等のNG表現
        ng_phrases = ["いかがでしたか", "いかがでしょうか", "まとめると以下の通りです"]
        for phrase in ng_phrases:
            if phrase in text:
                issues.append(f"NG表現検出: 「{phrase}」")

    # --- 数値データの存在チェック ---
    numbers = re.findall(r"\d+[%％万億円件社人]", text)
    metrics["data_points"] = len(numbers)
    if len(numbers) < 3:
        issues.append(f"具体的数値データ不足: {len(numbers)}個（最低3個）")

    # --- strong強調の存在 ---
    strong_count = len(re.findall(r"<strong>", html_body))
    metrics["strong_count"] = strong_count
    if strong_count < 5:
        issues.append(f"強調(strong)不足: {strong_count}個（最低5個）")

    # --- スコア計算 ---
    total_checks = 12
    passed_checks = total_checks - len(issues)
    score = max(0, int((passed_checks / total_checks) * 100))
    metrics["score"] = score

    passed = score >= 70  # 70点以上で合格

    result = {
        "score": score,
        "passed": passed,
        "issues": issues,
        "metrics": metrics,
    }

    logger.info(f"品質チェック: {score}点 ({'合格' if passed else '不合格'}) issues={len(issues)}")
    if issues:
        for issue in issues:
            logger.info(f"  - {issue}")

    return result


def generate_improvement_prompt(check_result: dict) -> str:
    """品質チェック結果から改善指示プロンプトを生成"""
    if check_result["passed"]:
        return ""

    issues = check_result["issues"]
    prompt = "以下の品質基準を満たしていません。修正してください：\n\n"
    for issue in issues:
        prompt += f"- {issue}\n"

    prompt += "\n上記を改善した記事本文HTMLを再出力してください。"
    return prompt


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        html = Path(sys.argv[1]).read_text(encoding="utf-8")
        # article-body部分を抽出
        match = re.search(r'<article[^>]*class="article-body"[^>]*>(.*?)</article>', html, re.DOTALL)
        if match:
            body = match.group(1)
        else:
            body = html
        result = check_article(body)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print("使用法: python quality_checker.py <記事HTMLファイル>")
