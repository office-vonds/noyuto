# STATE.md — プロジェクト現在地（単一の真実）

最終更新: 2026-04-19 02:25 / 更新者: KIRYU（ストレッチゼロLPアニメ追加+監修者カード刷新）

> 起動時にこのファイルだけ読めば全体像がわかる。
> 詳細は各 `state/*.md` を参照。完了済みはここに載せない。

---

## アクティブ

| # | プロジェクト | 状態 | ボール | 次のアクション | 詳細 |
|---|-------------|------|--------|---------------|------|
| 1 | A-TRUCK SEO | **鈑金承認待ち+Phase次施策承認メール完成(4/19)+GTM統合指示書拡充済(4/19)** | NOYUTO→サム | NOYUTO:Phase次施策メール送付/GTM A-6(SA付与)/承認受領後サム即実装 → [tasks/sam-queue.md](tasks/sam-queue.md) | [state/atruck-seo.md](state/atruck-seo.md) |
| 2 | VONDS広告監査 | CSV未取得 | NOYUTO | ストレッチゼロCSV 7本DL（会社PC）→ バナナへ引継ぎ | [state/vonds-ads-audit.md](state/vonds-ads-audit.md) |
| 2b | SANKEN Google広告（買取/ストレッチ×2 + A-TRUCK） | **バナナ担当固定** / ストレッチゼロKW追加11本＋除外11本作成済 / 本気ST CVタグ指示書作成済 | NOYUTO→サム | NOYUTO:KW投入＋CVアクション4本作成→サム:GTMタグ実装 | [state/sanken-ads.md](state/sanken-ads.md) |
| 3 | UNRYUTO Phase 0 | サイト構築済・外部連携待ち | NOYUTO | DNS確認 / Stripe開設 / X API鍵発行 | [state/unryuto.md](state/unryuto.md) |
| 4 | VONDS SEO | **権威ページ→コラム文脈リンク実装済(4/17 23:40)・11本中8本Unknown/Discovered** | Google→NOYUTO | 2週間観測→全SEO修正完了後に8URL手動インデックス登録 | [state/vonds-seo.md](state/vonds-seo.md) |
| 5 | 絆JOB SEO | **Phase2完了（meta/canonical/OGP/記事8本）** | NOYUTO | GSCで6URL手動インデックス登録（15分） | [session-logs/2026-04-15_1140_kizuna-seo-phase2.md](session-logs/2026-04-15_1140_kizuna-seo-phase2.md) |
| 6 | 絆バニラ最適化 | **6/7ページ更新完了** | NOYUTO | 画像素材提供→空き枠追加 / 口コミ返信手動投稿 | [session-logs/2026-04-15_1840_vanilla-optimize.md](session-logs/2026-04-15_1840_vanilla-optimize.md) |
| 7 | 自動投稿パイプライン統合運用（dto/vanilla/ガールズヘブン/絆JOB） | **サム担当固定（2026-04-17）** | サム | cron棚卸し・認証切れ検知統一・画像プール可視化 | [state/sam-automation.md](state/sam-automation.md) |
| 8 | VONDS広告運用MCC・Google Ads API統合基盤 | **API実装雛形整備完了(4/17 12:45)・Basic Access申請中** | NOYUTO | Token即リセット→GCP OAuth発行→`~/credentials/google-ads.yaml`配置→auth_setup.py実行 | [state/sanken-ads.md](state/sanken-ads.md) + `scripts/vonds-ads-api/` |
| 9 | @rina_xxxfree 凍結事故復旧 | **Appeal提出完了(4/17)・返答待ち / ブログ記事化cron稼働中** | X審査(3-14日) | 返答受領後判断 / cron毎朝10:00継続 | [tasks/rina-ban-recovery.md](tasks/rina-ban-recovery.md) |
| 10 | ストレッチゼロ広告LP実装(stretchzero.jp/lp/) | **アニメーション全面追加+監修者カード刷新完了(4/19 02:25・87c2065)・data-sz-reveal 63箇所+ケンバーンズ+カウントアップ+返金シール回転** | NOYUTO | プレビュー確認 → 岸先生実写入手(中込経由) → PC版/FC/サンクス → 中込承認→WPXデプロイ | [state/stretchzero-lp.md](state/stretchzero-lp.md) |
| 11 | noyuto X/NOTE戦略運用 | **🚨X pendingストック0本(次回空振り)・NOTE未投稿・Tweet ID unknownバグ(debug log追加済)** | KIRYU+サム | X新スレッド5-7本即補充・NOTE cron手動発火テスト・Gmail App Password再発行でdigest送信復旧 | [state/noyuto-media.md](state/noyuto-media.md) |

## 観測中

| # | プロジェクト | 状態 | 次の確認 | 詳細 |
|---|-------------|------|---------|------|
| 7 | ILゲーム v5 | 本番稼働中（Netlify）・**IL2025理論で教育資料刷新(4/17)** | Firestoreログ100件で月次レビュー / 刷新済み資料のオーナー営業活用 | [state/il-game.md](state/il-game.md) |
| 8 | 本気ストレッチ | スマホ修正完了・メール未テスト・**Google広告CVタグ実装待ち**・適格性確認プログラム進行中 | メール実機テスト送信 / CVタグ実装 / 代理店書類 / 中込氏クライアント書類待ち | [state/majistretch.md](state/majistretch.md) |
| 10 | 4/23(木)13:00 Kayoko Ando氏MTG | **質問項目完成版作成済(4/19)・30分進行シナリオ完備** | NOYUTO+KIRYU | 4/22までに Token リセット + Basic Access確認 / 4/22 20:00 KIRYU前日リマインダー | [scripts/vonds-ads-api/mtg_0423_notes.md](scripts/vonds-ads-api/mtg_0423_notes.md) |

## 保留

| # | プロジェクト | 理由 | 再開条件 |
|---|-------------|------|---------|
| 8 | VONDS決算・補助金 | 資金繰り優先 | 税理士¥600,600支払い後 |
| 9 | 資金繰り対策 | レオ引継ぎ済 | レオが三井住友カード枠確認後 |
| 10 | なみAI画像 | ラップトップ確認待ち | topless系の生成ルート特定 |
| 11 | ILゲーム事業分析 | NOYUTO口頭待ち | 5つの質問への回答 |
| ~~12~~ | ~~情報共有最適化~~ | ~~完了（2026-04-17: Notion役割分担表・tasks/配備・3エージェント作業キュー）~~ | - |

---

## 運用ルール

- **更新タイミング**: 各エージェントは作業完了時にSTATE.mdの該当行を更新する
- **完了プロジェクト**: この一覧から削除。履歴はsession-logs/に残る
- **300行ハードキャップ**: 超えたら完了・保留を整理して圧縮
- **詳細が必要な時**: `state/*.md` を読む。STATE.mdには書かない
