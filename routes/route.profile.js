"use strict"

var User = require("../models/user.js"),
    UserGroup = require("../models/usergroup.js"),
    Session = require("../models/session.js"),
    Controller = require("./controller.js");

const modelUtils = require("../core/common.js")().ModelUtils;

var route = function(router){
  /**
   * @api {get} /profile/ Profile Info
   * @apiDescription Method to get the account info of  the current profile
   * @apiName ProfileInfo
   * @apiGroup Profile
   *
   * @apiUse DefaultRequestWithSession
   *
   * @apiSuccess (200) {Int} code the code of the request
   * @apiSuccess (200) {String} msg General Message of the request
   * @apiSuccess (200) {Object} res the result of the report
   * @apiSuccessExample {json} Success-Response:
   *                    {"code":0,"msg":"OK","res":{"email":"digitador@mesaelectoral.com","firstname":"Digitador","lastname":"Mesa","phone1":"80955500000","phone2":null,"user_id":3,"last_login":"16-07-2019 12:05:37","date_created":"11-07-2019 15:40:27","user_group":{"user_group_id":2,"name":"Editores"}},"err":[]}
   *
   * @apiVersion 0.0.17
   */
  router.get("/profile", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
        })) return;

        var user = await User.findOne({
          attributes: {
            exclude: ["verifiedEmail","password","timezoneId","active","statusId","userGroupId"]
          },
          include: [
              {
                model: UserGroup,
                attributes: ["user_group_id","name"],
                foreignKey: "userGroupId"
              }
          ],
          where: {
            active: 1,
            userId: session.userId
          }
        });
        ctx.ws.outputSuccess(ctx,null,modelUtils.modelToJson(ctx,user));
      });
  });

  /**
   * @api {put} /profile/password Change Password
   * @apiDescription Method to change the password of the current user
   * @apiName ChangePassword
   * @apiGroup Profile
   *
   * @apiUse DefaultRequestWithSession
   *
   * @apiParam {String}   password the current password
   * @apiParam {String}   new_password the new password to change
   *
   * @apiSuccess (200) {Int} code the code of the request
   * @apiSuccess (200) {String} msg General Message of the request
   * @apiSuccess (200) {Object} res the result of the report
   *
   * @apiVersion 0.0.17
   */
  router.put("/profile/password", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
          ctx.checkBody("password")
            .notEmpty(ctx.i18n.__("error.required_current_password"))
            .trim();
          ctx.checkBody("new_password")
            .notEmpty(ctx.i18n.__("error.required_new_password"))
            .len(8,16,ctx.i18n.__("error.invalid_new_password"))
            .trim();
        })) return;

        var user = await User.findOne({
          where: { active: 1, userId: session.userId }
        });

        if (user === null){
          ctx.ws.oError(ctx,"5010");
          return
        }

        //validate if the current password belongs to the current user
        if (!Session.isValidPassword(user,ctx.request.body.password)){
          ctx.ws.oError(ctx,"4015");
          return
        }
        //end: validate if the current password belongs to the current user

        await user.update({password: ctx.request.body.new_password }).then(res=>{
            ctx.ws.outputSuccess(ctx,null,{});
        }).catch(err=>{
          console.log("err",err);
            ctx.ws.oError(ctx,"5011");
        });
      });
  });

}

module.exports= route;
