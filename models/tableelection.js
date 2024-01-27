'use strict';

let Model = require('./model.js'),
    Database = require("../core/ormdatabase.js"),
    database = new Database(),
    Election = require("../models/election.js"),
    Table = require("../models/table.js");

var TableElection = database.sequelize.define("tableElection", {
    tableId: {
      type: Database.Sequelize.INTEGER,
      primaryKey: true,
      field: "table_id",
      references: {
        model: Table,
        foreignKey: "tableId"
      }
    },
    electionId: {
        type: Database.Sequelize.INTEGER(3),
        primaryKey: true,
        field: "election_id",
        references: {
          model: Election,
          foreignKey: "electionId"
        }
    },
    totalVoters: {
        type: Database.Sequelize.INTEGER ,
        field: "total_voters"
    },
    active: {
        type: Database.Sequelize.BOOLEAN
    },
    dateCreated: {
        type: Database.Sequelize.DATE,
        field: "date_created"
    }
},{
  tableName: Model.getTableName("TABLE_ELECTION")
});


TableElection.belongsTo(Table, { foreignKey: "tableId"});
Table.belongsTo(TableElection, { foreignKey: "tableId"});

TableElection.belongsTo(Election, { foreignKey: "electionId"});
Election.belongsTo(TableElection, { foreignKey: "electionId"});

module.exports = TableElection;
