// app/controllers/postController.js
const { validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const { Post, Tag, PostTag, Category, Media, sequelize } = require('../models');

const DEFAULT_PAGE_SIZE = 10;

module.exports = {
  // GET /posts? page, limit, q, tag, category, author
  async listPublic(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const limit = Math.min(50, parseInt(req.query.limit || DEFAULT_PAGE_SIZE, 10));
      const offset = (page - 1) * limit;

      const where = { status: 'published' };
      if (req.query.q) {
        // simple title/content LIKE search
        where[sequelize.Op.or] = [
          { title: { [sequelize.Op.like]: `%${req.query.q}%` } },
          { content: { [sequelize.Op.like]: `%${req.query.q}%` } }
        ];
      }
      if (req.query.category) where.category_id = req.query.category;
      if (req.query.author) where.user_id = req.query.author;

      const include = [{ model: Category, as: 'category', attributes: ['id','name','slug'] }, { model: Tag, as: 'tags', attributes: ['id','name','slug'], through: { attributes: [] } }, { association: 'author', attributes: ['id','username','name'] }];

      const { count, rows } = await Post.findAndCountAll({
        where, include, attributes: ['id','title','slug','excerpt','featured_image','published_at','created_at'], limit, offset, order: [['published_at','DESC']]
      });

      res.json({
        meta: { page, limit, total: count, pages: Math.ceil(count/limit) },
        data: rows
      });
    } catch (err) { next(err); }
  },

  // GET /posts/:slug
  async getBySlug(req, res, next) {
    try {
      const slug = req.params.slug;
      const post = await Post.findOne({
        where: { slug, status: 'published' },
        include: [{ association: 'author', attributes: ['id','username','name'] }, { association: 'tags', attributes: ['id','name','slug'], through: { attributes: [] } }, { association: 'comments' }]
      });
      if (!post) return res.status(404).json({ error: 'not_found' });
      // optionally increment view counter (add view_count field if needed)
      res.json({ data: post });
    } catch (err) { next(err); }
  },

  // POST /posts  (auth required)
  async create(req, res, next) {
    try {
      console.log('--- POST.CREATE called ---');
      console.log('Authenticated user:', req.user && { id: req.user.id, username: req.user.username, role: req.user.role });
      console.log('Request body preview:', {
        title: req.body.title,
        excerpt: req.body.excerpt,
        category_id: req.body.category_id,
        status: req.body.status,
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags.slice(0,5) : String(req.body.tags).slice(0,200)) : undefined
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(422).json({ errors: errors.array() });
      }

      const { title, excerpt, content, category_id, tags } = req.body;
      // sanitize content
      const cleanContent = sanitizeHtml(content || '', {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img','h1','h2','h3']),
        allowedAttributes: { a: ['href','target','rel'], img: ['src','alt','width','height'] }
      });

      // transactional create post + tags link
      const result = await sequelize.transaction(async (t) => {
        console.log('Creating Post row (within transaction)...');
        const post = await Post.create({
          user_id: req.user.id,
          title,
          excerpt,
          content: cleanContent,
          category_id,
          status: req.body.status === 'published' ? 'published' : 'draft',
          published_at: req.body.status === 'published' ? new Date() : null,
          featured_image: req.body.featured_image || null
        }, { transaction: t });

        console.log('Post created id=', post.id);

        // tags may be comma-separated or array of tag names/ids
        if (tags) {
          let tagList = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(s=>s.trim()).filter(Boolean) : []);
          for (let tItem of tagList) {
            let tag;
            if (/^\d+$/.test(tItem)) {
              tag = await Tag.findByPk(tItem, { transaction: t });
            } else {
              tag = await Tag.findOne({ where: { name: tItem }, transaction: t });
              if (!tag) tag = await Tag.create({ name: tItem }, { transaction: t });
            }
            if (tag) {
              await PostTag.create({ post_id: post.id, tag_id: tag.id }, { transaction: t });
            }
          }
        }
        return post;
      });

      console.log('Transaction committed, post id=', result.id);
      res.status(201).json({ data: result });
    } catch (err) {
      // richer error logging
      console.error('POST.CREATE ERROR:', err && err.message);
      if (err && err.original) {
        console.error('err.original:', err.original);
      }
      if (err && err.errors) console.error('err.errors:', err.errors);

      // return useful debug info for now (remove in prod)
      return res.status(500).json({
        error: 'post_create_error',
        message: err.message,
        sqlError: err.original ? (err.original.sqlMessage || err.original.message) : undefined,
        sql: err.original ? err.original.sql : undefined
      });
    }
  },


  // PUT /posts/:id  (owner or admin)
  async update(req, res, next) {
    try {
      const id = req.params.id;
      const post = await Post.findByPk(id);
      if (!post) return res.status(404).json({ error: 'not_found' });
      // check owner/admin
      if (!(req.user.role === 'admin' || post.user_id === req.user.id)) return res.status(403).json({ error: 'forbidden' });

      const { title, excerpt, content, category_id, tags } = req.body;
      if (content) {
        post.content = sanitizeHtml(content, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img','h1','h2','h3']),
          allowedAttributes: { a: ['href','target','rel'], img: ['src','alt'] }
        });
      }
      if (title) post.title = title;
      if (excerpt) post.excerpt = excerpt;
      if (category_id !== undefined) post.category_id = category_id;
      if (req.body.status) {
        post.status = req.body.status;
        if (req.body.status === 'published' && !post.published_at) post.published_at = new Date();
      }
      if (req.body.featured_image) post.featured_image = req.body.featured_image;

      await post.save();

      // update tags (simplified: remove all and re-add)
      if (tags !== undefined) {
        await PostTag.destroy({ where: { post_id: post.id } });
        let tagList = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(s=>s.trim()).filter(Boolean) : []);
        for (let tItem of tagList) {
          let tag;
          if (/^\d+$/.test(tItem)) tag = await Tag.findByPk(tItem);
          else {
            tag = await Tag.findOne({ where: { name: tItem } });
            if (!tag) tag = await Tag.create({ name: tItem });
          }
          if (tag) await PostTag.create({ post_id: post.id, tag_id: tag.id });
        }
      }

      res.json({ data: post });
    } catch (err) { next(err); }
  },

  // DELETE /posts/:id (soft)
  async remove(req, res, next) {
    try {
      const id = req.params.id;
      const post = await Post.findByPk(id);
      if (!post) return res.status(404).json({ error: 'not_found' });
      if (!(req.user.role === 'admin' || post.user_id === req.user.id)) return res.status(403).json({ error: 'forbidden' });

      await post.destroy(); // soft delete if paranoid true
      res.json({ success: true });
    } catch (err) { next(err); }
  }
};
