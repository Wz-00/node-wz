// controllers/authController.js
const { User, RefreshToken, sequelize } = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize'); 
const { signAccessToken, createRefreshTokenInstance, findRefreshToken } = require('../../utils/tokens');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

// Helper: set httpOnly refresh cookie
function setRefreshCookie(res, token, expiresDays = 7) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: expiresDays * 24 * 60 * 60 * 1000 // ms
  };
  res.cookie('refreshToken', token, cookieOptions);
}

// POST /auth/register
async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  // Quick DB connection check (helpful ketika error terjadi saat query)
  try {
    await sequelize.authenticate();
    console.log('DB connection OK');
  } catch (connErr) {
    console.error('DB connection FAILED:', connErr && (connErr.message || connErr));
    return res.status(500).json({ error: 'db_connection_failed' });
  }

  const { name, username, password, email, role } = req.body;
  let t;
  try {
    t = await sequelize.transaction();

    // Check uniqueness
    const exists = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
      transaction: t
    });

    if (exists) {
      await t.rollback();
      return res.status(400).json({ error: 'username or email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = await User.create(
      { name, username, password: hashedPassword, email, role: role || 'user' },
      { transaction: t }
    );

    await t.commit();

    const accessToken = signAccessToken(user);
    const { rawToken: refreshToken, expiresAt } = await createRefreshTokenInstance(user);
    setRefreshCookie(res, refreshToken, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));

    return res.status(201).json({ message: 'registered', accessToken, user: user.toJSON() });
  } catch (err) {
    // rollback aman
    try { if (t && !t.finished) await t.rollback(); } catch (rbErr) { console.error('rollback error', rbErr); }

    // Log detail error di server (tidak dikirimkan ke client)
    console.error('Register error DETAILS:');
    console.error('name:', err.name);
    console.error('message:', err.message);
    if (err.sql) console.error('sql:', err.sql);
    // Sequelize sering menyimpan info SQL di err.parent / err.original
    if (err.parent) console.error('parent.sqlMessage:', err.parent.sqlMessage || err.parent.message);
    if (err.original) console.error('original:', err.original);
    console.error('stack:', err.stack);

    // safety-net untuk unique constraint
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'username or email already in use' });
    }

    return res.status(500).json({ error: 'internal_server_error' });
  }
}



// POST /auth/login
async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'invalid_credentials' });

    const accessToken = signAccessToken(user);
    const { rawToken: refreshToken, expiresAt } = await createRefreshTokenInstance(user);
    setRefreshCookie(res, refreshToken, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));

    return res.json({ message: 'logged_in', accessToken, user: user.toJSON() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

// POST /auth/refresh
async function refresh(req, res) {
  try {
    const raw = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!raw) return res.status(401).json({ error: 'no_refresh_token' });

    const token = await findRefreshToken(raw);
    if (!token || token.revoked) return res.status(401).json({ error: 'invalid_refresh_token' });
    if (new Date() > token.expiresAt) return res.status(401).json({ error: 'refresh_token_expired' });

    // rotate: create new refresh token, mark old revoked and set replacedByTokenId
    const user = await User.findByPk(token.userId);
    if (!user) return res.status(401).json({ error: 'invalid_refresh_token' });

    const { rawToken: newRaw, instance: newInstance, expiresAt } = await createRefreshTokenInstance(user);

    token.revoked = true;
    token.replacedByTokenId = newInstance.id;
    await token.save();

    const accessToken = signAccessToken(user);
    setRefreshCookie(res, newRaw, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));

    return res.json({ accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

// POST /auth/logout
async function logout(req, res) {
  try {
    const raw = req.cookies?.refreshToken || req.body?.refreshToken;
    if (raw) {
      const token = await findRefreshToken(raw);
      if (token) {
        token.revoked = true;
        await token.save();
      }
    }
    // clear cookie
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict', secure: process.env.COOKIE_SECURE === 'true' });
    return res.json({ message: 'logged_out' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
}

module.exports = { register, login, refresh, logout };
