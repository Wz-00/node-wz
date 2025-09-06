'use strict';
const { Tag } = require('../../app/models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Tag.bulkCreate([{
          name: 'korupsi',
          slug: 'korupsi',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'mobil',
          slug: 'mobil',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'demonstrasi',
          slug: 'demonstrasi',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'Laptop',
          slug: 'Laptop',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'Politik',
          slug: 'politik',
          createdAt: new Date(),
          updatedAt: new Date()
        }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tags', null, {});
  }
};
