/**
 * UNRYUTO Stripe Checkout Integration
 *
 * 使い方:
 * 1. Stripeアカウント開設後、publishable keyを設定
 * 2. Netlify Functionsに checkout-session.js を配置
 * 3. 商品のprice_idをStripeダッシュボードから取得して設定
 *
 * NOYUTOへ: Stripeアカウント開設が必要。株式会社オフィスVONDS名義で申請。
 */

// Stripe publishable key（開設後に差し替え）
const STRIPE_PK = 'pk_live_XXXXXXXXXXXXXXXXXXXXXXXX';

// 商品ID（Stripe Dashboard で作成後に差し替え）
const PRODUCTS = {
  recruitment_manual: {
    name: '求人AI戦略マニュアル',
    price_id: 'price_XXXXXXXX', // Stripeで作成後に設定
  },
  sales_manual: {
    name: '営業戦略マニュアル',
    price_id: 'price_XXXXXXXX',
  },
  membership: {
    name: 'メンバーシップ（月額）',
    price_id: 'price_XXXXXXXX', // recurring
  }
};

/**
 * Stripe Checkoutセッションを作成してリダイレクト
 * @param {string} productKey - PRODUCTS のキー
 */
async function checkout(productKey) {
  const product = PRODUCTS[productKey];
  if (!product) {
    alert('商品が見つかりません。');
    return;
  }

  try {
    const res = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_id: product.price_id,
        mode: productKey === 'membership' ? 'subscription' : 'payment',
        success_url: window.location.origin + '/thanks.html',
        cancel_url: window.location.origin + '/#pricing',
      })
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('決済ページの作成に失敗しました。しばらくしてから再度お試しください。');
    }
  } catch (err) {
    alert('通信エラーが発生しました。しばらくしてから再度お試しください。');
  }
}
