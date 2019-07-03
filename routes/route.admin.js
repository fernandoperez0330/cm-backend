"use strict"

var School = require("../models/school.js"),
    Table = require("../models/table.js");

var route = function(router){

  /**
   * @api {post} /admin/school
   * @apiDescription Method to create a new school
   * @apiName AddSchool
   * @apiGroup School
   *
   * @apiHeader {String} Authorization Bearer {{api_client}}
   *
   * @apiParam {String}   name
   * @apiParam {String}   school_number
   * @apiParam {String}   address the current address of the school
   * @apiParam [Double]   latitude
   * @apiParam [Double]   longitude
   *
   * @apiSuccess {Int}    code the code of the request
   * @apiSuccess {String} msg General Message of the request
   * @apiSuccess {Object} res result of the request
   * @apiVersion 0.0.2
   */
  router.post("/admin/school", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
            ctx.checkBody("name").notEmpty(ctx.i18n.__("error.invalid_school_name"));
            ctx.checkBody("school_number").notEmpty(ctx.i18n.__("error.invalid_school_number"));
            ctx.checkBody("address").notEmpty(ctx.i18n.__("error.invalid_school_address"));
            ctx.checkBody("latitude").optional().isFloat(ctx.i18n.__("error.invalid_latitude"));
            ctx.checkBody("longitude").optional().isFloat(ctx.i18n.__("error.invalid_longitude"));
        })) return;

        var school = School.build({
          name: ctx.request.body.name,
          schoolNumber: ctx.request.body.school_number,
          address: ctx.request.body.address,
          latitude: ctx.request.body.latitude,
          longitude: ctx.request.body.longitude
        });

        await school.save().then(school=> {
          ctx.ws.outputSuccess(ctx,null,{});
        }).catch(err=>{
          ctx.ws.oError(ctx,"4001");
        });
    });
  });
}


module.exports = route;
