// src/routes/user.routes.js
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/user.controller');

router.use(requireAuth);
router.get('/profile',         ctrl.getProfile);
router.put('/profile',         ctrl.updateProfile);
router.put('/change-password', ctrl.changePassword);
router.get('/dashboard',       ctrl.getDashboardStats);

module.exports = router;
