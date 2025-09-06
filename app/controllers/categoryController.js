// app/controllers/categoryController.js
const { Category, Post } = require('../models');
const slugify = require('slugify');

module.exports = {
  async list(req, res, next) {
    try {
      const rows = await Category.findAll({ attributes: ['id','name','slug','description'] });
      res.json({ data: rows });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      // defense-in-depth (opsional)
      if (!req.user || String(req.user.role || '').toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'forbidden', message: 'Akses hanya untuk admin' });
      }

      const { name, description } = req.body;
      if (!name || !String(name).trim()) return res.status(422).json({ error: 'category_required' });

      const slug = slugify(name, { lower: true, strict: true });
      const [cat, created] = await Category.findOrCreate({
        where: { slug },
        defaults: { name, description, slug }
      });

      res.status(created ? 201 : 200).json({ data: cat });
    } catch (err) { next(err); }
  },
  // GET /categories/posts
  async withPosts(req, res, next) {
    try {
      const limitPerCategory = Math.min(6, parseInt(req.query.limitPerCategory || '4', 10));
      const categories = await Category.findAll({
        include: [
          {
            model: Post,
            as: 'posts',
            where: { status: 'published' },
            required: true, // hanya category yg punya posts
            attributes: ['id','title','slug','featured_image','published_at'],
            limit: limitPerCategory,
            order: [['published_at', 'DESC']]
          }
        ],
        attributes: ['id','name','slug'],
      });
      res.json({ data: categories });
    } catch (err) { next(err); }
  }

};