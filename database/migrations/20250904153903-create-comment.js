'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      post_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false 
      },
      user_id: { 
        type: Sequelize.INTEGER, 
        allowNull: true 
      },
      name: { 
        type: Sequelize.STRING 
      },
      email: { 
        type: Sequelize.STRING 
      },
      content: { 
        type: Sequelize.TEXT 
      },
      status: { 
        type: Sequelize.ENUM('pending','approved','spam'), 
        defaultValue: 'pending' 
      },
      created_at: { 
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW 
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comments');
  }
};