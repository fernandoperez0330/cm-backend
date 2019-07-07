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


/**
* Method to find schools (with or without pagination)
*/
School.find = (ctx,filter)=>{
  if (typeof filter == undefined) { pag = {}; }
  if (typeof filter.pag == undefined) { filter.pag = null }

  return new Promise(async(resolve,reject)=>{
    var onError = function(err){
      reject(err);
    }

    if (filter.pag != null){
        await database.sequelize.findAllWithPagination(ctx,School,{},{
          currentPage: filter.pag
        }).then(results=>{
          resolve(results);
        }).catch(err=>{
            onError(err);
        });
    }else{
      await School.findAll({
        where: {active: true},
        order: [
          ['name','DESC']
        ]
      }).then(schools=>{
          resolve(schools);
      }).catch(err=>{
          onError(err);
      });
    }
  });
}

module.exports = School;
