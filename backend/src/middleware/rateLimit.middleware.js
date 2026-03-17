// src/middleware/rateLimit.middleware.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Please wait 15 minutes.' },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60,
  message: { success: false, message: 'Upload rate limit exceeded. Please wait.' },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };


// src/middleware/subscription.middleware.js — inline here to keep files lean
const { PrismaClient } = require('@prisma/client');
const { err } = require('../utils/response');
const prisma = new PrismaClient();

async function checkImageQuota(req, res, next) {
  const user = req.user;
  if (!user) return err(res, 'Unauthorized', 401);

  // Unlimited plan bypasses quota
  if (user.plan === 'UNLIMITED') return next();

  if (user.imagesLimit !== -1 && user.imagesUsed >= user.imagesLimit) {
    return err(res,
      `You've used all ${user.imagesLimit} images on your ${user.plan} plan. Please upgrade to continue.`,
      402
    );
  }
  next();
}

module.exports.checkImageQuota = checkImageQuota;
