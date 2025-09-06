'use strict';
const { Media } = require('../../app/models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Media.bulkCreate([{
          filename: 'img1.jpg',
          path: '/uploads/img1.jpg',
          mime: 'image/jpeg',
          size: 12345,
          uploaded_by: 1,
          created_at: new Date()
        }, {
          filename: 'img2.png',
          path: '/uploads/img2.png',
          mime: 'image/png',
          size: 12345,
          uploaded_by: 1,
          created_at: new Date()
        }, {
          filename: 'img3.jpg',
          path: '/uploads/img3.jpg',
          mime: 'image/jpeg',
          size: 12345,
          uploaded_by: 1,
          created_at: new Date()
        }, {
          filename: 'img4.jpg',
          path: '/uploads/img4.jpg',
          mime: 'image/jpeg',
          size: 12345,
          uploaded_by: 1,
          created_at: new Date()
        }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('media', null, {});
  }
};
