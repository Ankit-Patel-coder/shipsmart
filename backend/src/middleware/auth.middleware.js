// src/middleware/auth.middleware.js
const { verify } = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');
const { err } = require('../utils/response');

const prisma = new PrismaClient();

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return err(res, 'No token provided', 401);
    }
    const token = header.split(' ')[1];
    const payload = verify(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return err(res, 'User not found', 401);
    req.user = user;
    next();
  } catch (e) {
    return err(res, 'Invalid or expired token', 401);
  }
}

module.exports = { requireAuth };
