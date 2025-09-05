'use strict';
const slugify = require('slugify');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Post, { foreignKey: 'category_id', as: 'posts' });
    }
  }

  Category.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, unique: true },
    description: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Category.beforeValidate(async (cat) => {
    if (!cat.slug && cat.name) {
      const base = slugify(cat.name, { lower: true, strict: true });
      let slug = base;
      const CategoryModel = sequelize.models.Category;
      let i = 0;
      while (await CategoryModel.findOne({ where: { slug } })) {
        i += 1;
        slug = `${base}-${i}`;
      }
      cat.slug = slug;
    }
  });

  return Category;
};
