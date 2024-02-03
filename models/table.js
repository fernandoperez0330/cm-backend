'use strict';

let Model       = require('./model.js'),
    Database    = require("../core/ormdatabase.js"),
    database    = new Database(),
    School      = require("../models/school.js");

const Op = Database.Sequelize.Op;

var Table = database.sequelize.define("table",{
  tableId:{
    type: Database.Sequelize.INTEGER,
    primaryKey: true,
    field: "table_id",
    autoIncrement: true
  },
  schoolId: {
    type: Database.Sequelize.INTEGER,
    references: {
      model: School,
      key: "schoolId"
    }
  },
  tableNumber: {
    type: Database.Sequelize.STRING,
    field: "table_number",
  },
  active: {
    type: Database.Sequelize.BOOLEAN
  },
  dateCreated: {
    type: Database.Sequelize.DATE,
    field: "date_created"
  }
},{
  tableName: Model.getTableName("TABLE")
});


Table.belongsTo(School, { foreignKey: "schoolId"});

module.exports = Table;
