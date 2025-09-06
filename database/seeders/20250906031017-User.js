'use strict';
const bcrypt = require('bcrypt');
const { User } = require('../../app/models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const johnPass = await bcrypt.hash('john1234', 10);
    const phrolovaPass = await bcrypt.hash('phrolova123', 10);
    const adminPass = await bcrypt.hash('admin123', 10);
    await User.bulkCreate([{
          name: 'Admin1',
          username: 'admin',
          password: adminPass,
          email: 'admin1@example.com',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'John Doe',
          username: 'john123',
          password: johnPass,
          email: 'john.doe@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }, {
          name: 'Phrolova',
          username: 'phrolova',
          password: phrolovaPass,
          email: 'phrolova@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
