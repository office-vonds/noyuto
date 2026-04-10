# ラップトップ側 → メインPC 画像同期指示

**作成日**: 2026-04-10
**対象**: ラップトップ（ozawakiryu0902@NOYUTO2023）
**目的**: ラップトップで生成した `topless_*` / `bizho_*` / `busty_*` / `curvy_*` / `home_*` / `legs_*` / `bust_*` 系AI画像をgit経由でメインPCに流し、一元管理する

---

## 背景

- **2026-04-10セッションで判明**: デリヘルタウン写メ日記用のAI生成画像が2系統に分裂
  - メインPC側（git管理下）: `scripts/ai-generated/` 10枚 + `scripts/ai-generated-sexy/` 44枚 = **計54枚**（全て Lv1〜2前半）
  - ラップトップ側（git未pushの疑い）: `topless_*`/`bizho_*`/`busty_*`/`curvy_*`/`home_*` 系 = **枚数不明・体型バリエーション済み・Lv3到達**
- CLAUDE.md 絶対遵守ルール①③違反（成果物がgit外）

## 決定的な調査目的

メインPC側で検証した結果、`scripts/ai-generate-nami.js` が使う **Pollinations.ai (flux) は Lv2以上を HTTP 500 で拒否する**ことが確定。つまり:

**ラップトップにある `topless_*` 系画像は Pollinations.ai 以外のルートで生成されている。**

そのルート（使用サービス・スクリプト・プロンプト）を特定することが、Lv2-3の本番稼働の鍵。

---

## ラップトップ側でやること（順番通り）

### 1. 現物確認
```bash
cd ~/projects/vonds
find scripts -type f \( -iname 'topless_*' -o -iname 'bizho_*' -o -iname 'busty_*' -o -iname 'curvy_*' -o -iname 'home_bed_*' -o -iname 'home_futon_*' -o -iname 'legs_body*' -o -iname 'bust_*' \) | head -50
ls scripts/ai-generated* 2>/dev/null
# Desktop側も念のため
ls /mnt/c/Users/小沢宗弘/Desktop/ | grep -iE "topless|bizho|busty|curvy|home_bed"
```
→ どのディレクトリに何枚あるか把握する

### 1.5. 生成ルート特定（最重要・Lv2-3移植の鍵）
以下を調査:
```bash
# topless_* を生成したスクリプトを特定
find ~ -type f \( -name "*.js" -o -name "*.py" \) -newer ~/projects/vonds/scripts/ai-generate-images.js 2>/dev/null | xargs grep -l -iE "topless|bizho|nsfw|pollinations|seaart|mage|comfy|stable.?diff" 2>/dev/null
# ブラウザ履歴（Chrome/Edge）から最近使ったAI画像生成サービスを抽出
grep -iE "seaart|mage\.space|perchance|tensor\.art|dezgo|civitai|novelai|comfy" ~/.config/google-chrome/Default/History 2>/dev/null || echo "chrome履歴アクセス不可"
```
判明したら **使用サービス名・プロンプト・ログイン方法** を `session-logs/YYYY-MM-DD_nami-lv3-route.md` に記録し push する。これが無いとメインPC側で Lv2-3 を絶対に再現できない。

### 2. git状況確認
```bash
git status
git log --oneline -10
```
→ 未pushコミットがあるかチェック

### 3. ディレクトリ統合（必須）
- 全AI生成画像は `scripts/ai-generated/nami/` 配下に集約する
- 命名規則: `{scene}_{bodytype}_{level}_{n}.jpg`
- 例: `home_bed_curvy_lv3_01.jpg`

```bash
# 既存ファイルを nami/ に移動（例）
mkdir -p scripts/ai-generated/nami
git mv scripts/path/to/topless_bizho_bath_09_a.jpg scripts/ai-generated/nami/bath_bizho_lv3_09a.jpg
# ... (全ファイル同様に)
```

### 4. commit & push
```bash
git add scripts/ai-generated/nami/
git status
git commit -m "[写メ日記] ラップトップ生成画像をnami/配下に統合・git管理化"
git push origin main
```

### 5. メインPC側に通知
- session-logs/ に `YYYY-MM-DD_HHMM_nami-image-merge.md` を作成
- CLAUDE.md「最新作業サマリー」を更新
- この指示書（`LAPTOP_SYNC_写メ日記画像.md`）を削除（役目終了）

---

## メインPC側で受け取った後のアクション

1. `git pull origin main`
2. `scripts/ai-generated/nami/` の画像を確認
3. 新規生成スクリプト `scripts/ai-generate-nami.js` と命名規則を合わせる
4. 投稿スクリプト `scripts/dto-post-diary.js` / `dto-daily-diary.js` が `nami/` を参照するよう修正

---

## 絶対にやってはいけないこと

- ❌ `rm` で削除してから再生成する（生成物は貴重な資産）
- ❌ Desktop に出力する新しいスクリプトを書く（git外漂流の再発）
- ❌ 「後でやる」と放置する（別PC間の乖離が広がる）
- ❌ `git add -A` で無関係ファイルまで巻き込む

---

## 完了判定

以下が全て満たされた時に完了:
- [ ] `scripts/ai-generated/nami/` に統合済み
- [ ] `git push origin main` 完了
- [ ] メインPC側で `git pull` 成功
- [ ] この指示書を削除
