#!/usr/bin/env python3
"""vonds.co.jp 用 sitemap.xml 再生成スクリプト。
全index.htmlを走査し、公開対象だけを抽出して sitemap.xml を吐き出す。
除外: テスト、ヒアリング、バックアップ、majistretchサブページ、proposal等の作業用ディレクトリ。
"""
import os, subprocess
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_URL = "https://vonds.co.jp"

# このディレクトリ配下の index.html は絶対にsitemapに入れない
EXCLUDE_DIR_PREFIXES = (
    "test-lp/", "hearing_work/", "majistretch/", "kaitori-backup/",
    "kaitori-backup-20260317155439/", "seo/a-truck-backup-20260406/",
    "scripts/", "vonds-site/", "vonds-seo/", "proposal/", "rina/",
    "auto-repair/", ".git/", ".claude/", "node_modules/",
)

# 優先度(0.1-1.0) / 更新頻度 ルール
PRIORITY_RULES = [
    ("", 1.0, "weekly"),              # トップ
    ("works/", 0.9, "monthly"),       # サービス一覧・個別
    ("company/", 0.7, "monthly"),     # 会社概要
    ("past_work/", 0.7, "monthly"),   # 実績
    ("column/", 0.8, "weekly"),       # コラムindex
    ("column/", 0.6, "monthly"),      # 個別コラム記事
    ("seo/", 0.5, "monthly"),         # 旧SEOコラム（権威あり）
    ("net_biz/", 0.4, "monthly"),     # 旧ビジネスコラム
    ("kokodake/", 0.5, "monthly"),    # ここだけの話
]

def get_priority(rel_path: str):
    """rel_path: 'works/seo/' や '' 。末尾スラッシュあり。"""
    if rel_path == "":
        return 1.0, "weekly"
    # 個別コラム記事は親 column/XXX/ のような形
    segments = rel_path.strip("/").split("/")
    if segments[0] == "column" and len(segments) >= 2:
        return 0.6, "monthly"
    if segments[0] == "works" and len(segments) >= 2:
        return 0.85, "monthly"
    # デフォルトルール適用
    for prefix, prio, freq in PRIORITY_RULES:
        if rel_path == prefix:
            return prio, freq
    return 0.5, "monthly"

def should_exclude(rel: str) -> bool:
    for ex in EXCLUDE_DIR_PREFIXES:
        if rel.startswith(ex):
            return True
    return False

def has_noindex(file_path: str) -> bool:
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            head = f.read(8000)
        return "noindex" in head.lower() and 'name="robots"' in head.lower()
    except Exception:
        return False

def file_git_date(path: str) -> str:
    """git log から最終更新日を取る。失敗時はmtime。"""
    try:
        out = subprocess.check_output(
            ["git", "log", "-1", "--format=%ad", "--date=short", "--", path],
            cwd=ROOT, stderr=subprocess.DEVNULL
        ).decode().strip()
        if out:
            return out
    except Exception:
        pass
    return datetime.fromtimestamp(os.path.getmtime(path)).strftime("%Y-%m-%d")

def main():
    entries = []
    for dirpath, dirs, files in os.walk(ROOT):
        # 除外ディレクトリを walk から剪定
        rel_dir = os.path.relpath(dirpath, ROOT)
        if rel_dir == ".":
            rel_dir = ""
        else:
            rel_dir = rel_dir.replace(os.sep, "/") + "/"
        if should_exclude(rel_dir):
            dirs[:] = []
            continue
        if "index.html" in files:
            file_path = os.path.join(dirpath, "index.html")
            if has_noindex(file_path):
                print(f"  (skip noindex) /{rel_dir}")
                continue
            lastmod = file_git_date(file_path)
            prio, freq = get_priority(rel_dir)
            url = BASE_URL + "/" + rel_dir  # rel_dir末尾/付き、トップは ""
            entries.append((url, lastmod, freq, prio))

    # 優先度降順、次にURL昇順で安定化
    entries.sort(key=lambda e: (-e[3], e[0]))

    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, lastmod, freq, prio in entries:
        out.append("  <url>")
        out.append(f"    <loc>{url}</loc>")
        out.append(f"    <lastmod>{lastmod}</lastmod>")
        out.append(f"    <changefreq>{freq}</changefreq>")
        out.append(f"    <priority>{prio:.1f}</priority>")
        out.append("  </url>")
    out.append("</urlset>")
    out.append("")

    sitemap_path = os.path.join(ROOT, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print(f"Wrote {len(entries)} URLs to {sitemap_path}")
    for url, *_ in entries:
        print("  " + url)

if __name__ == "__main__":
    main()
