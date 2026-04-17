# STATE.md — プロジェクト現在地（単一の真実）

最終更新: 2026-04-17 21:50 / 更新者: KIRYU

> 起動時にこのファイルだけ読めば全体像がわかる。
> 詳細は各 `state/*.md` を参照。完了済みはここに載せない。

---

## アクティブ

| # | プロジェクト | 状態 | ボール | 次のアクション | 詳細 |
|---|-------------|------|--------|---------------|------|
| 1 | A-TRUCK SEO | **鈑金コンテンツ作成済(210行)/デプロイ待ち** | サム | GTM統合/title修正/鈑金デプロイ → [tasks/sam-queue.md](tasks/sam-queue.md) | [state/atruck-seo.md](state/atruck-seo.md) |
| 2 | VONDS広告監査 | CSV未取得 | NOYUTO | ストレッチゼロCSV 7本DL（会社PC）→ バナナへ引継ぎ | [state/vonds-ads-audit.md](state/vonds-ads-audit.md) |
| 2b | SANKEN Google広告（買取/ストレッチ×2 + A-TRUCK） | **バナナ担当固定** / ストレッチゼロKW追加11本＋除外11本作成済 / 本気ST CVタグ指示書作成済 | NOYUTO→サム | NOYUTO:KW投入＋CVアクション4本作成→サム:GTMタグ実装 | [state/sanken-ads.md](state/sanken-ads.md) |
| 3 | UNRYUTO Phase 0 | サイト構築済・外部連携待ち | NOYUTO | DNS確認 / Stripe開設 / X API鍵発行 | [state/unryuto.md](state/unryuto.md) |
| 4 | VONDS SEO | Crawled→Indexed遷移待ち | Google | GSCでインデックス状態確認 | [state/vonds-seo.md](state/vonds-seo.md) |
| 5 | 絆JOB SEO | **Phase2完了（meta/canonical/OGP/記事8本）** | NOYUTO | GSCで6URL手動インデックス登録（15分） | [session-logs/2026-04-15_1140_kizuna-seo-phase2.md](session-logs/2026-04-15_1140_kizuna-seo-phase2.md) |
| 6 | 絆バニラ最適化 | **6/7ページ更新完了** | NOYUTO | 画像素材提供→空き枠追加 / 口コミ返信手動投稿 | [session-logs/2026-04-15_1840_vanilla-optimize.md](session-logs/2026-04-15_1840_vanilla-optimize.md) |
| 7 | 自動投稿パイプライン統合運用（dto/vanilla/ガールズヘブン/絆JOB） | **サム担当固定（2026-04-17）** | サム | cron棚卸し・認証切れ検知統一・画像プール可視化 | [state/sam-automation.md](state/sam-automation.md) |
| 8 | VONDS広告運用MCC・Google Ads API統合基盤 | **NOYUTO構築完了(4/17)・Basic Access申請中** | バナナ | Token即リセット→Notion機密DB保管→GCP→OAuth実装 | [memory/project_vonds_ads_mcc.md](../.claude/projects/-home-ozawakiryu0902-projects-vonds/memory/project_vonds_ads_mcc.md) |
| 9 | @rina_xxxfree 凍結事故復旧 | **復旧パイプライン稼働中(4/17)** / 1記事投稿成功(Post 431) / 残37本→8記事分 | KIRYU+cron | Appeal文面提出(NOYUTO1分) + cron稼働(10:00/日) | [tasks/rina-ban-recovery.md](tasks/rina-ban-recovery.md) |

## 観測中

| # | プロジェクト | 状態 | 次の確認 | 詳細 |
|---|-------------|------|---------|------|
| 7 | ILゲーム v5 | 本番稼働中（Netlify） | Firestoreログ100件で月次レビュー | [state/il-game.md](state/il-game.md) |
| 8 | 本気ストレッチ | スマホ修正完了・メール未テスト・**Google広告CVタグ実装待ち**・適格性確認プログラム進行中 | メール実機テスト送信 / CVタグ実装 / 代理店書類 / 中込氏クライアント書類待ち | [state/majistretch.md](state/majistretch.md) |
| 10 | 4/23(木)13:00 Kayoko Ando氏MTG | Google Ads API Basic Access審査期間 | NOYUTO+KIRYU | 質問項目準備・前日リマインダー | [memory/project_vonds_ads_mcc.md](../.claude/projects/-home-ozawakiryu0902-projects-vonds/memory/project_vonds_ads_mcc.md) |

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
