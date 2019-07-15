'use strict';

let Model       = require('./model.js'),
    Database    = require("../core/ormdatabase.js"),
    Table       = require("../models/table.js"),
    database    = new Database(),
    User        = require("../models/user.js");

const Op = Database.Sequelize.Op;

var Voter = database.sequelize.define("voter",{
  voterId:{
    type: Database.Sequelize.INTEGER,
    primaryKey: true,
    field: "voter_id",
    autoIncrement: true
  },
  fullname: {
    type: Database.Sequelize.STRING,
    field: "fullname",
    validate: {
      notEmpty: true
    }
  },
  document: {
    type: Database.Sequelize.STRING,
    field: "document",
    validate: {
      is: ["^[0-9]+$",'i'],
      len : [11,11],
      notEmpty: true
    }
  },
  address: {
    type: Database.Sequelize.STRING,
    field: "address",
    validate: {
      notEmpty: true
    }
  },
  phone: {
    type: Database.Sequelize.STRING,
    field: "phone",
    validate: {
      is: ["^[0-9]+$",'i'],
      notEmpty: true
    }
  },
  mobile: {
    type: Database.Sequelize.STRING,
    field: "mobile",
    validate: {
      is: ["^[0-9]+$",'i'],
      notEmpty: true
    }
  },
  tableId: {
    type: Database.Sequelize.INTEGER,
    references: {
      model: Table,
      key: "tableId"
    }
  },
  isCoordinator: {
    type: Database.Sequelize.BOOLEAN,
    field: "is_coordinator"
  },
  coordinatorId: {
    type: Database.Sequelize.INTEGER,
    field: "coordinator_id",
    allowNull: true,
    validate: {
      isInt: true
    }
  },
  active: {
    type: Database.Sequelize.BOOLEAN
  },
  createdBy: {
    type: Database.Sequelize.INTEGER,
    field: "created_by",
    references: {
      model: User,
      key: "userId"
    }
  },
  dateCreated: {
    type: Database.Sequelize.DATE,
    field: "date_created"
  }
},{
  tableName: Model.getTableName("VOTER")
});

Voter.belongsTo(Voter, {as: 'coordinator', foreignKey: 'coordinatorId'});


Voter.belongsTo(Table,{ foreignKey: "tableId"});

/**
* Method to find and existing table number
* @param filter object to filter the find existing table
*/
Voter.findExisting = (filter,voter)=>{
  return new Promise((resolve,reject)=>{
      if (typeof filter !== "object") {
        reject();
        return;
      }

      var where = {};
      if (typeof voter === "object" && voter != null){
          where = {
            voterId: { [Op.ne]: voter.voterId }
          };
      }

      where = Object.assign({},filter,where);
      Voter.findOne({
        attributes: ["voterId"],
        where: where
      }).then(results=>{
        resolve(results);
      }).catch(err=>{
        reject(err);
      });
  });
}

/**
* Method to find tables (with or without pagination)
*/
Voter.find = (ctx,filter,pag)=>{
  if (typeof filter == "undefined") { filter = {}; }
  if (typeof pag == "undefined") { pag = null; }

  filter = Object.assign({},{
    where: {active: true},
    order: [
      ['dateCreated','DESC']
    ]
  }, filter);

  return new Promise(async(resolve,reject)=>{
    var onError = function(err){
      reject(err);
    }

    if (pag != null){
        await database.sequelize.findAllWithPagination(ctx,Voter,filter,{
          currentPage: pag
        }).then(results=>{
          resolve(results);
        }).catch(err=>{
            onError(err);
        });
    }else{
      await Voter.findAll(filter).then(voters=>{
          resolve(voters);
      }).catch(err=>{
          onError(err);
      });
    }
  });
}

module.exports = Voter;
