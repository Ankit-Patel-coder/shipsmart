// src/controllers/payment.controller.js
const { PrismaClient } = require('@prisma/client');
const { createOrder, verifyPaymentSignature, verifyWebhookSignature } = require('../services/razorpay.service');
const { ok, err } = require('../utils/response');
const { plans } = require('../config');

const prisma = new PrismaClient();

async function getPlans(req, res) {
  const plansData = Object.entries(plans).map(([key, val]) => ({
    id: key,
    label: val.label,
    price: val.price,
    priceINR: (val.price / 100).toFixed(0),
    imagesLimit: val.imagesLimit === -1 ? 'Unlimited' : val.imagesLimit,
    features: getPlanFeatures(key),
  }));
  return ok(res, { plans: plansData });
}

async function initiatePayment(req, res) {
  const { plan } = req.body;
  if (!plans[plan] || plan === 'FREE') return err(res, 'Invalid plan selected', 400);

  try {
    const order = await createOrder(plan, req.user.id);

    await prisma.subscription.create({
      data: {
        userId: req.user.id,
        razorpayOrderId: order.orderId,
        plan,
        status: 'PENDING',
        amount: order.amount,
        currency: order.currency,
      },
    });

    return ok(res, {
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      userName: req.user.name,
      userEmail: req.user.email,
    });
  } catch (e) {
    console.error('[PAYMENT] Initiate error:', e);
    return err(res, 'Could not create payment order', 500);
  }
}

async function verifyPayment(req, res) {
  const { orderId, paymentId, signature, plan } = req.body;
  if (!orderId || !paymentId || !signature || !plan) {
    return err(res, 'Missing payment verification fields', 400);
  }

  const isValid = verifyPaymentSignature({ orderId, paymentId, signature });
  if (!isValid) return err(res, 'Payment verification failed — invalid signature', 400);

  try {
    const planConfig = plans[plan];
    const now = new Date();
    const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.$transaction([
      prisma.subscription.updateMany({
        where: { razorpayOrderId: orderId, userId: req.user.id },
        data: {
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          status: 'ACTIVE',
          validFrom: now,
          validUntil,
        },
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          plan,
          imagesLimit: planConfig.imagesLimit,
          imagesUsed: 0,
        },
      }),
    ]);

    const updatedUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    const { password, ...safeUser } = updatedUser;

    return ok(res, { user: safeUser, validUntil }, 'Payment verified — plan activated');
  } catch (e) {
    console.error('[PAYMENT] Verify error:', e);
    return err(res, 'Could not activate plan', 500);
  }
}

async function webhookHandler(req, res) {
  const signature = req.headers['x-razorpay-signature'];
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  let event;
  try { event = JSON.parse(req.body.toString()); } catch { return res.status(400).end(); }

  if (event.event === 'payment.failed') {
    const orderId = event.payload?.payment?.entity?.order_id;
    if (orderId) {
      await prisma.subscription.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: 'FAILED' },
      }).catch(() => {});
    }
  }

  res.json({ received: true });
}

async function getPaymentHistory(req, res) {
  try {
    const subs = await prisma.subscription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, { subscriptions: subs });
  } catch (e) {
    return err(res, 'Could not fetch payment history', 500);
  }
}

function getPlanFeatures(plan) {
  const base = ['12 variants per image', 'White background removal', 'Shipping score', 'JPG download'];
  const map = {
    FREE:      [...base, '10 images total', 'Email support'],
    STARTER:   [...base, '200 images / month', 'Bulk upload (5 at once)', 'ZIP download', 'Email support'],
    PRO:       [...base, '1000 images / month', 'Bulk upload (20 at once)', 'ZIP download', 'Priority support', 'API access'],
    UNLIMITED: [...base, 'Unlimited images', 'Bulk upload (20 at once)', 'ZIP download', 'Priority support', 'API access', 'Custom branding'],
  };
  return map[plan] || base;
}

module.exports = { getPlans, initiatePayment, verifyPayment, webhookHandler, getPaymentHistory };
