'use strict';
const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.User, { foreignKey: 'user_id', as: 'author' });
      Post.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
      Post.hasMany(models.Comment, { foreignKey: 'post_id', as: 'comments' });
      Post.belongsToMany(models.Tag, { through: models.PostTag, foreignKey: 'post_id', otherKey: 'tag_id', as: 'tags' });
    }
  }

  Post.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    excerpt: { type: DataTypes.STRING(512) },
    content: { type: DataTypes.TEXT('long') },
    featured_image: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('draft','published'), defaultValue: 'draft' },
    published_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  });

  // Hooks: sanitize content + generate unique slug
  Post.beforeValidate(async (post, options) => {
    try {
      if (post.content && typeof post.content === 'string') {
        post.content = sanitizeHtml(post.content, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img','h1','h2','h3']),
          allowedAttributes: {
            a: ['href','name','target','rel'],
            img: ['src','alt','width','height']
          }
        });
      }

      if (!post.slug && post.title) {
        const base = slugify(post.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
        let slug = base;

        // try to ensure uniqueness by checking DB, but guard with try/catch:
        try {
          const PostModel = sequelize.models.Post;
          let idx = 0;
          // small loop but will bail out on DB errors
          while (await PostModel.findOne({ where: { slug } })) {
            idx += 1;
            slug = `${base}-${Date.now().toString(36).slice(-4)}${idx ? `-${idx}`:''}`;
            // safety: prevent infinite loop, break after few attempts
            if (idx > 5) {
              slug = `${base}-${Date.now().toString(36)}`;
              break;
            }
          }
        } catch (dbErr) {
          // LOG DB ERROR but do not throw — fallback to unique-ish slug
          console.error('Post.beforeValidate - DB check failed, falling back to timestamp slug. Error:', dbErr && (dbErr.original ? dbErr.original.sqlMessage || dbErr.message : dbErr.message));
          slug = `${base}-${Date.now().toString(36)}`;
        }

        post.slug = slug;
      }
    } catch (err) {
      // catch any unexpected error in hook to avoid crashing request
      console.error('Post.beforeValidate - unexpected error:', err && err.message);
      // if we still don't have slug, create fallback
      if (!post.slug && post.title) {
        const base = slugify(post.title, { lower: true, strict: true });
        post.slug = `${base}-${Date.now().toString(36)}`;
      }
    }
  });

  return Post;
};
