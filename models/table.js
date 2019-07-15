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


Table.belongsTo(School,{ foreignKey: "schoolId"});

/**
* Method to find and existing table number
* @param filter object to filter the find existing table
*/
Table.findExisting = (filter,table)=>{
  return new Promise((resolve,reject)=>{
      if (typeof filter !== "object") {
        //invalid table number to verify
        reject();
        return;
      }


      var where = {};
      if (typeof table === "object" && table != null){
          where = {
            tableId: { [Op.ne]: table.tableId }
          };
      }

      where = Object.assign({},filter,where);
      Table.findOne({
        attributes: ["tableId"],
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
Table.find = (ctx,filter,pag )=>{
  if (typeof filter == "undefined") { filter = {}; }
  if (typeof pag == "undefined") { pag = null }

  filter = Object.assign({},{
    where: {active: true},
    include: [{
      model: School,
      where: { active: 1},
      foreignKey: "schoolId"
    }],
    order: [
      ['table_number','DESC']
    ]
  }, filter);

  return new Promise(async(resolve,reject)=>{
    var onError = function(err){
      reject(err);
    }

    if (pag != null){
        await database.sequelize.findAllWithPagination(ctx,Table,filter,{
          currentPage: pag
        }).then(results=>{
          resolve(results);
        }).catch(err=>{
            onError(err);
        });
    }else{
      await Table.findAll(filter).then(tables=>{
          resolve(tables);
      }).catch(err=>{
          onError(err);
      });
    }
  });
}

/**
* Method to get the count of School
*/
Table.findCount = async(ctx,filter)=>{
  if (typeof filter !== "object") filter = {};
  return new Promise(async(resolve,reject)=>{
    filter = Object.assign({},filter,{
      attributes: [[database.sequelize.fn('COUNT', "tableId"), 'totalTables']]
    })

    await Table.findOne(filter).then(tables=>{
        resolve(tables);
    }).catch(err=>{
        reject(err);
    });
  });
};

module.exports = Table;
