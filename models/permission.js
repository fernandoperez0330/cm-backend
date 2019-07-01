'use strict';

var common      = require('../core/common.js')(),
    Model       = require('./model.js'),
    Database    = require("../core/ormdatabase.js"),
    User        = require("./user"),
    UserGroup   = require("../models/usergroup.js");

var database = new Database();

const Permission = database.sequelize.define("permission",{
  permissionId:{
    type: Database.Sequelize.INTEGER,
    primaryKey: true,
    field: "permission_id",
    autoIncrement: true
  },
  name: {
    type: Database.Sequelize.STRING
  },
  description: {
    type: Database.Sequelize.STRING
  },
  active: {
    type: Database.Sequelize.BOOLEAN
  },
  dateCreated: {
    type: Database.Sequelize.DATE,
    field: "date_created"
  }
},{
  tableName: Model.getTableName("PERMISSION")
});

module.exports = Permission;
