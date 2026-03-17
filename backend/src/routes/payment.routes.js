// src/routes/payment.routes.js
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/payment.controller');

router.get('/plans',          ctrl.getPlans);
router.post('/webhook',       ctrl.webhookHandler);   // raw body — no auth
router.use(requireAuth);
router.post('/initiate',      ctrl.initiatePayment);
router.post('/verify',        ctrl.verifyPayment);
router.get('/history',        ctrl.getPaymentHistory);

module.exports = router;
