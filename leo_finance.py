#!/usr/bin/env python3
"""
レオ 月次財務レポートエンジン
cron: 0 8 1 * *  cd ~/noyuto && python3 leo_finance.py

機能:
1. VONDS売上データの集計・トレンド分析
2. Notion KPIデータの達成率チェック
3. 事業別の財務サマリー生成
4. アラート（目標未達・異常値）
5. Gmailで月次レポート配信
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from notify import send_notify

BASE_DIR = Path(__file__).parent
FINANCE_DIR = BASE_DIR / "finance"
KPI_CACHE_FILE = FINANCE_DIR / "kpi_cache.json"
REVENUE_FILE = FINANCE_DIR / "revenue_log.json"
EXPENSE_FILE = FINANCE_DIR / "expense_log.json"
REPORT_DIR = FINANCE_DIR / "reports"


def ensure_dirs():
    FINANCE_DIR.mkdir(exist_ok=True)
    REPORT_DIR.mkdir(exist_ok=True)


def load_json(filepath, default=None):
    if default is None:
        default = []
    if filepath.exists():
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, ValueError):
            pass
    return default


def save_json(filepath, data):
    filepath.parent.mkdir(exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ============================================================
# 売上データ管理
# ============================================================
def add_revenue(business, month, amount, note=""):
    """売上データを追加（手動 or スクリプトから）"""
    data = load_json(REVENUE_FILE)
    entry = {
        "business": business,
        "month": month,
        "amount": amount,
        "note": note,
        "recorded_at": datetime.now().isoformat(),
    }
    data.append(entry)
    save_json(REVENUE_FILE, data)
    return entry


def add_expense(business, month, category, amount, note=""):
    """経費データを追加"""
    data = load_json(EXPENSE_FILE)
    entry = {
        "business": business,
        "month": month,
        "category": category,
        "amount": amount,
        "note": note,
        "recorded_at": datetime.now().isoformat(),
    }
    data.append(entry)
    save_json(EXPENSE_FILE, data)
    return entry


# ============================================================
# KPIキャッシュ（Notion MCPから同期）
# ============================================================
def update_kpi_cache(kpi_data):
    """NotionのKPIデータをローカルキャッシュに保存
    kpi_data: list of {事業, 指標名, 目標値, 現在値, 単位}
    """
    cache = {
        "updated_at": datetime.now().isoformat(),
        "kpis": kpi_data,
    }
    save_json(KPI_CACHE_FILE, cache)
    return cache


def load_kpi_cache():
    return load_json(KPI_CACHE_FILE, default={})


# ============================================================
# 分析
# ============================================================
def analyze_revenue(target_month=None):
    """売上データを事業別に集計"""
    if target_month is None:
        now = datetime.now()
        target_month = now.strftime("%Y-%m")

    data = load_json(REVENUE_FILE)
    by_business = {}

    for entry in data:
        if entry.get("month", "").startswith(target_month[:7]):
            biz = entry["business"]
            if biz not in by_business:
                by_business[biz] = {"total": 0, "entries": []}
            by_business[biz]["total"] += entry["amount"]
            by_business[biz]["entries"].append(entry)

    return by_business


def analyze_expenses(target_month=None):
    """経費データを事業別・カテゴリ別に集計"""
    if target_month is None:
        now = datetime.now()
        target_month = now.strftime("%Y-%m")

    data = load_json(EXPENSE_FILE)
    by_business = {}

    for entry in data:
        if entry.get("month", "").startswith(target_month[:7]):
            biz = entry["business"]
            cat = entry.get("category", "その他")
            if biz not in by_business:
                by_business[biz] = {"total": 0, "categories": {}}
            by_business[biz]["total"] += entry["amount"]
            by_business[biz]["categories"][cat] = (
                by_business[biz]["categories"].get(cat, 0) + entry["amount"]
            )

    return by_business


def check_kpi_alerts(kpi_cache):
    """KPI目標未達アラートを生成"""
    alerts = []
    kpis = kpi_cache.get("kpis", [])

    for kpi in kpis:
        target = kpi.get("目標値")
        current = kpi.get("現在値")
        name = kpi.get("指標名", "不明")
        business = kpi.get("事業", "不明")

        if target and current is not None and target > 0:
            rate = current / target * 100
            if rate < 50:
                alerts.append({
                    "level": "危険",
                    "business": business,
                    "kpi": name,
                    "target": target,
                    "current": current,
                    "rate": round(rate, 1),
                })
            elif rate < 80:
                alerts.append({
                    "level": "注意",
                    "business": business,
                    "kpi": name,
                    "target": target,
                    "current": current,
                    "rate": round(rate, 1),
                })

    return alerts


def get_revenue_trend():
    """直近6ヶ月の売上トレンドを生成"""
    data = load_json(REVENUE_FILE)
    monthly = {}

    for entry in data:
        month = entry.get("month", "")[:7]
        if month:
            monthly[month] = monthly.get(month, 0) + entry["amount"]

    sorted_months = sorted(monthly.items())[-6:]
    return sorted_months


# ============================================================
# レポート生成
# ============================================================
def build_monthly_report():
    """月次財務レポートを組み立て"""
    now = datetime.now()
    target_month = now.strftime("%Y-%m")
    prev_month = (now.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")

    lines = []
    lines.append(f"レオ 月次財務レポート（{target_month}）")
    lines.append("=" * 45)
    lines.append("")

    # 売上サマリー
    revenue = analyze_revenue(target_month)
    prev_revenue = analyze_revenue(prev_month)

    lines.append("[ 売上サマリー ]")
    total_revenue = 0
    if revenue:
        for biz, data in sorted(revenue.items()):
            total_revenue += data["total"]
            prev_total = prev_revenue.get(biz, {}).get("total", 0)
            diff = data["total"] - prev_total
            diff_str = f"（前月比 +{diff:,.0f}）" if diff > 0 else f"（前月比 {diff:,.0f}）" if diff < 0 else ""
            lines.append(f"  {biz}: ¥{data['total']:,.0f} {diff_str}")
        lines.append(f"  合計: ¥{total_revenue:,.0f}")
    else:
        lines.append("  ※ 売上データ未登録")
        lines.append("  → finance/revenue_log.json にデータを追加するか")
        lines.append("    Claude Codeで「VONDS 3月売上 95万」と入力")
    lines.append("")

    # 経費サマリー
    expenses = analyze_expenses(target_month)
    lines.append("[ 経費サマリー ]")
    total_expense = 0
    if expenses:
        for biz, data in sorted(expenses.items()):
            total_expense += data["total"]
            lines.append(f"  {biz}: ¥{data['total']:,.0f}")
            for cat, amt in sorted(data["categories"].items()):
                lines.append(f"    - {cat}: ¥{amt:,.0f}")
        lines.append(f"  合計: ¥{total_expense:,.0f}")
    else:
        lines.append("  ※ 経費データ未登録")
    lines.append("")

    # 損益
    if revenue or expenses:
        profit = total_revenue - total_expense
        lines.append("[ 損益 ]")
        lines.append(f"  売上: ¥{total_revenue:,.0f}")
        lines.append(f"  経費: ¥{total_expense:,.0f}")
        lines.append(f"  利益: ¥{profit:,.0f} {'🔴' if profit < 0 else ''}")
        lines.append("")

    # 売上トレンド
    trend = get_revenue_trend()
    if trend:
        lines.append("[ 売上トレンド（直近6ヶ月）]")
        max_val = max(v for _, v in trend) if trend else 1
        for month, val in trend:
            bar_len = int(val / max_val * 20) if max_val > 0 else 0
            bar = "█" * bar_len
            lines.append(f"  {month} ¥{val:>10,.0f} {bar}")
        lines.append("")

    # KPIアラート
    kpi_cache = load_kpi_cache()
    alerts = check_kpi_alerts(kpi_cache)
    lines.append("[ KPIアラート ]")
    if alerts:
        for alert in sorted(alerts, key=lambda x: x["rate"]):
            icon = "!!" if alert["level"] == "危険" else "!"
            lines.append(
                f"  {icon} [{alert['level']}] {alert['business']} / {alert['kpi']}"
            )
            lines.append(
                f"     目標:{alert['target']} → 現在:{alert['current']}（達成率:{alert['rate']}%）"
            )
    else:
        if kpi_cache.get("kpis"):
            lines.append("  全KPI正常範囲内")
        else:
            lines.append("  ※ KPIキャッシュなし")
            lines.append("  → Claude Codeで /leo を実行してNotionから同期")
    lines.append("")

    lines.append("---")
    lines.append("レオ（財務部長） / 月次自動レポート")

    return "\n".join(lines)


def save_report(report):
    """レポートをファイルに保存"""
    REPORT_DIR.mkdir(exist_ok=True)
    filename = datetime.now().strftime("%Y-%m") + "_monthly.md"
    filepath = REPORT_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(report)
    return filepath


def main():
    ensure_dirs()
    print("レオ 月次財務レポート生成中...")

    report = build_monthly_report()
    filepath = save_report(report)
    print(f"  レポート保存: {filepath}")

    # Gmail配信
    month = datetime.now().strftime("%Y年%m月")
    subject = f"【レオ】{month} 月次財務レポート"
    success = send_notify(subject, report)

    if success:
        print("月次レポート配信完了")
    else:
        print(f"Gmail送信失敗。レポートは {filepath} に保存済み")


if __name__ == "__main__":
    import sys

    # コマンドラインから売上・経費を追加可能
    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == "--add-revenue" and len(sys.argv) >= 5:
            # python3 leo_finance.py --add-revenue VONDS 2026-03 950000
            biz = sys.argv[2]
            month = sys.argv[3]
            amount = float(sys.argv[4])
            note = sys.argv[5] if len(sys.argv) > 5 else ""
            ensure_dirs()
            entry = add_revenue(biz, month, amount, note)
            print(f"売上追加: {biz} {month} ¥{amount:,.0f}")

        elif cmd == "--add-expense" and len(sys.argv) >= 6:
            # python3 leo_finance.py --add-expense VONDS 2026-03 サーバー代 5000
            biz = sys.argv[2]
            month = sys.argv[3]
            cat = sys.argv[4]
            amount = float(sys.argv[5])
            note = sys.argv[6] if len(sys.argv) > 6 else ""
            ensure_dirs()
            entry = add_expense(biz, month, cat, amount, note)
            print(f"経費追加: {biz} {month} {cat} ¥{amount:,.0f}")

        elif cmd == "--report":
            main()
        else:
            print("使い方:")
            print("  python3 leo_finance.py --report")
            print("  python3 leo_finance.py --add-revenue VONDS 2026-03 950000")
            print("  python3 leo_finance.py --add-expense VONDS 2026-03 サーバー代 5000")
    else:
        main()
