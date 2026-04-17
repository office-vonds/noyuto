# SANKEN Google広告プロジェクト

最終更新: 2026-04-17 / 更新者: KIRYU
担当固定: **バナナ君**（NOYUTO指示 / 2026-04-17）

---

## 引継ぎ範囲（全てバナナ担当）

| # | クライアント | ブランド | URL | 状態 |
|---|------------|---------|-----|------|
| 1 | SANKEN株式会社 | 買取コンシェルジュ | https://kaitori-concierge.net | 稼働中 |
| 2 | SANKEN株式会社 | ストレッチゼロ | stretchlabo.jp（LP別） | 稼働中・CSV未取得 |
| 3 | SANKEN株式会社 | 本気ストレッチ | majistretch.com | 稼働中 |
| 4 | A-TRUCK株式会社 | A-TRUCK本体 | - | 月額契約・稼働中 |

## バナナの責務

1. **KW設計・入札戦略**
2. **カニバリ防止**（本気×ゼロの棲み分け厳守 — `memory/project_ads_keyword_separation.md`）
3. **月次レポート作成**
4. **広告監査の実行**（VONDS広告監査商品 `ads-audit/`）
5. **GTM/CV計測の方針決定**（実装はサム）

## 越権禁止

- 技術実装（GTM/タグ/CV計測）→ サム
- 契約・請求・法務 → NOYUTO/河井
- 財務判断 → レオ

## 直近タスク（2026-04-17時点）

- [ ] **ストレッチゼロCSV 7本DL**（会社PC・NOYUTO作業・`ads-audit/samples/stretchzero/data/`）
- [ ] CSV着弾後 → 74チェック監査実行 → レポート納品
- [ ] 本気ストレッチ×ストレッチゼロの除外KW実装状況確認（現状は方針策定のみ）
- [ ] A-TRUCK月次レポート自動生成仕組みの引継ぎ（構築中）
- [ ] 買取コンシェルジュのCV計測現状棚卸し

## 関連

- SKILL: `.claude/skills/banana/SKILL.md`
- 監査商品: `ads-audit/` 配下（templates/pricing/samples/references）
- KW棲み分け: `memory/project_ads_keyword_separation.md`
- 監査商品化全体: `memory/project_vonds_ads_audit_product.md`
- A-TRUCK: `state/atruck-seo.md`
- ストレッチゼロサーバー: `memory/reference_stretchzero_server.md`
- 本気ストレッチサーバー: `memory/reference_majistretch_server.md`
