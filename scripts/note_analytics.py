#!/usr/bin/env python3
"""
NOYUTO Note Analytics
note.com/noyuto_0902 のダッシュボードからPV・スキ数を自動収集する。
Playwright + Chrome (Pre-saved session) 使用。

必要な設定:
  note_session.json - Playwright Chrome セッション（Google OAuth回避済み）

使い方:
  python note_analytics.py                # 全記事のメトリクス取得
  python note_analytics.py --headless     # ヘッドレスモード
"""

import argparse
import csv
import json
import os
import sys
from datetime import datetime, timedelta, timezone

JST = timezone(timedelta(hours=9))

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data", "analytics")
NOTE_CSV = os.path.join(DATA_DIR, "daily_note_metrics.csv")
SESSION_PATH = os.path.join(SCRIPT_DIR, "note_session.json")

NOTE_DASHBOARD_URL = "https://note.com/noyuto_0902/dashboard"
NOTE_STATS_URL = "https://note.com/noyuto_0902/dashboard/stats"

CSV_HEADERS = [
    "date",
    "article_title",
    "article_url",
    "pv",
    "likes",
    "comments",
]


def check_dependencies():
    """Playwright がインストールされているか確認する。"""
    try:
        from playwright.sync_api import sync_playwright
        return True
    except ImportError:
        print("ERROR: playwright がインストールされていません")
        print("  pip install playwright")
        print("  playwright install chromium")
        sys.exit(1)


def load_session():
    """Playwright セッション情報を読み込む。"""
    if not os.path.exists(SESSION_PATH):
        print(f"WARNING: {SESSION_PATH} が見つかりません")
        print("  note.com にログイン済みの Chrome セッションを保存してください")
        print("  手順: playwright codegen --save-storage=note_session.json note.com")
        return None
    return SESSION_PATH


def scrape_note_stats(headless=True):
    """note ダッシュボードから記事別メトリクスをスクレイピングする。"""
    from playwright.sync_api import sync_playwright

    session_path = load_session()
    articles = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="chrome",
            headless=headless,
        )

        context_opts = {}
        if session_path:
            context_opts["storage_state"] = session_path

        context = browser.new_context(**context_opts)
        page = context.new_page()

        try:
            # ダッシュボード統計ページへ
            page.goto(NOTE_STATS_URL, wait_until="networkidle", timeout=30000)

            # ログイン確認
            if "login" in page.url:
                print("ERROR: noteにログインできませんでした。セッションを更新してください")
                print(f"  現在URL: {page.url}")
                browser.close()
                return []

            # 統計テーブルの読み込み待ち
            page.wait_for_selector("[class*='stats'], [class*='dashboard'], table", timeout=15000)

            # note のダッシュボード構造に基づいてメトリクスを取得
            # note のUI構造は変更される可能性があるため、複数のセレクタを試行
            article_elements = page.query_selector_all(
                "[class*='ArticleStats'], [class*='article-stats'], "
                "tr[class*='article'], [data-testid*='article']"
            )

            if not article_elements:
                # フォールバック: テーブル行から取得
                article_elements = page.query_selector_all("table tbody tr")

            for elem in article_elements:
                try:
                    # タイトル取得
                    title_el = elem.query_selector("a, [class*='title']")
                    title = title_el.inner_text().strip() if title_el else ""
                    url = title_el.get_attribute("href") if title_el else ""

                    if url and not url.startswith("http"):
                        url = f"https://note.com{url}"

                    # 数値取得（PV, スキ, コメント）
                    cells = elem.query_selector_all("td, [class*='count'], [class*='number']")
                    numbers = []
                    for cell in cells:
                        text = cell.inner_text().strip().replace(",", "")
                        if text.isdigit():
                            numbers.append(int(text))

                    if title and len(numbers) >= 2:
                        articles.append({
                            "article_title": title[:100],
                            "article_url": url,
                            "pv": numbers[0] if len(numbers) > 0 else 0,
                            "likes": numbers[1] if len(numbers) > 1 else 0,
                            "comments": numbers[2] if len(numbers) > 2 else 0,
                        })
                except Exception as e:
                    print(f"  記事要素パースエラー: {e}")
                    continue

            # JavaScript API からの取得を試行（UIスクレイピングが不十分な場合）
            if not articles:
                print("  UIスクレイピングでデータ取得できず。API経由を試行...")
                api_data = page.evaluate("""
                    async () => {
                        try {
                            const resp = await fetch('/api/v2/creators/stats/articles', {
                                credentials: 'include'
                            });
                            if (resp.ok) return await resp.json();
                            return null;
                        } catch(e) { return null; }
                    }
                """)

                if api_data and isinstance(api_data, dict):
                    for item in api_data.get("data", api_data.get("articles", [])):
                        articles.append({
                            "article_title": item.get("name", item.get("title", ""))[:100],
                            "article_url": item.get("note_url", item.get("url", "")),
                            "pv": item.get("read_count", item.get("pv", 0)),
                            "likes": item.get("like_count", item.get("likes", 0)),
                            "comments": item.get("comment_count", item.get("comments", 0)),
                        })

        except Exception as e:
            print(f"ERROR: スクレイピング失敗: {e}")
        finally:
            browser.close()

    print(f"  取得記事数: {len(articles)}")
    return articles


# ── CSV蓄積 ───────────────────────────────────────────
def save_to_csv(articles):
    """日次メトリクスをCSVに追記する。"""
    os.makedirs(DATA_DIR, exist_ok=True)
    today = datetime.now(JST).strftime("%Y-%m-%d")

    # 既存エントリ確認（同日重複防止）
    existing = set()
    if os.path.exists(NOTE_CSV):
        with open(NOTE_CSV, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["date"] == today:
                    existing.add(row.get("article_title", ""))

    file_exists = os.path.exists(NOTE_CSV)
    new_count = 0

    with open(NOTE_CSV, "a", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        if not file_exists:
            writer.writeheader()

        for article in articles:
            if article["article_title"] in existing:
                continue
            row = {"date": today}
            row.update(article)
            writer.writerow(row)
            new_count += 1

    print(f"  CSV追記: {new_count}行 ({NOTE_CSV})")
    return new_count


# ── X投稿との相関分析 ──────────────────────────────────
def analyze_x_note_correlation():
    """X投稿日とnote PVの相関を分析する。"""
    x_csv = os.path.join(DATA_DIR, "daily_metrics.csv")
    if not os.path.exists(x_csv) or not os.path.exists(NOTE_CSV):
        return None

    # X投稿日を取得
    x_dates = set()
    with open(x_csv, "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            x_dates.add(row["date"])

    # note PV を日別集計
    note_by_date = {}
    with open(NOTE_CSV, "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            d = row["date"]
            if d not in note_by_date:
                note_by_date[d] = {"total_pv": 0, "total_likes": 0}
            note_by_date[d]["total_pv"] += int(row.get("pv", 0) or 0)
            note_by_date[d]["total_likes"] += int(row.get("likes", 0) or 0)

    # X投稿日 vs 非投稿日のnote PV比較
    pv_on_x_day = []
    pv_off_x_day = []

    for d, vals in note_by_date.items():
        if d in x_dates:
            pv_on_x_day.append(vals["total_pv"])
        else:
            pv_off_x_day.append(vals["total_pv"])

    if pv_on_x_day and pv_off_x_day:
        avg_on = round(sum(pv_on_x_day) / len(pv_on_x_day))
        avg_off = round(sum(pv_off_x_day) / len(pv_off_x_day))
        lift = round((avg_on - avg_off) / avg_off * 100, 1) if avg_off > 0 else 0

        return {
            "avg_pv_on_x_day": avg_on,
            "avg_pv_off_x_day": avg_off,
            "pv_lift_percent": lift,
            "x_post_days": len(pv_on_x_day),
            "non_post_days": len(pv_off_x_day),
        }

    return None


# ── サマリー生成 ───────────────────────────────────────
def generate_summary(articles, correlation):
    """Gmail通知用のnoteサマリーを生成する。"""
    lines = []
    lines.append("=== note アクセス解析サマリー ===\n")

    if not articles:
        lines.append("データ取得できず\n")
        return "\n".join(lines)

    total_pv = sum(a["pv"] for a in articles)
    total_likes = sum(a["likes"] for a in articles)
    lines.append(f"記事数: {len(articles)}")
    lines.append(f"合計PV: {total_pv:,}")
    lines.append(f"合計スキ: {total_likes}")

    # トップ記事
    top = sorted(articles, key=lambda x: x["pv"], reverse=True)[:3]
    lines.append("\n--- PVトップ3 ---")
    for i, a in enumerate(top, 1):
        lines.append(f"  {i}. PV:{a['pv']:,} スキ:{a['likes']} | {a['article_title'][:50]}")

    if correlation:
        lines.append(f"\n--- X投稿→note遷移の間接効果 ---")
        lines.append(f"  X投稿日の平均note PV: {correlation['avg_pv_on_x_day']:,}")
        lines.append(f"  非投稿日の平均note PV: {correlation['avg_pv_off_x_day']:,}")
        lines.append(f"  PVリフト: +{correlation['pv_lift_percent']}%")

    return "\n".join(lines)


# ── メイン ─────────────────────────────────────────────
def collect_note_analytics(headless=True):
    """noteメトリクス収集のメインエントリーポイント。サマリーテキストを返す。"""
    check_dependencies()

    print("[note_analytics] noteアクセス解析収集開始")

    articles = scrape_note_stats(headless=headless)

    if articles:
        save_to_csv(articles)

    correlation = analyze_x_note_correlation()
    summary = generate_summary(articles, correlation)

    print("\n" + summary)
    return summary


def main():
    parser = argparse.ArgumentParser(description="NOYUTO note アクセス解析収集")
    parser.add_argument("--headless", action="store_true", default=True,
                        help="ヘッドレスモード（デフォルト: True）")
    parser.add_argument("--no-headless", action="store_true",
                        help="ブラウザ表示モード")
    args = parser.parse_args()

    headless = not args.no_headless
    collect_note_analytics(headless=headless)


if __name__ == "__main__":
    main()
