'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('configs', [
      {
        key: 'current_number',
        value: '0000000000000',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'secret_key',
        value: 'FAKESECRETKEY',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('configs', null, {});
  }
};
