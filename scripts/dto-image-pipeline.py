#!/usr/bin/env python3
"""
デリヘルタウン写メ日記用 画像バリエーション自動生成パイプライン v2

元写真1枚 → 20+パターンの高品質バリエーションを生成
- 明るさ/色温度/コントラスト/彩度/トリミング/ソフトフォーカス/ビネット/グレイン
- 組み合わせパターンで多彩なバリエーション
- 品質チェック（サイズ/ぼやけ検出）
- 重複排除（perceptual hash）
- 途中再開・進捗表示対応

Usage:
  python dto-image-pipeline.py                     # 全キャスト一括
  python dto-image-pipeline.py --cast しずか        # 1キャスト指定
  python dto-image-pipeline.py --cast しずか --limit 1  # テスト（1枚だけ）
  python dto-image-pipeline.py --resume            # 中断から再開
"""
import os
import sys
import json
import hashlib
import time
import argparse
import random
from pathlib import Path
from datetime import datetime

import numpy as np
import cv2
from PIL import Image, ImageEnhance, ImageFilter

# === パス設定 ===
INPUT_BASE = os.path.expanduser("~/noyuto/scripts/dto-images")
OUTPUT_BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dto-variations")
STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dto-pipeline-state.json")
HASH_DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dto-hash-db.json")

# === 出力仕様 ===
TARGET_W = 640
TARGET_H = 960
MIN_FILE_SIZE_KB = 15
BLUR_THRESHOLD_RATIO = 0.3  # 元画像のblurスコアに対する比率（これ以下なら除外）
PHASH_SIMILARITY_THRESHOLD = 3  # perceptual hashの距離しきい値（これ以下=ほぼ同一で除外）
JPEG_QUALITY = 88

# === キャスト一覧 ===
CAST_LIST = [
    "あやせ", "あんな", "きみ", "けい", "けいか",
    "しずか", "つばき", "なおみ", "なみ", "のの",
    "まき", "まどか", "みき", "ゆりか", "わかな",
]


# ============================================================
# 画像変換関数群
# ============================================================

def adjust_brightness(img, factor):
    """明るさ調整"""
    return ImageEnhance.Brightness(img).enhance(factor)


def adjust_color_temp(img, mode):
    """色温度変更: warm / cool / neutral"""
    r, g, b = img.split()
    if mode == "warm":
        r = r.point(lambda x: min(255, int(x * 1.10)))
        b = b.point(lambda x: int(x * 0.90))
    elif mode == "cool":
        r = r.point(lambda x: int(x * 0.90))
        b = b.point(lambda x: min(255, int(x * 1.10)))
    else:  # neutral - slight desaturation
        return ImageEnhance.Color(img).enhance(0.85)
    return Image.merge("RGB", (r, g, b))


def adjust_contrast(img, factor):
    """コントラスト調整"""
    return ImageEnhance.Contrast(img).enhance(factor)


def adjust_saturation(img, factor):
    """彩度調整"""
    return ImageEnhance.Color(img).enhance(factor)


def crop_variation(img, position):
    """トリミング位置変更（元画像の88%を切り出し → 640x960にリサイズ）"""
    w, h = img.size
    crop_w = int(w * 0.88)
    crop_h = int(h * 0.88)

    positions = {
        "top":    ((w - crop_w) // 2, 0, (w + crop_w) // 2, crop_h),
        "center": ((w - crop_w) // 2, (h - crop_h) // 2, (w + crop_w) // 2, (h + crop_h) // 2),
        "bottom": ((w - crop_w) // 2, h - crop_h, (w + crop_w) // 2, h),
        "left":   (0, (h - crop_h) // 2, crop_w, (h + crop_h) // 2),
        "right":  (w - crop_w, (h - crop_h) // 2, w, (h + crop_h) // 2),
    }
    box = positions.get(position, positions["center"])
    return img.crop(box)


def soft_focus(img, radius):
    """ソフトフォーカス"""
    return img.filter(ImageFilter.GaussianBlur(radius=radius))


def apply_vignette(img):
    """ビネット効果（周辺減光）"""
    arr = np.array(img, dtype=np.float32)
    h, w = arr.shape[:2]
    # ガウシアンカーネルでビネット
    sigma_x = w * 0.45
    sigma_y = h * 0.45
    x = np.arange(w, dtype=np.float32) - w / 2
    y = np.arange(h, dtype=np.float32) - h / 2
    xx, yy = np.meshgrid(x, y)
    kernel = np.exp(-(xx**2 / (2 * sigma_x**2) + yy**2 / (2 * sigma_y**2)))
    kernel = kernel / kernel.max()
    # 最低値を0.3に（暗くなりすぎ防止）
    kernel = 0.3 + 0.7 * kernel
    for c in range(3):
        arr[:, :, c] *= kernel
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def apply_film_grain(img, intensity=15):
    """フィルム調グレイン"""
    arr = np.array(img, dtype=np.int16)
    noise = np.random.normal(0, intensity, arr.shape).astype(np.int16)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


# ============================================================
# パターン定義（20+）
# ============================================================

def get_patterns():
    """全バリエーションパターンを返す"""
    patterns = [
        # 単体加工（14パターン）
        ("bright_hi", lambda i: adjust_brightness(i, 1.18)),
        ("bright_mid", lambda i: adjust_brightness(i, 1.08)),
        ("dark", lambda i: adjust_brightness(i, 0.85)),
        ("warm", lambda i: adjust_color_temp(i, "warm")),
        ("cool", lambda i: adjust_color_temp(i, "cool")),
        ("neutral", lambda i: adjust_color_temp(i, "neutral")),
        ("contrast_hi", lambda i: adjust_contrast(i, 1.25)),
        ("contrast_lo", lambda i: adjust_contrast(i, 0.80)),
        ("sat_hi", lambda i: adjust_saturation(i, 1.25)),
        ("sat_lo", lambda i: adjust_saturation(i, 0.75)),
        ("crop_top", lambda i: crop_variation(i, "top")),
        ("crop_bottom", lambda i: crop_variation(i, "bottom")),
        ("crop_left", lambda i: crop_variation(i, "left")),
        ("crop_right", lambda i: crop_variation(i, "right")),
        ("soft_light", lambda i: soft_focus(i, 0.8)),
        ("soft_heavy", lambda i: soft_focus(i, 1.5)),
        ("vignette", lambda i: apply_vignette(i)),
        ("grain", lambda i: apply_film_grain(i, 12)),
        # 組み合わせ加工（6パターン）
        ("bright_warm", lambda i: adjust_color_temp(adjust_brightness(i, 1.12), "warm")),
        ("bright_cool", lambda i: adjust_color_temp(adjust_brightness(i, 1.10), "cool")),
        ("contrast_crop_top", lambda i: crop_variation(adjust_contrast(i, 1.15), "top")),
        ("contrast_crop_bottom", lambda i: crop_variation(adjust_contrast(i, 1.15), "bottom")),
        ("warm_vignette", lambda i: apply_vignette(adjust_color_temp(i, "warm"))),
        ("grain_bright", lambda i: apply_film_grain(adjust_brightness(i, 1.10), 10)),
    ]
    return patterns


# ============================================================
# 品質チェック
# ============================================================

def compute_blur_score(img):
    """ラプラシアン分散でぼやけ度を計算（高い=シャープ）"""
    arr = np.array(img.convert("L"), dtype=np.uint8)
    laplacian = cv2.Laplacian(arr, cv2.CV_64F)
    return laplacian.var()


def compute_phash(img, hash_size=16):
    """Perceptual Hash（DCTベース）"""
    # リサイズ
    resized = img.convert("L").resize((hash_size + 1, hash_size), Image.LANCZOS)
    arr = np.array(resized, dtype=np.float64)
    # 差分ハッシュ（隣接ピクセル比較）
    diff = arr[:, 1:] > arr[:, :-1]
    # ビット列をhex文字列に
    bits = diff.flatten()
    hash_int = 0
    for bit in bits:
        hash_int = (hash_int << 1) | int(bit)
    return format(hash_int, f"0{hash_size * hash_size // 4}x")


def hamming_distance(hash1, hash2):
    """2つのhex hashのハミング距離"""
    if len(hash1) != len(hash2):
        return 999
    val1 = int(hash1, 16)
    val2 = int(hash2, 16)
    xor = val1 ^ val2
    return bin(xor).count("1")


def resize_to_target(img):
    """640x960にリサイズ（アスペクト比を保持してフィット）"""
    return img.resize((TARGET_W, TARGET_H), Image.LANCZOS)


# ============================================================
# ハッシュDB管理
# ============================================================

def load_hash_db():
    if os.path.exists(HASH_DB_FILE):
        with open(HASH_DB_FILE, "r") as f:
            return json.load(f)
    return {}


def save_hash_db(db):
    with open(HASH_DB_FILE, "w") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)


# ============================================================
# 状態管理（途中再開用）
# ============================================================

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    return {"processed": {}, "last_run": None}


def save_state(state):
    state["last_run"] = datetime.now().isoformat()
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


# ============================================================
# メイン処理
# ============================================================

def get_source_images(cast_name):
    """キャストの元画像一覧を取得（Zone.Identifier等を除外）"""
    cast_dir = os.path.join(INPUT_BASE, cast_name)
    if not os.path.isdir(cast_dir):
        return []
    files = []
    for f in sorted(os.listdir(cast_dir)):
        if not f.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        if "Zone.Identifier" in f:
            continue
        fpath = os.path.join(cast_dir, f)
        if os.path.getsize(fpath) > MIN_FILE_SIZE_KB * 1024:
            files.append(fpath)
    return files


def process_image(src_path, cast_name, img_idx, output_dir, hash_db, patterns):
    """1枚の元画像から全パターンを生成"""
    src_basename = os.path.splitext(os.path.basename(src_path))[0]

    try:
        img = Image.open(src_path).convert("RGB")
    except Exception as e:
        print(f"  [SKIP] 読み込みエラー: {src_path} - {e}")
        return 0, 0

    # 元画像のphash・blurスコア
    src_phash = compute_phash(img)
    src_resized = resize_to_target(img)
    src_blur = compute_blur_score(src_resized)
    blur_min = src_blur * BLUR_THRESHOLD_RATIO  # 元画像基準の動的しきい値

    generated = 0
    skipped = 0

    for suffix, transform in patterns:
        out_filename = f"{cast_name}_{img_idx:04d}_{suffix}.jpg"
        out_path = os.path.join(output_dir, out_filename)

        # 既に生成済みで存在する場合はスキップ
        if os.path.exists(out_path) and os.path.getsize(out_path) > MIN_FILE_SIZE_KB * 1024:
            skipped += 1
            continue

        try:
            result = transform(img)
            result = resize_to_target(result)

            # ぼやけチェック（元画像比で著しく劣化したものを除外）
            blur_score = compute_blur_score(result)
            if blur_score < blur_min:
                skipped += 1
                continue

            # 一時保存してサイズチェック
            result.save(out_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
            file_size = os.path.getsize(out_path)

            if file_size < MIN_FILE_SIZE_KB * 1024:
                os.remove(out_path)
                skipped += 1
                continue

            # perceptual hash 重複チェック
            result_phash = compute_phash(result)
            dist = hamming_distance(src_phash, result_phash)

            if dist < PHASH_SIMILARITY_THRESHOLD:
                os.remove(out_path)
                skipped += 1
                continue

            # ハッシュDB内の既存画像との重複チェック
            file_md5 = hashlib.md5(open(out_path, "rb").read()).hexdigest()
            db_key = f"{cast_name}/{out_filename}"

            if file_md5 in hash_db.get("_md5_index", {}):
                os.remove(out_path)
                skipped += 1
                continue

            # DB記録
            if "_md5_index" not in hash_db:
                hash_db["_md5_index"] = {}
            hash_db[db_key] = {
                "md5": file_md5,
                "phash": result_phash,
                "size": file_size,
                "blur": round(blur_score, 1),
            }
            hash_db["_md5_index"][file_md5] = db_key

            generated += 1

        except Exception as e:
            print(f"    [ERR] {suffix}: {e}")
            if os.path.exists(out_path):
                os.remove(out_path)
            skipped += 1

    return generated, skipped


def process_cast(cast_name, state, hash_db, patterns, limit=None):
    """1キャスト分の処理"""
    src_images = get_source_images(cast_name)
    if not src_images:
        print(f"  元画像なし: {cast_name}")
        return 0, 0

    output_dir = os.path.join(OUTPUT_BASE, cast_name)
    os.makedirs(output_dir, exist_ok=True)

    # 状態から処理済みを取得
    processed_key = cast_name
    processed_set = set(state["processed"].get(processed_key, []))

    total_gen = 0
    total_skip = 0

    images_to_process = src_images
    if limit:
        images_to_process = images_to_process[:limit]

    for idx, src_path in enumerate(images_to_process):
        src_basename = os.path.basename(src_path)

        # 途中再開: 既に処理済みならスキップ
        if src_basename in processed_set:
            continue

        gen, skip = process_image(src_path, cast_name, idx, output_dir, hash_db, patterns)
        total_gen += gen
        total_skip += skip

        # 状態更新
        if processed_key not in state["processed"]:
            state["processed"][processed_key] = []
        state["processed"][processed_key].append(src_basename)

        # 進捗表示
        progress = idx + 1
        total = len(images_to_process)
        print(f"  [{progress}/{total}] {src_basename} -> +{gen} (skip:{skip})")

        # 10枚ごとに状態保存
        if progress % 10 == 0:
            save_state(state)
            save_hash_db(hash_db)

    return total_gen, total_skip


def main():
    parser = argparse.ArgumentParser(description="デリヘルタウン写メ日記 画像バリエーション生成")
    parser.add_argument("--cast", type=str, help="処理するキャスト名（省略時: 全キャスト）")
    parser.add_argument("--limit", type=int, help="キャストあたりの処理枚数制限")
    parser.add_argument("--resume", action="store_true", help="前回の中断から再開")
    parser.add_argument("--reset", action="store_true", help="状態をリセットして最初から")
    parser.add_argument("--stats", action="store_true", help="統計情報のみ表示")
    args = parser.parse_args()

    # 状態読み込み
    if args.reset:
        state = {"processed": {}, "last_run": None}
    else:
        state = load_state()

    hash_db = load_hash_db()
    patterns = get_patterns()

    print(f"=== dto画像パイプライン v2 ===")
    print(f"パターン数: {len(patterns)}")
    print(f"出力サイズ: {TARGET_W}x{TARGET_H}px")
    print(f"最終実行: {state.get('last_run', 'なし')}")
    print()

    # 統計モード
    if args.stats:
        for cast in CAST_LIST:
            src_count = len(get_source_images(cast))
            out_dir = os.path.join(OUTPUT_BASE, cast)
            out_count = len([f for f in os.listdir(out_dir) if f.endswith(".jpg")]) if os.path.isdir(out_dir) else 0
            processed = len(state["processed"].get(cast, []))
            print(f"  {cast}: 元{src_count}枚 / 生成{out_count}枚 / 処理済{processed}枚")
        return

    # 処理対象
    if args.cast:
        cast_list = [args.cast]
    else:
        cast_list = CAST_LIST

    grand_gen = 0
    grand_skip = 0
    start_time = time.time()

    for cast in cast_list:
        src_count = len(get_source_images(cast))
        print(f"[{cast}] 元画像: {src_count}枚")
        gen, skip = process_cast(cast, state, hash_db, patterns, limit=args.limit)
        grand_gen += gen
        grand_skip += skip
        print(f"  完了: +{gen}枚 (skip:{skip})")
        print()

        # キャストごとに状態保存
        save_state(state)
        save_hash_db(hash_db)

    elapsed = time.time() - start_time
    print(f"=== 完了 ===")
    print(f"生成: {grand_gen}枚 / スキップ: {grand_skip}件")
    print(f"所要時間: {elapsed:.1f}秒")
    print(f"出力先: {OUTPUT_BASE}")


if __name__ == "__main__":
    main()
