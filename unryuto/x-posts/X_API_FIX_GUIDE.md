# X API 修復手順（rina + UNRYUTO 両方）

所要時間: 5-10分
やること: Developer Portalで鍵の再生成 + 設定確認

---

## STEP 1: Developer Portal にログイン

1. ブラウザで開く → https://developer.x.com/en/portal/dashboard
2. Xアカウントでログイン（どのアカウントで作ったか不明なら、まず @rina_xxxfree で試す）

---

## STEP 2: 画面をスクショしてKIRYUに見せる

ログインしたら、以下の2画面のスクショが欲しい：

### スクショ①: ダッシュボード画面
- ログイン直後の画面
- **何個のApp（プロジェクト）が表示されているか**が重要

### スクショ②: Usage画面
- 左メニューの「Usage」をクリック
- **月間のAPI使用量・残りクレジット**が表示される

**この2枚で原因が確定する。ここまでやったらKIRYUに投げてくれ。**

---

## STEP 3: rina の Access Token 再生成（401修復）

1. 左メニューから「Projects & Apps」→ rinaのApp を選択
2. 「Keys and tokens」タブをクリック
3. **「Access Token and Secret」** の「Regenerate」ボタンを押す
4. 表示された2つの値をコピーして保存：
   - `Access Token`: `XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - `Access Token Secret`: `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
5. **⚠️ この画面を閉じると二度と表示されない。必ずコピーしてからページを離れる**

### KIRYUに渡すもの:
```
rina Access Token: （ここにペースト）
rina Access Token Secret: （ここにペースト）
```

---

## STEP 4: UNRYUTO の確認 + 修復（402修復）

### パターンA: 同じDeveloper Portal内にUNRYUTOのAppがある場合
1. 「Projects & Apps」→ UNRYUTOのApp を選択
2. 「Keys and tokens」タブ
3. **「Access Token and Secret」** の「Regenerate」を押す
4. 新しい値をコピー

### パターンB: UNRYUTOのAppが見つからない場合
- 別のXアカウントでDeveloper Portalに登録した可能性あり
- @unRyuto_ai でログインし直して確認

### パターンC: Appはあるが「Free」プランに未登録の場合
1. ダッシュボード画面に「Subscribe to Free」的なボタンがあれば押す
2. Free プランへの登録を完了する（無料・クレジットカード不要）

### KIRYUに渡すもの:
```
UNRYUTO Access Token: （ここにペースト）
UNRYUTO Access Token Secret: （ここにペースト）
```

---

## STEP 5: KIRYUに渡す → 俺が.env更新 → 自動投稿再開

パパがやるのはSTEP 2-4のスクショ + 鍵コピペだけ。
残りは全部KIRYUが：
- .env ファイル更新
- 動作テスト（dry-run）
- 本番投稿開始
- cron設定確認

を実行する。

---

## まとめ（パパの作業だけ抜粋）

| # | やること | 時間 |
|---|---------|------|
| 1 | https://developer.x.com にログイン | 30秒 |
| 2 | ダッシュボード + Usage のスクショ2枚 | 30秒 |
| 3 | rinaのApp → Access Token を Regenerate → コピー | 1分 |
| 4 | UNRYUTOのApp → 状態確認 + Access Token Regenerate → コピー | 1分 |
| 5 | 4つの値をKIRYUにペースト | 30秒 |

**合計: 3-4分。これで rina も UNRYUTO も両方復活する。**
