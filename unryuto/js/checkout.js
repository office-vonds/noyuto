/**
 * UNRYUTO Stripe決済
 *
 * 実装方式: Stripe Payment Links（コードゼロ・URL貼るだけ）
 * KIRYUのec-stripe-plan.mdに基づく最小実装。
 *
 * 使い方:
 * 1. NOYUTOがStripeアカウント開設（個人事業主・屋号UNRYUTO）
 * 2. Stripeダッシュボードで商品作成 → Payment Link取得
 * 3. 下のURLを差し替え
 * 4. index.htmlの料金ボタンにonclick="checkout('recruitment')"等を追加
 *
 * 初期は少量なので手動メール対応でもOK。
 * スケール時: Zapier or Make でWebhook→自動DLリンクメール送付（月¥2,000〜）
 */

const PAYMENT_LINKS = {
  recruitment: 'https://buy.stripe.com/XXXXXXXX', // 求人AI戦略マニュアル
  sales:       'https://buy.stripe.com/XXXXXXXX', // 営業戦略マニュアル
  membership:  'https://buy.stripe.com/XXXXXXXX', // メンバーシップ月額
};

function checkout(productKey) {
  const url = PAYMENT_LINKS[productKey];
  if (url && !url.includes('XXXXXXXX')) {
    window.location.href = url;
  } else {
    // Payment Link未設定時はメール問い合わせにフォールバック
    window.location.href = 'mailto:info@unryuto.jp?subject=' +
      encodeURIComponent('UNRYUTO商品について問い合わせ');
  }
}
