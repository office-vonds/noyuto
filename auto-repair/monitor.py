"""
改修依頼監視スクリプト
Notion DBから「ステータス = 新規」のレコードを取得し、対応中に更新して返す
"""

import os
import sys
import json
import logging
import requests
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# ログ設定
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)
logging.basicConfig(
    filename=str(LOG_DIR / "monitor.log"),
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# 環境変数
load_dotenv(Path(__file__).parent / ".env")
NOTION_API_KEY = os.getenv("NOTION_API_KEY", "")
NOTION_DB_ID = os.getenv("NOTION_DB_ID", "")
NOTION_API_URL = "https://api.notion.com/v1"
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
}


def fetch_new_requests():
    """ステータス=新規 のレコードを取得"""
    url = f"{NOTION_API_URL}/databases/{NOTION_DB_ID}/query"
    payload = {
        "filter": {
            "property": "ステータス",
            "select": {"equals": "新規"},
        },
        "sorts": [
            {"property": "依頼日時", "direction": "ascending"}
        ],
    }
    resp = requests.post(url, headers=NOTION_HEADERS, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json().get("results", [])


def update_status(page_id, status):
    """レコードのステータスを更新"""
    url = f"{NOTION_API_URL}/pages/{page_id}"
    payload = {
        "properties": {
            "ステータス": {"select": {"name": status}},
        }
    }
    resp = requests.patch(url, headers=NOTION_HEADERS, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()


def extract_request_data(page):
    """Notionレコードから依頼データを抽出"""
    props = page["properties"]

    def get_rich_text(prop_name):
        prop = props.get(prop_name, {})
        texts = prop.get("rich_text", [])
        return "".join(t.get("plain_text", "") for t in texts)

    def get_select(prop_name):
        prop = props.get(prop_name, {})
        sel = prop.get("select")
        return sel.get("name", "") if sel else ""

    def get_url(prop_name):
        prop = props.get(prop_name, {})
        return prop.get("url", "") or ""

    def get_email(prop_name):
        prop = props.get(prop_name, {})
        return prop.get("email", "") or ""

    return {
        "page_id": page["id"],
        "site_name": get_select("サイト名"),
        "request_content": get_rich_text("依頼内容"),
        "target_url": get_url("対象ページURL"),
        "priority": get_select("優先度"),
        "client_email": get_email("クライアントメール"),
    }


def run():
    """メイン処理: 新規依頼を検知して返す"""
    if not NOTION_API_KEY or not NOTION_DB_ID:
        logger.error("NOTION_API_KEY または NOTION_DB_ID が未設定")
        return []

    try:
        pages = fetch_new_requests()
    except requests.RequestException as e:
        logger.error(f"Notion API接続エラー: {e}")
        return []

    if not pages:
        logger.info("新規依頼なし")
        return []

    logger.info(f"新規依頼 {len(pages)} 件検出")
    requests_data = []

    for page in pages:
        try:
            data = extract_request_data(page)
            update_status(page["id"], "対応中")
            logger.info(f"対応開始: {data['site_name']} - {data['request_content'][:50]}")
            requests_data.append(data)
        except Exception as e:
            logger.error(f"レコード処理エラー (ID: {page['id']}): {e}")
            try:
                update_status(page["id"], "エラー")
            except Exception:
                pass

    return requests_data


if __name__ == "__main__":
    results = run()
    if results:
        print(json.dumps(results, ensure_ascii=False, indent=2))
