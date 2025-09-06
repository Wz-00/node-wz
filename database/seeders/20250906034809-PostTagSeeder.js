'use strict';
const { PostTag } = require('../../app/models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await PostTag.bulkCreate([{
          post_id: 64,
          tag_id: 3
        }, {
          post_id: 65,
          tag_id: 4
        }, {
          post_id: 66,
          tag_id: 2
        }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('post_tags', null, {});
  }
};
