// src/services/removebg.service.js
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const { removebg } = require('../config');

/**
 * Remove background from an image buffer using the Remove.bg API.
 * Returns a buffer with the background removed (transparent PNG).
 */
async function removeBackground(imageBuffer) {
  if (!removebg.apiKey) {
    throw new Error('REMOVEBG_API_KEY is not configured');
  }

  const form = new FormData();
  form.append('image_file', imageBuffer, {
    filename: 'product.jpg',
    contentType: 'image/jpeg',
  });
  form.append('size', 'auto');
  form.append('type', 'product');  // optimised for product photos
  form.append('format', 'png');

  const response = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
    headers: {
      'X-Api-Key': removebg.apiKey,
      ...form.getHeaders(),
    },
    responseType: 'arraybuffer',
    timeout: 30000,
  });

  return Buffer.from(response.data);
}

/**
 * Remove background and place the subject on a white background.
 * Returns a JPEG buffer.
 */
async function removeBackgroundWhite(imageBuffer, outputSize = 1080) {
  const noBgBuffer = await removeBackground(imageBuffer);

  // Composite subject onto white canvas
  const result = await sharp({
    create: {
      width: outputSize,
      height: outputSize,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      {
        input: await sharp(noBgBuffer)
          .resize(Math.round(outputSize * 0.84), Math.round(outputSize * 0.84), {
            fit: 'inside',
            withoutEnlargement: false,
          })
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  return result;
}

module.exports = { removeBackground, removeBackgroundWhite };
