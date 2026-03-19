import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

SESSION_FILE = Path.home() / "projects/vonds/note_session.json"
OUTPUT_FILE  = Path.home() / "projects/vonds/note_dialog_html.html"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context(
            storage_state=str(SESSION_FILE),
            viewport={"width": 1280, "height": 900},
        )
        page = await ctx.new_page()
        print("[1] note.com を開く...")
        await page.goto("https://note.com/", wait_until="networkidle")
        print("[2] 新規投稿ページへ遷移...")
        await page.goto("https://note.com/notes/new", wait_until="networkidle")
        await page.wait_for_timeout(3000)

        print("[3] ダイアログ候補を探索中...")
        candidates = await page.evaluate("""() => {
            const selectors = ['[role=\"dialog\"]','[role=\"alertdialog\"]','.modal','[class*=\"modal\"]','[class*=\"dialog\"]','[class*=\"Dialog\"]','[class*=\"Modal\"]','[class*=\"overlay\"]','[class*=\"Overlay\"]','[class*=\"popup\"]','[class*=\"Popup\"]'];
            const results = [];
            for (const sel of selectors) {
                const els = document.querySelectorAll(sel);
                els.forEach(el => { results.push({selector:sel,tag:el.tagName,class:el.className,visible:el.offsetParent!==null,innerText:el.innerText.slice(0,200),outerHTML:el.outerHTML.slice(0,500)}); });
            }
            return results;
        }""")

        if candidates:
            print(f"  → {len(candidates)} 件検出\n")
            for i,c in enumerate(candidates):
                print(f"[{i}] sel={c['selector']} tag={c['tag']} visible={c['visible']}")
                print(f"     class: {c['class'][:80]}")
                print(f"     text:  {c['innerText'][:100]}")
                print(f"     html:  {c['outerHTML'][:300]}\n")
        else:
            print("  → 検出なし。10秒待って再試行...")
            await page.wait_for_timeout(10000)

        full_html = await page.content()
        OUTPUT_FILE.write_text(full_html, encoding="utf-8")
        print(f"\n[4] HTML保存完了: {OUTPUT_FILE}")

        print("\n[5] 閉じるボタン候補:")
        buttons = await page.evaluate("""() => {
            const all = document.querySelectorAll('button,[role=\"button\"],[aria-label]');
            return Array.from(all).filter(el => {
                const t = (el.innerText||el.getAttribute('aria-label')||'').toLowerCase();
                return t.includes('閉')||t.includes('close')||t.includes('×')||t.includes('skip')||t.includes('あとで')||t.includes('キャン')||t.includes('了解');
            }).map(el => ({tag:el.tagName,class:el.className,ariaLabel:el.getAttribute('aria-label'),text:el.innerText,outerHTML:el.outerHTML.slice(0,300)}));
        }""")
        if buttons:
            for b in buttons:
                print(f"  tag={b['tag']} aria={b['ariaLabel']} text={b['text']}")
                print(f"  html: {b['outerHTML'][:250]}\n")
        else:
            print("  → 候補なし")

        print("\n[完了] 10秒後に閉じます。")
        await page.wait_for_timeout(10000)
        await browser.close()

asyncio.run(main())
