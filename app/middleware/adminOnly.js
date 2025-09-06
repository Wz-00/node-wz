// app/middleware/authorize.js
module.exports = function authorize(requiredRoles) {
  // support string atau array
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'missing_token' }); // seharusnya authenticate dipanggil sebelumnya

    // normalisasi role (jika Anda menyimpan role dalam lowercase)
    const userRole = String(req.user.role || '').toLowerCase();

    // cek keberadaan role
    const allowed = roles.map(r => String(r).toLowerCase()).includes(userRole);

    if (!allowed) {
      return res.status(403).json({ error: 'forbidden', message: 'Akses hanya untuk admin' });
    }

    next();
  };
};
