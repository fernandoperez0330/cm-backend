'use strict';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var Config = function(){ };

Config.debug = process.env.DEBUG || false;

Config.server = {
    protocol: process.env.SERVER_PROTOCOL || "http", //server name
    host: process.env.SERVER_HOST || "localhost", //server name
    port: process.env.SERVER_PORT || '3000' //the app will use this only if the enviroment variable is not defined
};

Config.app = {
  locale: {
    directory: './config/locales',
    locales: ['es'],
    modes: [
      'query',                //  optional detect querystring - `/?locale=en-US`
      'cookie',               //  optional detect cookie      - `Cookie: locale=zh-TW`
      'header'               //  optional detect header      - `Accept-Language: zh-CN,zh;q=0.5`
    ]
  }
}


Config.db = {
	mysql: {
    user: process.env.DB_MYSQL_USER || '',
    password: process.env.DB_MYSQL_PASSWORD || '',
    database: process.env.DB_MYSQL_DATABASE || 'SME2019_DB',
    pref_table: process.env.DB_MYSQL_PREF_TABLE || 'SME2019_',
    logging: process.env.DB_MYSQL_LOGGING !== undefined ? (process.env.DB_MYSQL_LOGGING === "true") : false,
    pool: {
      max: process.env.DB_POOL_MAX || 30,
      min: process.env.DB_POOL_MIN || 0,
      acquire: process.env.DB_POOL_ACQUIRE ||30000,
      idle: process.env.DB_POOL_IDLE || 100000
    }
  }
};

Config.date = {
    //save the date in utc
    utc: process.env.DATE_UTC || true,
    dbformat: 'YYYY/MM/DD HH:mm:ss',
    outputFormat : "MM/DD/YYYY",
    outputFormatWithTime : "MM/DD/YYYY HH:mm:ss"
};

Config.log = {
  path: process.env.LOG_PATH || "./logs/"
}

Config.redis = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT) || 6379,
}

module.exports = Config;
