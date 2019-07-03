'use strict';

let Model       = require('./model.js'),
    Database    = require("../core/ormdatabase.js"),
    database    = new Database();

var School = database.sequelize.define("school",{
  schoolId:{
    type: Database.Sequelize.INTEGER,
    primaryKey: true,
    field: "school_id",
    autoIncrement: true
  },
  name: {
    type: Database.Sequelize.STRING
  },
  schoolNumber: {
    type: Database.Sequelize.STRING,
    field: "school_number",
  },
  address: {
    type: Database.Sequelize.STRING
  },
  latitude: {
    type: Database.Sequelize.FLOAT
  },
  longitude: {
    type: Database.Sequelize.FLOAT
  },
  active: {
    type: Database.Sequelize.BOOLEAN
  },
  dateCreated: {
    type: Database.Sequelize.DATE,
    field: "date_created"
  }
},{
  tableName: Model.getTableName("SCHOOL")
});

module.exports = School;
