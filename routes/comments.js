// routes/comments.js
const express = require('express');
const router = express.Router();
const commentCtrl = require('../app/controllers/commentController');
const { authenticate } = require('../app/middleware/auth');

router.get('/post/:postId', commentCtrl.listByPost);
router.post('/', authenticate, commentCtrl.create); // can allow guest with captcha later
router.post('/:id/moderate', authenticate, commentCtrl.moderate); // only admin inside controller
module.exports = router;
