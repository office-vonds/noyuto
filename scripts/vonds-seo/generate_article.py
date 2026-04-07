#!/usr/bin/env python3
"""
VONDS SEO記事自動投稿システム
- keywords.jsonからキーワードを選択（優先度順）
- Claude API（claude-sonnet-4-20250514）で5000-8000文字の記事を生成
- テンプレートにマージしてHTML出力
- コラム一覧ページ更新（カテゴリフィルタ付き）
- git add -> commit -> push (gh-pages)
"""

import json
import os
import re
import sys
import logging
import subprocess
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ==============================================================================
# 設定
# ==============================================================================
BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent.parent  # ~/projects/vonds/
COLUMN_DIR = PROJECT_DIR / "column"
TEMPLATE_PATH = BASE_DIR / "article_template.html"
KEYWORDS_PATH = BASE_DIR / "keywords.json"
STATE_PATH = BASE_DIR / "state.json"
LOG_DIR = BASE_DIR / "logs"
LOG_PATH = LOG_DIR / "generate.log"

SITE_URL = "https://vonds.co.jp"
OG_IMAGE = f"{SITE_URL}/1600-900-1.jpg"
JST = timezone(timedelta(hours=9))

# ログ設定
LOG_DIR.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


# ==============================================================================
# ユーティリティ
# ==============================================================================
def load_json(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: dict):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_api_key() -> str:
    """ANTHROPIC_API_KEYを環境変数から取得。なければ~/.claude/.credentialsを参照"""
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key:
        cred_path = Path.home() / ".claude" / ".credentials"
        if cred_path.exists():
            try:
                creds = json.loads(cred_path.read_text(encoding="utf-8"))
                key = creds.get("anthropic_api_key", "") or creds.get("apiKey", "")
            except Exception:
                pass
    if not key:
        logger.error(
            "ANTHROPIC_API_KEY が未設定です。"
            "環境変数 ANTHROPIC_API_KEY を設定するか、"
            "~/.claude/.credentials に apiKey を記載してください。"
        )
        sys.exit(1)
    return key


def estimate_read_time(text: str) -> str:
    """日本語テキストの読了時間を推定（400文字/分）"""
    clean = re.sub(r"<[^>]+>", "", text)
    char_count = len(clean)
    minutes = max(1, round(char_count / 400))
    return f"約{minutes}分で読めます"


def count_chars(text: str) -> int:
    """HTMLタグ除去後の文字数を返す"""
    clean = re.sub(r"<[^>]+>", "", text)
    return len(clean)


# ==============================================================================
# キーワード選択
# ==============================================================================
def select_keyword(keywords_data: dict, state: dict) -> tuple:
    """
    未投稿のキーワードを優先度順に1つ選択。
    Returns: (category_dict, keyword_entry) or (None, None)
    """
    published_slugs = {p["slug"] for p in state.get("published", [])}
    priority_order = {"high": 0, "medium": 1, "low": 2}

    candidates = []
    for cat in keywords_data["categories"]:
        for kw in cat["keywords"]:
            if kw["slug"] not in published_slugs:
                candidates.append((cat, kw))

    if not candidates:
        return None, None

    candidates.sort(key=lambda x: priority_order.get(x[1].get("priority", "low"), 2))
    return candidates[0]


# ==============================================================================
# 記事生成 (Claude API)
# ==============================================================================
def generate_article_content(keyword_entry: dict, category: dict) -> str:
    """Claude APIで記事本文HTMLを生成"""
    try:
        import anthropic
    except ImportError:
        logger.error("anthropic SDKがインストールされていません: pip install anthropic")
        sys.exit(1)

    api_key = get_api_key()
    client = anthropic.Anthropic(api_key=api_key)

    keyword = keyword_entry["keyword"]
    title = keyword_entry["title"]
    cat_label = category["label"]

    prompt = f"""あなたは日本のWEBマーケティング・SEO対策の専門家です。
株式会社オフィスVONDS（山梨県甲府市）のコラム記事として、以下の要件で記事本文HTMLを生成してください。

【記事情報】
- キーワード: {keyword}
- タイトル: {title}
- カテゴリ: {cat_label}
- 文字数: 5000〜8000文字（HTMLタグ除外後）
- 読者: 中小企業の経営者・Web担当者

【記事構成の要件】
1. リード文（3〜4段落）: 読者の課題に寄り添い、この記事で解決できることを明示
2. 5〜7個のh2セクション: 論理的な流れで構成
3. 各セクションにh3サブ見出しを2〜3個含める
4. 具体的なデータ・統計・事例を各セクションに含める（日本の市場データ、調査結果等）
5. まとめセクション: 記事の要点を整理し、次のアクションを促す

【HTML装飾タグ（必ず使用すること）】
- ポイントボックス（各セクションの重要な要約に使用。最低3箇所）:
  <div class="point-box">重要なポイントの内容をここに記述</div>

- 注意ボックス（注意すべき点に使用。最低1箇所）:
  <div class="caution-box">注意すべき内容をここに記述</div>

- チェックリスト（実践ステップ等に使用。最低2箇所）:
  <ul class="check-list">
    <li>チェック項目1</li>
    <li>チェック項目2</li>
  </ul>

- 数字ハイライト（印象的な統計データに使用。最低2箇所）:
  <div class="stat-highlight">
    <span class="stat-number">90%</span>
    <span class="stat-desc">の企業がSEO対策の効果を実感</span>
  </div>

- 引用ブロック（権威ある情報源からの引用に使用。最低1箇所）:
  <blockquote>引用内容</blockquote>

- 通常のHTML要素も積極的に使用: <p>, <h2>, <h3>, <strong>, <ul>, <ol>, <li>

【コンテンツ品質の要件】
- 10年20年経っても色褪せないエバーグリーンコンテンツ
- 読み終わった後にシェアしたくなるような具体的な数字・事例・インサイトを含める
- 日本全国の最新データ・統計・調査結果を根拠として引用
- 一般論ではなく、実務で即使える具体的なアクションステップを含む
- 専門用語は初出時に簡潔に解説する
- VONDSの宣伝は入れない（CTAは記事外に別途あるため）

【出力形式】
- HTML本文のみを出力（<article>タグ、<html>タグは不要）
- 最初にリード文をp要素で記述し、その後h2から開始
- ```html や ``` は付けない
- 純粋なHTML本文のみ"""

    logger.info(f"Claude API呼び出し開始: {keyword}")

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=8192,
            timeout=120.0,
            messages=[{"role": "user", "content": prompt}],
        )

        content = message.content[0].text
        # コードブロック記法の除去
        content = re.sub(r"^```html\s*\n?", "", content)
        content = re.sub(r"\n?```\s*$", "", content)
        content = content.strip()

        char_count = count_chars(content)
        logger.info(f"記事生成完了: {char_count}文字")

        return content
    except Exception as e:
        logger.error(f"Claude API エラー: {e}")
        sys.exit(1)


# ==============================================================================
# HTMLビルド
# ==============================================================================
def build_article_html(
    template: str,
    article_body: str,
    keyword_entry: dict,
    category: dict,
    related_html: str,
) -> str:
    """テンプレートにプレースホルダを埋め込み"""
    now = datetime.now(JST)
    date_iso = now.strftime("%Y-%m-%d")
    date_jp = f"{now.year}年{now.month}月{now.day}日"
    read_time = estimate_read_time(article_body)
    canonical = f"{SITE_URL}/column/{keyword_entry['slug']}/"

    replacements = {
        "{{TITLE}}": keyword_entry["title"],
        "{{META_DESCRIPTION}}": keyword_entry["meta_description"],
        "{{META_KEYWORDS}}": keyword_entry["meta_keywords"],
        "{{CANONICAL_URL}}": canonical,
        "{{DATE_ISO}}": date_iso,
        "{{DATE_JP}}": date_jp,
        "{{CATEGORY_LABEL}}": category["label"],
        "{{ARTICLE_BODY}}": article_body,
        "{{READ_TIME}}": read_time,
        "{{RELATED_ARTICLES}}": related_html,
        "{{OG_IMAGE}}": OG_IMAGE,
    }

    html = template
    for key, val in replacements.items():
        html = html.replace(key, val)

    return html


# ==============================================================================
# 関連記事HTML生成
# ==============================================================================
def build_related_articles_html(
    state: dict, current_slug: str, category_id: str, limit: int = 3
) -> str:
    """投稿済み記事から同カテゴリ優先で関連記事カードHTMLを生成"""
    published = state.get("published", [])
    if not published:
        return "<!-- まだ関連記事はありません -->"

    # 同カテゴリの記事を優先
    same_cat = [p for p in published if p.get("category_id") == category_id and p["slug"] != current_slug]
    other_cat = [p for p in published if p.get("category_id") != category_id and p["slug"] != current_slug]

    candidates = same_cat + other_cat
    candidates = candidates[:limit]

    if not candidates:
        return "<!-- まだ関連記事はありません -->"

    cards = []
    for p in candidates:
        card = f"""        <div class="related-card">
          <div class="related-cat">{p.get('category_label', '')}</div>
          <a href="/column/{p['slug']}/">{p['title']}</a>
        </div>"""
        cards.append(card)

    return "\n".join(cards)


# ==============================================================================
# コラム一覧ページ生成
# ==============================================================================
def generate_column_index(state: dict, keywords_data: dict):
    """column/index.html を生成（カテゴリフィルタ付きカード形式）"""
    published = state.get("published", [])
    published_sorted = sorted(published, key=lambda x: x.get("date", ""), reverse=True)

    categories = keywords_data.get("categories", [])
    cat_map = {c["id"]: c["label"] for c in categories}

    # カテゴリフィルタボタン
    filter_buttons = ['      <button class="filter-btn active" data-cat="all">すべて</button>']
    used_cats = set(p.get("category_id", "") for p in published)
    for cat_id, cat_label in cat_map.items():
        if cat_id in used_cats:
            filter_buttons.append(f'      <button class="filter-btn" data-cat="{cat_id}">{cat_label}</button>')

    # 記事カード
    article_cards = []
    for p in published_sorted:
        card = f"""      <article class="column-card" data-cat="{p.get('category_id', '')}">
        <a href="/column/{p['slug']}/">
          <div class="column-card-cat">{p.get('category_label', '')}</div>
          <h2 class="column-card-title">{p['title']}</h2>
          <p class="column-card-desc">{p.get('meta_description', '')}</p>
          <time class="column-card-date" datetime="{p.get('date', '')}">{p.get('date_jp', '')}</time>
        </a>
      </article>"""
        article_cards.append(card)

    no_articles = ""
    if not article_cards:
        no_articles = '      <p class="no-articles">まだ記事がありません。</p>'

    html = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=GT-NFRN79GB"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','GT-NFRN79GB');</script>
  <meta name="google-site-verification" content="jYrwrlMXWshD3csIrSV5nwZIsc6AGJrXFNc0Vp5n9js">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1853024193601363" crossorigin="anonymous"></script>
  <title>コラム | 株式会社オフィスVONDS</title>
  <meta name="description" content="SEO対策・ホームページ制作・WEBマーケティング・AI活用に関するコラム記事一覧。中小企業のデジタル戦略に役立つ情報を発信しています。">
  <link rel="canonical" href="{SITE_URL}/column/">
  <meta property="og:title" content="コラム | 株式会社オフィスVONDS">
  <meta property="og:description" content="SEO対策・ホームページ制作・WEBマーケティング・AI活用に関するコラム記事一覧。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{SITE_URL}/column/">
  <meta property="og:image" content="{OG_IMAGE}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "コラム",
    "description": "SEO対策・ホームページ制作・WEBマーケティングに関するコラム記事一覧",
    "url": "{SITE_URL}/column/"
  }}
  </script>
  <style>
    .column-hero {{
      background: linear-gradient(135deg, #1a56db 0%, #1242b0 100%);
      padding: 120px 0 48px;
      color: #fff;
      text-align: center;
    }}
    .column-hero h1 {{
      font-size: clamp(1.8rem, 4vw, 2.5rem);
      font-weight: 900;
      margin-bottom: 12px;
    }}
    .column-hero p {{
      opacity: 0.8;
      font-size: 1rem;
    }}
    .column-count {{
      text-align: center;
      padding: 24px 24px 0;
      color: #6b7280;
      font-size: 0.9rem;
    }}
    .column-filter {{
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px 24px 0;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }}
    .filter-btn {{
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 50px;
      padding: 8px 20px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s;
    }}
    .filter-btn:hover, .filter-btn.active {{
      background: #1a56db;
      color: #fff;
      border-color: #1a56db;
    }}
    .column-grid {{
      max-width: 1000px;
      margin: 0 auto;
      padding: 32px 24px 80px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }}
    .column-card {{
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      transition: box-shadow 0.2s, transform 0.2s;
    }}
    .column-card:hover {{
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      transform: translateY(-4px);
    }}
    .column-card a {{
      display: block;
      padding: 24px;
      text-decoration: none;
      color: inherit;
    }}
    .column-card-cat {{
      font-size: 0.75rem;
      font-weight: 700;
      color: #1a56db;
      margin-bottom: 8px;
    }}
    .column-card-title {{
      font-size: 1.1rem;
      font-weight: 700;
      color: #111827;
      line-height: 1.5;
      margin: 0 0 12px;
    }}
    .column-card-desc {{
      font-size: 0.85rem;
      color: #6b7280;
      line-height: 1.6;
      margin: 0 0 12px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }}
    .column-card-date {{
      font-size: 0.8rem;
      color: #9ca3af;
    }}
    .no-articles {{
      grid-column: 1 / -1;
      text-align: center;
      color: #6b7280;
      padding: 48px 0;
    }}
    .column-card.hidden {{ display: none; }}
  </style>
</head>
<body>
  <header class="header" id="header">
    <div class="header-inner">
      <div class="header-logo"><a href="/"><img src="/logo185-61.png" alt="株式会社オフィスVONDS" width="185" height="61"></a></div>
      <nav class="header-nav" id="nav" aria-label="メインナビゲーション">
        <ul>
          <li><a href="/#service">サービス</a></li>
          <li><a href="/works/">サービス詳細</a></li>
          <li><a href="/past_work/">実績</a></li>
          <li><a href="/#reason">選ばれる理由</a></li>
          <li><a href="/company/">会社概要</a></li>
        </ul>
      </nav>
      <a href="/#contact" class="header-cta">無料相談はこちら</a>
      <button class="hamburger" id="hamburger" aria-label="メニューを開く"><span></span><span></span><span></span></button>
    </div>
  </header>

  <section class="column-hero">
    <div class="container">
      <h1>コラム</h1>
      <p>SEO・Web制作・マーケティング・AI活用の最新ナレッジをお届けします</p>
    </div>
  </section>

  <p class="column-count">全 {len(published_sorted)} 記事</p>

  <div class="column-filter">
{chr(10).join(filter_buttons)}
  </div>

  <div class="column-grid">
{chr(10).join(article_cards) if article_cards else no_articles}
  </div>

  <footer class="footer">
    <div class="container">
      <div class="footer-inner">
        <div class="footer-info">
          <div class="footer-logo"><img src="/logo185-61.png" alt="株式会社オフィスVONDS" width="185" height="61" style="filter:brightness(10);"></div>
          <p class="footer-address">〒400-0041 山梨県甲府市上石田4-17-7 コーポ河井202</p>
          <p class="footer-tel">TEL: <a href="tel:055-269-7220">055-269-7220</a></p>
        </div>
        <nav class="footer-nav" aria-label="フッターナビゲーション">
          <ul>
            <li><a href="/#service">サービス</a></li>
            <li><a href="/works/">サービス詳細</a></li>
            <li><a href="/past_work/">実績</a></li>
            <li><a href="/#reason">選ばれる理由</a></li>
            <li><a href="/company/">会社概要</a></li>
            <li><a href="/#contact">お問い合わせ</a></li>
          </ul>
        </nav>
      </div>
      <p class="footer-copy">&copy; 2026 株式会社オフィスVONDS All Rights Reserved.</p>
    </div>
  </footer>

  <script src="/js/main.js"></script>
  <script>
    // カテゴリフィルタ
    document.querySelectorAll('.filter-btn').forEach(function(btn) {{
      btn.addEventListener('click', function() {{
        document.querySelectorAll('.filter-btn').forEach(function(b) {{ b.classList.remove('active'); }});
        this.classList.add('active');
        var cat = this.getAttribute('data-cat');
        document.querySelectorAll('.column-card').forEach(function(card) {{
          if (cat === 'all' || card.getAttribute('data-cat') === cat) {{
            card.classList.remove('hidden');
          }} else {{
            card.classList.add('hidden');
          }}
        }});
      }});
    }});
  </script>
</body>
</html>"""

    COLUMN_DIR.mkdir(parents=True, exist_ok=True)
    index_path = COLUMN_DIR / "index.html"
    index_path.write_text(html, encoding="utf-8")
    logger.info(f"コラム一覧ページ更新: {index_path} ({len(published_sorted)}記事)")


# ==============================================================================
# Git操作
# ==============================================================================
def git_push(slug: str):
    """git add, commit, push (gh-pages)"""
    try:
        # 追加対象ファイル
        targets = [
            f"column/{slug}/index.html",
            "column/index.html",
            os.path.relpath(STATE_PATH, PROJECT_DIR),
        ]

        for t in targets:
            full_path = PROJECT_DIR / t
            if full_path.exists():
                subprocess.run(["git", "add", t], check=True, cwd=str(PROJECT_DIR))

        # コミット
        commit_msg = f"SEOコラム自動投稿: {slug}"
        result = subprocess.run(
            ["git", "commit", "-m", commit_msg],
            capture_output=True,
            text=True,
            cwd=str(PROJECT_DIR),
        )
        if result.returncode != 0:
            if "nothing to commit" in (result.stdout + result.stderr):
                logger.info("コミット対象の変更なし")
                return
            logger.error(f"git commit失敗: {result.stderr}")
            return

        logger.info(f"git commit完了: {commit_msg}")

        # push
        result = subprocess.run(
            ["git", "push", "origin", "gh-pages"],
            capture_output=True,
            text=True,
            cwd=str(PROJECT_DIR),
        )
        if result.returncode != 0:
            logger.error(f"git push失敗: {result.stderr}")
        else:
            logger.info("git push完了 (gh-pages)")

    except Exception as e:
        logger.error(f"Git操作エラー: {e}")


# ==============================================================================
# メイン処理
# ==============================================================================
def main():
    logger.info("=" * 60)
    logger.info("VONDS SEO記事自動投稿 開始")
    logger.info("=" * 60)

    # 1. データ読み込み
    keywords_data = load_json(KEYWORDS_PATH)
    state = load_json(STATE_PATH)
    template = TEMPLATE_PATH.read_text(encoding="utf-8")

    # 2. キーワード選択
    category, keyword_entry = select_keyword(keywords_data, state)
    if not keyword_entry:
        logger.info("すべてのキーワードが投稿済みです。")
        return

    slug = keyword_entry["slug"]
    logger.info(f"選択キーワード: {keyword_entry['keyword']} (slug: {slug})")

    # 3. Claude APIで記事生成
    article_body = generate_article_content(keyword_entry, category)

    # 4. 関連記事HTML
    related_html = build_related_articles_html(state, slug, category["id"])

    # 5. テンプレートにマージ
    final_html = build_article_html(
        template, article_body, keyword_entry, category, related_html
    )

    # 6. ファイル保存
    article_dir = COLUMN_DIR / slug
    article_dir.mkdir(parents=True, exist_ok=True)
    article_path = article_dir / "index.html"
    article_path.write_text(final_html, encoding="utf-8")
    logger.info(f"記事HTML保存: {article_path}")

    # 7. state.json更新
    now = datetime.now(JST)
    state["published"].append(
        {
            "slug": slug,
            "keyword": keyword_entry["keyword"],
            "title": keyword_entry["title"],
            "category_id": category["id"],
            "category_label": category["label"],
            "meta_description": keyword_entry["meta_description"],
            "date": now.strftime("%Y-%m-%d"),
            "date_jp": f"{now.year}年{now.month}月{now.day}日",
            "published_at": now.isoformat(),
        }
    )
    state["last_updated"] = now.isoformat()
    save_json(STATE_PATH, state)
    logger.info("state.json更新完了")

    # 8. コラム一覧ページ更新
    generate_column_index(state, keywords_data)

    # 9. git push
    git_push(slug)

    char_count = count_chars(article_body)
    logger.info("=" * 60)
    logger.info(f"投稿完了: {keyword_entry['title']}")
    logger.info(f"URL: {SITE_URL}/column/{slug}/")
    logger.info(f"文字数: {char_count}文字")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
