'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
    }
    toJSON() {
      // hide sensitive fields
      const values = Object.assign({}, this.get());
      delete values.password;
      return values;
    }
  }
  User.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    indexes: [{ unique: true, fields: ['username'] }, { unique: true, fields: ['email'] }]

  });
  return User;
};