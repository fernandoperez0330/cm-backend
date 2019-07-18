"use strict";

let Session = require("../models/session.js"),
    User    = require("../models/user.js"),
    Common  =  new require("../core/common.js")(),
    DateUtils = Common.DateUtils;


let prepareOutputSession = function(session){
  let expDate = DateUtils.getOutputDate(session.expirationDate);
  return {
    "session_key": session.sessionKey,
    "expiration_date": expDate
  };
}

var route = function(router){


  /**
   * @api {post} /login Login
   * @apiDescription Method to make login and retrieve a session to use within the ws
   * @apiName Login
   * @apiGroup Access
   *
   * @apiHeader {String} Authorization Bearer {{api_client}}
   *
   * @apiParam {String}   email The email to make the Login
   * @apiParam {String}   password The password to make the Login
   *
   * @apiSuccess {Int}    code the code of the request
   * @apiSuccess {String} msg General Message of the request
   * @apiSuccess {Object} res result of the request
   * @apiSuccess {String} res.session_key the session key of the result
   * @apiSuccess {String} res.expiration_date the expiration date of the session
   * @apiVersion 0.0.1
   */
  router.post("/login", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      if (!await ctx.ws.validator.validate(ctx, ctx.ws, async(ctx) =>{
            ctx.checkBody("email").isEmail(ctx.i18n.__("error.invalid_email"));
            ctx.checkBody("password").notEmpty(ctx.i18n.__("error.invalid_password"));
        })) return;

        var email = ctx.request.body.email || null;
        var pass  = ctx.request.body.password || null;

        await Session.login(email,pass).then(data=>{
          var output = prepareOutputSession(data.session);
          output = Object.assign({},{
            user: {
              email: data.user.email,
              user_group_id: data.user.userGroupId
            }
          },output);
          ctx.ws.outputSuccess(ctx,null, output);
        }).catch(err=>{
          ctx.ws.oError(ctx,"4001");
        });
    },false);
  });

  /**
   * @api {get} /ping Ping Sesion
   * @apiDescription Method to renew session and verify if the input is not expired
   * @apiName Ping
   *
   * @apiUse DefaultRequestWithSession
   *
   * @apiGroup Access
   *
   * @apiSuccess {Int}    code the code of the request
   * @apiSuccess {String} msg General Message of the request
   * @apiSuccess {Object} res result of the request
   * @apiSuccess {String} res.session_key the session key of the result
   * @apiSuccess {String} res.expiration_date the expiration date of the session
   * @apiSuccess {Object} res.user the user object of the session
   * @apiSuccess {Int}    res.user.user_group_id the group of the user that belong
   * @apiVersion 0.0.1
   */
  router.get("/ping", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
      var outputSession = prepareOutputSession(session);

      let user = await User.findById(session.userId).catch(err=>{
          ctx.ws.oError(ctx,"4002");
      });

      if (user == null) { return }

      outputSession = Object.assign({},outputSession, {user: {
          user_group_id: user.userGroupId
      }});
      ctx.ws.outputSuccess(ctx,null, outputSession);
    });
  });
}

module.exports = route;
