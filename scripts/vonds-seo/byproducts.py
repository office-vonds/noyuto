#!/usr/bin/env python3
"""
記事副産物 自動生成システム
記事投稿のたびに以下を自動生成・実行する:
1. sitemap.xml 更新（SEOインデックス促進）
2. X投稿素材生成（SNS拡散用）
3. 内部リンク自動挿入（記事間SEO強化）
4. GBP投稿テキスト生成（ローカルSEO）
5. 週次ダイジェストメール（顧客接点維持）
"""

import json
import re
import os
import sys
import logging
import smtplib
import subprocess
from datetime import datetime, timezone, timedelta
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

BASE_DIR = Path(__file__).parent
PROJECT_DIR = BASE_DIR.parent.parent
COLUMN_DIR = PROJECT_DIR / "column"
STATE_PATH = BASE_DIR / "state.json"
BYPRODUCTS_DIR = BASE_DIR / "byproducts"
LOG_DIR = BASE_DIR / "logs"

SITE_URL = "https://vonds.co.jp"
JST = timezone(timedelta(hours=9))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "byproducts.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def strip_html(html):
    return re.sub(r"<[^>]+>", "", html)


# ==============================================================================
# 1. sitemap.xml 自動生成
# ==============================================================================
def generate_sitemap():
    """公開済み全記事 + 固定ページからsitemap.xmlを生成（サービスページ保持）"""
    state = load_json(STATE_PATH)
    published = state.get("published", [])
    now = datetime.now(JST).strftime("%Y-%m-%d")

    # サービスページ（固定・削除禁止）
    urls = [
        {"loc": f"{SITE_URL}/", "priority": "1.0", "changefreq": "weekly", "lastmod": now},
        {"loc": f"{SITE_URL}/works/", "priority": "0.9", "changefreq": "monthly", "lastmod": "2026-04-11"},
        {"loc": f"{SITE_URL}/works/seo/", "priority": "0.9", "changefreq": "weekly", "lastmod": now},
        {"loc": f"{SITE_URL}/works/web/", "priority": "0.8", "changefreq": "monthly", "lastmod": "2026-04-11"},
        {"loc": f"{SITE_URL}/works/ads/", "priority": "0.8", "changefreq": "monthly", "lastmod": "2026-04-11"},
        {"loc": f"{SITE_URL}/works/ai/", "priority": "0.8", "changefreq": "monthly", "lastmod": "2026-04-11"},
        {"loc": f"{SITE_URL}/works/seo/auto-plan/", "priority": "0.7", "changefreq": "monthly", "lastmod": "2026-04-11"},
        {"loc": f"{SITE_URL}/company/", "priority": "0.7", "changefreq": "monthly", "lastmod": "2026-04-11"},
        {"loc": f"{SITE_URL}/column/", "priority": "0.8", "changefreq": "daily", "lastmod": now},
    ]

    # コラム記事（動的追加）
    for article in published:
        urls.append({
            "loc": f"{SITE_URL}/column/{article['slug']}/",
            "priority": "0.7",
            "changefreq": "monthly",
            "lastmod": article.get("date", now),
        })

    xml_entries = []
    for u in urls:
        xml_entries.append(f"""  <url>
    <loc>{u['loc']}</loc>
    <lastmod>{u['lastmod']}</lastmod>
    <changefreq>{u['changefreq']}</changefreq>
    <priority>{u['priority']}</priority>
  </url>""")

    sitemap = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(xml_entries)}
</urlset>"""

    sitemap_path = PROJECT_DIR / "sitemap.xml"
    sitemap_path.write_text(sitemap, encoding="utf-8")
    logger.info(f"sitemap.xml更新: {len(urls)}URL")

    # robots.txt も生成
    robots = f"""User-agent: *
Allow: /

Sitemap: {SITE_URL}/sitemap.xml"""
    (PROJECT_DIR / "robots.txt").write_text(robots, encoding="utf-8")
    logger.info("robots.txt更新")


# ==============================================================================
# 2. X(Twitter)投稿素材 自動生成
# ==============================================================================
def generate_sns_posts(article_data: dict, article_body: str):
    """記事からX投稿用の素材を3パターン生成"""
    title = article_data["title"]
    slug = article_data["slug"]
    url = f"{SITE_URL}/column/{slug}/"
    keyword = article_data.get("keyword", "")
    category = article_data.get("category_label", "")
    text = strip_html(article_body)

    # 記事から数字データを抽出
    stats = re.findall(r"[\d,]+[%％万億円件社人]", text)
    stats_text = "、".join(stats[:3]) if stats else ""

    # 3パターン生成
    posts = []

    # パターン1: フック型（数字で引きつける）
    posts.append({
        "type": "数字フック",
        "text": f"知ってましたか？{stats_text if stats_text else keyword + 'の最新データ'}。\n\n{title[:40]}...\n\n詳しくはこちら👇\n{url}\n\n#{category.replace('・', ' #')} #VONDS",
    })

    # パターン2: 課題提示型
    posts.append({
        "type": "課題提示",
        "text": f"「{keyword}」で悩んでいませんか？\n\n{text[100:200].strip()}...\n\n全文はこちら👇\n{url}\n\n#{category.replace('・', ' #')} #WEBマーケティング",
    })

    # パターン3: 結論先出し型
    summary = text[-300:-100].strip() if len(text) > 400 else text[:200].strip()
    posts.append({
        "type": "結論先出し",
        "text": f"【{category}】{title[:30]}...\n\n結論から言うと→\n{summary[:100]}...\n\n続きはこちら👇\n{url}",
    })

    BYPRODUCTS_DIR.mkdir(parents=True, exist_ok=True)
    sns_path = BYPRODUCTS_DIR / f"sns_{slug}.json"
    save_json(sns_path, {"article": title, "url": url, "posts": posts, "generated_at": datetime.now(JST).isoformat()})
    logger.info(f"X投稿素材生成: {len(posts)}パターン → {sns_path.name}")
    return posts


# ==============================================================================
# 3. 内部リンク自動挿入
# ==============================================================================
def optimize_internal_links():
    """公開済み記事間の内部リンクを自動最適化"""
    state = load_json(STATE_PATH)
    published = state.get("published", [])

    if len(published) < 2:
        logger.info("記事が2本未満のため内部リンク最適化スキップ")
        return

    # 各記事のキーワードマップ作成
    keyword_map = {}
    for article in published:
        keyword_map[article["slug"]] = {
            "title": article["title"],
            "keyword": article.get("keyword", ""),
            "category_id": article.get("category_id", ""),
            "url": f"/column/{article['slug']}/",
        }

    updated_count = 0
    for article in published:
        slug = article["slug"]
        article_path = COLUMN_DIR / slug / "index.html"
        if not article_path.exists():
            continue

        html = article_path.read_text(encoding="utf-8")
        modified = False

        # 他の記事のキーワードが本文中に出現したらリンク化
        for other_slug, other_info in keyword_map.items():
            if other_slug == slug:
                continue

            kw = other_info["keyword"]
            if not kw or len(kw) < 3:
                continue

            # 既にリンクされていないか確認
            link_url = other_info["url"]
            if link_url in html:
                continue

            # 本文中（article-body内）でキーワードを1箇所だけリンク化
            pattern = re.compile(
                r'(<article[^>]*class="article-body"[^>]*>)(.*?)(</article>)',
                re.DOTALL
            )
            match = pattern.search(html)
            if not match:
                continue

            body = match.group(2)
            # リンクタグの外にあるキーワードのみ対象（最初の1箇所）
            # <a>タグ内やタグ属性内は除外
            escaped_kw = re.escape(kw)
            link_pattern = re.compile(
                rf'(?<!<a[^>]*>)(?<!["\'/])({escaped_kw})(?!["\'/])(?!</a>)',
            )
            link_match = link_pattern.search(body)
            if link_match:
                new_body = body[:link_match.start()] + \
                    f'<a href="{link_url}" class="internal-link">{kw}</a>' + \
                    body[link_match.end():]
                new_html = html[:match.start(2)] + new_body + html[match.end(2):]
                html = new_html
                modified = True

        if modified:
            article_path.write_text(html, encoding="utf-8")
            updated_count += 1

    logger.info(f"内部リンク最適化: {updated_count}記事を更新")


# ==============================================================================
# 4. GBP投稿テキスト生成
# ==============================================================================
def generate_gbp_post(article_data: dict, article_body: str):
    """Googleビジネスプロフィール投稿用テキスト生成（1500文字以内）"""
    title = article_data["title"]
    slug = article_data["slug"]
    url = f"{SITE_URL}/column/{slug}/"
    text = strip_html(article_body)

    # リード文（最初の200文字）を抽出
    lead = text[:200].strip()

    gbp_text = f"""📝 新着コラム公開

{title}

{lead}...

▶ 続きを読む: {url}

山梨県のSEO対策・WEBマーケティングなら
株式会社オフィスVONDS
📞 055-269-7220"""

    BYPRODUCTS_DIR.mkdir(parents=True, exist_ok=True)
    gbp_path = BYPRODUCTS_DIR / f"gbp_{slug}.txt"
    gbp_path.write_text(gbp_text, encoding="utf-8")
    logger.info(f"GBP投稿テキスト生成: {gbp_path.name}")
    return gbp_text


# ==============================================================================
# 5. 週次ダイジェストメール
# ==============================================================================
def send_weekly_digest():
    """今週公開された記事のダイジェストメールを送信（日曜実行想定）"""
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR.parent.parent / "auto-repair" / ".env")

    gmail_address = os.getenv("GMAIL_ADDRESS", "")
    gmail_password = os.getenv("GMAIL_APP_PASSWORD", "")
    if not gmail_address or not gmail_password:
        logger.warning("Gmail認証情報未設定。ダイジェスト送信スキップ")
        return

    state = load_json(STATE_PATH)
    published = state.get("published", [])

    # 過去7日間の記事を抽出
    now = datetime.now(JST)
    week_ago = (now - timedelta(days=7)).strftime("%Y-%m-%d")
    recent = [p for p in published if p.get("date", "") >= week_ago]

    if not recent:
        logger.info("今週の新着記事なし。ダイジェスト送信スキップ")
        return

    # メール本文HTML
    articles_html = ""
    for a in recent:
        articles_html += f"""
        <div style="margin-bottom:24px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;">
          <div style="font-size:0.75rem;color:#1a56db;font-weight:700;margin-bottom:4px;">{a.get('category_label','')}</div>
          <h3 style="margin:0 0 8px;font-size:1rem;"><a href="{SITE_URL}/column/{a['slug']}/" style="color:#111827;text-decoration:none;">{a['title']}</a></h3>
          <div style="font-size:0.8rem;color:#9ca3af;">{a.get('date_jp', '')}</div>
        </div>"""

    html_body = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:'Noto Sans JP',sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px;">
<div style="background:#1a56db;color:#fff;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
  <h1 style="margin:0;font-size:1.3rem;">VONDS 週刊コラムダイジェスト</h1>
  <p style="margin:8px 0 0;opacity:0.8;font-size:0.9rem;">{week_ago} 〜 {now.strftime('%Y-%m-%d')}</p>
</div>
<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
  <p>今週公開した{len(recent)}本のコラム記事をお届けします。</p>
  {articles_html}
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="text-align:center;"><a href="{SITE_URL}/column/" style="color:#1a56db;font-weight:700;">コラム一覧を見る →</a></p>
  <p style="color:#9ca3af;font-size:0.8rem;text-align:center;margin-top:24px;">株式会社オフィスVONDS | 055-269-7220</p>
</div>
</body></html>"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"【VONDS】今週のコラム {len(recent)}本公開しました"
    msg["From"] = f"オフィスVONDS <{gmail_address}>"
    msg["To"] = gmail_address
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as server:
            server.starttls()
            server.login(gmail_address, gmail_password)
            server.send_message(msg)
        logger.info(f"週次ダイジェスト送信完了: {len(recent)}記事")
    except Exception as e:
        logger.error(f"ダイジェスト送信失敗: {e}")


# ==============================================================================
# 6. インデックス促進（GSC sitemap再送信 + IndexNow + URL検査）
# ==============================================================================
INDEXNOW_KEY = "vonds2026seo"
GSC_SITE = "https://vonds.co.jp/"
GSC_SITEMAP = "https://vonds.co.jp/sitemap.xml"
GSC_CRED_PATH = Path.home() / "credentials" / "ga4-mcp.json"


def _get_gsc_service(scope: str):
    """GSC API サービスを取得"""
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        creds = service_account.Credentials.from_service_account_file(
            str(GSC_CRED_PATH), scopes=[scope]
        )
        return build("searchconsole", "v1", credentials=creds, cache_discovery=False)
    except Exception as e:
        logger.warning(f"GSC認証失敗: {e}")
        return None


def resubmit_sitemap():
    """GSC API でsitemap.xmlを再送信"""
    svc = _get_gsc_service("https://www.googleapis.com/auth/webmasters")
    if not svc:
        return
    try:
        svc.sitemaps().submit(siteUrl=GSC_SITE, feedpath=GSC_SITEMAP).execute()
        logger.info(f"GSC sitemap再送信成功: {GSC_SITEMAP}")
    except Exception as e:
        logger.warning(f"GSC sitemap再送信失敗: {e}")


def inspect_new_url(article_url: str):
    """GSC URL検査APIで新記事のインデックス状態を確認（ログ記録用）"""
    svc = _get_gsc_service("https://www.googleapis.com/auth/webmasters.readonly")
    if not svc:
        return
    try:
        r = svc.urlInspection().index().inspect(body={
            "inspectionUrl": article_url,
            "siteUrl": GSC_SITE,
        }).execute()
        idx = r.get("inspectionResult", {}).get("indexStatusResult", {})
        verdict = idx.get("verdict", "?")
        cov = idx.get("coverageState", "?")
        crawl = (idx.get("lastCrawlTime") or "NEVER")[:10]
        logger.info(f"URL検査: {verdict} / {cov} / crawl={crawl} / {article_url}")
    except Exception as e:
        logger.warning(f"URL検査失敗: {e}")


def ping_search_engines():
    """IndexNow + GSC sitemap再送信 + URL検査"""
    import urllib.request
    state = load_json(STATE_PATH)
    published = state.get("published", [])
    if not published:
        return

    latest = published[-1]
    article_url = f"{SITE_URL}/column/{latest['slug']}/"

    # 1. IndexNow (Bing/Yandex対応)
    try:
        indexnow_url = f"https://api.indexnow.org/indexnow?url={article_url}&key={INDEXNOW_KEY}"
        req = urllib.request.Request(indexnow_url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            logger.info(f"IndexNow通知: {article_url} → {resp.status}")
    except Exception as e:
        logger.info(f"IndexNow通知スキップ: {e}")

    # 2. GSC sitemap再送信
    resubmit_sitemap()

    # 3. 新記事のURL検査（状態ログ記録）
    inspect_new_url(article_url)
    # コラム一覧も確認
    inspect_new_url(f"{SITE_URL}/column/")


# ==============================================================================
# メイン: 記事投稿後に呼び出される
# ==============================================================================
def run_all(article_data: dict = None, article_body: str = None):
    """全副産物を一括生成"""
    logger.info("=" * 60)
    logger.info("副産物生成 開始")
    logger.info("=" * 60)

    # 1. sitemap.xml
    generate_sitemap()

    # 2. X投稿素材（新記事がある場合）
    if article_data and article_body:
        generate_sns_posts(article_data, article_body)

    # 3. 内部リンク最適化
    optimize_internal_links()

    # 4. GBP投稿テキスト（新記事がある場合）
    if article_data and article_body:
        generate_gbp_post(article_data, article_body)

    # 5. 検索エンジンping
    ping_search_engines()

    # 6. 週次ダイジェスト（日曜日のみ）
    if datetime.now(JST).weekday() == 6:  # 日曜
        send_weekly_digest()

    logger.info("=" * 60)
    logger.info("副産物生成 完了")
    logger.info("=" * 60)


if __name__ == "__main__":
    # 単体実行: 既存記事全体に対して副産物生成
    run_all()
