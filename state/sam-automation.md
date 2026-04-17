# サム自動投稿パイプライン（絆・妃・UNRYUTO系統）

最終更新: 2026-04-17 / 更新者: KIRYU
担当固定: **サム**（NOYUTO指示 / 2026-04-17）

---

## 引継ぎ範囲（全てサム単独担当）

| # | 系統 | 対象媒体 | 主要スクリプト | 事業主体 |
|---|------|---------|---------------|---------|
| 1 | 写メ日記自動 | デリヘルタウン(dto.jp) / 山梨人妻デリヘル妃 | `scripts/dto-*.js` / `dto-image-pipeline.py` | 妃 |
| 2 | バニラ自動投稿 | qzin.jp 店長ブログ | `scripts/vanilla-*.js` | 絆（バニラ出稿店舗） |
| 3 | ガールズヘブン自動投稿 | girlsheaven-job.net 店長ブログ | `scripts/girlsheaven-auto-post.js` | 絆 |
| 4 | 絆JOB（kizuna-job.com） | WordPress / 求人サイト | `scripts/kizuna-job/*` | 絆 |
| 5 | 絆JOB SEO | meta/canonical/OGP/記事生成 | `scripts/kizuna-seo/*` | 絆 |
| 6 | UNRYUTO X自動投稿 | X (Cookie方式) | `scripts/x-cookie-post.js` 系 | UNRYUTO |
| 7 | NOTE記事自動生成 | note.com | `scripts/kizuna-job/x-auto-tweet.js` 等 | UNRYUTO/絆 |

---

## サムの責務

1. **運用継続**: 既存スクリプトのcron/daily実行を止めない
2. **障害対応**: 投稿失敗・認証切れ・画像枯渇を即検知・復旧
3. **改善**: 画像バリエーション追加・文面テンプレ拡張・投稿枠最適化
4. **横展開**: dtoパイプラインを他媒体に流用する技術判断
5. **報告**: 週次で投稿成功率・エンゲージメント・エラーログをKIRYUに上げる

## サムが触らない範囲（越権禁止）

- 事業戦略判断（どの店舗を残すか等）→ NOYUTO
- 法人・税務・契約関連 → NOYUTO/河井
- コンテンツの商売判断（どの客層を狙うか等）→ バナナ/KIRYU

## 認証情報の参照先（memory）

- デリヘルタウン: `reference_deliheal_town.md`
- バニラ: `reference_vanilla.md`
- ガールズヘブン: `reference_girlsheaven.md`
- 絆JOB: `reference_kizunajob_server.md`

## 直近タスク（2026-04-17時点）

- [ ] 各系統の cron 実行状況を棚卸し（どれが生きててどれが死んでるか）
- [ ] 認証切れ検知の共通化（dto/vanilla/ガールズヘブンで別実装になってる）
- [ ] 画像素材プール残数の可視化（dto-variations / vanilla画像）
- [ ] 絆バニラ口コミ返信の半自動化検討（現状NOYUTO手動）

## 関連

- SKILL: `.claude/skills/sam/SKILL.md`
- UNRYUTO全体: `state/unryuto.md`
- 直近絆作業: `session-logs/2026-04-15_1140_kizuna-seo-phase2.md` / `2026-04-15_1840_vanilla-optimize.md`
