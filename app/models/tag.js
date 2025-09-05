'use strict';
const slugify = require('slugify');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    static associate(models) {
      Tag.belongsToMany(models.Post, { through: models.PostTag, foreignKey: 'tag_id', otherKey: 'post_id', as: 'posts' });
    }
  }

  Tag.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, unique: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'Tag',
    tableName: 'tags',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Tag.beforeValidate(async (tag) => {
    if (!tag.slug && tag.name) {
      const base = slugify(tag.name, { lower: true, strict: true });
      let slug = base;
      const TagModel = sequelize.models.Tag;
      let i = 0;
      while (await TagModel.findOne({ where: { slug } })) {
        i += 1;
        slug = `${base}-${i}`;
      }
      tag.slug = slug;
    }
  });

  return Tag;
};
