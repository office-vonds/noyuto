# Design System SKILL

VONDSブランドのデザインシステム管理。  
UI/フロントエンド制作時にDESIGN.mdを参照させる。

---

## いつ使うか

- VONDS自社サイト・LP・ダッシュボードのUI構築時
- クライアント向け提案資料のデザイン参考時
- React / HTML / CSS でUIコンポーネントを作成する時
- 「VONDSっぽく」「ブランドに合わせて」という指示があった時

## 使い方

1. `DESIGN.md` を読み込む（プロジェクトルートまたは `skills/design-system/DESIGN.md`）
2. カラーパレット・タイポグラフィ・コンポーネントスタイルに従ってUI生成
3. Section 9 の Agent Prompt Guide にある定型プロンプトを活用

## クライアント案件での応用

クライアント固有のDESIGN.mdを作る場合:
1. VONDS版を複製
2. Section 2 (Color) と Section 3 (Typography) をクライアントブランドに差替
3. Section 7 (Do's/Don'ts) をクライアント業界に調整
4. `skills/design-system/clients/[client-name]-DESIGN.md` に保存

## 参考デザインシステム

他社のDESIGN.mdを参考にしたい場合:
```bash
# リポジトリ: https://github.com/VoltAgent/awesome-design-md
curl -fsSL "https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/[site]/DESIGN.md" -o reference-DESIGN.md
```

利用可能: stripe / notion / vercel / linear.app / supabase / apple / figma 他30+

## ファイル構成

```
skills/design-system/
├── SKILL.md          ← このファイル
├── DESIGN.md         ← VONDSブランドデザインシステム
└── clients/          ← クライアント別DESIGN.md（必要時に作成）
```
