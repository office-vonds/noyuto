import asyncio
import json
import glob
from pathlib import Path
from playwright.async_api import async_playwright

PENDING_DIR  = Path.home() / "projects/vonds/pending_notes"
SESSION_FILE = Path.home() / "projects/vonds/note_session.json"

async def close_dialog(page):
    selectors = [
        'button[aria-label="モーダルを閉じる"]',
        'button[aria-label*="モーダルを閉じる"]',
        'button[aria-label*="閉じる"]',
        '[role="dialog"] button:last-child',
    ]
    for sel in selectors:
        try:
            await page.wait_for_selector(sel, timeout=4000)
            await page.click(sel)
            await page.wait_for_timeout(800)
            print(f"[ダイアログ] 閉じました: {sel}")
            return
        except:
            continue
    try:
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(800)
        print("[ダイアログ] Escapeで閉じました")
    except:
        print("[ダイアログ] 検出なし（スキップ）")

async def post_to_note():
    files = sorted(glob.glob(str(PENDING_DIR / "*.json")))
    if not files:
        print("投稿するnoteがありません")
        return
    latest = files[-1]
    with open(latest, "r") as f:
        data = json.load(f)
    title = data["title"]
    body  = data["body"]
    print(f"[投稿開始] {title}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            channel="chrome",
            args=["--disable-blink-features=AutomationControlled"],
        )
        context = await browser.new_context(storage_state=str(SESSION_FILE))
        page = await context.new_page()
        await page.goto("https://note.com/notes/new", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        await close_dialog(page)
        try:
            title_sel = 'textarea[placeholder*="タイトル"], input[placeholder*="タイトル"]'
            await page.wait_for_selector(title_sel, timeout=6000)
            await page.click(title_sel)
            await page.fill(title_sel, title)
            print("[タイトル] 入力完了")
        except Exception as e:
            print(f"[タイトル] 失敗: {e}")
        await page.wait_for_timeout(500)
        try:
            body_sel = '.ProseMirror, [contenteditable="true"]'
            await page.wait_for_selector(body_sel, timeout=6000)
            await page.click(body_sel)
            for line in body.split("\n"):
                await page.keyboard.type(line)
                await page.keyboard.press("Enter")
            print("[本文] 入力完了")
        except Exception as e:
            print(f"[本文] 失敗: {e}")
            raise
        await page.wait_for_timeout(500)
        await page.click('button:has-text("公開に進む")')
        print("[公開] 遷移中...")
        await page.wait_for_timeout(3000)
        await page.click('button:has-text("投稿する")', timeout=10000)
        print("[公開] 完了ボタンクリック")
        await page.wait_for_timeout(4000)
        url = page.url
        print(f"[完了] URL: {url}")
        data["status"] = "published"
        data["url"] = url
        with open(latest, "w") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        await browser.close()
        print("[完了] 正常終了")

asyncio.run(post_to_note())
