// routes/posts.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postController = require('../app/controllers/postController');
const { authenticate } = require('../app/middleware/auth');
const { requireOwnerOrAdmin } = require('../app/middleware/authorize');

// public
router.get('/', postController.listPublic);
router.get('/:slug', postController.getBySlug);

// auth required to create/update/delete
router.post(
  '/',
  authenticate,
  [ body('title').notEmpty().withMessage('title_required') ],
  postController.create
);

router.put('/:id', authenticate, postController.update);
router.delete('/:id', authenticate, postController.remove);

module.exports = router;
