// src/config/index.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  removebg: {
    apiKey: process.env.REMOVEBG_API_KEY,
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },

  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME || 'shipsmart-images',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  },

  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
  },

  plans: {
    FREE:      { imagesLimit: 10,   price: 0,                    label: 'Free' },
    STARTER:   { imagesLimit: 200,  price: parseInt(process.env.PLAN_STARTER_AMOUNT)   || 49900,  label: 'Starter' },
    PRO:       { imagesLimit: 1000, price: parseInt(process.env.PLAN_PRO_AMOUNT)       || 99900,  label: 'Pro' },
    UNLIMITED: { imagesLimit: -1,   price: parseInt(process.env.PLAN_UNLIMITED_AMOUNT) || 199900, label: 'Unlimited' },
  },
};
