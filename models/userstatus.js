"use strict";

var Config      = require("../config/config.js"),
    Database    = require("../core/ormdatabase.js"),
    Common      = require('../core/common.js')(),
    Model       = require("./model.js"),
    Permission  = require("../models/permission.js"),
    UserGroupHasPermission = require("../models/usergrouphaspermission.js");

var database = new Database();

/**
* Constructor
*/
var UserStatus = database.sequelize.define(Model.getTableName("USER_STATUS"),{
    statusId:{
      type: Database.Sequelize.INTEGER,
      primaryKey: true,
      field: "status_id"
    },
    name: {
      type: Database.Sequelize.STRING
    },
    active: {
      type: Database.Sequelize.BOOLEAN
    },
    dateCreated: {
      type: Database.Sequelize.DATE,
      field: "date_created"
    }
});

UserStatus.TYPES = {
  ACTIVE: 1,
  INACTIVE: 2,
  PENDING: 3,
  BLOCKED: 4
};

module.exports = UserStatus;
