#!/usr/bin/env python3
"""
AI画像生成 + 顔トリミング後処理スクリプト
- Pollinations.aiで残り画像を生成
- 全画像に上部25%カットのcroppedバージョンを生成
"""

import os
import time
import urllib.request
import urllib.parse
from PIL import Image

OUTPUT_DIR = "/home/ozawakiryu0902/projects/vonds/scripts/ai-generated"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ========== STEP1: 残り画像を生成 ==========

IMAGES_TO_GENERATE = [
    {
        "name": "selfie_bath_04",
        "prompt": "realistic photo, japanese woman body only, neck to waist, face completely out of frame above, wrapped in fluffy white towel, bathroom, dewy skin, warm soft light, after bath",
        "seed": 4004,
    },
    {
        "name": "selfie_back_06",
        "prompt": "realistic photo, japanese woman from behind, bare shoulders and back, wearing loose white shirt sliding off, bedroom, warm golden hour sunlight, face not visible, artistic",
        "seed": 6006,
    },
    {
        "name": "selfie_sweater_08",
        "prompt": "realistic photo, japanese woman body chin to hip, face above frame, cream oversized knit sweater off one shoulder, sitting on bed, natural window light, cozy intimate",
        "seed": 8008,
    },
    {
        "name": "selfie_morning_10",
        "prompt": "realistic photo, japanese woman lying in bed, body from neck down, face above frame not visible, white tank top, messy sheets, morning sun through curtains, warm natural",
        "seed": 10010,
    },
]

# selfie_red_09 は既に存在するのでスキップ

print("=" * 60)
print("STEP1: Pollinations.ai で画像生成")
print("=" * 60)

for i, img in enumerate(IMAGES_TO_GENERATE):
    filepath = os.path.join(OUTPUT_DIR, f"{img['name']}.jpg")
    if os.path.exists(filepath):
        size = os.path.getsize(filepath)
        if size > 10000:
            print(f"[SKIP] {img['name']}.jpg already exists ({size} bytes)")
            continue

    encoded_prompt = urllib.parse.quote(img["prompt"])
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=640&height=960&seed={img['seed']}&model=flux&nologo=true"

    print(f"\n[{i+1}/{len(IMAGES_TO_GENERATE)}] Generating: {img['name']}")
    print(f"  URL: {url[:100]}...")

    retry_count = 0
    max_retries = 3
    success = False

    while retry_count < max_retries and not success:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=120) as response:
                data = response.read()
                if len(data) < 5000:
                    print(f"  WARNING: Response too small ({len(data)} bytes), retrying...")
                    retry_count += 1
                    time.sleep(10)
                    continue
                with open(filepath, "wb") as f:
                    f.write(data)
                print(f"  OK: {len(data)} bytes saved")
                success = True
        except Exception as e:
            retry_count += 1
            print(f"  ERROR (attempt {retry_count}/{max_retries}): {e}")
            if retry_count < max_retries:
                time.sleep(15)

    if not success:
        print(f"  FAILED: Could not generate {img['name']}")

    # レート制限回避: 30秒待機
    if i < len(IMAGES_TO_GENERATE) - 1:
        print("  Waiting 30s for rate limit...")
        time.sleep(30)

# ========== STEP2: 全画像に顔トリミング処理 ==========

print("\n" + "=" * 60)
print("STEP2: 顔トリミング処理（上部25%カット → 640x960リサイズ）")
print("=" * 60)

all_files = sorted([f for f in os.listdir(OUTPUT_DIR) if f.endswith(".jpg") and "_cropped" not in f])

print(f"\n対象画像: {len(all_files)}枚")

results = {"original": [], "cropped": []}

for fname in all_files:
    filepath = os.path.join(OUTPUT_DIR, fname)
    cropped_name = fname.replace(".jpg", "_cropped.jpg")
    cropped_path = os.path.join(OUTPUT_DIR, cropped_name)

    try:
        img = Image.open(filepath)
        w, h = img.size
        results["original"].append(fname)
        print(f"\n  {fname}: {w}x{h}")

        # 上部25%をカット
        crop_top = int(h * 0.25)
        cropped = img.crop((0, crop_top, w, h))

        # 640x960にリサイズ
        cropped = cropped.resize((640, 960), Image.LANCZOS)
        cropped.save(cropped_path, "JPEG", quality=90)

        results["cropped"].append(cropped_name)
        print(f"  → {cropped_name}: 640x960 saved")

    except Exception as e:
        print(f"  ERROR processing {fname}: {e}")

# ========== 結果レポート ==========

print("\n" + "=" * 60)
print("最終結果")
print("=" * 60)
print(f"\n元画像: {len(results['original'])}枚")
for f in results["original"]:
    size = os.path.getsize(os.path.join(OUTPUT_DIR, f))
    print(f"  - {f} ({size:,} bytes)")

print(f"\nクロップ画像: {len(results['cropped'])}枚")
for f in results["cropped"]:
    size = os.path.getsize(os.path.join(OUTPUT_DIR, f))
    print(f"  - {f} ({size:,} bytes)")

print(f"\n合計: {len(results['original']) + len(results['cropped'])}枚")
print(f"出力先: {OUTPUT_DIR}")
