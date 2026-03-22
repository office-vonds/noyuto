#!/usr/bin/env python3
"""note.comに記事を投稿する（Playwright経由・ヘッドレス対応）"""
import asyncio
import json
import glob
from pathlib import Path
from playwright.async_api import async_playwright

PENDING_DIR  = Path.home() / "projects/noyuto/pending_notes"
SESSION_FILE = Path.home() / "projects/noyuto/note_session.json"

async def close_dialog(page):
    """AIダイアログやモーダルを閉じる"""
    selectors = [
        'button[aria-label="モーダルを閉じる"]',
        'button[aria-label*="閉じる"]',
        '[role="dialog"] button',
    ]
    for sel in selectors:
        try:
            el = await page.wait_for_selector(sel, timeout=3000)
            if el:
                await el.click()
                await page.wait_for_timeout(800)
                print(f"[ダイアログ] 閉じました: {sel}")
                return True
        except:
            continue
    try:
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(500)
        print("[ダイアログ] Escapeで閉じました")
        return True
    except:
        pass
    return False

async def post_to_note():
    files = sorted(glob.glob(str(PENDING_DIR / "*.json")))
    pending = [f for f in files if json.load(open(f)).get("status") == "pending"]
    if not pending:
        print("[完了] 投稿するnoteがありません")
        return

    latest = pending[-1]
    with open(latest, "r") as f:
        data = json.load(f)

    title = data["title"]
    body  = data["body"]
    print(f"[投稿開始] {title}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ],
        )
        context = await browser.new_context(
            storage_state=str(SESSION_FILE),
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        page = await context.new_page()

        # Navigate and wait for editor to fully load
        print("[ナビ] editor.note.com/new へ移動中...")
        await page.goto("https://editor.note.com/new", timeout=60000)

        # Wait for page to fully render (note editor is heavy JS)
        for i in range(15):
            await page.wait_for_timeout(2000)
            elements = await page.query_selector_all('[contenteditable="true"], .ProseMirror, textarea')
            if elements:
                print(f"[ロード完了] {len(elements)}個の入力要素を検出（{(i+1)*2}秒後）")
                break
            print(f"[待機中] {(i+1)*2}秒経過...")
        else:
            # Take screenshot for debugging
            await page.screenshot(path=str(Path.home() / "projects/noyuto/note_error.png"))
            print("[エラー] エディタが30秒以内にロードされませんでした")
            url = page.url
            title_text = await page.title()
            print(f"  URL: {url}")
            print(f"  Title: {title_text}")
            await browser.close()
            return

        # Close any dialog/modal
        await close_dialog(page)
        await page.wait_for_timeout(1000)

        # Input title
        try:
            title_sels = [
                'textarea[placeholder*="タイトル"]',
                'input[placeholder*="タイトル"]',
                '[data-placeholder*="タイトル"]',
                'h1[contenteditable="true"]',
            ]
            title_filled = False
            for sel in title_sels:
                try:
                    el = await page.wait_for_selector(sel, timeout=3000)
                    if el:
                        await el.click()
                        await el.fill(title) if 'contenteditable' not in sel else None
                        if 'contenteditable' in sel:
                            await page.keyboard.type(title)
                        else:
                            await el.fill(title)
                        print(f"[タイトル] 入力完了 ({sel})")
                        title_filled = True
                        break
                except:
                    continue
            if not title_filled:
                print("[タイトル] セレクタが見つかりません。Tab+入力を試みます")
                await page.keyboard.type(title)
                await page.keyboard.press("Tab")
        except Exception as e:
            print(f"[タイトル] 失敗: {e}")

        await page.wait_for_timeout(500)

        # Input body
        try:
            body_sels = [
                '.ProseMirror',
                '[contenteditable="true"]:not(h1)',
                'div[role="textbox"]',
            ]
            body_filled = False
            for sel in body_sels:
                try:
                    els = await page.query_selector_all(sel)
                    # Use the last contenteditable (body, not title)
                    el = els[-1] if els else None
                    if el:
                        await el.click()
                        for line in body.split("\n"):
                            await page.keyboard.type(line, delay=5)
                            await page.keyboard.press("Enter")
                        print(f"[本文] 入力完了 ({sel})")
                        body_filled = True
                        break
                except:
                    continue
            if not body_filled:
                print("[本文] セレクタが見つかりません")
                await page.screenshot(path=str(Path.home() / "projects/noyuto/note_body_error.png"))
                await browser.close()
                return
        except Exception as e:
            print(f"[本文] 失敗: {e}")
            await browser.close()
            return

        await page.wait_for_timeout(1000)

        # Click publish
        try:
            await page.click('button:has-text("公開に進む")', timeout=5000)
            print("[公開] 「公開に進む」クリック")
            await page.wait_for_timeout(3000)

            # Try different publish button texts
            publish_sels = [
                'button:has-text("投稿する")',
                'button:has-text("公開する")',
                'button:has-text("完了する")',
            ]
            for sel in publish_sels:
                try:
                    await page.click(sel, timeout=5000)
                    print(f"[公開] {sel} クリック成功")
                    break
                except:
                    continue

            await page.wait_for_timeout(5000)
            url = page.url
            print(f"[完了] URL: {url}")

            data["status"] = "published"
            data["note_url"] = url
            with open(latest, "w") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

        except Exception as e:
            print(f"[公開] 失敗: {e}")
            await page.screenshot(path=str(Path.home() / "projects/noyuto/note_publish_error.png"))

        await browser.close()
        print("[完了] 正常終了")

if __name__ == "__main__":
    asyncio.run(post_to_note())
