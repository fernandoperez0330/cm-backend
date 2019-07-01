'use strict'

var Config        = require("../config/config.js"),
    Model         = require("../models/model.js"),
    Database      = require("../core/ormdatabase.js"),
    Permission    = require("../models/permission.js"),
    UserGroup     = require("../models/usergroup.js");

var database = new Database();

var UserGroupHasPermission = database.sequelize.define("userGroupHasPermission",{
    userGroupId: {
        type: Database.Sequelize.INTEGER,
        field: "user_group_id",
        primaryKey: true,
        references: {
          model: UserGroup,
          foreignKey: "userGroupId"
        }
    },
    permissionId: {
        type: Database.Sequelize.INTEGER,
        field: "permission_id",
        primaryKey: true,
        references: {
          model: Permission,
          foreignKey: "permissionId"
        }
    },
    method: {
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
    tableName: Model.getTableName("USER_GROUP_HAS_PERMISSION")
});

module.exports = UserGroupHasPermission;
