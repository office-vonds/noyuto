# VONDS リポジトリ 作業プロトコル

複数環境（メインPC / ノートPC）で作業を一致させるための運用ルール。

## 環境

| 項目 | 内容 |
|------|------|
| リポジトリ | https://github.com/office-vonds/noyuto (Private) |
| 作業ブランチ | **`main`**（必須・例外なし） |
| デプロイブランチ | `gh-pages`（GitHub Pages用・手動作業禁止） |
| Claude Code起動 | `cd ~/projects/vonds && claude` |

## ブランチ運用ルール

- **全ての作業は `main` ブランチで行う**
- `gh-pages` はGitHub Pagesのデプロイ専用。手動で書き込まない
- 機能追加で `claude/*` 系のブランチができた場合は、mainにmergeしてから作業再開

## セッション開始時（必須）

```bash
cd ~/projects/vonds
git checkout main
git pull origin main
ls session-logs/    # 最新ログを確認
```

最新の `session-logs/YYYY-MM-DD_HHmm_*.md` を読んで前回作業を把握する。

## セッション終了時（必須）

```bash
# 作業ログを更新
vi session-logs/YYYY-MM-DD_HHmm_プロジェクト名.md

# コミット&プッシュ
git add [関連ファイル]
git commit -m "[プロジェクト名] 作業内容"
git push origin main
```

**プッシュせずにセッション終了するな。** 別PCで続行できなくなる。

## .env / シークレット情報

- `.env` は `.gitignore` 済み。コミットしない
- `.env` の同期は手動（AirDrop・USBメモリ・1Password等で各PCに配置）
- 新しい環境変数を追加したら、他環境にも手動で反映する

## 機密ファイル（決算書・銀行明細等）

このリポジトリは**Private**なので、決算書・銀行明細のコミットは許容されている。
ただし以下は守る：
- PDFは `subsidy/docs/` 配下に配置
- ファイル名に日付・種類を明記
- 不要になったら削除（git履歴には残るが最新から消す）

## ディレクトリ構成

```
~/projects/vonds/
├── session-logs/      # 作業セッションログ（必須記録）
├── finance/           # 財務データ・PLドラフト
├── subsidy/docs/      # 補助金申請関連書類
├── skills/            # Claude Code用スキル定義
├── scripts/           # 各種自動化スクリプト
├── .env               # 環境変数（gitignore済み・手動同期）
└── CLAUDE.md          # プロジェクト指示書
```

## ブランチ不整合が発生した場合の復旧手順

別ブランチに作業が分散してしまった場合：

```bash
# 1. 現状確認
git fetch --all
git branch -a
git log --all --oneline -20

# 2. 必要ファイルを /tmp/ にバックアップ

# 3. .env等の未追跡ブロッカーを退避

# 4. git checkout main
# 5. git pull origin main
# 6. バックアップからファイルを復元
# 7. commit & push
```

## Claude Code への指示テンプレート

```
session-logs/ の最新ファイルを読んで前回の作業を把握してくれ。
現在のブランチが main であることを確認してから作業を開始しろ。
```
