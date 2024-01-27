'use strict';

var Database          = require("../core/ormdatabase"),
    Model             = require("../models/model.js");

var database = new Database();

var Election = database.sequelize.define("election",{
    electionId: {
        type: Database.Sequelize.INTEGER,
        primaryKey: true,
        field: "election_id",
        autoIncrement: true
    },
    name: {
        type: Database.Sequelize.STRING(45)
    },
    active: {
        type: Database.Sequelize.BOOLEAN
    },
    dateCreated: {
        type: Database.Sequelize.DATE,
        field: "date_created"
    }
},{
  tableName: Model.getTableName("ELECTION")
});

Election.findList = function(){
  var filter = {
    where: {
      active: true
    }
  };
  return Election.findAll(filter);
}

module.exports = Election;
