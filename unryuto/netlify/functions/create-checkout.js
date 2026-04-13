/**
 * Netlify Function: Stripe Checkout Session 作成
 *
 * 環境変数（Netlify Dashboard → Site settings → Environment variables）:
 *   STRIPE_SECRET_KEY = sk_live_XXXXXXXX
 *
 * このファイルは unryuto/netlify/functions/ に配置。
 * netlify.toml の [functions] directory で参照。
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { price_id, mode, success_url, cancel_url } = JSON.parse(event.body);

    if (!price_id || !mode) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'price_id and mode are required' })
      };
    }

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode: mode, // 'payment' or 'subscription'
      success_url: success_url || 'https://unryuto.jp/thanks.html',
      cancel_url: cancel_url || 'https://unryuto.jp/#pricing',
      locale: 'ja',
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
