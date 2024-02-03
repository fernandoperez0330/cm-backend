'use strict';

var Promise       = require('promise'),
    Sequelize     = require("sequelize"),
    Config        = require('../config/config.js'),
    common        = require('../core/common.js')();

var ORMDatabase = function(){
  this.sequelize = new Sequelize(Config.db.mysql.database, Config.db.mysql.user, Config.db.mysql.password, {
    host: Config.db.mysql.host,
    dialect: 'mysql',
    dialectOptions: { decimalNumbers: true },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: "+00:00",
    logging: Config.db.mysql.logging ? console.log : false,
    define: {
      timestamps: false,
      underscored: true,
      freezeTableName: true
    }
  });
};

/**
 * Method to find all rows with pagination configuration
 * @param  {[type]} model        [description]
 * @param  {object} filter       [description]
 * @param  {object} pagination   [description]
 * @param  {boolean} outputFormat [description]
 * @return {Promise}              [description]
 */
Sequelize.prototype.findAllWithPagination = async function(ctx,model,filter,pagination,outputFormat){
  if (typeof outputFormat !== "boolean") outputFormat = true;
  var defPagination = {
    currentPage: 1,
    rowsPerPage: 20,
    totalPages : 1,
    totalRows  : 0
  };
  pagination = Object.assign({},defPagination,pagination);

  if (pagination.currentPage === null) pagination.currentPage = defPagination.currentPage;
  if (typeof pagination.currentPage !== "number") pagination.currentPage = parseInt(pagination.currentPage);

  return new Promise(function(resolve, reject){
    if (filter !== undefined){
      if (filter.limit !== undefined) delete filter.limit;
      if (filter.offset !== undefined) delete filter.offset;
    }
    model.count(filter).then(count=>{
       var output = {};
       output.pag = Object.assign({},pagination);
       output.pag.totalRows = count;
       output.pag.totalPages = Math.ceil(output.pag.totalRows / output.pag.rowsPerPage);

       var newFilter = Object.assign({},filter);
       newFilter.raw = true;
       newFilter.limit = output.pag.rowsPerPage;
       newFilter.offset = output.pag.rowsPerPage * (output.pag.currentPage - 1);
       model.findAll(newFilter).then((result)=>{
         output.rows = result;
         if (outputFormat){
           output.rows = common.ModelUtils.rowsToJson(ctx,output.rows);
           output.pag  = common.ModelUtils.modelToJson(ctx,output.pag);
         }
         resolve(output);
       }).catch(err=>{
         reject(err);
       });
    }).catch(err=>{
      global.logger.default.error("Error from MySQL Database",{
        error: err
      });
      reject(err);
    });;
  });
};

ORMDatabase.Sequelize = Sequelize;

module.exports = ORMDatabase;
