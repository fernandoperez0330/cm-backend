'use strict';

var Database          = require("../core/ormdatabase"),
    Model             = require("../models/model.js");

var database = new Database();

var Platform = database.sequelize.define("platform",{
    platformId: {
        type: Database.Sequelize.INTEGER,
        primaryKey: true,
        field: "platform_id",
        autoIncrement: true
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
  tableName: Model.getTableName("PLATFORM")
});

Platform.PLATFORM = {WEB: 1, ANDROID: 2, IOS: 3};

module.exports = Platform;
