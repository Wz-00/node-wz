// ...existing code...
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tokenHash: { 
        type: Sequelize.STRING, 
        allowNull: false 
      }, 
      userId: { 
        type: Sequelize.BIGINT, 
        allowNull: false 
      },
      expiresAt: { 
        type: Sequelize.DATE, 
        allowNull: false 
      },
      revoked: { 
        type: Sequelize.BOOLEAN, 
        defaultValue: false 
      },
      replacedByTokenId: { 
        type: Sequelize.BIGINT, 
        allowNull: true 
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('refresh_tokens');
  }
};