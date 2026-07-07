const config = require('./config');

module.exports = {
  development: {
    username: config.db.mysql.user,
    password: config.db.mysql.password,
    database: config.db.mysql.database,
    host: config.db.mysql.host,
    dialect: config.db.mysql.dialect,
    logging: config.db.mysql.logging,
    pool: config.db.mysql.pool,
    migrationStorage: 'sequelize',
    migrationStorageTableName: config.db.mysql.pref_table + 'SEQUELIZE_META'
  },
  test: {
    username: config.db.mysql.user,
    password: config.db.mysql.password,
    database: config.db.mysql.database,
    host: config.db.mysql.host,
    dialect: config.db.mysql.dialect,
    logging: false,
    pool: config.db.mysql.pool,
    migrationStorage: 'sequelize',
    migrationStorageTableName: config.db.mysql.pref_table + 'SEQUELIZE_META'
  },
  production: {
    username: config.db.mysql.user,
    password: config.db.mysql.password,
    database: config.db.mysql.database,
    host: config.db.mysql.host,
    dialect: config.db.mysql.dialect,
    logging: false,
    pool: config.db.mysql.pool,
    migrationStorage: 'sequelize',
    migrationStorageTableName: config.db.mysql.pref_table + 'SEQUELIZE_META'
  }
};
