"use strict";
var util = require("util");

var Model = function(){};

/**
 * Method to get the table name with databse prefix
 * @param {string} tableName
 * @return {[type]} [description]
 */
Model.getTableName = function(tableName){
  if (typeof tableName !== "string" || tableName === null) return null;
  return util.format("%s%s",Config.db.mysql.pref_table,tableName);
}

module.exports = Model;
