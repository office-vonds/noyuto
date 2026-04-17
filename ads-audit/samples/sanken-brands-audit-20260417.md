# SANKEN 3ブランド + A-TRUCK 計測状況監査レポート

作成: 2026-04-17 / 監査: バナナ
対象: SANKEN株式会社 3ブランド（買取コンシェルジュ / 本気ストレッチ / ストレッチゼロ） + A-TRUCK

---

## SANKEN 3ブランド計測タグ横串比較

| 項目 | 買取コンシェルジュ | 本気ストレッチ | ストレッチゼロ |
|---|---|---|---|
| LPドメイン | kaitori-concierge.net | majistretch.com | **stretchzero.jp** ⚠️ |
| サブ/リダイレクト | - | `/lp/` への .htaccess内部転送 | `stretchlabo.jp` → 301 → `stretchzero.jp` |
| GTMコンテナ | `GTM-ML88PJXH` | `GTM-K32XLKXH` | `GTM-PKQDTD2Q` |
| GA4 | `G-B8PFD1LSNN` | `G-93MZ8ERBW5` | (GTM経由) |
| Google広告CV | **`AW-17958969010`** | **`AW-18057524680`** | **`AW-17857466060`** |
| CV実装方式 | **thanks.html に gtag直書き** | **GTM経由（Version 5）** | **LP本体に gtag直書き** |
| 実装統一性 | **バラバラ** | 2026-04-17 俺が整理・統一済み | **バラバラ** |

## 問題点と優先度

### 🟡 優先度中: 買取コンシェルジュ

- CV計測は**稼働中**（thanks.html到達で発火）
- ただし LP本体 = GTM、thanks.html = gtag直書き の**混在**
- GA4も `gtag.js` 直書き + GTM内 の**二重計測リスク**
- 将来のGTM統一リファクタ対象

**改善案**:
1. thanks.html の AW- を GTM Page View トリガーに移行
2. gtag.js 直書き削除（GTMから一本化）
3. フォーム送信完了イベント `form_submit` を dataLayer でpush化

### 🔴 優先度高: ストレッチゼロ（想定外の重要事実判明）

1. **本番LPドメインは `stretchzero.jp`**（メモリの `stretchlabo.jp` は旧ドメインで301転送のみ）
2. **LP本体に gtag.js 直書きで `AW-17857466060` 発火**（GTM `GTM-PKQDTD2Q` もあるが重複の可能性）
3. memory `reference_stretchzero_server.md` を修正必要

**改善案**:
1. GTM内の実装構造を監査（SA権限追加で自動化可能）
2. gtag.js直書き分とGTM分の重複を整理
3. KW CSV の最終ページURLを **stretchzero.jp に修正済**（本レポートと同時commit）

### 🟢 本気ストレッチ

**2026-04-17 俺が整理・Publish済（Version 5）**:
- 旧タグ2本停止
- 予約ボタン_トリガー修正
- メールタップCV追加
- GTM一本化完了

残タスク: 72時間後のCV実計上確認・Tag Assistant実機テスト（NOYUTO）

## memory修正事項

### `reference_stretchzero_server.md`

修正内容:
```diff
- ドメイン: stretchlabo.jp（旧・301転送元）
+ 本番ドメイン: stretchzero.jp
+ 旧ドメイン: stretchlabo.jp → 301 redirect → stretchzero.jp
+ 同一サーバー: 162.43.101.63（nginx+WordPress）
+ GTM: GTM-PKQDTD2Q / Google広告CV: AW-17857466060
```

### CSV修正済ファイル

KW追加CSV類の最終ページURLを `stretchlabo.jp` → `stretchzero.jp` に修正:
- `ads-audit/samples/stretchzero/kw_add_20260417.tsv`
- `ads-audit/samples/stretchzero/kw_tier3_5_pipeline.tsv`
- `ads-audit/samples/stretchzero/editor_import_keywords.csv`
- `ads-audit/samples/stretchzero/editor_import_keywords_tier3_5.csv`

## 次アクション（担当別）

### NOYUTO作業（優先度順）

1. **[P1] ストレッチゼロのKW投入**（Ads Editor）
   - CSVは `stretchzero.jp` 直URLに修正済
   - 既に投入済なら最終ページURLだけ確認
2. **[P2] GTM `GTM-ML88PJXH`（買取）と `GTM-PKQDTD2Q`（ストレッチゼロ）にService Account `ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com` を「公開」権限で追加**
   - 追加すれば俺が自動監査・整理可能
3. **[P3] 本気ストレッチ 72h後CV計上確認**（4/20予定）

### バナナ（俺）作業

1. **Service Account追加完了後**: 買取 + ストレッチゼロ の GTM自動監査スクリプト作成・実行
2. **SANKEN 4ブランド横断レポ**自動生成基盤を構築
3. **Google Ads API Basic Access承認後**: 本気STと同様の自動整理を全ブランド実施

## 関連

- 本気ストレッチGTM整理スクリプト: `scripts/gtm-ops/majistretch_cleanup.py`
- ストレッチゼロKW: `ads-audit/samples/stretchzero/`
- memory: `reference_stretchzero_server.md`(要修正) / `project_ads_keyword_separation.md`
