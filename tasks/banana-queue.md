# バナナ作業キュー

最終更新: 2026-04-17 12:30 / 発注者: KIRYU

> バナナが即起動して上から順に片付ける作業キュー。
> CSV到着前でもできる「前倒し準備」を最優先。

---

## P0 (最優先) Google Ads API統合基盤 実装（NOYUTO構築完了→バナナ実装フェーズ）

### 0-A. Developer Token リセット → Notion機密DB保管（承認到着前に即実施可能）

**経緯**: 現行Token（文字列はNotion機密DB参照）がチャット内で露出 → セキュリティ観点で即リセット必須
**手順**:
1. Google Ads UI → MCC (709-306-3546) → 管理者 → API Center
2. Developer Token欄「トークンをリセット」クリック
3. 新Token発行 → **即Notion機密DB（2要素認証必須）保管**
4. 保管スキーマ: MCC ID / Developer Token / OAuth Googleアカ / 配下アカウント / 発行日 / リセット履歴 / アクセスレベル / 権限

### 0-B. Google Cloud プロジェクト作成 + OAuth 2.0

1. Cloud プロジェクト新規作成（案: `vonds-ads-api`）
2. Google Ads API を有効化
3. OAuth同意画面: **Internal** が望ましい
4. OAuth 2.0 Client ID / Client Secret 発行（.envに・.gitignore必須）
5. Refresh Token取得フロー構築（初回手動認証→以降自動更新）

### 0-C. Python 3.11 + google-ads SDK v24 ベース実装

- 想定APIコール量: 約500/日（上限15,000の3.3%）
- メソッド:
  - `GoogleAdsService.SearchStream` (GAQL Read)
  - `CustomerService.ListAccessibleCustomers`
  - `CampaignService.GetCampaign`
  - `KeywordPlanIdeaService`
  - `CampaignBudgetService.MutateCampaignBudgets` (Write・承認フロー経由)
  - `AdGroupCriterionService.MutateAdGroupCriteria` (Write・同上)
  - `RecommendationService.ApplyRecommendation`

### 0-D. 4/23 (木) 13:00 Kayoko Ando氏 MTG 準備

- 質問項目準備: Basic Access承認状況・適格性確認代理店書類要件・Standard Access昇格条件・Performance Max BP・業界ベンチマーク
- バナナ出席 or KIRYU出席（NOYUTO判断）

詳細仕様: `memory/project_vonds_ads_mcc.md`

---

## P0（CSV到着前にできること）

### 1. ストレッチゼロ×本気ストレッチ 除外KW実装チェック

- [ ] 本気ストレッチ側のGoogle Ads で除外KW設定状況を確認
  - 除外されているべき: ストレッチゼロ / 南アルプス / 韮崎 / 上石田 / 体験コース
- [ ] ストレッチゼロ側で除外すべき: 本気ストレッチ / 改善プログラム / 可動域 / 返金保証 / 精密姿勢診断 / 深層筋
- [ ] 未実装分があれば実装
- [ ] 参照: `memory/project_ads_keyword_separation.md`

**何故今か**: 棲み分け方針は2026-04-06策定済だが、実装チェック未完了。カニバリ継続中なら広告費の無駄。

---

### 2. A-TRUCK 月次レポート自動生成フォーマット確定

- [ ] A-TRUCKクライアント向け月次レポートの項目定義
- [ ] Google Ads + GA4 + GSC の3データソースから自動集計するためのテンプレを整える
- [ ] `tasks/` または `ads-audit/templates/` 配下に `monthly-report-template.md` として配置
- [ ] 次月レポート配信からこのテンプレで出せる状態にする

---

### 3. 買取コンシェルジュ CV計測棚卸し

- [ ] GTM内のCVタグを列挙 → 重複・欠損チェック
- [ ] 電話CV / LINE CV / フォームCV が全部取れてるか
- [ ] 取れてないCVがあればサムに実装発注（サム向け発注書は `tasks/sam-queue.md` に追記）

---

## P1（CSV到着後）

### 4. ストレッチゼロ 74チェック監査実行

- [ ] `ads-audit/samples/stretchzero/data/` にCSV7本着弾を検知
- [ ] 74チェック走査（英語出力）
- [ ] 日本語化 → `ads-audit/templates/audit-report-template.md` に流し込み
- [ ] NOYUTO所見欄は空欄で仕上げ → NOYUTO記入依頼
- [ ] PDF化 → commit+push
- [ ] 既存客向け提案書（`ads-audit/templates/proposal-existing-client.md`）をストレッチゼロ用に差し込み生成

---

## P2（並行で回す）

### 5. noyutoブランド SNS PDCA（従来業務）

- [ ] X/NOTE直近7日投稿分析
- [ ] `theme_weights.json` の重み見直し
- [ ] 前回PDCA改善の実施状況確認

---

## バナナへのルール

- 広告タグ実装が必要になったらサムに発注（GTM実装は越権）
- 契約・法務判断が必要になったらNOYUTO/河井にエスカレーション
- 財務判断はレオ
- レポートは **CPC / CV / CPA / CTR** の4指標を必ず揃える
