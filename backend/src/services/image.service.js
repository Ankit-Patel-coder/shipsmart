// src/services/image.service.js
const sharp = require('sharp');
const archiver = require('archiver');
const { PassThrough } = require('stream');
const { calcShippingScore } = require('../utils/score');
const { removeBackgroundWhite } = require('./removebg.service');
const storageService = require('./storage.service');

/**
 * 12 variant configurations.
 * Each describes the transformations to apply on top of a bg-removed image.
 */
const VARIANT_CONFIGS = [
  {
    id: 'meesho-standard',
    name: 'Meesho Standard',
    description: 'White BG · 1080×1080 · Centred — ideal listing image',
    size: 1080,
    padding: 0.08,
    quality: 85,
    modulate: null,
    sharpen: false,
  },
  {
    id: 'ultra-compressed',
    name: 'Ultra Compressed',
    description: 'Smallest file · Max compression · Fastest upload',
    size: 800,
    padding: 0.06,
    quality: 45,
    modulate: null,
    sharpen: false,
  },
  {
    id: 'bright-vivid',
    name: 'Bright & Vivid',
    description: 'Brightness +30% · Saturation +15% · Attracts buyers',
    size: 1080,
    padding: 0.08,
    quality: 82,
    modulate: { brightness: 1.3, saturation: 1.15 },
    sharpen: false,
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Contrast boost · Product edges pop',
    size: 1080,
    padding: 0.08,
    quality: 82,
    modulate: { brightness: 1.08 },
    linear: [1.4, -(128 * 0.4)],
    sharpen: false,
  },
  {
    id: 'colour-vivid',
    name: 'Colour Vivid',
    description: 'Saturation +50% · Rich, punchy colours',
    size: 1080,
    padding: 0.08,
    quality: 82,
    modulate: { brightness: 1.1, saturation: 1.5 },
    sharpen: false,
  },
  {
    id: 'close-crop',
    name: 'Close Crop',
    description: 'Zoomed 20% · Product fills frame',
    size: 1080,
    padding: -0.04,
    quality: 85,
    modulate: null,
    sharpen: false,
  },
  {
    id: 'wide-padding',
    name: 'Wide Padding',
    description: 'Extra whitespace · Category-safe margins',
    size: 1080,
    padding: 0.18,
    quality: 82,
    modulate: null,
    sharpen: false,
  },
  {
    id: 'warm-natural',
    name: 'Warm Natural',
    description: 'Warm tone · Lifestyle look · Great for apparel',
    size: 1080,
    padding: 0.08,
    quality: 82,
    modulate: { brightness: 1.1, saturation: 1.2, hue: -8 },
    tint: { r: 255, g: 240, b: 220 },
    sharpen: false,
  },
  {
    id: 'cool-studio',
    name: 'Cool Studio',
    description: 'Cool blue tone · Clean studio · Electronics / tech',
    size: 1080,
    padding: 0.08,
    quality: 82,
    modulate: { brightness: 1.05, saturation: 0.9, hue: 12 },
    sharpen: false,
  },
  {
    id: 'sharp-detail',
    name: 'Sharp Detail',
    description: 'Enhanced sharpness · Texture & detail clarity',
    size: 1080,
    padding: 0.07,
    quality: 88,
    modulate: { brightness: 1.08, saturation: 1.1 },
    sharpen: true,
  },
  {
    id: 'soft-apparel',
    name: 'Soft Apparel',
    description: 'Gentle processing · Ideal for fabric & clothing',
    size: 1080,
    padding: 0.09,
    quality: 80,
    modulate: { brightness: 1.12, saturation: 1.08 },
    sharpen: false,
    blur: 0.4,
  },
  {
    id: 'listing-mini',
    name: 'Listing Mini',
    description: '800px · Mobile-first · Fast-load thumbnail',
    size: 800,
    padding: 0.06,
    quality: 72,
    modulate: { brightness: 1.08 },
    linear: [1.08, -10],
    sharpen: false,
  },
];

/**
 * Process a single variant from a transparent-background PNG buffer.
 * Returns { buffer, width, height, fileSizeKB, score }
 */
async function processVariant(noBgBuffer, cfg) {
  const { size, padding, quality, modulate, sharpen, blur, linear, tint } = cfg;

  // Compute product drawing area
  const pad = Math.max(padding, -0.15);
  const availableSize = Math.round(size * (1 - Math.abs(pad) * 2));
  const drawSize = padding < 0
    ? Math.round(size * (1 + Math.abs(padding) * 2))
    : availableSize;

  // ── 1. Resize the no-bg image to fit within the drawing area ──────────────
  let img = sharp(noBgBuffer).resize(drawSize, drawSize, {
    fit: 'inside',
    withoutEnlargement: false,
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  });

  // ── 2. Optional modulate (brightness / saturation / hue) ──────────────────
  if (modulate) img = img.modulate(modulate);

  // ── 3. Optional linear (contrast) ─────────────────────────────────────────
  if (linear) img = img.linear(linear[0], linear[1]);

  // ── 4. Optional tint ──────────────────────────────────────────────────────
  if (tint) img = img.tint(tint);

  // ── 5. Optional sharpen ───────────────────────────────────────────────────
  if (sharpen) img = img.sharpen({ sigma: 1.2, m1: 0.5, m2: 0.3 });

  // ── 6. Optional blur ──────────────────────────────────────────────────────
  if (blur) img = img.blur(blur);

  const productBuffer = await img.png().toBuffer();

  // ── 7. Composite product onto white canvas ────────────────────────────────
  const finalBuffer = await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: productBuffer, gravity: 'center' }])
    .jpeg({ quality, mozjpeg: true, chromaSubsampling: quality < 60 ? '4:2:0' : '4:4:4' })
    .toBuffer();

  const fileSizeKB = Math.round(finalBuffer.length / 1024);
  const score = calcShippingScore({
    fileSizeKB,
    width: size,
    height: size,
    hasWhiteBg: true,
    isBright: modulate ? (modulate.brightness || 1) >= 1.05 : false,
  });

  return { buffer: finalBuffer, width: size, height: size, fileSizeKB, score };
}

/**
 * Main entry point.
 * Takes a raw image buffer (from upload), removes the background,
 * generates all 12 variants, uploads them, returns variant metadata.
 */
async function generateVariants(imageBuffer, uploadId) {
  // ── Remove background (uses Remove.bg API) ────────────────────────────────
  let noBgBuffer;
  try {
    noBgBuffer = await removeBackgroundWhite(imageBuffer, 1200);
    // Extract just the transparent PNG of the subject
    const removebgService = require('./removebg.service');
    noBgBuffer = await removebgService.removeBackground(imageBuffer);
  } catch (err) {
    console.warn('[BG-REMOVE] Failed, falling back to original image:', err.message);
    // Fallback: use the original image without bg removal
    noBgBuffer = await sharp(imageBuffer)
      .resize(1200, 1200, { fit: 'inside' })
      .png()
      .toBuffer();
  }

  const results = [];

  for (const cfg of VARIANT_CONFIGS) {
    try {
      const { buffer, width, height, fileSizeKB, score } = await processVariant(noBgBuffer, cfg);

      // Upload to storage
      const key = `uploads/${uploadId}/${cfg.id}.jpg`;
      const url = await storageService.upload(buffer, key, 'image/jpeg');

      results.push({
        name: cfg.name,
        description: cfg.description,
        fileSize: fileSizeKB * 1024,
        width,
        height,
        url,
        score,
        format: 'jpeg',
        _buffer: buffer,  // kept in memory only for ZIP — not stored in DB
      });
    } catch (variantErr) {
      console.error(`[VARIANT] Failed to generate ${cfg.id}:`, variantErr.message);
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Stream a ZIP archive of all variants for a given upload.
 * Returns a readable stream — pipe it directly to the HTTP response.
 */
function createZipStream(variants) {
  const archive = archiver('zip', { zlib: { level: 6 } });
  variants.forEach((v, i) => {
    const rank = String(i + 1).padStart(2, '0');
    archive.append(v._buffer || Buffer.alloc(0), {
      name: `${rank}_${v.name.replace(/\s+/g, '-').toLowerCase()}_score${v.score}.jpg`,
    });
  });
  archive.finalize();
  return archive;
}

module.exports = { generateVariants, createZipStream, VARIANT_CONFIGS };
