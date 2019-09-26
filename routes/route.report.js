"use strict"

var Report = require("../models/report.js"),
    Controller = require("./controller.js"),
    School = require("../models/school.js"),
    Table = require("../models/table.js"),
    Voter = require("../models/voter.js");

const modelUtils = require("../core/common.js")().ModelUtils;

var route = function(router){

  /**
   * @api {get} /report/summary/ Report's Summary
   * @apiDescription Method to get the summary of reports
   * @apiName ReportSummary
   * @apiGroup Report
   *
   * @apiUse DefaultRequestWithSession
   *
   * @apiSuccess (200) {Int} code the code of the request
   * @apiSuccess (200) {String} msg General Message of the request
   * @apiSuccess (200) {Object} res the result of the report
   * @apiSuccessExample {json} Success-Response:
   *                    {"code":0,"msg":"OK","res":{"schools":2,"tables":1,"voters":8,"coordinators":5},"err":[]}
   *
   * @apiVersion 0.0.16
   */
  router.get("/report/summary", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
        })) return;

        var school = await School.findCount(ctx,{ where: { active: 1  }});
        var tables = await Table.findCount(ctx,{ where: { active: 1  }});
        var voters = await Voter.findCount(ctx,{ where: { active: 1, isCoordinator: 0}});
        var coordinators = await Voter.findCount(ctx,{ where: { active: 1, isCoordinator: 1}});

        ctx.ws.outputSuccess(ctx,null,{
          "schools": school.dataValues["totalSchools"],
          "tables": tables.dataValues["totalTables"],
          "voters": voters.dataValues["totalVoters"],
          "coordinators": coordinators.dataValues["totalVoters"]
        });
      });
  });

  /**
   * @api {get} /report/coordinators/voters Coordinators Summary
   * @apiDescription Method to get the list of coordinators actived with count of voters
   * @apiName SummaryCoordinators
   * @apiGroup Report
   *
   * @apiUse DefaultRequestWithSession
   * @apiHeader {String} [xrqt-export] determine if want to export the list as file
   *
   * @apiSuccess (200) {Int} code the code of the request
   * @apiSuccess (200) {String} msg General Message of the request
   * @apiSuccess (200) {Object[]} res result of the request
   * @apiSuccess (200) {Int} resp.total_voters the total voters of the row coordinator
   * @apiSuccess (200) {Object} resp.coordinator the coordinators's List
   * @apiSuccess (200) {Int} resp.coordinator.voter_id the id of the coordinator
   * @apiSuccess (200) {String} resp.coordinator.document the document identification of the coordinator
   * @apiSuccess (200) {String} resp.coordinator.fullname the full name of the coordinator
   * @apiSuccessExample {json} Success-Response:
   *                    {"code":0,"msg":"OK","res":[{"total_voters":1,"coordinator":{"voter_id":6,"document":"0010000005","fullname":"Coordinator #3"}},{"total_voters":3,"coordinator":{"voter_id":5,"document":"0010000004","fullname":"Coordinator #2"}},{"total_voters":3,"coordinator":{"voter_id":1,"document":"0010000000","fullname":"Armando Castillo (Coordinador)"}}],"err":[]}
   *
   * @apiVersion 0.0.8
   */
  router.get("/report/coordinators/voters", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{

        })) return;

      let pag = ctx.query.pag || null;

      await Report.getSummaryCoordinators(ctx).then(async(results)=>{
        await Controller.list(ctx,[
          {index: "coordinator_id", value: "Coordinator Number"},
          {index: "coordinator_document", value: "Coordinator Document"},
          {index: "coordinator_fullname", value: "Coordinator Fullname"},
          {index: "total_voters", value: "Total Voters"}
        ], results, pag, "summary_coordinators", "filename.summary_coordinators", function(row){
           row["coordinator_id"] = row.coordinator.dataValues["voter_id"] || "";
           row["coordinator_document"] = row.coordinator.document || "";
           row["coordinator_fullname"] = row.coordinator.fullname || "";
           row["total_voters"] = row.dataValues["total_voters"] || "";
           return row;
        });
      }).catch(err=>{
        console.log(err);
        ctx.ws.oError(ctx,"5009");
      });
    });
  });

  /**
   * @api {get} /report/tables/voters Report Tables Voters
   * @apiDescription Report of quantity of voters by tables
   * @apiName ReportTableVoters
   * @apiGroup Report
   *
   * @apiUse DefaultRequestWithSession
   * @apiHeader {String} [xrqt-export] determine if want to export the list as file
   *
   * @apiSuccess (200) {Int} code the code of the request
   * @apiSuccess (200) {String} msg General Message of the request
   * @apiSuccess (200) {Object} res the result of the report
   * @apiSuccessExample {json} Success-Response:
   *                           {"code":0,"msg":"OK","res":[{"total_voters":1,"table":{"school":{"name":"Escuela Primaria Rural Juanillo","school_number":"53"},"table_number":"03"}},{"total_voters":12,"table":{"school":{"name":"Escuela Primaria Rural Juanillo","school_number":"53"},"table_number":"01"}}],"err":[]}
   *
   *
   *
   * @apiVersion 0.0.35
   */
   router.get("/report/tables/voters", async(ctx, next) => {
     await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
       if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{

         })) return;

       let pag = ctx.query.pag || null;

       await Report.getTableByVoters(ctx).then(async(results)=>{
         await Controller.list(ctx,[
           {index: "table_number", value: "Table Number"},
           {index: "school_name", value: "School Name"},
           {index: "total_voters", value: "Total Voters"}
         ], results, pag, "table_by_voters", "filename.table_by_voters", function(row){
            row["table_number"] = row.table.dataValues["tableNumber"] || "";
            row["school_name"] = row.table.school.name;
            row["total_voters"] = row.dataValues["total_voters"] || "";
            return row;
         });
       }).catch(err=>{
         ctx.ws.oError(ctx,"5009");
       });
     });
   });

   /**
    * @api {get} /report/tables/voters/details  Report Voters By Tables Details
    * @apiDescription Report to get the list of voters of a specific table
    * @apiName ReportTableVotersDetails
    * @apiGroup Report
    *
    * @apiUse DefaultRequestWithSession
    * @apiHeader {String} [xrqt-export] determine if want to export the list as file
    *
    * @apiSuccess (200) {Int} code the code of the request
    * @apiSuccess (200) {String} msg General Message of the request
    * @apiSuccess (200) {Object} res the result of the report
    * @apiSuccessExample {json} Success-Response:
    *                           {"code":0,"msg":"OK","res":[{"total_voters":1,"table":{"school":{"name":"Escuela Primaria Rural Juanillo","school_number":"53"},"table_number":"03"}},{"total_voters":12,"table":{"school":{"name":"Escuela Primaria Rural Juanillo","school_number":"53"},"table_number":"01"}}],"err":[]}
    *
    *
    *
    * @apiVersion 0.0.35
    */
   router.get("/report/tables/voters/details", async(ctx, next) => {
     await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
       if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
          ctx.checkQuery("table_id").isInt(ctx.i18n.__("error.table_not_found"));
         })) return;

       let pag = ctx.query.pag || null;


       let filter = {
         where: {
             "tableId": ctx.query.table_id,
             "isCoordinator": 0
         },
         include: [
           {
             model: Table,
             attributes: ["tableId","tableNumber"],
             foreignKey: "tableId",
             include: [
               {
                   attributes: ["schoolId","name"],
                   model: School,
                   foreignKey: "schoolId"
               }
             ]
           },
           {
             model: Voter,
             as: "coordinator",
             attributes: ["voterId","fullname"],
             foreignKey: "coordinatorId"
           }
         ]
       }

       await Voter.find(ctx,filter,pag).then( async(results)=>{
         await Controller.list(ctx, [
           {index: "school_name", value: "School Name"},
           {index: "table_number", value: "Table Number"},
           {index: "voter_full_name", value: "Voter Full Name"},
           {index: "coordinator_full_name", value: "Coordinator Full Name"}
         ], results, pag, "table_by_voters_details", "filename.table_by_voters_details", function(row){
           row["school_name"] = row.table.school.name || "";
           row["table_number"] = row.table.tableNumber || "";
           row["voter_full_name"] = row.fullname || "";
           row["coordinator_full_name"] = row.coordinator.fullname || "";
           return row;
         });
       }).catch(err=>{
         console.log(err);
         ctx.ws.oError(ctx,"5009");
       });
     });
   });


   /**
    * @api {get} /report/tables/voters Report Tables Voters
    * @apiDescription Report of quantity of voters by tables
    * @apiName ReportTableVoters
    * @apiGroup Report
    *
    * @apiUse DefaultRequestWithSession
    * @apiHeader {String} [xrqt-export] determine if want to export the list as file
    *
    * @apiSuccess (200) {Int} code the code of the request
    * @apiSuccess (200) {String} msg General Message of the request
    * @apiSuccess (200) {Object} res the result of the report
    * @apiSuccessExample {json} Success-Response:
    *                           {"code":0,"msg":"OK","res":[{"total_voters":1,"table":{"school":{"name":"Escuela Primaria Rural Juanillo","school_number":"53"},"table_number":"03"}},{"total_voters":12,"table":{"school":{"name":"Escuela Primaria Rural Juanillo","school_number":"53"},"table_number":"01"}}],"err":[]}
    *
    *
    *
    * @apiVersion 0.0.35
    */
    router.get("/report/tables/voters", async(ctx, next) => {
      await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
        if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{

          })) return;

        let pag = ctx.query.pag || null;

        await Report.getTableByVoters(ctx).then(async(results)=>{
          await Controller.list(ctx,[
            {index: "table_number", value: "Table Number"},
            {index: "school_name", value: "School Name"},
            {index: "total_voters", value: "Total Voters"}
          ], results, pag, "table_by_voters", "filename.table_by_voters", function(row){
             row["table_number"] = row.table.dataValues["tableNumber"] || "";
             row["school_name"] = row.table.school.name;
             row["total_voters"] = row.dataValues["total_voters"] || "";
             return row;
          });
        }).catch(err=>{
          ctx.ws.oError(ctx,"5009");
        });
      });
    });

   /**
    * @api {get} /report/schools/tables Report Tables By Schools
    * @apiDescription Report of quantity of tables By Schools
    * @apiName ReportTablesSchools
    * @apiGroup Report
    *
    * @apiUse DefaultRequestWithSession
    * @apiHeader {String} [xrqt-export] determine if want to export the list as file
    *
    * @apiSuccess (200) {Int} code the code of the request
    * @apiSuccess (200) {String} msg General Message of the request
    * @apiSuccess (200) {Object} res the result of the report
    * @apiSuccessExample {json} Success-Response:
    *                           {"code":0,"msg":"OK","res":[{"total_tables":3,"school":{"name":"Escuela Primaria Rural Juanillo","school_number":"53"}}],"err":[]}
    *
    *
    *
    * @apiVersion 0.0.35
    */
    router.get("/report/schools/tables", async(ctx, next) => {
      await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
        if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{

          })) return;

        let pag = ctx.query.pag || null;

        await Report.getTablesBySchool(ctx).then(async(results)=>{
          await Controller.list(ctx,[
            {index: "school_name", value: "School Name"},
            {index: "total_tables", value: "Total Voters"}
          ], results, pag, "table_by_voters", "filename.table_by_voters", function(row){
             row["school_name"] = row.school.name || "";
             row["total_tables"] = row.dataValues["total_tables"] || "";
             return row;
          });
        }).catch(err=>{
          ctx.ws.oError(ctx,"5009");
        });
      });
    });
}


module.exports = route;
