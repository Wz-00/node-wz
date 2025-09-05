'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      post_id: { 
        type: Sequelize.INTEGER.UNSIGNED, 
        allowNull: false 
      },
      tag_id: { 
        type: Sequelize.INTEGER.UNSIGNED, 
        allowNull: false 
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('post_tags');
  }
};