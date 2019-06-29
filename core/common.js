'use strict';

var Util = function(){ };

var StringUtil = function(){};

//im: case insesitive
StringUtil.PATTERN_MATCH_PHONE_NUMBER = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

StringUtil.PATTERN_DEPURATE_PHONE_NUMBER = /[^0-9\#\+\*]/g;

StringUtil.replaceLocale = function(i18n, input){
  //pattern for replace input with locale
  if (typeof input !== "string") return input;
  var patt = /\{\{(.*)\}\}/g;
  return input.replace(patt, function(str,p1,p2){ return i18n.__(p1); });
}

/**
 * Method to depurate a phone number
 */
StringUtil.depuratePhoneNumber = function(phoneNumber){
  return phoneNumber.replace(StringUtil.PATTERN_DEPURATE_PHONE_NUMBER,"").replace(/^\+/,"011");
}

/**
 * Method to determine whether the string is a valid json
 * @param  {[type]} strJson [description]
 * @return {[type]}         [description]
 */
StringUtil.isJson = function(strJson){
  var isJson = false;
  try{
    JSON.parse(strJson);
    isJson = true;
  }catch(err){ }
  return isJson;
}

/**
 * Method to convert a string to json object, it will return a null if the string is invalid json
 * @param  {[type]} strJson [description]
 * @return {[type]}         [description]
 */
StringUtil.toJson = function(strJson){
  if (!StringUtil.isJson(strJson)) return null;
  return JSON.parse(strJson);
}

var ModelUtils = function(){ };

ModelUtils.initProperties = function(obj,properties,addAccessors){
  if (addAccessors !== "boolean") addAccessors = false;

  for (var k in properties) {
    obj[k] = properties[k];
    if (addAccessors) obj.addAccessors(obj);
  }
};


ModelUtils.modelToJson = function(ctx, model){
  //exception when is using sequelize
  if (model === undefined){
    global.logger.default.warn("the model is undefined");
    model = {};
  }
  else if (typeof model === "object" && model !== null && model['dataValues'] !== undefined && model['dataValues'] !== null)
    model = model.dataValues;

  var keyF = null;

  for(var k in model){
      if (DateUtils.isDateObject(model[k])) model[k] = DateUtils.getOutputDate(model[k]);
      else if (typeof model[k] === "boolean") model[k] = model[k] ? 1 : 0;
      //else if (typeof model[k] === "string" && StringUtil.isJson(model[k]) && ctx !== undefined)
      //  model[k] = StringUtil.toJson(model[k]);
      else if (typeof model[k] === "string" && ctx !== undefined)
        model[k] = StringUtil.replaceLocale(ctx.i18n, model[k]);

      //else if (Array.isArray(model[k]))
      //  model[k] = ModelUtils.rowsToJson(ctx,model[k]);
      else if (typeof model[k] === "object")
        model[k] = ModelUtils.modelToJson(ctx,model[k]);

      //de camelize a camel case param
      keyF = decamelize(k);
      if (keyF === k) continue;
      model[keyF] = model[k];
      delete model[k];
  }
  return model;
}

ModelUtils.rowsToJson = function(ctx, rows){
    if (typeof rows !== "object" || rows.length === undefined) return rows;
    var len = rows.length;
    //console.log("len",len);
    for(var i=0;i<len;i++) {
      rows[i] = ModelUtils.modelToJson(ctx, rows[i]);
    }
    return rows;
}

module.exports = function(){
  return {
    ModelUtils: ModelUtils,
    StringUtil: StringUtil
  };
};
