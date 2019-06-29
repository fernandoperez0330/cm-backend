let WSError = require("../config/wserror.js")();
let common = require("../core/common.js")();

var Webservice = function(){
  this.ctx = null;
  this.msg = "";
  this.code = 0;
  this.result  = {};
  this.errors = [];
  this.validator = null;
};

/**
 * Method to generate output of ws
 * @param  {[type]} ctx [description]
 * @return {[type]}     [description]
 */
Webservice.prototype.output = function(ctx){
  return {
      code: this.code,
      msg : this.msg,
      res: this.result,
      err: this.errors
  };
};

/**
 * Method to make an output success with ws
 * @param  {[type]} ctx    [description]
 * @param  {[type]} msg    [description]
 * @param  {[type]} result [description]
 * @return {[type]}        [description]
 */
Webservice.prototype.outputSuccess = function(ctx, msg, result){
    if (typeof ctx === "object" && typeof ctx.status === "number") ctx.status = 200;
    if (typeof msg !== "string") msg = "OK";
    if (typeof result !== "object") result = {};

    this.errors = [];
    this.code = 0;
    this.msg   = msg;
    this.result = result;
    ctx.body = this.output();
}

/**
 * Method to make the output error with ws
 * @param  {[type]} ctx       [description]
 * @param  {[type]} errors    [description]
 * @param  {[type]} http_code [description]
 * @param  {object} result    Optional
 * @return {[type]}           [description]
 */
Webservice.prototype.outputError = function(ctx, errors, http_code, formatLocale, result){
  if (typeof errors !== "object") errors = {};
  if (typeof formatLocale !== "boolean") formatLocale = true;
  if (typeof result !== "object") result = {};
  this.code = errors.length > 0 && typeof errors[0] === "object" && typeof errors[0].code === "string" ? errors[0].code : "500"; //default erro
  //assign the http code
  if (typeof http_code !== "number" || http_code === null) {
    var originCode = this.code.substring(0,1);
    switch(originCode){
      case "5":
        http_code = 500;
        this.msg = WSError["500"].msg;
        break;
      case "4":
      default:
        http_code = 400;
        this.msg = WSError["400"].msg;
        break;
    }
  }else this.msg = http_code != null && typeof WSError[http_code.toString()] === "object" ? WSError[http_code.toString()].msg : "";

  if (typeof ctx == "object" && typeof ctx.status == "number" && typeof http_code == "number") ctx.status = http_code;
  //end: assign the http code
  //
  if (formatLocale){
    this.msg = common.StringUtil.replaceLocale(ctx.i18n,this.msg);
    for(var k in errors){
      //add this for fix problem when the language is changed
      errors[k] = Object.assign({},errors[k]);
      errors[k].msg = common.StringUtil.replaceLocale(ctx.i18n,errors[k].msg);
    }
  }

  this.errors = errors;
  this.result = result ;
  ctx.body = this.output();
  return ctx.body;
}

/**
 * Method shortcut to make output error (call outputError method)
 * @param  {[type]} ctx       [description]
 * @param  {[type]} index     [description]
 * @param  {[type]} http_code [description]
 * @param  {object} result    Optional
 * @return {[type]}           [description]
 */
Webservice.prototype.oError = function(ctx, index, http_code, result){
  if (typeof index === "number") index = index + "";
  var error = typeof index === "string" ? WSError[index] : null;
  if (typeof error === "object" && error !== null)
    return this.outputError(ctx,[error],http_code,true, result);
  else return ctx.body;
}

module.exports = Webservice;
