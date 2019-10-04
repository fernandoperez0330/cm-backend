"use strict"

var School = require("../models/school.js"),
    Table = require("../models/table.js"),
    Voter = require("../models/voter.js"),
    VoterZone = require("../models/voterzone.js"),
    Controller = require("./controller.js"),
    User = require("../models/user.js"),
    UserGroup = require("../models/usergroup.js"),
    UserStatus = require("../models/userstatus.js");

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
          where: { 'schoolId': ctx.params.school_id, active: 1 }
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
          //console.log(err);
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
   * @apiHeader {String} [xrqt-export] determine if want to export the list as file
   *
   * @apiParam {Number} [pag] The current page to show. It will show all the rows if this param is undefined
   *
   * @apiVersion 0.0.3
   */
  router.get("/admin/school", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
          validate.pagination(ctx,false);
          ctx.checkQuery('zone_id').optional().isInt(ctx.i18n.__("error.invalid_zone")).toInt();
        })) return;

        let pag = ctx.query.pag || null;

        var onError = function(ctx,err){
          ctx.ws.oError(ctx,"5003");
        }

        var filter = {};

        await School.find(ctx,filter,pag).then(async(results)=>{
          await Controller.list(ctx,[
              {index: "name", value: "School Name"},
              {index: "address", value: "School Address"}
          ], results, pag, "school_list", "filename.school_list");
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
          ctx.checkQuery('include_active').optional().default(1).isInt(ctx.i18n.__("error.invalid_value_include_active")).toInt();
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
          //console.log("err",err);
          onError(ctx,err);
        });
    });
  });

  /**
   * @api {delete} /admin/school/:school_id Delete a school
   * @apiDescription Method to delete a voter
   * @apiName DeleteSchool
   * @apiGroup School
   *
   * @apiUse DefaultRequestWithSession
   *
   * @apiParam {Number} school_id The school id
   *
   * @apiVersion 0.0.29
   */
  router.delete("/admin/school/:school_id", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
          ctx.checkParams("school_id").isInt(ctx.i18n.__("error.school_not_found"));
        })) return;

        var onError = function(ctx,err){
          ctx.ws.oError(ctx,"5021");
        }

        var filter = { 'schoolId': ctx.params.school_id };

        var school = await School.findOne({
          where: filter
        });

        if (school == null){
          ctx.ws.oError(ctx,"4003");
          return;
        }

        await school.update({
          active: 0
        }).then(results=>{
          ctx.ws.outputSuccess(ctx,null,{});
        }).catch(err=>{
          onError(ctx,err);
        });
    });
  });

  /**
   * @api {post} /admin/voter_zone Add Voter Zone
   * @apiDescription Method to add new Voter zone
   * @apiName AddVoterZone
   * @apiGroup Voter
   *
   * @apiUse DefaultRequestWithSession
   * @apiParam {Number} name Name of the zone
   *
   * @apiVersion 0.0.23
   */
   router.post("/admin/voter_zone", async(ctx, next) => {
     await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
       if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
           validate.voterZone(ctx,false);
         })) return;

         if (!(await validate.dataVoterZone(ctx))){
           return;
         }
         var voterZone = VoterZone.build(mapModel.voterZone(ctx));

         await voterZone.save().then(voterZone=> {
           ctx.ws.outputSuccess(ctx,null,{});
         }).catch(err=>{
           //console.log("err",err);
           ctx.ws.oError(ctx,"5012");
         });
     });
   });

   /**
    * @api {get} /admin/voter_zone/:zone_id Find Voter Zone By Id
    * @apiDescription Method to find the voter zone by ID
    * @apiName VoterZoneById
    * @apiGroup Voter
    *
    * @apiUse DefaultRequestWithSession
    * @apiParam {Number} zone_id zone unique ID.
    * @apiParam {Number} [include_active=1] determine if want to find only the school is actived
    *
    * @apiVersion 0.0.23
    */
   router.get("/admin/voter_zone/:zone_id", async(ctx, next) => {
     await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
       if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
           ctx.checkParams("zone_id").isInt(ctx.i18n.__("error.invalid_zone"));
           ctx.checkQuery('include_active').optional().default(1).isInt(ctx.i18n.__("error.invalid_value_include_active")).toInt();
         })) return;

         var onError = function(ctx,err){
           ctx.ws.oError(ctx,"5013");
         }

         var filter = { 'zoneId': ctx.params.zone_id };

         if (typeof ctx.query.include_active === "number"){
           filter.active = ctx.query.include_active;
         }

         await VoterZone.findOne({
           where: filter
         }).then(results=>{
           if (results == null){
             ctx.ws.oError(ctx,"4017");
             return
           }
           ctx.ws.outputSuccess(ctx,null,modelUtils.modelToJson(ctx,results));
         }).catch(err=>{
           onError(ctx,err);
         });
     });
   });

  /**
   * @api {get} /admin/voter_zone List Voter Zones
   * @apiDescription Method to get the list of voter zones
   * @apiName ListVoterZone
   * @apiGroup Voter
   *
   * @apiParam {Number} [pag] The current page to show. It will show all the rows if this param is undefined
   *
   * @apiUse DefaultRequestWithSession
   * @apiHeader {String} [xrqt-export] determine if want to export the list as file
   *
   * @apiSuccessExample {json} Success-Response:
   *                           {"code":0,"msg":"OK","res":[{"name":"Paraje PRUEBA","zone_id":1,"date_created":"18-07-2019 13:45:05"}],"err":[]}
   *
   * @apiVersion 0.0.23
   */
  router.get("/admin/voter_zone", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
          validate.pagination(ctx,false);
        })) return;
        let pag = ctx.query.pag || null;

        var filter = {
          attributes: ["zoneId","name","dateCreated"]
        };

        await VoterZone.find(ctx,filter,pag).then(async(results)=>{
          await Controller.list(ctx,[
              {index: "name", value: "Voter Zone Name"}
          ], results, pag, "voter_zone_list", "filename.voter_zone_list");
        }).catch(err=>{
          onError(ctx,err);
        });
    });
  });

  /**
   * @api {put} /admin/voter_zone/:zone_id Update voter Zone
   * @apiDescription Method to update a existing voter zone
   * @apiName UpdateVoterZone
   * @apiGroup Voter
   *
   * @apiUse DefaultRequestWithSession
   *
   * @apiParam {Number}   zone_id the zone's voter to update
   * @apiParam {String}   name the name of the zone's school
   *
   * @apiSuccess {Int}    code the code of the request
   * @apiSuccess {String} msg General Message of the request
   * @apiSuccess {Object} res result of the request
   * @apiVersion 0.0.23
   */
  router.put("/admin/voter_zone/:zone_id", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
        validate.voterZone(ctx,true);
        })) return;

        var voterZone = await VoterZone.findOne({
          where: { 'zoneId': ctx.params.zone_id, active: 1 }
        });

        if (voterZone == null){
          ctx.ws.oError(ctx,"4017");
          return
        }

        if (!(await validate.dataVoterZone(ctx,voterZone))){
          return;
        }

        await voterZone.update(mapModel.voterZone(ctx)).then(voterZone=> {
          ctx.ws.outputSuccess(ctx,null,{});
        }).catch(err=>{
          ctx.ws.oError(ctx,"5014");
        });
    });
  });

  /**
   * @api {delete} /admin/voter_zone/:zone_id Delete a voter zone
   * @apiDescription Method to delete a voter zone
   * @apiName DeleteVoterZone
   * @apiGroup Voter
   *
   * @apiUse DefaultRequestWithSession
   *
   * @apiParam {Number} zone_id The ID unique of the zone to delete
   *
   * @apiVersion 0.0.29
   */
  router.delete("/admin/voter_zone/:zone_id", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
          ctx.checkParams("zone_id").isInt(ctx.i18n.__("error.voter_zone_not_found"));
        })) return;

        var onError = function(ctx,err){
          ctx.ws.oError(ctx,"5022");
        }

        var filter = { 'zoneId': ctx.params.zone_id };

        var voterZone = await VoterZone.findOne({
          where: filter
        });

        if (voterZone == null){
          ctx.ws.oError(ctx,"4003");
          return;
        }

        await voterZone.update({
          active: 0
        }).then(results=>{
          ctx.ws.outputSuccess(ctx,null,{});
        }).catch(err=>{
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
   * @apiParam {String} table_number number of the table's center
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
           //console.log(err);
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
           ctx.checkQuery('include_active').optional().default(1).isInt(ctx.i18n.__("error.invalid_value_include_active")).toInt();
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
           //console.log("err",err);
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
    * @apiParam {String} table_number number of the table's center
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
     * @api {delete} /admin/table/:table_id Delete a table
     * @apiDescription Method to delete a table from school
     * @apiName DeleteTable
     * @apiGroup Table
     *
     * @apiUse DefaultRequestWithSession
     *
     * @apiParam {Number} table_id The ID unique of the table to delete
     *
     * @apiVersion 0.0.29
     */
    router.delete("/admin/table/:table_id", async(ctx, next) => {
      await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
        if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
            ctx.checkParams("table_id").isInt(ctx.i18n.__("error.table_not_found"));
          })) return;

          var onError = function(ctx,err){
            ctx.ws.oError(ctx,"5024");
          }

          var filter = { 'tableId': ctx.params.table_id };

          var table = await Table.findOne({
            where: filter
          });

          if (table == null){
            ctx.ws.oError(ctx,"4004");
            return;
          }

          await table.update({
            active: 0
          }).then(results=>{
            ctx.ws.outputSuccess(ctx,null,{});
          }).catch(err=>{
            onError(ctx,err);
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
     * @apiParam {Number} zone_id zone id whose belong the voter
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

           var voter = Voter.build(mapModel.voter(ctx,session));

           await voter.save().then(voter=> {
             ctx.ws.outputSuccess(ctx,null,{});
           }).catch(err=>{
             //console.log("err",err);
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
      * @apiHeader {String} [xrqt-export] determine if want to export the list as file
      *
      * @apiParam {Number} [pag] The current page to show. It will show all the rows if this param is undefined
      * @apiParam {Number} [coordinator_id] Show the list filtered by coordinator
      * @apiParam {Number} [is_coordinator] Show the list filtered by voter who are coordinators. This value will force to false when the coordinator_id is defined
      * @apiParam {Number} [zone_id] Show the list filtered by zone id.
      * @apiVersion 0.0.7
      */
     router.get("/admin/voter", async(ctx, next) => {
       await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
         if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
             validate.pagination(ctx,false);
             ctx.checkQuery("coordinator_id").optional().isInt(ctx.i18n.__("error.invalid_coordinator")).toInt();
             ctx.checkQuery("is_coordinator").optional().isInt(ctx.i18n.__("error.invalid_is_coordinator")).toInt();
             ctx.checkQuery("zone_id").optional().isInt(ctx.i18n.__("error.invalid_zone")).toInt();
           })) return;

           let pag = ctx.query.pag || null;

           var onError = function(ctx,err){
             ctx.ws.oError(ctx,"5007");
           }

           var filter = {
             where: {
               active: 1
             },
             include: [
               {
                 model: VoterZone,
                 foreignKey: "zoneId",
                 attributes: ["zoneId","name"]
               }
             ]};

           if (typeof ctx.query.zone_id === "number"){
             filter.where = Object.assign({},filter.where,{
                 zoneId: ctx.query.zone_id
             })
           }

           if (typeof ctx.query.is_coordinator === "number"){
                filter.where = Object.assign({},filter.where,{
                  isCoordinator: ctx.query.is_coordinator == 1
                });
           }

            if (typeof ctx.query.coordinator_id === "number"){
              filter.where = Object.assign({},filter.where,{
                isCoordinator: false,
                coordinatorId: ctx.query.coordinator_id
              });
            }

            filter.attributes = {
              exclude: ["coordinatorId","tableId"]
            };


            filter.include.push({
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
            });

            filter.include.push({
              model: Voter,
              as: "coordinator",
              attributes: ["voterId","fullname"],
              foreignKey: "coordinatorId"
            });

            var newFilter = await validate.voterByRole(ctx,session,filter);
            if (newFilter == null){
              return
            }
            filter = newFilter;

           await Voter.find(ctx,filter,pag).then(async(results)=>{
             await Controller.list(ctx,[
                 {index: "fullname", value: "Fullname"},
                 {index: "document", value: "Document"},
                 {index: "address", value: "Address"},
                 {index: "phone", value: "Phone"},
                 {index: "mobile", value: "Mobile"},
                 {index: "table_number", value: "Table Number"},
                 {index: "school_name", value: "School Name"},
                 {index: "is_coordinator", value: "Is Coordinator?"},
                 {index: "coordinator_id", value: "Coordinator Number"},
                 {index: "coordinator_fullname", value: "Coordinator Full Name"},
                 {index: "make_votation", value: "Make votation"},
                 {index: "make_votation_assign_by", value: "Votation assigned By"}
             ], results, pag, "voter_list", "filename.voter_list", function(row){
                row["table_number"] = row.table.tableNumber || "";
                row["school_name"] = row.table.school.name || "";
                row["is_coordinator"] = ctx.i18n.__(row.isCoordinator ? "YES" : "NO");
                row["coordinator_id"] = (row.coordinator || {}).voterId || "";
                row["make_votation"] = ctx.i18n.__(row.isCoordinator ? "YES" : "NO");
                row["make_votation_assign_by"] = row.makeVotationAssignBy;

                return row;
             });
           }).catch(err=>{
             //console.log(err);
             onError(ctx,err);
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
     * @apiParam {Number} zone_id zone id whose belong the voter
     * @apiParam {Number} [is_coordinator=0] determine if the current voter is a coordinator (1: true, 0: false)
     * @apiParam {Number} [coordinator_id] the coordinator id who belong this voter (Note: is_coordinator must be 0 (false) to save this value)
     * @apiVersion 0.0.7
     */
    router.put("/admin/voter/:voter_id", async(ctx, next) => {
        await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
          if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
              validate.voter(ctx,true);
            })) return;

            var voter = await Voter.findOne({
              where: {
                voterId: ctx.params.voter_id,
                active: 1
              }
            });

            if (voter == null){
              ctx.ws.oError(ctx,"4004");
              return;
            }

            if (!(await validate.dataVoter(ctx,voter))){
              return;
            }

            if (!await validate.voterByRole(ctx,session,undefined,voter)){
              return
            }

            await voter.update(mapModel.voter(ctx)).then(voter=> {
              ctx.ws.outputSuccess(ctx,null,{});
            }).catch(err=>{
              ctx.ws.oError(ctx,"5008");
            });
        });
      });


      /**
       * @api {put} /admin/voter/:voter_id/make_votation
       * @apiDescription Method to update the votation of a voter
       * @apiName UpdateVotationFromVoter
       * @apiGroup Voter
       *
       * @apiUse DefaultRequestWithSession
       *
       * @apiParam {Number} voter_id The voter id
       * @apiParam {Int} [make_votation] determine if the voter make the votation or not. 1: yes, 0: no. Default: 1
       * @apiVersion 1.0.1
       */
       router.put("/admin/voter/:voter_id/make_votation", async(ctx, next) => {
           await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
             if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
                 ctx.checkParams("voter_id").isInt(ctx.i18n.__("error.voter_not_found"));
                 ctx.checkBody('make_votation').optional().isInt(ctx.i18n.__("error.invalid_make_votation"));
               })) return;

               var makeVotation = typeof ctx.request.body.make_votation === "number" ? ctx.request.body.make_votation : 1;
               var voter = await Voter.findOne({
                 where: {
                   voterId: ctx.params.voter_id,
                   active: 1
                 }
               });

               if (voter == null){
                 ctx.ws.oError(ctx,"4004");
                 return;
               }

               var voterUpdate = {
                 makeVotation: makeVotation == 1
               };

               voterUpdate.makeVotationAssignBy = voterUpdate.makeVotation ? session.userId : null;
               await voter.update(voterUpdate).then(voter=> {
                 ctx.ws.outputSuccess(ctx,null,{});
               }).catch(err=>{
                 ctx.ws.oError(ctx,"5008");
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
    router.get("/admin/voter/:voter_id", async(ctx, next) => {
        await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
          if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
              ctx.checkParams("voter_id").isInt(ctx.i18n.__("error.voter_not_found"));
              ctx.checkQuery('include_active').optional().default(1).isInt(ctx.i18n.__("error.invalid_value_include_active")).toInt();
            })) return;

            var onError = function(ctx,err){
              ctx.ws.oError(ctx,"5003");
            }

            var filter = { 'voterId': ctx.params.voter_id };

            if (typeof ctx.query.include_active === "number"){
              filter.active = ctx.query.include_active;
            }

            filter = {
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
                },
                {
                  model: VoterZone,
                  foreignKey: "zoneId",
                  attributes: ["zoneId","name"]
                }
              ]
            };

            var newFilter = await validate.voterByRole(ctx,session,filter);
            if (newFilter == null){
              return
            }
            filter = newFilter;

            await Voter.findOne(filter).then(results=>{
              if (results == null){
                ctx.ws.oError(ctx,"4009");
                return
              }
              ctx.ws.outputSuccess(ctx,null,modelUtils.modelToJson(ctx,results));
            }).catch(err=>{
              //console.log("err",err);
              onError(ctx,err);
            });

        });
      });

    /**
     * @api {delete} /admin/voter/:voter_id Delete a voter
     * @apiDescription Method to delete a voter
     * @apiName DeleteVoter
     * @apiGroup Voter
     *
     * @apiUse DefaultRequestWithSession
     *
     * @apiParam {Number} voter_id The voter id
     *
     * @apiVersion 0.0.28
     */
    router.delete("/admin/voter/:voter_id", async(ctx, next) => {
        await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
          if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
              ctx.checkParams("voter_id").isInt(ctx.i18n.__("error.voter_not_found"));
            })) return;

            var onError = function(ctx,err){
              ctx.ws.oError(ctx,"5019");
            }

            var filter = { 'voterId': ctx.params.voter_id };

            if (typeof ctx.query.include_active === "number"){
              filter.active = ctx.query.include_active;
            }

            var voter = await Voter.findOne({
              where: filter
            });

            if (voter == null){
              ctx.ws.oError(ctx,"4004");
              return;
            }

            await voter.update({
              active: 0
            }).then(results=>{
              ctx.ws.outputSuccess(ctx,null,{});
            }).catch(err=>{
              //console.log("err",err);
              onError(ctx,err);
            });
        });
      });

    /**
     * @api {get} /admin/user List Users
     * @apiDescription Method to get the list of users
     * @apiName UsersList
     * @apiGroup User
     *
     * @apiParam {Number} [pag] The current page to show. It will show all the rows if this param is undefined
     * @apiParam {Number} [user_group_id] The user group to filter the users
     *
     * @apiUse DefaultRequestWithSession
     *
     * @apiSuccessExample {json} Success-Response:
     *                    {"code":0,"msg":"OK","res":[{"email":"lmartinez@byteprox.com","firstname":"Luis","lastname":"Martinez","phone1":null,"phone2":null,"user_id":2,"last_login":null,"date_created":"03-07-2019 03:08:45","user_group":{"name":"Administradores","user_group_id":1},"user_status":{"name":"Activo","status_id":1}},{"email":"fperez@byteprox.com","firstname":"Admin","lastname":"Admin","phone1":"8295850959","phone2":null,"user_id":1,"last_login":"16-07-2019 00:48:13","date_created":"01-07-2019 17:25:43","user_group":{"name":"Administradores","user_group_id":1},"user_status":{"name":"Activo","status_id":1}}],"err":[]}
     *
     * @apiVersion 0.0.19
     */
    router.get("/admin/user", async(ctx, next) => {
        await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
          if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
              validate.pagination(ctx,false);
              ctx.checkQuery('user_group_id').optional().isInt(ctx.i18n.__("error.invalid_user_group")).toInt();
            })) return;

            let pag = ctx.query.pag || null;

            var where = {
              userId: {
                [User.Op.ne]: session.userId
              },
              active: 1
            };

            if (typeof ctx.query.user_group_id === "number"){
                where = Object.assign({},where,{
                  userGroupId: ctx.query.user_group_id
                });
            }

            var filter = {
                attributes: [ "userId","email", "firstname","lastname","phone1","phone2","lastLogin","dateCreated"],
                where: where,
                include: [
                  {
                    attributes: ["userGroupId","name"],
                    model: UserGroup,
                    foreignKey: "userGroupId"
                  },
                  {
                    attributes: ["statusId","name"],
                    model: UserStatus,
                    foreignKey: "statusId"
                  }
                ]
            };

            await User.find(ctx,filter,pag).then(results=>{
              if (pag == null){
                results = modelUtils.rowsToJson(ctx,results);
              }
              ctx.ws.outputSuccess(ctx,null,results)
            }).catch(err=>{
              //console.log(err);
              onError(ctx,err);
            });
        });
      });

    /**
     * @api {get} /admin/user_group List User Groups
     * @apiDescription Method to get the list of users
     * @apiName UserGroupsList
     * @apiGroup User
     *
     * @apiParam {Number} [pag] The current page to show. It will show all the rows if this param is undefined
     *
     * @apiUse DefaultRequestWithSession
     *
     * @apiSuccessExample {json} Success-Response:
     *                           {"code":0,"msg":"OK","res":[{"name":"Editores","user_group_id":2,"date_created":"28-06-2019 12:53:54"},{"name":"Administradores","user_group_id":1,"date_created":"28-06-2019 12:53:54"}],"err":[]}
     *
     * @apiVersion 0.0.19
     */
    router.get("/admin/user_group", async(ctx, next) => {
        await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
          if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
              validate.pagination(ctx,false);
            })) return;

            let pag = ctx.query.pag || null;

            var filter = {
              attributes: ["userGroupId","name","dateCreated"]
            };

            await UserGroup.find(ctx,filter,pag).then(results=>{
              if (pag == null){
                results = modelUtils.rowsToJson(ctx,results);
              }
              ctx.ws.outputSuccess(ctx,null,results)
            }).catch(err=>{
              //console.log(err);
              onError(ctx,err);
            });
        });
      });

    /**
     * @api {post} /admin/user Add User
     * @apiDescription Method to add new user
     * @apiName AddUser
     * @apiGroup User
     *
     * @apiUse DefaultRequestWithSession
     *
     * @apiParam {String} email the unique email which belong the user
     * @apiParam {String} password the new pasword to assign to new user
     * @apiParam {Boolean} gen_password generate a password for this user, the new password will be return in the response and the password param won't take any effect if this param is true.
     * @apiParam {String} firstname firstname of the user to add
     * @apiParam {String} lastname last name of the user to add
     * @apiParam {String} phone1 the current phone of the new user
     * @apiParam {String} [phone2] the second current phone of the new user
     * @apiParam {Number} user_group_id the user group which belong the user
     *
     * @apiSuccessExample {json} Success-Response:
     *                          {"code":0,"msg":"OK","res":{"email":"email2@email.com","firstname":"Nombre","lastname":"Apellido","password":"UuG7OIzc"},"err":[]}
     * @apiVersion 0.0.24
     */
    router.post("/admin/user", async(ctx, next) => {
         await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
           if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
               validate.user(ctx,false);
             })) return;

             if (!(await Controller.validate.dataUser(ctx))){
               return;
             }

             var isGenPassword = ctx.request.body.gen_password === 1;

             var user = User.build(mapModel.user(ctx,session));
             var password = user.password;

             await User.create(ctx, user, password).then(voter=> {
               var output = {
                 email: user.email,
                 firstname: user.firstname,
                 lastname: user.lastname
               };
               if (isGenPassword){
                  output.password   = password;
               }
               ctx.ws.outputSuccess(ctx,null,output);
             }).catch(err=>{
               console.log("err",err);
               ctx.ws.oError(ctx,"5015");
             });
         });
       });

   /**
    * @api {get} /admin/user/:user_id/ Find the user by id
    * @apiDescription Method to get the user by id
    * @apiName FindUserByid
    * @apiGroup User
    *
    * @apiUse DefaultRequestWithSession
    *
    * @apiParam {Number} user_id The user to change the password
    * @apiParam {Number} [include_active=1] determine if want to find only the school is actived
    *
    * @apiVersion 0.0.25
    */
    router.get("/admin/user/:user_id", async(ctx, next) => {
         await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
           if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
               ctx.checkParams("user_id").isInt(ctx.i18n.__("error.invalid_user"));
               ctx.checkQuery('include_active').optional().default(1).isInt(ctx.i18n.__("error.invalid_value_include_active")).toInt();
             })) return;

             var onError = function(ctx,err){
               ctx.ws.oError(ctx,"5016");
             }

             var where = { 'userId': ctx.params.user_id };

             if (typeof ctx.query.include_active === "number"){
               where.active = ctx.query.include_active;
             }

             var filter = {
               attributes: [
                 "userId","email","firstname","lastname","phone1","phone2","active","lastLogin","dateCreated"
               ],
               where: where,
               include: [
                {
                  model: UserGroup,
                  attributes: ["userGroupId","name"],
                  foreignKey: "userGroupId"
                },
                {
                  model: UserStatus,
                  attributes: ["statusId","name"],
                  foreignKey: "statusId"
                }
               ]
             };

             await User.findOne(filter).then(results=>{
               if (results == null){
                 ctx.ws.oError(ctx,"4019");
                 return
               }
               ctx.ws.outputSuccess(ctx,null,modelUtils.modelToJson(ctx,results));
             }).catch(err=>{
               onError(ctx,err);
             });
         });
       });

   /**
    * @api {put} /admin/user/:user_id Update User Information
    * @apiDescription Method to update a user information (No Password)
    * @apiName UpdateUser
    * @apiGroup User
    *
    * @apiUse DefaultRequestWithSession
    *
    * @apiParam {Number} user_id The user to change the password
    * @apiParam {String} email the unique email which belong the user
    * @apiParam {String} firstname firstname of the user to add
    * @apiParam {String} lastname last name of the user to add
    * @apiParam {String} phone1 the current phone of the new user
    * @apiParam {String} [phone2] the second current phone of the new user
    * @apiParam {Number} user_group_id the user group which belong the user
    *
    * @apiSuccessExample {json} Success-Response:
    *                           {"code":0,"msg":"OK","res":{"email":"admin@mesaelectoral.com","firstname":"Admin","lastname":"Mesa Electoral"},"err":[]}
    *
    * @apiVersion 0.0.26
    */
    router.put("/admin/user/:user_id", async(ctx, next) => {
          await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
            if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
                validate.user(ctx,true);
              })) return;

              var where = { 'userId': ctx.params.user_id, active: 1 };

              var filter = {
                where: where
              };

              var user = await User.findOne(filter);

              if (user === null){
                ctx.ws.oError(ctx,"4019");
                return
              }

              if (!(await Controller.validate.dataUser(ctx,user))){
                return;
              }

              await user.update(mapModel.user(ctx,session, true)).then(user=> {
                var output = {
                  email: user.email,
                  firstname: user.firstname,
                  lastname: user.lastname
                };
                ctx.ws.outputSuccess(ctx,null,output);
              }).catch(err=>{
                //console.log("err",err);
                ctx.ws.oError(ctx,"5018");
              });
          });
        });

   /**
    * @api {put} /admin/user/:user_id/pasword Change Password User
    * @apiDescription Method to change the password to a user
    * @apiName ChangePasswordUser
    * @apiGroup User
    *
    * @apiUse DefaultRequestWithSession
    *
    * @apiParam {Number} user_id The user to change the password
    * @apiParam {Number} password The new password to set to the input user
    *
    * @apiVersion 0.0.25
    */
    router.put("/admin/user/:user_id/password", async(ctx, next) => {
         await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
           if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
               ctx.checkParams("user_id").isInt(ctx.i18n.__("error.invalid_user"));
               validate.password(ctx, ctx.checkBody("password"));
             })) return;

             var onError = function(ctx,err){
               ctx.ws.oError(ctx,"5017");
             }

             var where = { 'userId': ctx.params.user_id, active: 1 };

             var filter = {
               where: where
             };

             var user = await User.findOne(filter);

             if (user === null){
               ctx.ws.oError(ctx,"4019");
               return
             }

             await User.changePassword(ctx, user,ctx.request.body.password).then(results=>{
               ctx.ws.outputSuccess(ctx,null, {});
             }).catch(err=>{
                onError(ctx, err);
             });
         });
       });

   /**
    * @api {delete} /admin/user/:user_id Delete User
    * @apiDescription Method to delete the user
    * @apiName DeleteUser
    * @apiGroup User
    *
    * @apiUse DefaultRequestWithSession
    *
    * @apiParam {Number} user_id The user to change the password
    *
    * @apiVersion 0.0.27
    */
    router.delete("/admin/user/:user_id", async(ctx, next) => {
          await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
            if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
                ctx.checkParams("user_id").isInt(ctx.i18n.__("error.invalid_user"));
              })) return;

              var onError = function(ctx,err){
                ctx.ws.oError(ctx,"5020");
              }

              var where = { 'userId': ctx.params.user_id, active: 1 };

              var filter = {
                where: where
              };

              var user = await User.findOne(filter);

              if (user === null){
                ctx.ws.oError(ctx,"4019");
                return
              }

              await user.update({
                active: 0
              }).then(results=>{
                ctx.ws.outputSuccess(ctx,null, {});
              }).catch(err=>{
                 onError(ctx, err);
              });
          });
        });
}

module.exports = route;
