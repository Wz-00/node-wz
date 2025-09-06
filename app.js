// app.js (relevant parts)
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./app/models');
const xss = require('xss');
const app = express();
const path = require('path');
const fs = require('fs');

// --- helmet: set Cross-Origin-Resource-Policy to allow cross-origin resources ---
app.use(helmet({
  // atur CORP agar file statis dapat di-load dari origin lain selama dev
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // (jika Anda memakai contentSecurityPolicy secara custom, atur juga disana)
}));

// CORS: jika ALLOWED_ORIGINS di env tersedia gunakan itu, sinonim dev use '*'
const allowed = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*';
app.use(cors({ origin: allowed }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

// xssMiddleware (tetap)
function xssMiddleware(req, res, next) {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  if (req.query) {
    for (let key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    }
  }
  next();
}
app.use(xssMiddleware);
// routes
app.use('/auth', require('./routes/auth'));
app.use('/categories', require('./routes/categories'));
app.use('/tags', require('./routes/tags'));
app.use('/posts', require('./routes/posts'));
app.use('/media', require('./routes/media'));
app.use('/comments', require('./routes/comments'));

// --- static serve uploads with explicit setHeaders to allow cross-origin resources ---
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
app.use('/uploads', (req, res, next) => {
  // logging untuk debug
  console.log('[uploads] request for:', req.path);

  // Pastikan header CORS dasar
  res.setHeader('Access-Control-Allow-Origin', '*');   // DEV only
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  // Monkey-patch writeHead agar kita bisa memastikan header ini terakhir di-set
  const originalWriteHead = res.writeHead;
  res.writeHead = function (statusCode /*, statusMessage, headers */) {
    try {
      // override CORP tepat sebelum header dikirim
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    } catch (e) {
      console.warn('[uploads] failed to set CORP:', e && e.message);
    }
    // panggil implementasi asli
    return originalWriteHead.apply(this, arguments);
  };

  next();
}, express.static(UPLOADS_DIR, {
  setHeaders: (res/*, path, stat */) => {
    // setHeaders juga akan dipanggil oleh express.static — pertahanan ganda
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*'); // DEV only
    // pastikan content-type oleh express.static (biasanya otomatis)
  }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, HOST, () => console.log(`Server running on ${HOST}:${PORT}`));
  })
  .catch((err) => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });

module.exports = app;
