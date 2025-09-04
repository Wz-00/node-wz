// utils/tokens.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { RefreshToken } = require('../app/models'); // adjust path as needed
const ms = require('ms'); // optional, if you want to parse '7d' etc (install if used)

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '7d';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

// create access token
function signAccessToken(user) {
  const payload = { sub: user.id, role: user.role, username: user.username };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

// create refresh token string (long random) and store hashed version
async function createRefreshTokenInstance(user, options = {}) {
  // generate raw token (send raw to client, store hash)
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date(Date.now() + parseMsToMs(REFRESH_EXPIRES));
  const rt = await RefreshToken.create({
    tokenHash,
    userId: user.id,
    expiresAt
  });

  return { rawToken, instance: rt, expiresAt };
}

function parseMsToMs(val) {
  // accepts values like '15m', '7d', or ms numeric string
  // simple parser if ms package not installed:
  if (/^\d+$/.test(val)) return Number(val);
  const n = parseInt(val.slice(0,-1), 10);
  const unit = val.slice(-1);
  switch (unit) {
    case 's': return n * 1000;
    case 'm': return n * 60 * 1000;
    case 'h': return n * 60 * 60 * 1000;
    case 'd': return n * 24 * 60 * 60 * 1000;
    default: return 0;
  }
}

// validate refresh token: hash incoming raw, find in DB and check not revoked & not expired
async function findRefreshToken(rawToken) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const token = await RefreshToken.findOne({ where: { tokenHash } });
  return token;
}

module.exports = {
  signAccessToken,
  createRefreshTokenInstance,
  findRefreshToken,
};
