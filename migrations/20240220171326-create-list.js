'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lists', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      root_url: {
        type: Sequelize.TEXT,
      },
      short_url: {
        type: Sequelize.TEXT,
      },
      password: {
        type: Sequelize.TEXT,
      },
      access_number: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      safe_redirect: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      custom_path: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lists');
  }
};