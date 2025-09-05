// routes/tags.js
const express = require('express');
const router = express.Router();
const tagCtrl = require('../app/controllers/tagController');
const { authenticate } = require('../app/middleware/auth');

router.get('/', tagCtrl.list);
router.post('/', authenticate, tagCtrl.create);
module.exports = router;
