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
var SchoolZone = database.sequelize.define("schoolZone",{
    zoneId:{
      type: Database.Sequelize.INTEGER,
      primaryKey: true,
      field: "zone_id"
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
},{
  tableName: Model.getTableName("SCHOOL_ZONE")
});

module.exports = SchoolZone;
