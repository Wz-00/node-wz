// app/controllers/mediaController.js (bagian uploadFile - debug)
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const db = require('../models'); // gunakan object models export dari app/models/index.js
const Media = db.Media;

const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer storage basic (tetap)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\.\-_]/g, '');
    cb(null, `${ts}-${safe}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

module.exports = {
  uploadMiddleware: upload.single('file'),

  async uploadFile(req, res, next) {
    try {
      console.log('--- uploadFile called ---');
      console.log('req.user:', req.user && { id: req.user.id, username: req.user.username, role: req.user.role });
      console.log('req.file:', req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null);

      if (!req.file) return res.status(400).json({ error: 'no_file' });

      const filePath = req.file.path;
      const webpPath = `${filePath}.webp`;

      // try sharp conversion but ignore if fails
      try {
        await sharp(filePath).resize({ width: 1200 }).webp().toFile(webpPath);
      } catch (sharpErr) {
        console.warn('sharp warning:', sharpErr && sharpErr.message);
        // continue even if sharp fails
      }

      // prepare payload
      const payload = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        mime: req.file.mimetype,
        size: req.file.size,
        uploaded_by: req.user ? req.user.id : null
      };

      console.log('Creating Media with payload:', payload);

      const media = await Media.create(payload);

      console.log('Media created id=', media.id);

      return res.status(201).json({ data: media });
    } catch (err) {
      // print detailed info about DB error
      console.error('UPLOAD ERROR:', err && err.message);
      if (err && err.original) {
        console.error('err.original:', err.original); // from mysql2 driver usually contains sqlMessage and sql
      }
      if (err && err.errors) {
        console.error('err.errors:', err.errors);
      }
      // return clearer message to Postman (temporarily)
      return res.status(500).json({ error: 'upload_error', message: err.message, sqlError: err.original ? err.original.sqlMessage || err.original.message : undefined, sql: err.original ? err.original.sql : undefined });
    }
  }
};
