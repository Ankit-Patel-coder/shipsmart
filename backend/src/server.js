// src/server.js
const app = require('./app');
const { port } = require('./config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function start() {
  try {
    await prisma.$connect();
    console.log('[DB] PostgreSQL connected via Prisma');

    app.listen(port, () => {
      console.log(`[SERVER] ShipSmart API running on port ${port}`);
      console.log(`[SERVER] http://localhost:${port}/api/health`);
    });
  } catch (err) {
    console.error('[FATAL] Could not start server:', err.message);
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('[SERVER] Graceful shutdown');
  process.exit(0);
});
