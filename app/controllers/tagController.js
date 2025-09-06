// app/controllers/tagController.js
const { Tag } = require('../models');
const slugify = require('slugify');

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
      if (!name || !String(name).trim()) return res.status(422).json({ error: 'tag_required' });
      const slug = slugify(name, { lower: true, strict: true });
      const [t, created] = await Tag.findOrCreate({
        where: { slug },
        defaults: { name, slug }
      });
      res.status(created ? 201 : 200).json({ data: t });
    } catch (err) { next(err); }
  }
};
