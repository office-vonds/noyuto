# UNRYUTO Phase 0（AI経営パッケージ）

## 現在地（2026-04-15更新）

- **状態**: サイト構築済み・外部連携待ち
- **法人形態**: 個人事業主（屋号: UNRYUTO）※法人化は軌道に乗ってから
- **ドメイン**: unryuto.jp — **DNS完了・サイト表示確認済み（2026-04-16）**
- **SSL**: 発行中（数分〜1時間で完了予定）
- **ホスティング**: Netlify（fancy-bonbon-304f5c / office-vondsチーム / mainブランチ / Publish dir: unryuto）
- **EC**: Stripe確定（3.6%・JPY直接）
- **X**: @un_Ryuto_ai 開設済み

## 構築済み成果物

- サイト: index.html / tokushoho.html / privacy.html / thanks.html
- SEO記事6本（デリヘル開業・求人・売上・1人経営・廃業・法人vs個人）
- 戦略: docs/seo-strategy.md / docs/ec-stripe-plan.md
- X投稿テンプレ10本 / 固定ツイート / プロフィール画像2点

## NOYUTO待ちタスク

1. ~~DNS反映確認~~ → **完了（2026-04-16）**
2. **X自動投稿** — API課金制のためCookie方式に切替。`x-cookie-post.js --setup` でauth_token+ct0を入力（DevToolsから1分）
3. **Stripeアカウント開設**（本人確認・口座登録）
4. ストレッチゼロCSV（ads-audit兼用）

## 収益モデル

- 無料: X/NOTE → 集客
- 買い切り: マニュアル ¥29,800〜¥49,800
- 月額: メンバーシップ ¥9,800〜¥19,800

## 関連

- SKILL.md: .claude/skills/ai-biz-package/SKILL.md
- session-logs/2026-04-13_0300_unryuto-phase0-build.md
