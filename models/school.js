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

School.Op = Database.Sequelize.Op;

/**
* Method to find and existing table number
* @param filter object to filter the find existing table
*/
School.findExisting = (filter,school)=>{
  return new Promise((resolve,reject)=>{
      if (typeof filter !== "object") {
        //invalid filter to verify
        reject();
        return;
      }

      var where = {};
      if (typeof school === "object" && school != null){
          where = {
            schoolId: { [School.Op.ne]: school.schoolId }
          };
      }

      where = Object.assign({},filter,where);

      console.log("where",where);
      School.findOne({
        attributes: ["schoolId"],
        where: where
      }).then(results=>{
        resolve(results);
      }).catch(err=>{
        reject(err);
      });
  });
}

/**
* Method to find schools (with or without pagination)
*/
School.find = (ctx,filter,pag )=>{
  if (typeof filter == "undefined") { filter = {}; }
  if (typeof pag == "undefined") { pag = null }

  filter = Object.assign({},{
    where: {active: true},
    order: [
      ['name','DESC']
    ]
  }, filter);

  return new Promise(async(resolve,reject)=>{
    var onError = function(err){
      reject(err);
    }

    if (pag != null){
        await database.sequelize.findAllWithPagination(ctx,School,{},{
          currentPage: pag
        }).then(results=>{
          resolve(results);
        }).catch(err=>{
            onError(err);
        });
    }else{
      await School.findAll(filter).then(schools=>{
          resolve(schools);
      }).catch(err=>{
          onError(err);
      });
    }
  });
}

module.exports = School;
