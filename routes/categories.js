// routes/categories.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../app/middleware/auth');
const authorize = require('../app/middleware/adminOnly');
const catCtrl = require('../app/controllers/categoryController');

router.get('/', catCtrl.list);
router.get('/posts', catCtrl.withPosts);
router.post('/', authenticate, authorize('admin'), catCtrl.create);
module.exports = router;
