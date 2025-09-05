// app/controllers/commentController.js
const { Comment } = require('../models');

module.exports = {
  async create(req, res, next) {
    try {
      const { post_id, content, name, email } = req.body;
      const payload = {
        post_id,
        content,
        user_id: req.user ? req.user.id : null,
        name: req.user ? req.user.name : name,
        email: req.user ? req.user.email : email,
        status: 'pending'
      };
      const comment = await Comment.create(payload);
      res.status(201).json({ data: comment });
    } catch (err) { next(err); }
  },

  async listByPost(req, res, next) {
    try {
      const postId = req.params.postId;
      const rows = await Comment.findAll({ where: { post_id: postId, status: 'approved' }, order: [['created_at','ASC']] });
      res.json({ data: rows });
    } catch (err) { next(err); }
  },

  async moderate(req, res, next) {
    try {
      // only admin or editor (we only have admin/user right now)
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
      const id = req.params.id;
      const comment = await Comment.findByPk(id);
      if (!comment) return res.status(404).json({ error: 'not_found' });
      comment.status = req.body.status || 'approved';
      await comment.save();
      res.json({ data: comment });
    } catch (err) { next(err); }
  }
};
