'use strict';
const { Category } = require('../../app/models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Category.bulkCreate([{
          name: 'Politik',
          slug: 'politik',
          description: 'Artikel tentang politik',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'Teknologi',
          slug: 'teknologi',
          description: 'Artikel tentang Teknologi',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'Fashion',
          slug: 'fashion',
          description: 'Artikel tentang Fashion',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'Otomotif',
          slug: 'otomotif',
          description: 'Artikel tentang Otomotif',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'Ekonomi',
          slug: 'ekonomi',
          description: 'Artikel tentang Ekonomi',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'Olahraga',
          slug: 'Olahraga',
          description: 'Artikel tentang Olahraga',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'Kesehatan',
          slug: 'kesehatan',
          description: 'Artikel tentang Kesehatan',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'Lingkungan',
          slug: 'lingkungan',
          description: 'Artikel tentang Lingkungan',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'Cek Fakta',
          slug: 'cek-fakta',
          description: 'Artikel tentang Cek Fakta',
          createdAt: new Date(),
          updatedAt: new Date()
        }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
