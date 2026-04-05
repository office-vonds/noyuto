#!/usr/bin/env python3
"""毎朝cron実行用: Xフォロワー数・note会員数・月間収益を自動集計し、
NotionのKPIダッシュボードページに記録する。

cron設定例:
  0 8 * * * cd ~/noyuto && python3 kpi_dashboard.py

前提:
  - X_BEARER_TOKEN: X API v2 Bearer Token
  - NOTE_ACCESS_TOKEN: note API アクセストークン（未実装の場合は手動入力）
  - NOTION_API_KEY: Notion API キー（MCP経由の場合は不要）
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from notify import send_notify

BASE_DIR = Path(__file__).parent
KPI_LOG_DIR = BASE_DIR / "kpi_logs"

load_dotenv(BASE_DIR / ".env")

# Notion KPIダッシュボードページID
KPI_PAGE_ID = "339b652777f581ee8763fbf8dc4e53f4"


def fetch_x_followers():
    """X APIでフォロワー数を取得する"""
    bearer_token = os.getenv("X_BEARER_TOKEN")
    x_user_id = os.getenv("X_USER_ID")

    if not bearer_token or not x_user_id:
        print("[SKIP] X_BEARER_TOKEN または X_USER_ID が未設定")
        return None

    import requests

    url = f"https://api.twitter.com/2/users/{x_user_id}"
    params = {"user.fields": "public_metrics"}
    headers = {"Authorization": f"Bearer {bearer_token}"}

    try:
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        if resp.status_code != 200:
            print(f"[WARN] X API応答: {resp.status_code}")
            return None

        data = resp.json().get("data", {})
        metrics = data.get("public_metrics", {})
        return {
            "followers": metrics.get("followers_count", 0),
            "following": metrics.get("following_count", 0),
            "tweets": metrics.get("tweet_count", 0),
        }
    except Exception as e:
        print(f"[ERROR] X API: {e}")
        return None


def fetch_note_stats():
    """note APIで会員数・収益を取得する（手動フォールバック対応）"""
    note_token = os.getenv("NOTE_ACCESS_TOKEN")

    if not note_token:
        # note APIが未設定の場合、前回のログから読み込む
        prev = load_previous_kpi()
        if prev and "note" in prev:
            print("[INFO] note: 前回値を引き継ぎ（APIトークン未設定）")
            return prev["note"]
        print("[SKIP] NOTE_ACCESS_TOKEN が未設定")
        return None

    import requests

    try:
        headers = {"Authorization": f"Bearer {note_token}"}
        # note API v2 ダッシュボード（エンドポイントは要確認）
        resp = requests.get(
            "https://note.com/api/v2/creators/dashboard",
            headers=headers,
            timeout=10,
        )
        if resp.status_code != 200:
            print(f"[WARN] note API応答: {resp.status_code}")
            return None

        data = resp.json()
        return {
            "members": data.get("membership_count", 0),
            "monthly_revenue": data.get("monthly_revenue", 0),
        }
    except Exception as e:
        print(f"[ERROR] note API: {e}")
        return None


def load_previous_kpi():
    """前回のKPIログを読み込む"""
    if not KPI_LOG_DIR.exists():
        return None

    logs = sorted(KPI_LOG_DIR.glob("*.json"), reverse=True)
    if not logs:
        return None

    try:
        with open(logs[0], "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, ValueError):
        return None


def save_kpi_log(kpi_data):
    """KPIログを保存する"""
    KPI_LOG_DIR.mkdir(exist_ok=True)
    filename = datetime.now().strftime("%Y-%m-%d") + ".json"
    filepath = KPI_LOG_DIR / filename

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(kpi_data, f, ensure_ascii=False, indent=2)

    return filepath


def build_notion_content(kpi_data):
    """Notion KPIダッシュボード用のマークダウンを生成する"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    x = kpi_data.get("x", {})
    note = kpi_data.get("note", {})

    followers = x.get("followers", "-") if x else "-"
    members = note.get("members", "-") if note else "-"
    revenue = f"¥{note['monthly_revenue']:,}" if note and note.get("monthly_revenue") else "-"

    lines = [
        f"> 最終更新: {now}",
        "",
        "---",
        "",
        "## 現在値",
        "",
        f"| 指標 | 値 | 更新日 |",
        f"|---|---|---|",
        f"| Xフォロワー数 | {followers} | {now[:10]} |",
        f"| note会員数 | {members} | {now[:10]} |",
        f"| note月間収益 | {revenue} | {now[:10]} |",
        "",
        "---",
        "",
        "## 目標対比",
        "",
        "| 指標 | 現在 | 6ヶ月目標 | 1年目標 |",
        "|---|---|---|---|",
        f"| Xフォロワー | {followers} | 10,000 | 100,000 |",
        f"| note会員 | {members} | 100 | 1,000 |",
        f"| 月間収益 | {revenue} | ¥98,000 | ¥980,000 |",
        "",
        "---",
        "",
        "## 日次ログ",
        "",
    ]

    # 過去7日分のログを追記
    if KPI_LOG_DIR.exists():
        logs = sorted(KPI_LOG_DIR.glob("*.json"), reverse=True)[:7]
        if logs:
            lines.append("| 日付 | フォロワー | 会員数 | 月間収益 |")
            lines.append("|---|---|---|---|")
            for log_file in logs:
                try:
                    with open(log_file, "r", encoding="utf-8") as f:
                        log_data = json.load(f)
                    date = log_data.get("date", log_file.stem)
                    lx = log_data.get("x", {})
                    ln = log_data.get("note", {})
                    lf = lx.get("followers", "-") if lx else "-"
                    lm = ln.get("members", "-") if ln else "-"
                    lr = f"¥{ln['monthly_revenue']:,}" if ln and ln.get("monthly_revenue") else "-"
                    lines.append(f"| {date} | {lf} | {lm} | {lr} |")
                except (json.JSONDecodeError, ValueError):
                    continue
        else:
            lines.append("*データ蓄積中*")
    else:
        lines.append("*データ蓄積中*")

    return "\n".join(lines)


def build_report(kpi_data):
    """Gmail通知用レポートを生成する"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    x = kpi_data.get("x", {})
    note = kpi_data.get("note", {})

    lines = [
        f"noyuto KPI日次レポート（{now}）",
        "=" * 40,
        "",
        "【X】",
        f"  フォロワー: {x.get('followers', '-') if x else '-'}",
        f"  ツイート数: {x.get('tweets', '-') if x else '-'}",
        "",
        "【note】",
        f"  会員数: {note.get('members', '-') if note else '-'}",
        f"  月間収益: ¥{note['monthly_revenue']:,}" if note and note.get("monthly_revenue") else "  月間収益: -",
        "",
        "---",
        "kpi_dashboard.py / 自動レポート",
    ]
    return "\n".join(lines)


def main():
    print("KPIダッシュボード集計開始...")

    # データ取得
    x_data = fetch_x_followers()
    note_data = fetch_note_stats()

    kpi_data = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "timestamp": datetime.now().isoformat(),
        "x": x_data,
        "note": note_data,
    }

    # ログ保存
    log_path = save_kpi_log(kpi_data)
    print(f"KPIログ保存: {log_path}")

    # Notion用コンテンツ保存（MCP経由で更新される）
    content = build_notion_content(kpi_data)
    content_file = BASE_DIR / "kpi_dashboard_content.md"
    with open(content_file, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Notionコンテンツ保存: {content_file}")

    # Gmail通知
    report = build_report(kpi_data)
    subject = f"【noyuto KPI】{datetime.now().strftime('%m/%d')} 日次レポート"
    success = send_notify(subject, report)

    if success:
        print("KPIレポート配信完了")
    else:
        print(f"Gmail送信失敗。ログは {log_path} に保存済み")


if __name__ == "__main__":
    main()
