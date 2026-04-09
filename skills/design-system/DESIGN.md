# DESIGN.md — Office VONDS Brand Design System

> SEO・Webマーケティング専門企業。山梨県唯一の全日本SEO協会認定コンサルタント企業。
> 「お客様の成功 = わたしたちの成功」を掲げ、データに基づいた集客戦略を提供。

---

## 1. Visual Theme & Atmosphere

**Design Philosophy:** 信頼と実績を視覚化する「プロフェッショナル・クリーン」。
華美な装飾ではなく、データと結果が主役になるデザイン。SEO会社として
「検索結果で上位に立つ企業」の品格を、自社のビジュアルでも体現する。

**Mood Keywords:** 信頼感 / データドリブン / 結果主義 / 地域密着 / 洗練

**Density:** ミディアム — 余白を活かしつつ、必要な情報は密度高く配置。
コンテンツファーストで、装飾要素は最小限。

**Feel:** 日本のビジネスシーンに馴染む落ち着いたトーン。
テック企業のような冷たさではなく、face-to-faceの温かみを感じさせる。
「この会社に任せれば大丈夫」という安心感が最優先。

---

## 2. Color Palette & Roles

### Primary Colors

| Name | Hex | Role |
|------|-----|------|
| VONDS Navy | `#1B2A4A` | 主要背景、ヘッダー、フッター。信頼と権威を表現 |
| VONDS White | `#FAFBFC` | メイン背景色。清潔感と読みやすさ |
| VONDS Blue | `#2563EB` | プライマリアクション（CTA、リンク、アクセント） |

### Secondary Colors

| Name | Hex | Role |
|------|-----|------|
| Steel Gray | `#64748B` | ボディテキスト（サブ）、キャプション |
| Slate | `#334155` | ボディテキスト（メイン） |
| Light Gray | `#F1F5F9` | カード背景、セクション区切り |
| Border Gray | `#E2E8F0` | ボーダー、ディバイダー |

### Accent Colors

| Name | Hex | Role |
|------|-----|------|
| Success Green | `#059669` | 上位表示達成、成功指標、ポジティブデータ |
| Warm Gold | `#D97706` | 認定バッジ、ハイライト、注意喚起 |
| Alert Red | `#DC2626` | エラー、警告（使用は最小限） |

### Color Usage Rules

- Navy × White のコントラストがブランドの基本構成
- Blue は「次のアクション」を示す唯一の色。乱用しない
- Green はデータ・実績の文脈でのみ使用（「上位表示達成」「+XX%」など）
- Gold は認定・資格・特別な実績の強調に限定
- グラデーションは原則不使用。使う場合は Navy → Blue の微妙な1方向のみ

---

## 3. Typography Rules

### Font Families

| Role | Font | Fallback |
|------|------|----------|
| 見出し（日本語） | Noto Sans JP | sans-serif |
| 見出し（英語） | Inter | system-ui, sans-serif |
| 本文 | Noto Sans JP | sans-serif |
| データ・数値 | Inter | monospace |
| コード | JetBrains Mono | monospace |

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Heading | 48px / 3rem | 700 | 1.2 | -0.02em | `#1B2A4A` |
| Section Heading (h2) | 32px / 2rem | 700 | 1.3 | -0.01em | `#1B2A4A` |
| Sub Heading (h3) | 24px / 1.5rem | 600 | 1.4 | 0 | `#334155` |
| Card Title (h4) | 18px / 1.125rem | 600 | 1.4 | 0 | `#1B2A4A` |
| Body Large | 18px / 1.125rem | 400 | 1.75 | 0.01em | `#334155` |
| Body | 16px / 1rem | 400 | 1.75 | 0.01em | `#334155` |
| Body Small | 14px / 0.875rem | 400 | 1.6 | 0.01em | `#64748B` |
| Caption | 12px / 0.75rem | 400 | 1.5 | 0.02em | `#64748B` |
| Stat Number | 48-72px | 700 | 1.1 | -0.02em | `#2563EB` |

### Typography Rules

- 見出しは常に Noto Sans JP Weight 700。英数字混在時は Inter が自動適用
- 本文の最大行長は 680px（読みやすさの限界）
- 数値・パーセンテージは Inter Weight 700 で表示し、視覚的に強調
- 全角英数字は使用禁止。半角に統一

---

## 4. Component Stylings

### Buttons

**Primary Button:**
```
background: #2563EB
color: #FFFFFF
padding: 12px 24px
border-radius: 8px
font-size: 16px
font-weight: 600
border: none
transition: background 0.2s ease
hover: background #1D4ED8
active: background #1E40AF
```

**Secondary Button:**
```
background: transparent
color: #2563EB
padding: 12px 24px
border-radius: 8px
font-size: 16px
font-weight: 600
border: 1.5px solid #2563EB
hover: background #EFF6FF
```

**Ghost Button:**
```
background: transparent
color: #64748B
padding: 12px 24px
border-radius: 8px
font-size: 14px
font-weight: 500
border: 1px solid #E2E8F0
hover: border-color #2563EB, color #2563EB
```

### Cards

**Standard Card:**
```
background: #FFFFFF
border: 1px solid #E2E8F0
border-radius: 12px
padding: 24px
box-shadow: 0 1px 3px rgba(0,0,0,0.06)
hover: box-shadow 0 4px 12px rgba(0,0,0,0.08), translateY(-2px)
transition: all 0.2s ease
```

**Stats Card (実績カード):**
```
background: #1B2A4A
color: #FFFFFF
border-radius: 12px
padding: 32px
text-align: center
stat-number: 48-72px Inter weight 700 color #60A5FA
stat-label: 14px Noto Sans JP weight 400 color rgba(255,255,255,0.7)
```

**Service Card:**
```
background: #F8FAFC
border: 1px solid #E2E8F0
border-radius: 12px
padding: 32px
border-top: 3px solid #2563EB
icon: 40px color #2563EB
```

### Navigation

```
height: 72px
background: #FFFFFF
border-bottom: 1px solid #E2E8F0
position: sticky, top 0
z-index: 100
backdrop-filter: blur(8px)
background: rgba(255,255,255,0.95)
logo: left-aligned
nav-links: 15px weight 500 color #334155
nav-link-hover: color #2563EB
cta-button: Primary Button style (right-aligned)
mobile-breakpoint: hamburger at 768px
```

### Form Inputs

```
background: #FFFFFF
border: 1.5px solid #E2E8F0
border-radius: 8px
padding: 12px 16px
font-size: 16px
color: #334155
placeholder-color: #94A3B8
focus: border-color #2563EB, box-shadow 0 0 0 3px rgba(37,99,235,0.1)
error: border-color #DC2626
```

---

## 5. Layout Principles

### Spacing Scale (8px base)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | アイコンとテキスト間 |
| sm | 8px | 同一グループ内の要素間 |
| md | 16px | カード内パディング、フォーム要素間 |
| lg | 24px | カード間、セクション内ブロック間 |
| xl | 32px | カードパディング |
| 2xl | 48px | セクション間（モバイル） |
| 3xl | 64px | セクション間（デスクトップ） |
| 4xl | 96px | ヒーローセクション上下パディング |

### Grid System

```
max-width: 1200px
columns: 12
gutter: 24px
margin: auto (centered)
mobile-padding: 16px
tablet-padding: 24px
desktop-padding: 0 (max-width制約)
```

### Common Layouts

- **ヒーロー:** 中央揃え、最大幅 800px、上下 96px パディング
- **2カラム:** 左テキスト(55%) + 右ビジュアル(45%)。モバイルでスタック
- **3カラムグリッド:** サービスカード、実績カードに使用。タブレットで2列、モバイルで1列
- **コンテンツ:** 最大幅 680px、中央揃え（ブログ・記事）

### Whitespace Philosophy

余白は「何もない空間」ではなく「信頼のシグナル」。
詰め込みすぎは安っぽさを生む。特に実績セクションは大胆な余白で
数字を際立たせる。セクション間は最低 64px。

---

## 6. Depth & Elevation

### Shadow System

| Level | Value | Usage |
|-------|-------|-------|
| Level 0 | none | フラット要素、テーブルセル |
| Level 1 | `0 1px 3px rgba(0,0,0,0.06)` | カード（デフォルト） |
| Level 2 | `0 4px 12px rgba(0,0,0,0.08)` | カード（ホバー）、ドロップダウン |
| Level 3 | `0 8px 24px rgba(0,0,0,0.12)` | モーダル、ポップオーバー |

### Surface Hierarchy

1. **最背面:** `#F8FAFC` — ページ全体の背景
2. **中間面:** `#FFFFFF` — カード、コンテンツエリア
3. **前面:** `#FFFFFF` + Level 2 shadow — ホバー中のカード、アクティブ要素
4. **最前面:** `#FFFFFF` + Level 3 shadow — モーダル、通知

### Rules

- シャドウは最大 Level 3 まで。深すぎるドロップシャドウは使わない
- Navy背景セクションではシャドウ不使用。代わりに rgba の透明度で区別
- ボーダーとシャドウの併用は避ける（どちらか一方）

---

## 7. Do's and Don'ts

### Do's ✓

- 実績データ（数字）を大きく、目立たせる
- Navy + White + Blue の3色で8割を構成する
- CTAは1画面に1つ。明確で具体的な文言（「無料相談する」「SEO診断を依頼」）
- 写真は実際のクライアントサイト・データのスクリーンショットを使用
- モバイルファーストで設計。70%以上がスマートフォンユーザー
- 余白を十分に取り、プロフェッショナル感を維持
- 認定バッジ（全日本SEO協会）は目立つ位置に配置

### Don'ts ✗

- ストック写真の多用（特にビジネスマン握手系）
- 派手なグラデーション、ネオン系の色使い
- 過度なアニメーション（パララックス、3D回転など）
- 複数のCTAを同一セクションに詰め込む
- テキストの中央揃え（見出し以外）。本文は左揃え
- 情報を装飾で隠す。データと結果がストレートに見えること
- 角丸の不統一（8px or 12px に統一）
- フォントサイズ 12px 未満の使用（キャプション除く）

---

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 640px | 1列、パディング 16px |
| Tablet | 640-1024px | 2列グリッド、パディング 24px |
| Desktop | > 1024px | 3列グリッド、max-width 1200px |

### Mobile-Specific Rules

- タッチターゲット最小 44px × 44px
- ナビゲーション → ハンバーガーメニュー（768px以下）
- Stats Card → 横スクロールカルーセル or 2列グリッド
- Hero見出し → 32px に縮小（48px → 32px）
- セクション間パディング → 48px に縮小（64px → 48px）
- 電話番号は `tel:` リンクで1タップ発信可能に

### Collapsing Strategy

- 3列 → 2列 → 1列（段階的に）
- サイドバー → 下部に移動（モバイル）
- テーブル → カード形式に変換（モバイル）
- 長い実績リスト → アコーディオンで折りたたみ

---

## 9. Agent Prompt Guide

### Quick Color Reference

```
Primary:    #1B2A4A (navy)    #2563EB (blue)    #FAFBFC (white)
Text:       #334155 (main)    #64748B (sub)
Surface:    #F8FAFC (bg)      #F1F5F9 (card-bg)  #FFFFFF (card)
Border:     #E2E8F0
Accent:     #059669 (success) #D97706 (gold)     #DC2626 (error)
```

### Ready-to-Use Prompts

**ヒーローセクション:**
「VONDS Navy (#1B2A4A) 背景に白テキストのヒーローセクション。見出し 48px Noto Sans JP weight 700、サブテキスト 18px weight 400 rgba(255,255,255,0.8)。CTAボタンは Blue (#2563EB) 背景、白テキスト、border-radius 8px、padding 16px 32px。」

**実績セクション:**
「白背景に3列のStats Card。各カードは Navy (#1B2A4A) 背景、中央揃え。数字は 60px Inter weight 700 color #60A5FA、ラベルは 14px Noto Sans JP color rgba(255,255,255,0.7)。カード間ギャップ 24px。」

**サービスカード:**
「Light Gray (#F8FAFC) 背景セクションに3列のサービスカード。各カードは白背景、border 1px solid #E2E8F0、border-radius 12px、border-top 3px solid #2563EB。アイコン 40px Blue、タイトル 18px weight 600 Navy、説明 16px weight 400 Slate。」

**お問い合わせフォーム:**
「白背景にフォーム。max-width 560px 中央揃え。入力フィールド: border 1.5px solid #E2E8F0、border-radius 8px、padding 12px 16px。focus時 border-color #2563EB。送信ボタン: Primary Button スタイル、全幅。」

**ナビゲーションバー:**
「sticky、高さ 72px、白背景 rgba(255,255,255,0.95) + backdrop-filter blur(8px)。border-bottom 1px solid #E2E8F0。ロゴ左、ナビリンク中央 15px weight 500 #334155、CTAボタン右。768px以下でハンバーガーメニュー。」

---

## Usage

このファイルをプロジェクトルートに配置し、AIエージェントに参照させる。

```
# Claude Code
「DESIGN.mdを参照してVONDSブランドに沿ったUIを作成して」

# クライアント案件での応用
クライアント固有のDESIGN.mdを作成する際のテンプレートとしても使用可能。
カラーパレットとタイポグラフィを差し替えるだけで別ブランドに適応。
```
