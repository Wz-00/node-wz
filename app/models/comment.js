'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post' });
      Comment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  Comment.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    post_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    content: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('pending','approved','spam'), defaultValue: 'pending' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Comment;
};
