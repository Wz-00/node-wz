'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RefreshToken.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  RefreshToken.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    tokenHash: { type: DataTypes.STRING(128), allowNull: false }, // store SHA256 hash
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
    replacedByTokenId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true }
  }, {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ fields: ['userId'] }, { fields: ['tokenHash'] }]
  });
  return RefreshToken;
};