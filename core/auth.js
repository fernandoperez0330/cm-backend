"use strict";

let BearerStrategy = require('passport-http-bearer').Strategy,
    passport      = require('koa-passport'),
    AuthApiClient = require("../models/authapiclient.js"),
    WSError       = require("../config/wserror.js");

var Auth = function(app,router){

  var auth = this;

  /**
  * Init components
  */
  this.init = function(){
    passport.use(new BearerStrategy(async(token, done) =>{
      //"07258fa9-c5f3-4a11-9247-05d665ad5902"
      var apiClient = await AuthApiClient.findByKey(token);
      //console.log("apiClient",apiClient);

      if (apiClient == null) {
        done(null,false);
        return;
      }
      done(null,apiClient);
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
      await callback(user);
      return;
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
Auth.prototype.validateAuthentication = async function(ctx, ws, callback, requireSession){
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
  return await this.validateApiKey(ctx, ws, async function(apiUser){
      ctx.apiUser = apiUser;
      var session = null;
      if (requireSession){
        var keySession = typeof ctx.request.header === "object" && typeof ctx.request.header[app.config.session.header_param_name] === "string" ? ctx.request.header[app.config.session.header_param_name] : null;
        session = await Session.validateSession(keySession);
        if (session === null) {
          ws.oError(ctx,'4004', 401);
          return;
        }
        //proceed to renew the session
        session.generateExpirationDate();
        await session.save();
        //end: proceed to renew the session

        ctx.session = session;
      }
      callback(apiUser, session);
      return;
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
      callback(apiUser, session);
      return;
  },requireSession);
};

module.exports = Auth;
