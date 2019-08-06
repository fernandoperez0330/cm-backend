var Database  = require("../core/ormdatabase.js"),
    Voter     = require("./voter.js"),
    School     = require("./school.js"),
    Table     = require("./table.js");

var Reports = function(){};

const sequelize = Database.Sequelize;

/**
  * Method to get the summary of coordinators
  */
Reports.getSummaryCoordinators = function(ctx){
  return new Promise((resolve,reject)=>{
    var filter = {
      attributes: [[sequelize.fn('COUNT', sequelize.col('voter.voter_id')), 'total_voters']],
      include: [{
        as: "coordinator",
        attributes: ["voter_id","document","fullname"],
        model: Voter,
        where: { active: 1,  is_coordinator: 1},
        foreignKey: "coordinatorId"
      }],
      where: {
        active: 1
      },
      group: ["voter.coordinator_id"]
    };

    Voter.find(ctx,filter, null)
      .then(results =>{
        resolve(results);
      }).catch(err =>{
        reject(err);
      })
  })
}

/**
  * Method to get the summary of coordinators
  */
Reports.getTableByVoters = function(ctx){
  return new Promise((resolve,reject)=>{
    var filter = {
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('voter.voter_id')), 'total_voters']
      ],
      include: [{
        model: Table,
        attributes: [ "tableNumber"],
        foreignKey: "tableId",
        include : [{
          model: School,
          attributes: [ "name"],
          foreignKey: "schoolId",
        }]
      }],
      where: {
        active: 1
      },
      group: [
        sequelize.col('table.table_id'),
        sequelize.col('table.table_number')
      ]
    };

    Voter.find(ctx,filter, null)
      .then(results =>{
        resolve(results);
      }).catch(err =>{
        reject(err);
      })
  })
}

/**
  * Method to get the summary of coordinators
  */
Reports.getTablesBySchool = function(ctx){
  return new Promise((resolve,reject)=>{

    var filter = {
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('table.table_id')), 'total_tables']
      ],
      include : [{
        model: School,
        attributes: [ "schoolNumber", "name"],
        foreignKey: "schoolId",
      }],
      where: {
        active: 1
      },
      group: [
        sequelize.col('table.school_id')
      ]
    };

    Table.find(ctx,filter, null)
      .then(results =>{
        resolve(results);
      }).catch(err =>{
        console.log("err",err);
        reject(err);
      });
  });
}



module.exports = Reports;
