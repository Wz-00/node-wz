'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Media extends Model {
    static associate(models) {
      Media.belongsTo(models.User, { foreignKey: 'uploaded_by', as: 'uploader' });
    }
  }

  Media.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    filename: { type: DataTypes.STRING },
    path: { type: DataTypes.STRING },
    mime: { type: DataTypes.STRING },
    size: { type: DataTypes.INTEGER },
    uploaded_by: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'Media',
    tableName: 'media',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Media;
};
