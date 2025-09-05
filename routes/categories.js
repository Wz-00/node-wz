// routes/categories.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../app/middleware/auth');
const catCtrl = require('../app/controllers/categoryController');

router.get('/', catCtrl.list);
router.post('/', authenticate, catCtrl.create); // only authenticated (you can further protect to admin)
module.exports = router;
