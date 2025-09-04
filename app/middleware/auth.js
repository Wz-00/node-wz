// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

async function authenticate(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing_token' });
    const token = auth.split(' ')[1];

    const payload = jwt.verify(token, ACCESS_SECRET);
    // optionally load user basic info (avoid heavy joins)
    const user = await User.findByPk(payload.sub, { attributes: ['id', 'username', 'role', 'email', 'name'] });
    if (!user) return res.status(401).json({ error: 'invalid_token' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'token_expired' });
    return res.status(401).json({ error: 'invalid_token' });
  }
}

module.exports = { authenticate };
