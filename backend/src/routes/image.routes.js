// src/routes/image.routes.js
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { uploadSingle: multerSingle, uploadBulk: multerBulk } = require('../middleware/upload.middleware');
const { checkImageQuota } = require('../middleware/rateLimit.middleware');
const { uploadLimiter } = require('../middleware/rateLimit.middleware');
const ctrl = require('../controllers/image.controller');

router.use(requireAuth);

router.post('/upload',      uploadLimiter, multerSingle, checkImageQuota, ctrl.uploadSingle);
router.post('/upload-bulk', uploadLimiter, multerBulk,   checkImageQuota, ctrl.uploadBulk);
router.get('/',             ctrl.listUploads);
router.get('/:uploadId',    ctrl.getUpload);
router.get('/:uploadId/download', ctrl.downloadZip);
router.delete('/:uploadId', ctrl.deleteUpload);

module.exports = router;
