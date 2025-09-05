// app/controllers/tagController.js
const { Tag } = require('../models');

module.exports = {
  async list(req, res, next) {
    try {
      const rows = await Tag.findAll({ attributes: ['id','name','slug'] });
      res.json({ data: rows });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const { name } = req.body;
      const t = await Tag.create({ name });
      res.status(201).json({ data: t });
    } catch (err) { next(err); }
  }
};
