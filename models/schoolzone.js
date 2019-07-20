"use strict";

var Config      = require("../config/config.js"),
    Database    = require("../core/ormdatabase.js"),
    Common      = require('../core/common.js')(),
    Model       = require("./model.js"),
    Permission  = require("../models/permission.js"),
    UserGroupHasPermission = require("../models/usergrouphaspermission.js");

var database = new Database();

const Op = Database.Sequelize.Op;

/**
* Constructor
*/
var SchoolZone = database.sequelize.define("schoolZone",{
    zoneId:{
      type: Database.Sequelize.INTEGER,
      primaryKey: true,
      field: "zone_id"
    },
    name: {
      type: Database.Sequelize.STRING
    },
    active: {
      type: Database.Sequelize.BOOLEAN
    },
    dateCreated: {
      type: Database.Sequelize.DATE,
      field: "date_created"
    }
},{
  tableName: Model.getTableName("SCHOOL_ZONE")
});


/**
* Method to find and existing table number
* @param filter object to filter the find existing table
*/
SchoolZone.findExisting = (filter,schoolZone)=>{
  return new Promise((resolve,reject)=>{
      if (typeof filter !== "object") {
        //invalid table number to verify
        reject();
        return;
      }

      var where = {};
      if (typeof schoolZone === "object" && schoolZone != null){
          where = {
            zoneId: { [Op.ne]: schoolZone.zoneId }
          };
      }

      where = Object.assign({},filter,where);
      SchoolZone.findOne({
        attributes: ["zoneId"],
        where: where
      }).then(results=>{
        resolve(results);
      }).catch(err=>{
        reject(err);
      });
  });
}


/**
* Method to find school zones (with or without pagination)
*/
SchoolZone.find = (ctx,filter,pag )=>{
  if (typeof filter == "undefined") { filter = {}; }
  if (typeof pag == "undefined") { pag = null }

  filter = Object.assign({},{
    where: {active: true},
    order: [
      ['zoneId','DESC']
    ]
  }, filter);

  return new Promise(async(resolve,reject)=>{
    var onError = function(err){
      reject(err);
    }

    if (pag != null){
        await database.sequelize.findAllWithPagination(ctx,SchoolZone,{},{
          currentPage: pag
        }).then(results=>{
          resolve(results);
        }).catch(err=>{
            onError(err);
        });
    }else{
      await SchoolZone.findAll(filter).then(schoolZones=>{
          resolve(schoolZones);
      }).catch(err=>{
          onError(err);
      });
    }
  });
}

module.exports = SchoolZone;
