// src/middleware/upload.middleware.js
const multer = require('multer');
const path = require('path');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_BULK_COUNT = 20;

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'), false);
  }
}

// Single image upload
const uploadSingle = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } })
  .single('image');

// Bulk image upload (up to 20)
const uploadBulk = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE, files: MAX_BULK_COUNT } })
  .array('images', MAX_BULK_COUNT);

// Wrapper to convert multer callback errors into proper HTTP responses
function wrapMulter(multerFn) {
  return (req, res, next) => {
    multerFn(req, res, (err) => {
      if (!err) return next();
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Maximum size is 20 MB.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ success: false, message: `Maximum ${MAX_BULK_COUNT} images at a time.` });
      }
      return res.status(400).json({ success: false, message: err.message });
    });
  };
}

module.exports = {
  uploadSingle: wrapMulter(uploadSingle),
  uploadBulk: wrapMulter(uploadBulk),
};
