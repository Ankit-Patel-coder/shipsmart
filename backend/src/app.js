// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { frontendUrl, nodeEnv } = require('./config');

const authRoutes    = require('./routes/auth.routes');
const imageRoutes   = require('./routes/image.routes');
const paymentRoutes = require('./routes/payment.routes');
const userRoutes    = require('./routes/user.routes');

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Logging ─────────────────────────────────────────────────────────────────
if (nodeEnv !== 'test') app.use(morgan('dev'));

// ─── Body parsing ─────────────────────────────────────────────────────────────
// NOTE: /api/payment/webhook uses raw body — must be before express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static files (local storage fallback) ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: nodeEnv });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/images',  imageRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user',    userRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message, err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

module.exports = app;
