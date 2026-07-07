'use strict';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var Config = function(){ };

Config.debug = process.env.DEBUG || false;

Config.server = {
    protocol: process.env.SERVER_PROTOCOL || "http", //server name
    host: process.env.SERVER_HOST || "localhost", //server name
    port: process.env.SERVER_PORT || '3003' //the app will use this only if the enviroment variable is not defined
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
  version: "1.2.0",
	mysql: {
    dialect: process.env.DB_MYSQL_DIALECT || "mysql",
    host: process.env.DB_MYSQL_HOST || 'localhost',
    user: process.env.DB_MYSQL_USER || 'smeuser',
    password: process.env.DB_MYSQL_PASSWORD || 'Sm32019!',
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

Config.crypt = {
  salt: {
    rounds:process.env.CRYPT_ROUND || 10
  }
};

Config.email = {
    from: process.env.EMAIL_FROM || "Sistema de Gestion de Mesas <digitador.manolitoalcalde@gmail.com>",
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
    username: process.env.EMAIL_USERNAME || "digitador.manolitoalcalde@gmail.com",
    password: process.env.EMAIL_PASSWORD || "Man0l1toAlcald32020!",
    useHtml: process.env.EMAIL_USE_HTML !== undefined ? (process.env.EMAIL_USE_HTML === "true") : true,
    ssl: process.env.EMAIL_SSL !== undefined ? (process.env.EMAIL_SSL === "true") : true,
    tls: process.env.EMAIL_TLS !== undefined ? (process.env.EMAIL_TLS === "true") : true,
};

Config.session = {
    duration: process.env.SESSION_DURATION || 60 /*in minutes*/,
    header_param_name: "xrqt-session-key"
};

Config.date = {
    //save the date in utc
    utc: process.env.DATE_UTC || true,
    dbformat: 'YYYY/MM/DD HH:mm:ss',
    outputFormat : "DD-MM-YYYY",
    outputFormatWithTime : "DD-MM-YYYY HH:mm:ss"
};

Config.log = {
  path: process.env.LOG_PATH || "./logs/"
}

Config.redis = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT) || 6379,
}

module.exports = Config;
