# セッションログ: 2026-04-18 絆求人素材の退避先確保

- 担当: サム
- ブランチ: main

## 作業内容

NOYUTOがメインPCから持ち寄ったGoogleドライブ配下の絆求人素材一式を、PUBLICリポジトリ（office-vonds/noyuto）に漏れない安全地帯にコピー配置。

### 元データ
- 場所: `G:\マイドライブ\絆関連\求人\`（Google Drive for Desktop）
- 構成: 167ファイル / 189.89MB
- 拡張子内訳: jpg:73 / png:49 / psd:19 / txt:5 / xlsx:4 / docx:4 / ai:4 / mp4:4 / jpeg:3 / pdf:2
- サブフォルダ: motto / EX2018 / 面接用写真 / 爆さい用 / 出稼ぎブログ記事一覧 / リンクグループ / バナーリンク / アイキャッチ画像動物 / 求人 / 接客マニュアル

### 退避先（確定）
- Windows側: `C:\Users\ozawa\vonds-assets\kizuna-recruit-source\`
- WSLアクセス: `~/vonds-assets/kizuna-recruit-source`（symlink）
- **projects/vonds 外に配置** → git管理対象外・PUBLIC漏洩ゼロ

### 実行コマンド
```powershell
robocopy "G:\マイドライブ\絆関連\求人" "C:\Users\ozawa\vonds-assets\kizuna-recruit-source" /E /COPY:DAT /R:2 /W:5 /NFL /NDL /NP
```
結果: Files 167/167 / Bytes 189.89MB / FAILED 0 / 所要2分14秒

```bash
mkdir -p ~/vonds-assets
ln -sfn /mnt/c/Users/ozawa/vonds-assets/kizuna-recruit-source ~/vonds-assets/kizuna-recruit-source
```

## この配置にした理由

1. `office-vonds/noyuto` は **PUBLIC** リポジトリ
2. 素材に実店舗名・実キャスト名入りファイル多数（CLAUDE.mdルール7直撃）
3. .psd / .ai などの編集原本もあり一級品・流出厳禁
4. 190MB規模でgit管理は肥大化リスク大

## 運用ルール（以後遵守）

- 原本は `~/vonds-assets/kizuna-recruit-source/` から**移動させない**
- 求人系ブログ投稿（バニラ / ガールズヘブン / 絆JOB）で使う場合:
  1. 必要ファイルだけ `scripts/images/kizuna/` にコピー
  2. 実名・店舗名を含むものは加工・匿名化してから
  3. 加工済み版のみgit push対象
- Googleドライブ側は**残したまま**（バックアップ兼用）
- 別PC側で同素材が必要になったら同じ robocopy 手順を踏む（G: が見えていれば）

## 現在の状態
完了

## 次にやること
- NOYUTO判断待ち: この素材のうち、どれを求人系ブログに流すか / どれを加工必須とするか
- バナナ or KIRYU と分担整理（素材選定は商売判断領域）

## 関連ファイル
- `state/sam-automation.md`（求人パイプライン系統表を更新）
- `~/vonds-assets/kizuna-recruit-source/`（素材本体・git外）
