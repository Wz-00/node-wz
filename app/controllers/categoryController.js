// app/controllers/categoryController.js
const { Category } = require('../models');

module.exports = {
  async list(req, res, next) {
    try {
      const rows = await Category.findAll({ attributes: ['id','name','slug','description'] });
      res.json({ data: rows });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const { name, description } = req.body;
      const cat = await Category.create({ name, description });
      res.status(201).json({ data: cat });
    } catch (err) { next(err); }
  }
  // add update/delete similarly if needed
};
