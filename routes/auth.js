// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, refresh, logout } = require('../app/controllers/authController');
const { body } = require('express-validator');

router.post('/register', [
  body('name').isLength({ min: 2 }),
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
], register);

router.post('/login', [
  body('username').isLength({ min: 3 }),
  body('password').isLength({ min: 8 })
], login);

router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;
