#!/usr/bin/env python3
"""
PayPay銀行CSVインポーター
使い方: python3 import_bank.py [CSVファイルパス]

PayPay銀行からダウンロードしたCSVを読み込み、
自動分類して finance/revenue_log.json と finance/expense_log.json に登録する。
"""

import csv
import json
import sys
from datetime import datetime
from pathlib import Path
from io import StringIO

BASE_DIR = Path(__file__).parent
FINANCE_DIR = BASE_DIR / "finance"
REVENUE_FILE = FINANCE_DIR / "revenue_log.json"
EXPENSE_FILE = FINANCE_DIR / "expense_log.json"
RULES_FILE = FINANCE_DIR / "classify_rules.json"

# デフォルトの分類ルール（摘要に含まれるキーワード → 事業 + カテゴリ）
DEFAULT_RULES = {
    "revenue_rules": [
        {"keyword": "GOOGLE", "business": "オフィスVONDS", "note": "Google広告関連"},
        {"keyword": "広告", "business": "オフィスVONDS", "note": "広告収入"},
        {"keyword": "RIWAY", "business": "RIWAY", "note": "RIWAY報酬"},
        {"keyword": "振込", "business": "未分類", "note": "振込入金"},
    ],
    "expense_rules": [
        {"keyword": "GOOGLE", "category": "広告費", "business": "オフィスVONDS"},
        {"keyword": "ADS", "category": "広告費", "business": "オフィスVONDS"},
        {"keyword": "GRAB.COM", "category": "交通費（海外）", "business": "RIWAY"},
        {"keyword": "GRAB", "category": "交通費（海外）", "business": "RIWAY"},
        {"keyword": "AIRASIA", "category": "航空券", "business": "RIWAY"},
        {"keyword": "OPENAI", "category": "ツール費用", "business": "共通"},
        {"keyword": "CHATGPT", "category": "ツール費用", "business": "共通"},
        {"keyword": "ヤマグチ", "category": "外注費", "business": "オフィスVONDS"},
        {"keyword": "ZOOM", "category": "ツール費用", "business": "共通"},
        {"keyword": "Next Aid", "category": "保険料", "business": "共通"},
        {"keyword": "ネクストエイド", "category": "保険料", "business": "共通"},
        {"keyword": "wpX", "category": "サーバー代", "business": "オフィスVONDS"},
        {"keyword": "オクトパス", "category": "光熱費", "business": "オフィスVONDS"},
        {"keyword": "トヨタファイナンス", "category": "車両ローン", "business": "オフィスVONDS"},
        {"keyword": "NOTTA", "category": "ツール費用", "business": "共通"},
        {"keyword": "E-net", "category": "現金引出", "business": "共通"},
        {"keyword": "X CORP", "category": "ツール費用", "business": "noyuto"},
        {"keyword": "PAID FEATURES", "category": "ツール費用", "business": "noyuto"},
        {"keyword": "エートラック", "category": "事業経費", "business": "A-TRUCK"},
        {"keyword": "A-TRUCK", "category": "事業経費", "business": "A-TRUCK"},
        {"keyword": "ラクラクフリーワイファイ", "category": "通信費", "business": "共通"},
        {"keyword": "ワイファイ", "category": "通信費", "business": "共通"},
        {"keyword": "AMAZON", "category": "消耗品", "business": "共通"},
        {"keyword": "アマゾン", "category": "消耗品", "business": "共通"},
        {"keyword": "ATM", "category": "現金引出", "business": "共通"},
        {"keyword": "セブン", "category": "現金引出", "business": "共通"},
        {"keyword": "ローソン", "category": "現金引出", "business": "共通"},
        {"keyword": "電気", "category": "光熱費", "business": "共通"},
        {"keyword": "ガス", "category": "光熱費", "business": "共通"},
        {"keyword": "水道", "category": "光熱費", "business": "共通"},
        {"keyword": "通信", "category": "通信費", "business": "共通"},
        {"keyword": "携帯", "category": "通信費", "business": "共通"},
        {"keyword": "ソフトバンク", "category": "通信費", "business": "共通"},
        {"keyword": "ドコモ", "category": "通信費", "business": "共通"},
        {"keyword": "サーバ", "category": "サーバー代", "business": "オフィスVONDS"},
        {"keyword": "ドメイン", "category": "サーバー代", "business": "オフィスVONDS"},
        {"keyword": "XSERVER", "category": "サーバー代", "business": "オフィスVONDS"},
        {"keyword": "SUBSCR", "category": "ツール費用", "business": "共通"},
        {"keyword": "デビット", "category": "カード決済", "business": "未分類"},
    ],
    "ignore_keywords": ["利息"],
}


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


def load_rules():
    if RULES_FILE.exists():
        return load_json(RULES_FILE, DEFAULT_RULES)
    # 初回実行時にルールファイルを生成
    save_json(RULES_FILE, DEFAULT_RULES)
    return DEFAULT_RULES


def normalize(text):
    """全角英数字・記号を半角に変換し、余分なスペースを除去"""
    result = []
    for ch in text:
        code = ord(ch)
        # 全角英数字（Ａ-Ｚ, ａ-ｚ, ０-９）→ 半角
        if 0xFF01 <= code <= 0xFF5E:
            result.append(chr(code - 0xFEE0))
        # 全角スペース → 半角スペース
        elif code == 0x3000:
            result.append(' ')
        else:
            result.append(ch)
    # 連続スペースを1つに
    return ' '.join(''.join(result).split())


def classify_transaction(description, amount_out, amount_in, rules):
    """取引を分類する"""
    desc_upper = normalize(description).upper()

    # 無視するキーワード
    for kw in rules.get("ignore_keywords", []):
        if kw.upper() in desc_upper:
            return None

    # 入金（売上）
    if amount_in and amount_in > 0:
        for rule in rules.get("revenue_rules", []):
            if rule["keyword"].upper() in desc_upper:
                return {
                    "type": "revenue",
                    "business": rule["business"],
                    "note": rule.get("note", description),
                }
        return {
            "type": "revenue",
            "business": "未分類",
            "note": description,
        }

    # 出金（経費）
    if amount_out and amount_out > 0:
        for rule in rules.get("expense_rules", []):
            if rule["keyword"].upper() in desc_upper:
                return {
                    "type": "expense",
                    "business": rule.get("business", "共通"),
                    "category": rule["category"],
                }
        return {
            "type": "expense",
            "business": "未分類",
            "category": "未分類",
        }

    return None


def parse_csv(filepath):
    """PayPay銀行CSVを読み込み"""
    # Shift-JISで読み込み
    with open(filepath, "r", encoding="shift_jis") as f:
        content = f.read()

    reader = csv.reader(StringIO(content))
    header = next(reader)  # ヘッダー行スキップ

    transactions = []
    for row in reader:
        if len(row) < 11:
            continue

        try:
            year = row[0].strip().strip('"')
            month = row[1].strip().strip('"').zfill(2)
            day = row[2].strip().strip('"').zfill(2)
            description = row[7].strip().strip('"')
            amount_out_str = row[8].strip().strip('"')
            amount_in_str = row[9].strip().strip('"')
            balance_str = row[10].strip().strip('"')

            amount_out = int(amount_out_str) if amount_out_str else 0
            amount_in = int(amount_in_str) if amount_in_str else 0
            balance = int(balance_str) if balance_str else 0

            date_str = f"{year}-{month}-{day}"
            month_str = f"{year}-{month}"

            transactions.append({
                "date": date_str,
                "month": month_str,
                "description": description,
                "amount_out": amount_out,
                "amount_in": amount_in,
                "balance": balance,
            })
        except (ValueError, IndexError):
            continue

    return transactions


def import_transactions(filepath):
    """CSVを読み込んで分類し、revenue/expenseに登録"""
    FINANCE_DIR.mkdir(exist_ok=True)

    transactions = parse_csv(filepath)
    rules = load_rules()

    revenue_data = load_json(REVENUE_FILE)
    expense_data = load_json(EXPENSE_FILE)

    # 既存データの重複チェック用
    existing_revenue = {
        (r.get("month", ""), r.get("amount", 0), r.get("note", ""))
        for r in revenue_data
    }
    existing_expense = {
        (e.get("month", ""), e.get("amount", 0), e.get("category", ""))
        for e in expense_data
    }

    added_revenue = 0
    added_expense = 0
    skipped = 0
    unclassified = []

    for tx in transactions:
        result = classify_transaction(
            tx["description"], tx["amount_out"], tx["amount_in"], rules
        )

        if result is None:
            skipped += 1
            continue

        if result["type"] == "revenue":
            key = (tx["month"], tx["amount_in"], tx["description"])
            if key not in existing_revenue:
                entry = {
                    "business": result["business"],
                    "month": tx["month"],
                    "amount": tx["amount_in"],
                    "note": tx["description"],
                    "date": tx["date"],
                    "recorded_at": datetime.now().isoformat(),
                    "source": "paypay_bank",
                }
                revenue_data.append(entry)
                existing_revenue.add(key)
                added_revenue += 1

                if result["business"] == "未分類":
                    unclassified.append(f"  [入金] {tx['date']} ¥{tx['amount_in']:,} {tx['description']}")

        elif result["type"] == "expense":
            key = (tx["month"], tx["amount_out"], tx["description"])
            if key not in existing_expense:
                entry = {
                    "business": result["business"],
                    "month": tx["month"],
                    "category": result["category"],
                    "amount": tx["amount_out"],
                    "note": tx["description"],
                    "date": tx["date"],
                    "recorded_at": datetime.now().isoformat(),
                    "source": "paypay_bank",
                }
                expense_data.append(entry)
                existing_expense.add(key)
                added_expense += 1

                if result["business"] == "未分類":
                    unclassified.append(f"  [出金] {tx['date']} ¥{tx['amount_out']:,} {tx['description']}")

    save_json(REVENUE_FILE, revenue_data)
    save_json(EXPENSE_FILE, expense_data)

    # サマリー出力
    print("=" * 50)
    print("PayPay銀行 CSV インポート完了")
    print("=" * 50)
    print(f"  読み込み件数: {len(transactions)}件")
    print(f"  売上（入金）追加: {added_revenue}件")
    print(f"  経費（出金）追加: {added_expense}件")
    print(f"  スキップ: {skipped}件")
    print()

    if unclassified:
        print("【未分類の取引】以下を確認してルールを追加してください:")
        print(f"  ルールファイル: {RULES_FILE}")
        print()
        for item in unclassified[:20]:
            print(item)
        if len(unclassified) > 20:
            print(f"  ...他 {len(unclassified) - 20}件")
    else:
        print("全取引の分類完了")

    # 月別サマリー
    monthly_in = {}
    monthly_out = {}
    for tx in transactions:
        m = tx["month"]
        monthly_in[m] = monthly_in.get(m, 0) + tx["amount_in"]
        monthly_out[m] = monthly_out.get(m, 0) + tx["amount_out"]

    print()
    print("【月別サマリー】")
    for m in sorted(set(list(monthly_in.keys()) + list(monthly_out.keys()))):
        inc = monthly_in.get(m, 0)
        out = monthly_out.get(m, 0)
        profit = inc - out
        mark = "" if profit >= 0 else " ※赤字"
        print(f"  {m}: 入金 ¥{inc:>10,} / 出金 ¥{out:>10,} / 差額 ¥{profit:>10,}{mark}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        # デフォルトパス
        default_csv = FINANCE_DIR / "paypay_bank.csv"
        if default_csv.exists():
            import_transactions(str(default_csv))
        else:
            print("使い方: python3 import_bank.py [CSVファイルパス]")
            print(f"  または {default_csv} にCSVを置いて引数なしで実行")
    else:
        csv_path = sys.argv[1]
        if not Path(csv_path).exists():
            print(f"ファイルが見つかりません: {csv_path}")
            sys.exit(1)
        import_transactions(csv_path)
