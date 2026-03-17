// src/controllers/user.controller.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { ok, err } = require('../utils/response');

const prisma = new PrismaClient();

async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: { select: { uploads: true } },
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    const { password, ...safe } = user;
    const quota = {
      used: safe.imagesUsed,
      limit: safe.imagesLimit,
      remaining: safe.imagesLimit === -1 ? 'unlimited' : Math.max(0, safe.imagesLimit - safe.imagesUsed),
      percent: safe.imagesLimit === -1 ? 0 : Math.round((safe.imagesUsed / safe.imagesLimit) * 100),
    };
    return ok(res, { user: { ...safe, uploadCount: user._count.uploads }, quota, activeSubscription: user.subscriptions[0] ?? null });
  } catch (e) {
    return err(res, 'Could not load profile', 500);
  }
}

async function updateProfile(req, res) {
  const { name } = req.body;
  if (!name || name.trim().length < 2) return err(res, 'Name must be at least 2 characters', 400);
  try {
    const updated = await prisma.user.update({ where: { id: req.user.id }, data: { name: name.trim() } });
    const { password, ...safe } = updated;
    return ok(res, { user: safe }, 'Profile updated');
  } catch (e) {
    return err(res, 'Could not update profile', 500);
  }
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return err(res, 'New password must be at least 8 characters', 400);
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return err(res, 'Current password is incorrect', 400);
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    return ok(res, null, 'Password changed successfully');
  } catch (e) {
    return err(res, 'Could not change password', 500);
  }
}

async function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;
    const [totalUploads, variants, recentUploads] = await prisma.$transaction([
      prisma.upload.count({ where: { userId } }),
      prisma.variant.findMany({
        where: { upload: { userId } },
        select: { score: true },
      }),
      prisma.upload.findMany({
        where: { userId },
        include: { variants: { orderBy: { score: 'desc' }, take: 1 } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);
    const avgScore = variants.length
      ? Math.round(variants.reduce((s, v) => s + v.score, 0) / variants.length)
      : 0;
    const topScore = variants.length ? Math.max(...variants.map((v) => v.score)) : 0;
    return ok(res, {
      stats: { totalUploads, avgScore, topScore, totalVariants: variants.length },
      recentUploads: recentUploads.map((u) => ({ ...u, topVariant: u.variants[0] ?? null, variants: undefined })),
    });
  } catch (e) {
    return err(res, 'Could not load dashboard stats', 500);
  }
}

module.exports = { getProfile, updateProfile, changePassword, getDashboardStats };
