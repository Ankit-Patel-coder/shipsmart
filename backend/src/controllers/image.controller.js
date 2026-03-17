// src/controllers/image.controller.js
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { generateVariants, createZipStream } = require('../services/image.service');
const storageService = require('../services/storage.service');
const { ok, err } = require('../utils/response');

const prisma = new PrismaClient();

/**
 * POST /api/images/upload
 * Single image upload — generates 12 variants.
 */
async function uploadSingle(req, res) {
  if (!req.file) return err(res, 'No image file provided', 400);

  const uploadId = uuidv4();
  let upload;

  try {
    // 1. Upload original to storage
    const origKey = `uploads/${uploadId}/original${getExt(req.file.mimetype)}`;
    const originalUrl = await storageService.upload(req.file.buffer, origKey, req.file.mimetype);

    // 2. Create upload record
    upload = await prisma.upload.create({
      data: {
        id: uploadId,
        userId: req.user.id,
        originalName: req.file.originalname,
        originalSize: req.file.size,
        originalUrl,
        status: 'PROCESSING',
      },
    });

    // 3. Generate variants (this is the heavy work)
    const variants = await generateVariants(req.file.buffer, uploadId);

    // 4. Save variants to DB
    const created = await prisma.$transaction(
      variants.map((v) =>
        prisma.variant.create({
          data: {
            uploadId,
            name: v.name,
            description: v.description,
            fileSize: v.fileSize,
            width: v.width,
            height: v.height,
            url: v.url,
            score: v.score,
            format: v.format || 'jpeg',
          },
        })
      )
    );

    // 5. Update upload status + user quota
    await prisma.upload.update({
      where: { id: uploadId },
      data: { status: 'DONE', variantsCount: created.length },
    });
    await prisma.user.update({
      where: { id: req.user.id },
      data: { imagesUsed: { increment: 1 } },
    });

    // Attach _buffer for possible in-memory ZIP use
    const variantsWithBuffer = created.map((dbV, i) => ({
      ...dbV,
      _buffer: variants[i]?._buffer,
    }));

    return ok(res, {
      uploadId,
      originalUrl,
      variants: variantsWithBuffer.map(sanitizeVariant),
      bestScore: variantsWithBuffer[0]?.score ?? 0,
    }, 'Variants generated successfully', 201);

  } catch (e) {
    console.error('[IMAGE] Single upload error:', e);
    if (upload) {
      await prisma.upload.update({ where: { id: uploadId }, data: { status: 'FAILED' } }).catch(() => {});
    }
    return err(res, 'Image processing failed: ' + e.message, 500);
  }
}

/**
 * POST /api/images/upload-bulk
 * Bulk upload — accepts up to 20 images, processes each.
 */
async function uploadBulk(req, res) {
  if (!req.files || req.files.length === 0) return err(res, 'No images provided', 400);

  const results = [];
  const errors = [];

  for (const file of req.files) {
    try {
      const mockReq = { ...req, file, user: req.user };
      const mockRes = {
        statusCode: 200,
        _data: null,
        status(c) { this.statusCode = c; return this; },
        json(d) { this._data = d; return this; },
      };
      await uploadSingle(mockReq, mockRes);
      if (mockRes._data?.success) {
        results.push({ file: file.originalname, ...mockRes._data.data });
      } else {
        errors.push({ file: file.originalname, error: mockRes._data?.message });
      }
    } catch (e) {
      errors.push({ file: file.originalname, error: e.message });
    }
  }

  return ok(res, { processed: results.length, failed: errors.length, results, errors },
    `Processed ${results.length} of ${req.files.length} images`, 201);
}

/**
 * GET /api/images
 * List all uploads for the authenticated user.
 */
async function listUploads(req, res) {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [uploads, total] = await prisma.$transaction([
      prisma.upload.findMany({
        where: { userId: req.user.id },
        include: {
          variants: { orderBy: { score: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.upload.count({ where: { userId: req.user.id } }),
    ]);

    return ok(res, {
      uploads: uploads.map((u) => ({
        ...u,
        topVariant: u.variants[0] ?? null,
        variants: undefined,
      })),
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (e) {
    return err(res, 'Could not fetch uploads', 500);
  }
}

/**
 * GET /api/images/:uploadId
 * Get a single upload with all its variants.
 */
async function getUpload(req, res) {
  try {
    const upload = await prisma.upload.findFirst({
      where: { id: req.params.uploadId, userId: req.user.id },
      include: { variants: { orderBy: { score: 'desc' } } },
    });
    if (!upload) return err(res, 'Upload not found', 404);
    return ok(res, { upload });
  } catch (e) {
    return err(res, 'Could not fetch upload', 500);
  }
}

/**
 * GET /api/images/:uploadId/download
 * Stream a ZIP of all variants for an upload.
 */
async function downloadZip(req, res) {
  try {
    const upload = await prisma.upload.findFirst({
      where: { id: req.params.uploadId, userId: req.user.id },
      include: { variants: { orderBy: { score: 'desc' } } },
    });
    if (!upload) return err(res, 'Upload not found', 404);

    // Fetch variant buffers from storage (local: read from disk, R2: presigned or direct)
    const variantsWithBuffers = await Promise.all(
      upload.variants.map(async (v) => {
        try {
          const axios = require('axios');
          const resp = await axios.get(v.url, { responseType: 'arraybuffer', timeout: 15000 });
          return { ...v, _buffer: Buffer.from(resp.data) };
        } catch {
          return { ...v, _buffer: Buffer.alloc(0) };
        }
      })
    );

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition',
      `attachment; filename="shipsmart-${upload.id.slice(0, 8)}.zip"`);

    const stream = createZipStream(variantsWithBuffers);
    stream.on('error', (e) => { console.error('[ZIP]', e); res.end(); });
    stream.pipe(res);

  } catch (e) {
    return err(res, 'Could not create ZIP: ' + e.message, 500);
  }
}

/**
 * DELETE /api/images/:uploadId
 */
async function deleteUpload(req, res) {
  try {
    const upload = await prisma.upload.findFirst({
      where: { id: req.params.uploadId, userId: req.user.id },
      include: { variants: true },
    });
    if (!upload) return err(res, 'Upload not found', 404);

    // Remove from storage
    const keys = [
      `uploads/${upload.id}/original`,
      ...upload.variants.map((v) => `uploads/${upload.id}/${v.name.replace(/\s+/g, '-').toLowerCase()}.jpg`),
    ];
    await Promise.allSettled(keys.map((k) => storageService.remove(k)));

    await prisma.upload.delete({ where: { id: upload.id } });
    return ok(res, null, 'Upload deleted');
  } catch (e) {
    return err(res, 'Could not delete upload', 500);
  }
}

function sanitizeVariant(v) {
  const { _buffer, ...rest } = v;
  return rest;
}

function getExt(mime) {
  const map = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
  return map[mime] || '.jpg';
}

module.exports = { uploadSingle, uploadBulk, listUploads, getUpload, downloadZip, deleteUpload };
