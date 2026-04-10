# Google広告監査 74チェック項目 日本語対訳版

**出典**: `claude-ads` skill v2026.02 / `references/google-audit.md`
**用途**: 英語版 SKILL.md の内容を日本語クライアント向けに説明する際の参照資料
**運用**: 監査レポート作成時、各チェック項目の日本語説明として引用する

---

## 配点重み

| カテゴリ | 配点 | チェック数 |
|----------|-----|-----------|
| コンバージョン計測 | 25% | 11項目 |
| 無駄遣い対策・除外KW | 20% | 8項目 |
| アカウント構造 | 15% | 12項目 |
| キーワード・品質スコア | 15% | 8項目 |
| 広告・アセット | 15% | 17項目 |
| 設定・ターゲティング | 10% | 18項目 |

## 重要度の乗数

| 重要度 | 乗数 | 意味 |
|--------|-----|------|
| Critical(🔴 緊急) | 5.0× | 収益・データ損失リスク。即座の対応が必要 |
| High(🟠 重要) | 3.0× | 大きなパフォーマンス低下要因。7日以内の対応 |
| Medium(🟡 中) | 1.5× | 最適化の機会。30日以内の対応 |
| Low(⚪ 低) | 0.5× | ベストプラクティス。余裕があれば対応 |

---

## コンバージョン計測(配点25%)

| ID | 英語原文 | 日本語説明 | 重要度 |
|----|---------|-----------|--------|
| G42 | Conversion actions defined | コンバージョンアクションが少なくとも1つ「主要」として定義されているか | 🔴 Critical |
| G43 | Enhanced conversions enabled | 拡張コンバージョンが有効化されているか(計測精度10-15%向上) | 🔴 Critical |
| G44 | Server-side tracking | サーバーサイドGTMまたはGoogle広告APIによるコンバージョンインポートが稼働しているか | 🟠 High |
| G45 | Consent Mode v2 (EU/EEA) | EU/EEA圏向けに同意モードv2(Advanced)が実装されているか | 🔴 Critical |
| G46 | Conversion window | コンバージョン計測期間が販売サイクルに合っているか(EC=7日/B2B=30-90日/リードジェン=30日) | 🟡 Medium |
| G47 | Micro vs macro separation | マクロCV(購入・リード)のみが「主要」に設定されているか(ミクロCVは副次) | 🟠 High |
| G48 | Attribution model | データドリブン アトリビューション(DDA)が選択されているか(ルールベースは2025年9月廃止) | 🟡 Medium |
| G49 | Conversion value | コンバージョン値が動的(EC)または価値ルール(リードジェン)で割り当てられているか | 🟠 High |
| G-CT1 | No duplicate counting | GA4インポートとネイティブタグが同じCVを重複計測していないか | 🔴 Critical |
| G-CT2 | GA4 linked and flowing | GA4プロパティが連携され、データが正常に流れているか | 🟠 High |
| G-CT3 | Google Tag firing | gtag.js または GTM がすべての重要ページで正常発火しているか | 🔴 Critical |

---

## 無駄遣い対策・除外KW(配点20%)

| ID | 英語原文 | 日本語説明 | 重要度 |
|----|---------|-----------|--------|
| G13 | Search term audit recency | 検索語句レビューが過去14日以内に実施されているか | 🔴 Critical |
| G14 | Negative keyword lists exist | テーマ別の除外KWリストが3つ以上あるか(競合・求人・無料・無関係) | 🔴 Critical |
| G15 | Account-level negatives applied | 除外KWリストがアカウントレベルまたは全キャンペーンに適用されているか | 🟠 High |
| G16 | Wasted spend on irrelevant terms | 過去30日で無関係検索語句への支出が全体の5%未満か | 🔴 Critical |
| G17 | Broad match + smart bidding pairing | 部分一致KWが手動CPCで動いていないか(必ずスマート入札とセットで) | 🔴 Critical |
| G18 | Close variant pollution | 完全一致・フレーズ一致が無関係な近似バリエーションを拾っていないか | 🟠 High |
| G19 | Search term visibility | 検索語句の可視化率が60%超か(非表示の検索語句が多すぎないか) | 🟡 Medium |
| G-WS1 | Zero-conversion keywords | 100クリック以上で0CVのキーワードが存在しないか | 🟠 High |

---

## アカウント構造(配点15%)

| ID | 英語原文 | 日本語説明 | 重要度 |
|----|---------|-----------|--------|
| G01 | Campaign naming convention | キャンペーン命名規則が一貫しているか(例: [Brand]_[Type]_[Geo]_[Target]) | 🟡 Medium |
| G02 | Ad group naming convention | 広告グループ命名規則がキャンペーンと一致しているか | 🟡 Medium |
| G03 | Single theme ad groups | 各広告グループが1テーマで10KW以下か(テーマドリフトしていないか) | 🟠 High |
| G04 | Campaign count per objective | 1目的あたりのキャンペーン数が5以下か(分断されすぎていないか) | 🟠 High |
| G05 | Brand vs Non-Brand separation | ブランドKWとノンブランドKWが別キャンペーンになっているか | 🔴 Critical |
| G06 | PMax present for eligible accounts | コンバージョン実績がある場合PMaxが稼働しているか | 🟡 Medium |
| G07 | Search + PMax overlap | 検索ブランドキャンペーンがある場合PMaxでブランド除外されているか | 🟠 High |
| G08 | Budget allocation matches priority | 成果の良いキャンペーンが予算制限を受けていないか | 🟠 High |
| G09 | Daily budget vs spend | 18時前に予算上限到達するキャンペーンがないか | 🟡 Medium |
| G10 | Ad schedule configured | 営業時間がある場合、配信スケジュールが設定されているか | ⚪ Low |
| G11 | Geographic targeting accuracy | ローカルビジネスで「所在または関心」ではなく「所在のみ」が選択されているか | 🟠 High |
| G12 | Network settings | 検索キャンペーンでディスプレイネットワークがOFFか・検索パートナーがON(任意)か | 🟠 High |

---

## キーワード・品質スコア(配点15%)

| ID | 英語原文 | 日本語説明 | 重要度 |
|----|---------|-----------|--------|
| G20 | Average Quality Score | インプレッション加重平均QSが7以上か | 🟠 High |
| G21 | Critical QS keywords | QS3以下のKWが全体の10%未満か | 🔴 Critical |
| G22 | Expected CTR component | 推定CTR「平均を下回る」のKWが20%未満か | 🟠 High |
| G23 | Ad relevance component | 広告関連性「平均を下回る」のKWが20%未満か | 🟠 High |
| G24 | Landing page experience | LP経験「平均を下回る」のKWが15%未満か | 🟠 High |
| G25 | Top keyword QS | 支出上位20KWのQSがすべて7以上か | 🟡 Medium |
| G-KW1 | Zero-impression keywords | 30日間インプレッション0のKWがないか | 🟡 Medium |
| G-KW2 | Keyword-to-ad relevance | 広告見出しに主要キーワードのバリエーションが含まれているか | 🟠 High |

---

## 広告・アセット(配点15%)

| ID | 英語原文 | 日本語説明 | 重要度 |
|----|---------|-----------|--------|
| G26 | RSA per ad group | 各広告グループにRSA広告が1本以上(推奨2本以上) | 🟠 High |
| G27 | RSA headline count | RSAごとに見出し8本以上(理想12-15本) | 🟠 High |
| G28 | RSA description count | RSAごとに説明文3本以上(理想4本) | 🟡 Medium |
| G29 | RSA Ad Strength | 全RSAが「良好」または「優良」評価か | 🟠 High |
| G30 | RSA pinning strategy | ピン留めが戦略的か(1-2ポジション、バリエーション2-3本ずつ) | 🟡 Medium |
| G31 | PMax asset group density | アセットグループごとに画像20本以上・ロゴ5本以上・動画5本以上 | 🔴 Critical |
| G32 | PMax video assets | ネイティブ動画が全フォーマット(16:9/1:1/9:16)揃っているか | 🟠 High |
| G33 | PMax asset group count | PMaxキャンペーンごとにアセットグループ2以上(意図別) | 🟡 Medium |
| G34 | PMax final URL expansion | 最終URL拡張が意図的に設定されているか(デフォルトONを見直したか) | 🟠 High |
| G35 | Ad copy relevance to keywords | 広告見出しに主要KWのバリエーションが含まれているか | 🟠 High |
| G-AD1 | Ad freshness | 過去90日以内に新規広告コピーがテストされているか | 🟡 Medium |
| G-AD2 | CTR vs industry benchmark | CTRが業界平均以上か | 🟠 High |
| G-PM1 | Audience signals configured | PMaxでアセットグループごとにオーディエンスシグナル設定済みか | 🟠 High |
| G-PM2 | PMax Ad Strength | PMaxの広告強度が「良好」または「優良」か | 🟠 High |
| G-PM3 | Brand cannibalization | PMax CVのうちブランド由来が15%未満か | 🟠 High |
| G-PM4 | Search themes | PMaxでサーチテーマが設定されているか(最大50個) | 🟡 Medium |
| G-PM5 | Negative keywords (PMax) | PMaxでブランド除外+無関係除外KWが適用されているか(最大10,000) | 🟠 High |

---

## 設定・ターゲティング(配点10%)

| ID | 英語原文 | 日本語説明 | 重要度 |
|----|---------|-----------|--------|
| G36 | Smart bidding strategy active | 月15CV以上のキャンペーンでスマート入札が使われているか | 🟠 High |
| G37 | Target CPA/ROAS reasonableness | 目標CPA/ROASが過去実績の±20%以内か | 🔴 Critical |
| G38 | Learning phase status | 「学習中」または「学習制限」のキャンペーンが25%未満か | 🟠 High |
| G39 | Budget constrained campaigns | 高パフォーマンスキャンペーンが予算制限を受けていないか | 🟠 High |
| G40 | Manual CPC justification | 手動CPCは月CV15件未満のキャンペーンのみか | 🟡 Medium |
| G41 | Portfolio bid strategies | 低ボリュームキャンペーンがポートフォリオにまとめられているか | 🟡 Medium |
| G50 | Sitelink extensions | キャンペーンごとにサイトリンク拡張が4本以上あるか | 🟠 High |
| G51 | Callout extensions | キャンペーンごとにコールアウト拡張が4本以上あるか | 🟡 Medium |
| G52 | Structured snippets | 構造化スニペット拡張が1セット以上あるか | 🟡 Medium |
| G53 | Image extensions | 画像拡張が検索キャンペーンで有効か | 🟡 Medium |
| G54 | Call extensions (if applicable) | 電話ビジネスの場合、電話拡張+通話トラッキングがあるか | 🟡 Medium |
| G55 | Lead form extensions | リードジェンアカウントでリードフォーム拡張がテストされているか | ⚪ Low |
| G56 | Audience segments applied | リマケ+インマーケットオーディエンスが観察モードで適用されているか | 🟠 High |
| G57 | Customer Match lists | カスタマーマッチリストが30日以内に更新されているか | 🟠 High |
| G58 | Placement exclusions | アカウントレベルで配置先除外(ゲーム・アプリ・MFAサイト)があるか | 🟠 High |
| G59 | Landing page mobile speed | モバイルLCPが2.5秒未満か(理想2.0秒未満) | 🟠 High |
| G60 | Landing page relevance | LPのH1/タイトルが広告グループのテーマと一致しているか | 🟠 High |
| G61 | Landing page schema markup | Product/FAQ/Service等のスキーママークアップが設定されているか | 🟡 Medium |

---

## クイックウィン一覧(15分以内で実装可能)

監査で指摘された Critical/High 項目のうち、15分以内で対応できるものは「クイックウィン」としてレポートの目立つ位置に掲載する。

| チェックID | クイックウィン内容 | 所要時間 | 効果 |
|-----------|------------------|---------|------|
| G43 | 拡張コンバージョンを Google広告のコンバージョン設定で有効化 | 5分 | 計測精度+10〜15% |
| G11 | 位置情報ターゲティングを「所在のみ」に変更 | 2分 | エリア外クリック削減 |
| G14 | 除外KWリスト(競合・求人・無料)を新規作成 | 10分 | 無駄クリック即日削減 |
| G17 | 部分一致+手動CPCをスマート入札または完全一致に変更 | 5分 | 無関係流入の削減 |
| G12 | 検索キャンペーンでディスプレイネットワークをOFF | 2分 | 質の低いクリック削減 |
| G05 | ブランドKWを別キャンペーンに分離 | 10分 | 入札・ターゲティング最適化 |
| G50 | サイトリンク拡張を4本以上追加 | 10分 | CTR +0.5〜1.0% |

---

## 参考:業界ベンチマーク(ローカルサービス)

| 指標 | 合格 | 要注意 | 不合格 |
|------|------|-------|--------|
| 品質スコア平均 | ≥7 | 5-6 | ≤4 |
| 無駄遣い率 | <5% | 5-15% | >15% |
| RSA広告強度 | 良好/優良 | 平均 | 不良 |
| 検索語句可視化率 | >60% | 40-60% | <40% |
| 学習制限率 | <25% | 25-40% | >40% |
| モバイルLCP | <2.5s | 2.5-4.0s | >4.0s |

---

## 参考:業界ベンチマーク(ヘルスケア)

| 指標 | ヘルスケア平均 | ストレッチ/整体 |
|------|---------------|---------------|
| Google CPC | $10-$40+ | ¥200-¥800 |
| CTR | 4.90% | 5.0-6.5% |
| CVR | 3.10% | 4.0-7.0% |
| 新規患者獲得単価 | $100-$500 | ¥3,000-¥12,000 |
| 患者LTV | $1,000-$10,000+ | ¥20,000-¥150,000 |

---

## 使い方

1. 監査実行後、`audit-google` エージェントが出力する英語レポートを受け取る
2. 本ファイルで日本語対訳を参照しつつ、`audit-report-template.md` に流し込む
3. NOYUTOの所見(22年の経験値)を Executive Summary に追加
4. PDF化して納品

---

**最終更新**: 2026-04-10
**参照元**: `~/.claude/skills/ads/references/google-audit.md`
**免責**: 本対訳は claude-ads v2026.02 時点。今後のバージョンアップで項目が追加・変更される可能性あり
