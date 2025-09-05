// app/middleware/authorize.js
module.exports = {
  requireRole: (role) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    if (req.user.role !== role) return res.status(403).json({ error: 'forbidden' });
    next();
  },

  requireOwnerOrAdmin: (modelName, idParam = 'id', ownerKey = 'user_id') => {
    // expects req.user and model available in req.app.get('models') or require('../app/models')
    return async (req, res, next) => {
      try {
        const models = require('../models'); // app/models/index.js
        const Model = models[modelName];
        if (!Model) return res.status(500).json({ error: 'model_not_found' });

        const id = req.params[idParam];
        const instance = await Model.findByPk(id, { attributes: [ownerKey] });
        if (!instance) return res.status(404).json({ error: 'not_found' });

        if (req.user.role === 'admin' || instance[ownerKey] === req.user.id) {
          req.resource = instance;
          return next();
        }

        return res.status(403).json({ error: 'forbidden' });
      } catch (err) {
        next(err);
      }
    };
  }
};
