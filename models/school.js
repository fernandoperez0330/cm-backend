'use strict';

let Model       = require('./model.js'),
    Database    = require("../core/ormdatabase.js"),
    database    = new Database(),
    SchoolZone  = require("../models/schoolzone.js");

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
  zoneId: {
    type: Database.Sequelize.INTEGER,
    references: {
      model: SchoolZone,
      foreignKey: "zoneId"
    },
    field: "zone_id"
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

School.belongsTo(SchoolZone,{ foreignKey: "zoneId"});

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

  var where = { active: true};
  if (typeof filter.where === "object"){
    where = Object.assign({},filter.where,where);
    delete filter.where;
  }

  filter = Object.assign({},{
    where: where,
    order: [
      ['name','DESC']
    ]
  }, filter);

  return new Promise(async(resolve,reject)=>{
    var onError = function(err){
      reject(err);
    }

    if (pag != null){
        await database.sequelize.findAllWithPagination(ctx,School,filter,{
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

/**
* Method to get the count of School
*/
School.findCount = async(ctx,filter)=>{
  if (typeof filter !== "object") filter = {};
  return new Promise(async(resolve,reject)=>{
    filter = Object.assign({},filter,{
      attributes: [[database.sequelize.fn('COUNT', "schoolId"), 'totalSchools']]
    })

    await School.findOne(filter).then(school=>{
        resolve(school);
    }).catch(err=>{
        reject(err);
    });
  });
};

module.exports = School;
