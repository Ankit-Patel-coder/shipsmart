// src/services/razorpay.service.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { razorpay, plans } = require('../config');

const rzp = new Razorpay({
  key_id: razorpay.keyId,
  key_secret: razorpay.keySecret,
});

/**
 * Create a Razorpay order for a plan purchase.
 */
async function createOrder(plan, userId) {
  const planConfig = plans[plan];
  if (!planConfig) throw new Error(`Unknown plan: ${plan}`);

  const order = await rzp.orders.create({
    amount: planConfig.price,
    currency: 'INR',
    receipt: `ss_${userId.slice(0, 8)}_${Date.now()}`,
    notes: { userId, plan },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: razorpay.keyId,
  };
}

/**
 * Verify Razorpay payment signature (called after payment success).
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', razorpay.keySecret)
    .update(body)
    .digest('hex');
  return expected === signature;
}

/**
 * Verify webhook signature.
 */
function verifyWebhookSignature(rawBody, signature) {
  const expected = crypto
    .createHmac('sha256', razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}

module.exports = { createOrder, verifyPaymentSignature, verifyWebhookSignature };
