# SANKEN Google広告プロジェクト

最終更新: 2026-04-17 12:40 / 更新者: KIRYU（バナナ実施）
担当固定: **バナナ君**（NOYUTO指示 / 2026-04-17）

## MCC統合（2026-04-17構築）

- **MCC顧客ID**: `709-306-3546`（VONDS広告運用MCC）
- 配下3クライアント統合済み:
  - `136-371-9642` A-TRUCK
  - `854-911-4235` ストレッチゼロ
  - `681-110-5790` 本気ストレッチ
- Basic Access 申請中（4/17提出・1-3営業日審査）
- 4/23 13:00 Kayoko Ando氏MTG予定

## API実装基盤（2026-04-17整備）

- `scripts/vonds-ads-api/` 作成
  - README.md / requirements.txt（google-ads v24）
  - auth_setup.py（OAuth refresh_token取得）
  - test_connection.py（3クライアント疎通確認）
  - fetch_reports.py（74チェック用CSV一括取得）
  - mtg_0423_notes.md（4/23 MTG質問リスト）
  - .gitignore（秘密情報ブロック）
- 認証情報は `~/credentials/google-ads.yaml` のみ（リポジトリ不在）
- Basic Access承認後に即稼働可能

---

## 引継ぎ範囲（全てバナナ担当）

| # | クライアント | ブランド | URL | 状態 |
|---|------------|---------|-----|------|
| 1 | SANKEN株式会社 | 買取コンシェルジュ | https://kaitori-concierge.net | 稼働中・MCC外（別途判断） |
| 2 | SANKEN株式会社 | ストレッチゼロ | stretchlabo.jp（LP別） | 稼働中・MCC内・CSV未取得 |
| 3 | SANKEN株式会社 | 本気ストレッチ | majistretch.com | 稼働中・MCC内 |
| 4 | A-TRUCK株式会社 | A-TRUCK本体 | - | 月額契約・MCC内 |

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

- [ ] **Developer Token リセット**（最優先・Notionに新Token保管）
- [ ] Google Cloud `vonds-ads-api` プロジェクト作成 → OAuth Client ID発行
- [ ] `~/credentials/google-ads.yaml` 配置 → `auth_setup.py` で refresh_token 取得
- [ ] Basic Access 承認後：`test_connection.py` で3クライアント疎通確認
- [ ] 承認後：`fetch_reports.py --all` で 74チェック用CSV一括取得（CSV手DLは不要化）
- [ ] 4/23 MTG事前準備（`scripts/vonds-ads-api/mtg_0423_notes.md`）
- [ ] 本気ストレッチ×ストレッチゼロの除外KW実装状況確認（API承認後に即検証可）
- [ ] 買取コンシェルジュのMCC統合要否判断（現状MCC外）

## 関連

- SKILL: `.claude/skills/banana/SKILL.md`
- 監査商品: `ads-audit/` 配下（templates/pricing/samples/references）
- KW棲み分け: `memory/project_ads_keyword_separation.md`
- 監査商品化全体: `memory/project_vonds_ads_audit_product.md`
- MCC・API基盤: `memory/project_vonds_ads_mcc.md` + `scripts/vonds-ads-api/`
- 秘密情報ルール: `memory/feedback_secret_handling.md`
- A-TRUCK: `state/atruck-seo.md`
- ストレッチゼロサーバー: `memory/reference_stretchzero_server.md`
- 本気ストレッチサーバー: `memory/reference_majistretch_server.md`
