'use strict';

const Config = require('../config/config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = `${Config.db.mysql.pref_table}VOTER`;

    await queryInterface.addColumn(tableName, 'birthday', {
      type: Sequelize.DATEONLY,
      allowNull: false
    });

    await queryInterface.addColumn(tableName, 'facebook', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn(tableName, 'instagram', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn(tableName, 'xsocialnetwork', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface) {
    const tableName = `${Config.db.mysql.pref_table}VOTER`;

    await queryInterface.removeColumn(tableName, 'birthday');
    await queryInterface.removeColumn(tableName, 'facebook');
    await queryInterface.removeColumn(tableName, 'instagram');
    await queryInterface.removeColumn(tableName, 'xsocialnetwork');
  }
};
