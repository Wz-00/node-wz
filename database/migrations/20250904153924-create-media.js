'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('media', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      filename: { 
        type: Sequelize.STRING 
      },
      path: { 
        type: Sequelize.STRING 
      },
      mime: { 
        type: Sequelize.STRING 
      },
      size: { 
        type: Sequelize.INTEGER 
      },
      uploaded_by: {
        type: Sequelize.INTEGER
      },
      created_at: { 
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW 
      },
      updated_at: { 
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW 
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('media');
  }
};