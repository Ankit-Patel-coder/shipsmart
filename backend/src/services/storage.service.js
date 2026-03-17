// src/services/storage.service.js
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { r2, storage, port } = require('../config');

const LOCAL_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });

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
  const fileName = key.replace(/\//g, '_');
  const filePath = path.join(LOCAL_DIR, fileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

module.exports = { upload, remove };
