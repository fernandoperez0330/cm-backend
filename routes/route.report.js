"use strict"

var Report = require("../models/report.js"),
    Controller = require("./controller.js");

const modelUtils = require("../core/common.js")().ModelUtils;

var route = function(router){
  /**
   * @api {get} /report/coordinators/voters Coordinators Summary
   * @apiDescription Method to get the list of coordinators actived with count of voters
   * @apiName SummaryCoordinators
   * @apiGroup Report
   *
   * @apiUse DefaultRequestWithSession
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

      await Report.getSummaryCoordinators(ctx).then(results=>{
        if (pag == null){
          results = modelUtils.rowsToJson(ctx,results);
        }
        ctx.ws.outputSuccess(ctx,null,results)
      }).catch(err=>{
        console.log(err);
        ctx.ws.oError(ctx,"5009");
      });
    });
  });
}


module.exports = route;
