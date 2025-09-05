// routes/media.js
const express = require('express');
const router = express.Router();
const mediaCtrl = require('../app/controllers/mediaController');
const { authenticate } = require('../app/middleware/auth');

router.post('/upload', authenticate, mediaCtrl.uploadMiddleware, mediaCtrl.uploadFile);
module.exports = router;
