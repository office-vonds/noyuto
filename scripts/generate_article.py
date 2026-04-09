#!/usr/bin/env python3
"""
VONDS Auto Article Generator
Generates SEO-optimized articles using Claude API and publishes to GitHub Pages.
"""

import json
import os
import re
import sys
from datetime import date, datetime


def load_config(config_path):
    """Load article configuration."""
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_config(config_path, config):
    """Save updated configuration."""
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
        f.write("\n")


def find_next_topic(config, override_slug=None):
    """Find the next pending topic to generate."""
    for topic in config["topics"]:
        if override_slug and topic["slug"] == override_slug:
            return topic
        if not override_slug and topic["status"] == "pending":
            return topic
    return None


def generate_article_with_claude(topic, config):
    """Call Claude API to generate an article."""
    try:
        import anthropic
    except ImportError:
        print("ERROR: anthropic package not installed. Run: pip install anthropic")
        sys.exit(1)

    client = anthropic.Anthropic()

    category_label = config["categories"][topic["category"]]["label"]
    keywords_str = "、".join(topic["keywords"])

    system_prompt = """あなたは山梨県甲府市のSEO・WEBマーケティング会社「株式会社オフィスVONDS」のコンテンツライターです。
代表の小沢は全日本SEO協会認定コンサルタント（山梨県唯一）で、20年以上のWEBマーケティング経験があります。

以下のルールに従って記事を書いてください：
- 専門的だが平易な日本語で、山梨県の中小企業経営者に向けて書く
- 約2000〜3000文字の記事を生成する
- H2タグで3〜5個のセクションに分ける。必要に応じてH3も使う
- 指定されたキーワードを自然に含める（詰め込みすぎない）
- 冒頭で読者の課題に共感し、最後に行動を促す構成にする
- 山梨県の地域性に触れる内容を1箇所以上含める
- 具体的な数値やデータを含めて信頼性を高める
- HTMLタグ（h2, h3, p, ul, ol, li, strong, em）で構造化して返す
- scriptタグやiframeは絶対に含めない

レスポンスは必ず以下のJSON形式で返してください（他のテキストは不要）：
{
  "title": "記事タイトル（30〜60文字）",
  "meta_description": "メタディスクリプション（80〜120文字）",
  "excerpt": "記事の要約（60〜100文字）",
  "body_html": "<h2>...</h2><p>...</p>..."
}"""

    user_prompt = f"""以下のテーマで記事を生成してください。

テーマ: {topic['title_hint']}
カテゴリ: {category_label}
対策キーワード: {keywords_str}
記事スラッグ: {topic['slug']}

JSONのみで回答してください。"""

    print(f"Calling Claude API for: {topic['title_hint']}")

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )

    response_text = response.content[0].text.strip()

    # Try to parse JSON directly
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code block
    json_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", response_text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try finding JSON object in text
    json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass

    print(f"ERROR: Could not parse Claude response as JSON")
    print(f"Response: {response_text[:500]}")
    sys.exit(1)


def sanitize_html(html_content):
    """Remove potentially dangerous tags from generated HTML."""
    # Remove script, iframe, object, embed tags
    dangerous_tags = ["script", "iframe", "object", "embed", "form", "input"]
    for tag in dangerous_tags:
        html_content = re.sub(
            rf"<{tag}[^>]*>.*?</{tag}>", "", html_content, flags=re.DOTALL | re.IGNORECASE
        )
        html_content = re.sub(
            rf"<{tag}[^>]*/?>", "", html_content, flags=re.IGNORECASE
        )
    return html_content


def build_article_html(template_path, article_data, topic, config):
    """Build the full article HTML from template."""
    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()

    today = date.today()
    date_iso = today.isoformat()
    date_jp = f"{today.year}年{today.month}月{today.day}日"

    category = config["categories"][topic["category"]]
    canonical_url = f"{config['site']['canonical_base']}/column/{topic['slug']}/"
    keywords_str = ", ".join(topic["keywords"])

    body_html = sanitize_html(article_data["body_html"])

    replacements = {
        "{{TITLE}}": article_data["title"],
        "{{META_DESCRIPTION}}": article_data["meta_description"],
        "{{META_KEYWORDS}}": keywords_str,
        "{{CANONICAL_URL}}": canonical_url,
        "{{DATE_ISO}}": date_iso,
        "{{DATE_JP}}": date_jp,
        "{{CATEGORY_LABEL}}": category["label"],
        "{{ARTICLE_BODY}}": body_html,
    }

    html = template
    for key, value in replacements.items():
        html = html.replace(key, value)

    return html


def update_column_index(column_index_path, article_data, topic, config):
    """Add new article card to column/index.html."""
    with open(column_index_path, "r", encoding="utf-8") as f:
        content = f.read()

    today = date.today()
    date_jp = f"{today.year}年{today.month}月{today.day}日"

    category = config["categories"][topic["category"]]
    slug = topic["slug"]

    card_html = f"""      <div class="column-card">
        <div class="column-card-body">
          <span class="column-card-cat" style="background:{category['bg']};color:{category['color']};">{category['label']}</span>
          <p class="column-card-date">{date_jp}</p>
          <h3 class="column-card-title">{article_data['title']}</h3>
          <p class="column-card-excerpt">{article_data['excerpt']}</p>
          <a href="/noyuto/column/{slug}/" class="column-card-link">記事を読む &rarr;</a>
        </div>
      </div>
"""

    marker = "<!-- NEW_ARTICLE_HERE -->"
    if marker in content:
        content = content.replace(marker, card_html + marker)
    else:
        print("WARNING: Marker not found in column/index.html")

    with open(column_index_path, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    # Determine paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)

    config_path = os.path.join(script_dir, "article_config.json")
    template_path = os.path.join(script_dir, "article_template.html")
    column_index_path = os.path.join(repo_root, "column", "index.html")

    # Load config
    config = load_config(config_path)

    # Check for topic override from environment
    override_slug = os.environ.get("TOPIC_SLUG", "").strip() or None

    # Find next topic
    topic = find_next_topic(config, override_slug)
    if not topic:
        print("No pending topics found. Add more topics to article_config.json.")
        # Count remaining
        remaining = sum(1 for t in config["topics"] if t["status"] == "pending")
        print(f"Remaining topics: {remaining}")
        sys.exit(0)

    print(f"=== Generating article: {topic['slug']} ===")
    print(f"Topic: {topic['title_hint']}")
    print(f"Keywords: {', '.join(topic['keywords'])}")

    # Check if article already exists
    article_dir = os.path.join(repo_root, "column", topic["slug"])
    article_path = os.path.join(article_dir, "index.html")
    if os.path.exists(article_path):
        print(f"Article already exists at {article_path}. Marking as completed.")
        topic["status"] = "completed"
        topic["published_date"] = date.today().isoformat()
        save_config(config_path, config)
        sys.exit(0)

    # Generate article with Claude
    article_data = generate_article_with_claude(topic, config)

    print(f"Generated title: {article_data['title']}")
    print(f"Meta description: {article_data['meta_description']}")

    # Build article HTML
    article_html = build_article_html(template_path, article_data, topic, config)

    # Write article file
    os.makedirs(article_dir, exist_ok=True)
    with open(article_path, "w", encoding="utf-8") as f:
        f.write(article_html)
    print(f"Article written to: {article_path}")

    # Update column index page
    update_column_index(column_index_path, article_data, topic, config)
    print("Column index updated.")

    # Update config
    topic["status"] = "completed"
    topic["published_date"] = date.today().isoformat()
    topic["actual_title"] = article_data["title"]
    save_config(config_path, config)
    print("Config updated.")

    # Output for GitHub Actions
    github_output = os.environ.get("GITHUB_OUTPUT", "")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"article_title={article_data['title']}\n")
            f.write(f"article_slug={topic['slug']}\n")

    # Check remaining topics
    remaining = sum(1 for t in config["topics"] if t["status"] == "pending")
    print(f"\n=== Done! Remaining topics: {remaining} ===")
    if remaining <= 3:
        print("WARNING: Only a few topics left. Consider adding more to article_config.json.")


if __name__ == "__main__":
    main()
