# STATE.md — プロジェクト現在地（単一の真実）

最終更新: 2026-04-15 11:45 / 更新者: KIRYU

> 起動時にこのファイルだけ読めば全体像がわかる。
> 詳細は各 `state/*.md` を参照。完了済みはここに載せない。

---

## アクティブ

| # | プロジェクト | 状態 | ボール | 次のアクション | 詳細 |
|---|-------------|------|--------|---------------|------|
| 1 | A-TRUCK SEO | **本番稼働中（4/15デプロイ完了）** | KIRYU | 残タスク: GTM統合・title修正・鈑金コンテンツ | [state/atruck-seo.md](state/atruck-seo.md) |
| 2 | VONDS広告監査 | CSV未取得 | NOYUTO | ストレッチゼロCSV 7本DL（会社PC） | [state/vonds-ads-audit.md](state/vonds-ads-audit.md) |
| 3 | UNRYUTO Phase 0 | サイト構築済・外部連携待ち | NOYUTO | DNS確認 / Stripe開設 / X API鍵発行 | [state/unryuto.md](state/unryuto.md) |
| 4 | VONDS SEO | Crawled→Indexed遷移待ち | Google | GSCでインデックス状態確認 | [state/vonds-seo.md](state/vonds-seo.md) |
| 5 | 絆JOB SEO | **Phase2完了（meta/canonical/OGP/記事8本）** | NOYUTO | GSCで6URL手動インデックス登録（15分） | [session-logs/2026-04-15_1140_kizuna-seo-phase2.md](session-logs/2026-04-15_1140_kizuna-seo-phase2.md) |

## 観測中

| # | プロジェクト | 状態 | 次の確認 | 詳細 |
|---|-------------|------|---------|------|
| 6 | ILゲーム v5 | 本番稼働中（Netlify） | Firestoreログ100件で月次レビュー | [state/il-game.md](state/il-game.md) |
| 7 | 本気ストレッチ | スマホ修正完了・メール未テスト | メール実機テスト送信 | [state/majistretch.md](state/majistretch.md) |

## 保留

| # | プロジェクト | 理由 | 再開条件 |
|---|-------------|------|---------|
| 8 | VONDS決算・補助金 | 資金繰り優先 | 税理士¥600,600支払い後 |
| 9 | 資金繰り対策 | レオ引継ぎ済 | レオが三井住友カード枠確認後 |
| 10 | なみAI画像 | ラップトップ確認待ち | topless系の生成ルート特定 |
| 11 | ILゲーム事業分析 | NOYUTO口頭待ち | 5つの質問への回答 |
| 12 | 情報共有最適化 | Phase 2実行中（今） | STATE.md完成で完了 |

---

## 運用ルール

- **更新タイミング**: 各エージェントは作業完了時にSTATE.mdの該当行を更新する
- **完了プロジェクト**: この一覧から削除。履歴はsession-logs/に残る
- **300行ハードキャップ**: 超えたら完了・保留を整理して圧縮
- **詳細が必要な時**: `state/*.md` を読む。STATE.mdには書かない
