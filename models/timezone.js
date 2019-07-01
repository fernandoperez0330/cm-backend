"use strict";

var Config   = require("../config/config.js"),
    Database = require("../core/ormdatabase.js"),
    Common   = require('../core/common.js')(),
    Model    = require("./model.js");

var database = new Database();

const Timezone = database.sequelize.define("timezone",{
  timezoneId : {
    type: Database.Sequelize.INTEGER,
    primaryKey: true,
    field: "timezone_id"
  },
  name: {
    type: Database.Sequelize.STRING
  },
  utcOffset: {
    type: Database.Sequelize.STRING,
    field: "utc_offset"
  },
  active: {
    type: Database.Sequelize.BOOLEAN
  },
  dateCreated: {
    type: Database.Sequelize.DATE,
    field: "date_created"
  }
},{
  tableName: Model.getTableName("TIMEZONE")
});

Timezone.ID = {
  AMERICA__NEW_YORK: 169,
  AMERICA__PUERTO_RICO: 185,
  AMERICA__SANTO_DOMINGO: 197,
  AMERICA__TORONTO: 213
}

module.exports = Timezone;
