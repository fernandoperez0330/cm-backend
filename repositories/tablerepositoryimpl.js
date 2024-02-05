'use strict';

var Database  = require("../core/ormdatabase.js"),
    Op = Database.Sequelize.Op,
    database = new Database(),
    Election = require("../models/election.js"),
    Controller = require("../routes/controller.js"),
    Table = require("../models/table.js"),
    School = require("../models/school.js"),
    TableElection = require("../models/tableelection.js"),
    TableRepository = require('./tablerepository.js');


const mapModel = Controller.mapModel;

class TableRepositoryImpl extends TableRepository {

    constructor() {
        super();
    }

    /**
    * Method to find and existing table number
    * @param filter object to filter the find existing table
    */
    findExistingTable(filter,table) {
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
    findListTables(ctx, filter, pag) {
      if (typeof filter == "undefined") { filter = {}; }
      if (typeof pag == "undefined") { pag = null }

      filter = Object.assign({}, {
        where: {
          active: true
        },
        include: [
          {
            model: School,
            foreignKey: "schoolId"
          }
        ],
        order: [
          ['table_number','DESC']
        ]
      }, filter);

      return new Promise(async(resolve,reject)=>{
        var onError = function(err){
          console.error(err);
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
    findTotalTables(ctx,filter) {
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

    /*
    * Method to save table election (insert or update)
    */
    saveTableElection(ctx) {
        return new Promise(async (resolve, reject) => {
            let table = await Table.findOne({
              where: {
                active: 1,
                tableId: ctx.params.table_id
              }
            });

            if (table === null) {
              reject("4004");
              return
            }

            let election = await Election.findOne({
              where: {
                active: 1,
                electionId: ctx.params.election_id
              }
            });

            if (election === null) {
              reject("4021");
              return;
            }

            var tableElection = await TableElection.findOne({
              where: {
                electionId: ctx.params.election_id,
                tableId: ctx.params.table_id
              }
            });

            if (tableElection === null) {
              tableElection = TableElection.build(mapModel.tableElection(ctx));
            } else {
              tableElection.totalVoters = ctx.request.body.total_voters;
            }
            tableElection.save().then(tableElection => {
              resolve({
                "totalVoters": tableElection.totalVoters
              });
            }).catch(err => {
              console.error(err);
              reject("5027");
            });
        });
    };
}

module.exports = TableRepositoryImpl;
