"use strict";

let BearerStrategy = require('passport-http-bearer').Strategy,
    passport      = require('koa-passport'),
    AuthApiClient = require("../models/authapiclient.js"),
    WSError       = require("../config/wserror.js"),
    Config        = require("../config/config.js"),
    Session       = require("../models/session.js"),
    UserGroup     = require("../models/usergroup.js");

var Auth = function(app,router){

  var auth = this;

  /**
  * Init components
  */
  this.init = function(){
    passport.use(new BearerStrategy(async(token, done) =>{
      //"07258fa9-c5f3-4a11-9247-05d665ad5902"
      AuthApiClient.findByKey(token).then(apiClient=>{
        if (apiClient == null) {
          done(null,false);
          return;
        }
        done(null,apiClient);
      }).catch(err=>{
        done(null,false);
      });
    }));

    app.use(passport.initialize());
    app.use(passport.session());
  };

  this.init();
};

/**
 * Get Authenticator
 * @return {[type]} [description]
 */
Auth.prototype.getAuthenticator = function(){
  return passport;
};

/**
 * Method to validate the current authentication of api key
 * @param  {[type]}   ctx      Context of the application
 * @param  {[type]}   ws       [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Auth.prototype.validateApiKey = async function(ctx, ws, callback){
  return await this.getAuthenticator().authenticate('bearer',{}, async function(err, user) {
      if (user === false) {
        ws.outputError(ctx,[WSError['4001']], 401);
        return;
      }
      //logging action
      //end: logging action
      return callback(user);
  })(ctx);
};

/**
 * Method to validate the current authentication (including the API Key and the session (if it's required))
 * @param  {[type]}   ctx            Context of the application
 * @param  {[type]}   ws             [description]
 * @param  {Function} callback       [description]
 * @param  {[type]}   requireSession [description]
 * @return {[type]}                  [description]
 */
Auth.prototype.validateAuthentication = function(ctx, ws, callback, requireSession){
  if (typeof requireSession !== "boolean") requireSession = true;
  if (typeof callback !== "function")
    callback = async function(
                            //boolean
                            validated,
                            //object
                            apiUser,
                            //object
                            session){};
  var auth = this;
  return this.validateApiKey(ctx, ws, async function(apiUser){
      ctx.apiUser = apiUser;
      var session = null;
      if (requireSession){
        var keySession = typeof ctx.request.header === "object" && typeof ctx.request.header[Config.session.header_param_name] === "string" ? ctx.request.header[Config.session.header_param_name] : null;
        session = await Session.validateSession(keySession);
        if (session === null) {
          ws.oError(ctx,'4002', 401);
          return;
        }
        //proceed to renew the session
        session.generateExpirationDate();
        await session.save();
        //end: proceed to renew the session

        ctx.session = session;
      }
      return callback(apiUser, session);
  });
};

/**
 * Method to validate the request (api key, session id (if apply) and permission (if apply))
 * @param  {[type]}   ctx            Context of the application
 * @param  {[type]}   ws             [description]
 * @param  {Function} callback       [description]
 * @param  {[type]}   requireSession [description]
 * @return {[type]}                  [description]
 */
Auth.prototype.validate = async function(ctx, ws, callback, requireSession){
  if (typeof requireSession !== "boolean") requireSession = true;
  if (typeof callback !== "function")
    callback = async function(
                            //boolean
                            validated,
                            //object
                            apiUser,
                            //object
                            session){};
  var auth = this;
  return await this.validateAuthentication(ctx, ws, async function(apiUser,session){
      //verify the permissions of the current resource
      if (requireSession && !await UserGroup.validPermission(ctx._matchedRoute,ctx.request.method,session.userId)){
        ws.oError(ctx,'403', 403);
        return;
      }
      //end: verify the permissions of the current resource
      return callback(apiUser, session);
  },requireSession);
};

module.exports = Auth;
