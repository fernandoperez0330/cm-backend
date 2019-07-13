"use strict"

var School = require("../models/school.js"),
    Table = require("../models/table.js"),
    Voter = require("../models/voter.js"),
    Controller = require("./controller.js");

const modelUtils = require("../core/common.js")().ModelUtils;
const validate = Controller.validate;
const mapModel = Controller.mapModel;

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

        if (!await validate.dataSchool(ctx)){
          return
        }

        var school = School.build(mapModel.school(ctx));

        await school.save().then(school=> {
          ctx.ws.outputSuccess(ctx,null,{});
        }).catch(err=>{
          console.error(err);
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

        if (!await validate.dataSchool(ctx,school)){
          return
        }

        await school.update(mapModel.school(ctx)).then(school=> {
          ctx.ws.outputSuccess(ctx,null,{});
        }).catch(err=>{
          console.log(err);
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
   * @apiDescription Method to find the school by id
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

         var existingTable = await Table.findExisting({
           schoolId: ctx.request.body.school_id,
           tableNumber: ctx.request.body.table_number
         });

         if (existingTable != null){
           ctx.ws.oError(ctx,"4005");
           return
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

   /**
    * @api {get} /admin/table/:table_id Find Table By Id
    * @apiDescription Method to find the table  by id
    * @apiName TableById
    * @apiGroup Table
    *
    * @apiUse DefaultRequestWithSession
    * @apiParam {Number} table_id Table unique ID.
    * @apiParam {Number} [include_active=1] determine if want to find only the school is actived
    *history
    * @apiVersion 0.0.6
    */
   router.get("/admin/table/:table_id", async(ctx, next) => {
     await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
       if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
           ctx.checkParams("table_id").isInt(ctx.i18n.__("error.table_not_found"));
           ctx.checkQuery('include_active').optional().isInt(ctx.i18n.__("error.invalid_value_include_active")).toBoolean();
         })) return;

         var onError = function(ctx,err){
           ctx.ws.oError(ctx,"5003");
         }

         var filter = { 'tableId': ctx.params.table_id };

         if (typeof ctx.query.include_active === "number"){
           filter.active = ctx.query.include_active;
         }

         await Table.findOne({
           where: filter
         }).then(results=>{
           if (results == null){
             ctx.ws.oError(ctx,"4004");
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
    * @api {put} /admin/table/:table_id Update Table
    * @apiDescription Method to update new table of center
    * @apiName UpdateTable
    * @apiGroup Table
    *
    * @apiUse DefaultRequestWithSession
    * @apiParam {Number} school_id School unique ID of belong the table
    * @apiParam {Number} table_number number of the table's center
    *
    * @apiVersion 0.0.6
    */
    router.put("/admin/table/:table_id", async(ctx, next) => {
      await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
        if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
            validate.table(ctx,true);
          })) return;

          var table = await Table.findOne({
            where: {
              tableId: ctx.params.table_id
            }
          });

          if (table == null){
            ctx.ws.oError(ctx,"4004");
            return;
          }

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

          //find duplicate table number
          var existingTable = await Table.findExisting({
            schoolId: ctx.request.body.school_id,
            tableNumber: ctx.request.body.table_number
          },table);

          if (existingTable != null){
            ctx.ws.oError(ctx,"4005");
            return
          }
          //end: find duplicate table number

          await table.update(mapModel.table(ctx)).then(table=> {
            ctx.ws.outputSuccess(ctx,null,{});
          }).catch(err=>{
            console.error("err",err);
            ctx.ws.oError(ctx,"5005");
          });
      });
    });

    /**
     * @api {post} /admin/voter Add Voter
     * @apiDescription Method to add new voter
     * @apiName AddVoter
     * @apiGroup Voter
     *
     * @apiUse DefaultRequestWithSession
     *
     * @apiParam {String} fullname the full name of the voter
     * @apiParam {String} document the identity document of the voter
     * @apiParam {String} address of the voter
     * @apiParam {String} phone main phone number of the voter
     * @apiParam {String} [mobile] mobile phone Number of the voter
     * @apiParam {Number} table_id table id whose belong the voter
     * @apiParam {Number} [is_coordinator=0] determine if the current voter is a coordinator (1: true, 0: false)
     * @apiParam {Number} [coordinator_id] the coordinator id who belong this voter (Note: is_coordinator must be 0 (false) to save this value)
     * @apiVersion 0.0.7
     */
     router.post("/admin/voter", async(ctx, next) => {
       await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
         if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
             validate.voter(ctx,false);
           })) return;

           if (!(await Controller.validate.dataVoter(ctx))){
             return;
           }

           var voter = Voter.build(mapModel.voter(ctx));

           await voter.save().then(voter=> {
             ctx.ws.outputSuccess(ctx,null,{});
           }).catch(err=>{
             console.log("err",err);
             ctx.ws.oError(ctx,"5006");
           });
       });
     });

     /**
      * @api {get} /admin/voter Find Voters List
      * @apiDescription Method to get the list of voters available
      * @apiName ListVoter
      * @apiGroup Voter
      *
      * @apiUse DefaultRequestWithSession
      *
      * @apiParam {Number} [pag] The current page to show. It will show all the rows if this param is undefined
      * @apiParam {Number} [coordinator_id] Show the list filtered by coordinator
      * @apiParam {Number} [is_coordinator] Show the list filtered by voter who are coordinators. This value will force to false when the coordinator_id is defined
      * @apiVersion 0.0.7
      */
     router.get("/admin/voter", async(ctx, next) => {
       await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
         if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
             validate.pagination(ctx,false);

             ctx.checkQuery("coordinator_id").optional().isInt(ctx.i18n.__("error.invalid_coordinator")).toInt();
             ctx.checkQuery("is_coordinator").optional().isInt(ctx.i18n.__("error.invalid_is_coordinator")).default(0).toBoolean();
           })) return;

           let pag = ctx.query.pag || null;

           var onError = function(ctx,err){
             ctx.ws.oError(ctx,"5007");
           }

           var filter = {
             where: {
               isCoordinator: ctx.query.is_coordinator == 1
             }
           };

            if (typeof ctx.query.coordinator_id === "number"){
              filter = {
                  where: {
                    isCoordinator: false,
                    coordinatorId: ctx.query.coordinator_id
                  }
              };
            }

            var filter = Object.assign({},{
              attributes: {
                exclude: ["coordinatorId","tableId"]
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
            },filter);

           await Voter.find(ctx,filter,pag).then(results=>{
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


     /**
      * @api {get} /admin/voter/:voter_id Find the voter by id
      * @apiDescription Method to get voter by id
      * @apiName FindVoterById
      * @apiGroup Voter
      *
      * @apiUse DefaultRequestWithSession
      *
      * @apiParam {Number} voter_id The voter id
      *
      * @apiVersion 0.0.7
      */
      router.put("/admin/voter/:voter_id", async(ctx, next) => {
        await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
          if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
              validate.table(ctx,true);
            })) return;

            var voter = await Voter.findOne({
              where: {
                voterId: ctx.params.voter_id
              }
            });

            if (voter == null){
              ctx.ws.oError(ctx,"4004");
              return;
            }

            //find duplicate table number
            var existingTable = await Table.findExisting({
              schoolId: ctx.request.body.school_id,
              tableNumber: ctx.request.body.table_number
            },table);

            if (existingTable != null){
              ctx.ws.oError(ctx,"4005");
              return
            }
            //end: find duplicate table number

            await table.update(mapModel.table(ctx)).then(table=> {
              ctx.ws.outputSuccess(ctx,null,{});
            }).catch(err=>{
              console.error("err",err);
              ctx.ws.oError(ctx,"5005");
            });
        });
      });


     /**
      * @api {put} /admin/voter/:voter_id Update Voter
      * @apiDescription Method to update voter
      * @apiName UpdateVoter
      * @apiGroup Voter
      *
      * @apiUse DefaultRequestWithSession
      *
      * @apiParam {Number} voter_id The voter id
      * @apiParam {String} fullname the full name of the voter
      * @apiParam {String} document the identity document of the voter
      * @apiParam {String} address of the voter
      * @apiParam {String} phone main phone number of the voter
      * @apiParam {String} [mobile] mobile phone Number of the voter
      * @apiParam {Number} table_id table id whose belong the voter
      * @apiParam {Number} [is_coordinator=0] determine if the current voter is a coordinator (1: true, 0: false)
      * @apiParam {Number} [coordinator_id] the coordinator id who belong this voter (Note: is_coordinator must be 0 (false) to save this value)
      * @apiVersion 0.0.7
      */
      router.get("/admin/voter/:voter_id", async(ctx, next) => {
        await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
          if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
              ctx.checkParams("voter_id").isInt(ctx.i18n.__("error.voter_not_found"));
              ctx.checkQuery('include_active').optional().isInt(ctx.i18n.__("error.invalid_value_include_active")).toBoolean();
            })) return;

            var onError = function(ctx,err){
              ctx.ws.oError(ctx,"5003");
            }

            var filter = { 'voterId': ctx.params.voter_id };

            if (typeof ctx.query.include_active === "number"){
              filter.active = ctx.query.include_active;
            }

            await Voter.findOne({
              attributes: {
                exclude: ["coordinatorId","tableId"]
              },
              where: filter,
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
            }).then(results=>{
              if (results == null){
                ctx.ws.oError(ctx,"4004");
                return
              }
              ctx.ws.outputSuccess(ctx,null,modelUtils.modelToJson(ctx,results));
            }).catch(err=>{
              console.log("err",err);
              onError(ctx,err);
            });

        });
      });
}


module.exports = route;
