// src/services/storage.service.js
// Simplified storage — saves images as base64 data URLs in DB (works on Railway with no filesystem)
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { r2, storage, port } = require('../config');

// Only used for R2 or local dev
const LOCAL_DIR = path.join(process.cwd(), 'uploads');
if (storage.driver === 'local' && !fs.existsSync(LOCAL_DIR)) {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
}

let s3;
if (storage.driver === 'r2') {
  s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2.accessKeyId,
      secretAccessKey: r2.secretAccessKey,
    },
  });
}

function getBaseUrl() {
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL;
  return `http://localhost:${port}`;
}

/**
 * Upload a buffer.
 * - R2: uploads to Cloudflare R2, returns public URL
 * - local (dev): saves to disk, returns localhost URL
 * - base64 (production fallback): returns data URL — no filesystem needed
 */
async function upload(buffer, key, contentType = 'image/jpeg') {
  if (storage.driver === 'r2') {
    await s3.send(new PutObjectCommand({
      Bucket: r2.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000',
    }));
    return `${r2.publicUrl}/${key}`;
  }

  // In production on Railway — return base64 data URL (stored directly in DB)
  if (process.env.NODE_ENV === 'production') {
    const base64 = buffer.toString('base64');
    return `data:${contentType};base64,${base64}`;
  }

  // Local development — save to disk
  const fileName = key.replace(/\//g, '_');
  const filePath = path.join(LOCAL_DIR, fileName);
  fs.writeFileSync(filePath, buffer);
  return `${getBaseUrl()}/uploads/${fileName}`;
}

async function remove(key) {
  if (storage.driver === 'r2') {
    await s3.send(new DeleteObjectCommand({ Bucket: r2.bucketName, Key: key }));
    return;
  }
  // For base64 or local — nothing to delete from filesystem
  if (key.startsWith('data:')) return;
  try {
    const fileName = key.replace(/\//g, '_');
    const filePath = path.join(LOCAL_DIR, fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    // ignore
  }
}

module.exports = { upload, remove };
