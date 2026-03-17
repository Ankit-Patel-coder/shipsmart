// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { sign } = require('../utils/jwt');
const { ok, err } = require('../utils/response');
const { plans } = require('../config');

const prisma = new PrismaClient();

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return err(res, 'Validation failed', 422, errors.array());

  const { name, email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return err(res, 'Email already registered', 409);

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        plan: 'FREE',
        imagesLimit: plans.FREE.imagesLimit,
      },
    });

    const token = sign({ userId: user.id, email: user.email });
    return ok(res, { token, user: safeUser(user) }, 'Account created', 201);
  } catch (e) {
    console.error('[AUTH] Register error:', e);
    return err(res, 'Registration failed', 500);
  }
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return err(res, 'Validation failed', 422, errors.array());

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return err(res, 'Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return err(res, 'Invalid credentials', 401);

    const token = sign({ userId: user.id, email: user.email });
    return ok(res, { token, user: safeUser(user) }, 'Login successful');
  } catch (e) {
    console.error('[AUTH] Login error:', e);
    return err(res, 'Login failed', 500);
  }
}

async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: { select: { uploads: true } },
      },
    });
    return ok(res, { user: { ...safeUser(user), uploadCount: user._count.uploads } });
  } catch (e) {
    return err(res, 'Could not fetch profile', 500);
  }
}

function safeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

module.exports = { register, login, me };
