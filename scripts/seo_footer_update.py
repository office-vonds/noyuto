#!/usr/bin/env python3
"""全sitemap対象HTMLのfooter-navを4サービス直接リンク含む新版に置換。
ホームページ(index.html)は内部#アンカーを保持、それ以外は/#形式に統一。"""
import re, sys
from pathlib import Path

FILES = [
    "index.html",
    "works/index.html",
    "works/seo/index.html",
    "works/seo/auto-plan/index.html",
    "works/web/index.html",
    "works/ads/index.html",
    "works/ai/index.html",
    "company/index.html",
    "past_work/index.html",
    "column/index.html",
    "column/seo-howto-guide/index.html",
    "column/what-is-seo/index.html",
    "column/yamanashi-seo/index.html",
    "seo/index.html",
    "seo/report1/index.html",
    "seo/semantic/index.html",
    "net_biz/index.html",
    "net_biz/corona/index.html",
    "kokodake/index.html",
    "kokodake/fan/index.html",
    "kokodake/report1-2/index.html",
    "kokodake/seikou/index.html",
]

def new_nav(is_home: bool) -> str:
    contact = "#contact" if is_home else "/#contact"
    return f'''<nav class="footer-nav" aria-label="フッターナビゲーション">
          <ul>
            <li><a href="/works/seo/">SEO対策・コンサルティング</a></li>
            <li><a href="/works/web/">ホームページ制作</a></li>
            <li><a href="/works/ads/">Google広告運用代行</a></li>
            <li><a href="/works/ai/">AI活用支援</a></li>
            <li><a href="/works/">サービス一覧</a></li>
            <li><a href="/past_work/">制作実績</a></li>
            <li><a href="/company/">会社概要</a></li>
            <li><a href="{contact}">お問い合わせ</a></li>
          </ul>
        </nav>'''

PAT = re.compile(r'<nav class="footer-nav"[^>]*>.*?</nav>', re.S)

changed = 0
for f in FILES:
    p = Path(f)
    if not p.exists():
        print(f"MISS {f}"); continue
    s = p.read_text(encoding="utf-8")
    is_home = (f == "index.html")
    new = PAT.sub(new_nav(is_home), s, count=1)
    if new == s:
        print(f"NOOP {f}"); continue
    p.write_text(new, encoding="utf-8")
    print(f"OK   {f}")
    changed += 1

print(f"\n=== {changed} files updated ===")
