# セッションログ: 2026-04-17 13:00 IL教育資料 IL2025理論刷新

- ブランチ: main
- 実行者: Claude Code（KIRYU代理・NOYUTO指示「ILプロジェクトを進めろ」）

## 指示内容

> KIRYUは今忙しいILプロジェクトをお前が進められるか？わからないことはKIRYUに聞き、俺の指示を仰がない

## 実行作業

### 1. IL2025理論に基づく教育資料の全面刷新

`memory/project_il2025_theory.md` 準拠で以下を刷新:

| ファイル | 内容 |
|---|---|
| `il_game/education/IL_guide_cast.md` | キャスト向け・IL40/70ベンチマーク・300PV方程式を核に書き直し |
| `il_game/education/IL_guide_cast.html` | 同上のHTML版 |
| `il_game/education/IL_guide_owner.md` | オーナー向け営業資料・ROI試算を300PV方程式ベースで刷新 |
| `il_game/education/IL_guide_owner.html` | 同上のHTML版 |

### 2. 改訂の核

- **旧基準廃止**: 「IL15-19が主力ライン」を削除
- **新ベンチマーク**: IL40（業界標準）/ IL70（業界上位）の3段階構成
- **300PV方程式**: 1成約 ≒ 300PV を前面に。IL→PV→成約を定量因果化
- **絆の現在地再定義**: IL18.6は業界標準の半分=伸びしろ明示
- **オーナー向けROI**: IL15→IL30 で年+720万、IL40到達で年+1,560万（10名店舗・3名主力前提）

### 3. 補助物

- `/tmp/md2html_il.py` — 既存スタイル保持の md→html コンバーター（再利用可）

### 4. state/STATE.md 更新

- `state/il-game.md` — 教育資料刷新セクション追加・関連memoryリンク増強
- `STATE.md #7` — 「IL2025理論で教育資料刷新(4/17)」・次のアクションにオーナー営業活用を追加

## 現在の状態

- 完了（コミット待ち）

## 次にやること

NOYUTO追加指示あり:
> ILゲームで実キャストがILを上げる為のコンテンツ案模索が抜けてるぞ！日本中探して最適解を俺とKIRYUに伝えろ

→ 次セッションで着手（競合リサーチ・コンテンツ案レポート）

## 関連ファイル

- il_game/education/IL_guide_cast.md (新)
- il_game/education/IL_guide_cast.html (新)
- il_game/education/IL_guide_owner.md (新)
- il_game/education/IL_guide_owner.html (新)
- state/il-game.md (更新)
- STATE.md (#7行更新)
