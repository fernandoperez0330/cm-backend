"use strict"

var School = require("../models/school.js"),
    Table = require("../models/table.js");

const modelUtils = require("../core/common.js")().ModelUtils;

var validate = function(){ };

validate.pagination = function(ctx,required){
  var pag = ctx.checkQuery("pag");
  if (!required){
    pag = pag.optional();
  }
  pag.isInt(ctx.i18n.__("error.invalid_pagination"));
}

validate.school = function(ctx,update){
  if (update){
      ctx.checkParams("school_id").notEmpty(ctx.i18n.__("error.invalid_school"));
  }
  ctx.checkBody("name").notEmpty(ctx.i18n.__("error.invalid_school_name"));
  ctx.checkBody("school_number").notEmpty(ctx.i18n.__("error.invalid_school_number"));
  ctx.checkBody("address").notEmpty(ctx.i18n.__("error.invalid_school_address"));
  ctx.checkBody("latitude").optional().isFloat(ctx.i18n.__("error.invalid_latitude"));
  ctx.checkBody("longitude").optional().isFloat(ctx.i18n.__("error.invalid_longitude"));
}


validate.table = function(ctx, update){
  if (update){
      ctx.checkParams("table_id").notEmpty(ctx.i18n.__("error.invalid_table"));
  }
  ctx.checkBody("school_id").notEmpty(ctx.i18n.__("error.invalid_school"));
  ctx.checkBody("table_number").notEmpty(ctx.i18n.__("error.invalid_table_number"));
}


var mapModel = function(){};

mapModel.school = function(ctx){
  return {
    name: ctx.request.body.name,
    schoolNumber: ctx.request.body.school_number,
    address: ctx.request.body.address,
    latitude: ctx.request.body.latitude,
    longitude: ctx.request.body.longitude
  }
}

mapModel.table = function(ctx){
  return {
    schoolId: ctx.request.body.school_id,
    tableNumber: ctx.request.body.table_number
  };
}

var route = function(router){
  /**
   * @api {post} /admin/school Add School
   * @apiDescription Method to create a new school (center)
   * @apiName AddSchool
   * @apiGroup School
   *
   * @apiUse DefaultRequestWithSession
   *
   * @apiParam {String}   name the name of the school
   * @apiParam {String}   school_number the school number
   * @apiParam {String}   address the current address of the school
   * @apiParam {Double}   [latitude] latitude of the school
   * @apiParam {Double}   [longitude] longitude of the school
   *
   * @apiSuccess {Int}    code the code of the request
   * @apiSuccess {String} msg General Message of the request
   * @apiSuccess {Object} res result of the request
   * @apiVersion 0.0.2
   */
  router.post("/admin/school", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
        validate.school(ctx,false);
        })) return;

        var school = School.build(mapModel.school(ctx));

        await school.save().then(school=> {
          ctx.ws.outputSuccess(ctx,null,{});
        }).catch(err=>{
          ctx.ws.oError(ctx,"5001");
        });
    });
  });

  /**
   * @api {put} /admin/school/:school_id Update School
   * @apiDescription Method to update a existing school (center)
   * @apiName UpdateSchool
   * @apiGroup School
   *
   * @apiUse DefaultRequestWithSession
   *
   * @apiParam {Number}   school_id the school to update
   * @apiParam {String}   name the name of the school
   * @apiParam {String}   school_number the school number
   * @apiParam {String}   address the current address of the school
   * @apiParam {Double}   [latitude] latitude of the school
   * @apiParam {Double}   [longitude] longitude of the school
   *
   * @apiSuccess {Int}    code the code of the request
   * @apiSuccess {String} msg General Message of the request
   * @apiSuccess {Object} res result of the request
   * @apiVersion 0.0.3
   */
  router.put("/admin/school/:school_id", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
        validate.school(ctx,true);
        })) return;

        var school = await School.findOne({
          where: { 'schoolId': ctx.params.school_id }
        });

        if (school == null){
          ctx.ws.oError(ctx,"4003");
          return
        }

        await school.update(mapModel.school(ctx)).then(school=> {
          ctx.ws.outputSuccess(ctx,null,{});
        }).catch(err=>{
          ctx.ws.oError(ctx,"5002");
        });
    });
  });

  /**
   * @api {get} /admin/school Find School List
   * @apiDescription Method to get the list of school available
   * @apiName ListSchool
   * @apiGroup School
   *
   * @apiUse DefaultRequestWithSession
   *
   * @apiParam {Number} [pag] The current page to show. It will show all the rows if this param is undefined
   *
   * @apiVersion 0.0.3
   */
  router.get("/admin/school", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
          validate.pagination(ctx,false);
        })) return;

        let pag = ctx.query.pag || null;

        var onError = function(ctx,err){
          ctx.ws.oError(ctx,"5003");
        }

        await School.find(ctx,{},pag).then(results=>{
          if (pag == null){
            results = modelUtils.rowsToJson(ctx,results);
          }
          ctx.ws.outputSuccess(ctx,null,results)
        }).catch(err=>{
          onError(ctx,err);
        });
    });
  });


  /**
   * @api {get} /admin/school/:school_id Find School By Id
   * @apiDescription Method the school by id
   * @apiName SchoolById
   * @apiGroup School
   *
   * @apiUse DefaultRequestWithSession
   * @apiParam {Number} school_id School unique ID.
   * @apiParam {Number} [include_active=1] determine if want to find only the school is actived
   *
   * @apiVersion 0.0.3
   */
  router.get("/admin/school/:school_id", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
          ctx.checkParams("school_id").isInt(ctx.i18n.__("error.school_not_found"));
          ctx.checkQuery('include_active').optional().isInt(ctx.i18n.__("error.invalid_value_include_active")).toBoolean();
        })) return;

        var onError = function(ctx,err){
          ctx.ws.oError(ctx,"5003");
        }

        var filter = { 'schoolId': ctx.params.school_id };


        if (typeof ctx.query.include_active === "number"){
          filter.active = ctx.query.include_active;
        }

        await School.findOne({
          where: filter
        }).then(results=>{
          if (results == null){
            ctx.ws.oError(ctx,"4003");
            return
          }
          ctx.ws.outputSuccess(ctx,null,modelUtils.modelToJson(ctx,results));
        }).catch(err=>{
          console.log("err",err);
          onError(ctx,err);
        });
    });
  });


  /**
   * @api {post} /admin/table Add Table
   * @apiDescription Method to add new table of center
   * @apiName AddTable
   * @apiGroup Table
   *
   * @apiUse DefaultRequestWithSession
   * @apiParam {Number} school_id School unique ID of belong the table
   * @apiParam {Number} table_number number of the table's center
   *
   * @apiVersion 0.0.4
   */
   router.post("/admin/table", async(ctx, next) => {
     await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
       if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
           validate.table(ctx,false);
         })) return;


         var school = await School.findOne({
           where: {
             active: 1,
             schoolId: ctx.request.body.school_id
           }
         });

         if (school == null){
           ctx.ws.oError(ctx,"4003");
           return;
         }

         var table = Table.build(mapModel.table(ctx));

         await table.save().then(table=> {
           ctx.ws.outputSuccess(ctx,null,{});
         }).catch(err=>{
           console.error("err",err);
           ctx.ws.oError(ctx,"5004");
         });
     });
   });

   /**
    * @api {get} /admin/table Find Table List
    * @apiDescription Method to get the list of table available
    * @apiName ListTable
    * @apiGroup Table
    *
    * @apiUse DefaultRequestWithSession
    *
    * @apiParam {Number} [pag] The current page to show. It will show all the rows if this param is undefined
    *
    * @apiVersion 0.0.5
    */
   router.get("/admin/table", async(ctx, next) => {
     await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
       if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
           validate.pagination(ctx,false);
         })) return;

         let pag = ctx.query.pag || null;

         var onError = function(ctx,err){
           ctx.ws.oError(ctx,"5005");
         }

         await Table.find(ctx,{},pag).then(results=>{
           if (pag == null){
             results = modelUtils.rowsToJson(ctx,results);
           }
           ctx.ws.outputSuccess(ctx,null,results)
         }).catch(err=>{
           console.log(err);
           onError(ctx,err);
         });
     });
   });
}


module.exports = route;
