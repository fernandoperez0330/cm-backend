'use strict';

let Validate      = require('koa-validate'),
    ExtValidator  = Validate.Validator;


var Validator = function(app){
  Validate(app);
};

/**
* ctx (object) context
* fieldsToValidate {function} function with fields to validate
*/
Validator.prototype.validate = async function(ctx, ws, fieldsToValidate, success){
    if (typeof fieldsToValidate !== "function") fieldsToValidate = function(ctx){};
    if (typeof success !== "function") success = function(ctx,ws){};

    //the param is required
    var defaultCodeError = "4003";
    await fieldsToValidate(ctx);
    if (ctx.errors){
      var wsError = [];
      for (var i = 0;i < ctx.errors.length; i++){
        for (var prop in ctx.errors[i]){
          wsError.push({ "code":defaultCodeError,"param": prop, "msg": ctx.errors[i][prop] });
        }
      }
      ws.outputError(ctx,wsError);
      return false;
    }

    return true;
}

module.exports = Validator;
