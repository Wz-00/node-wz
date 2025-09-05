'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PostTag.init({
    id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      primaryKey: true, 
      autoIncrement: true 
    },
    post_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    tag_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
  }, {
    sequelize,
    modelName: 'PostTag',
    tableName: 'post_tags',
    underscored: true,
    timestamps: false
  });
  return PostTag;
};