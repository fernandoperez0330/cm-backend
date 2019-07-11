var Database  = require("../core/ormdatabase.js"),
    Voter     = require("./voter.js");

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



module.exports = Reports;
