'use strict'
var School = require("../models/school.js"),
    Table = require("../models/table.js"),
    Voter  = require("../models/voter.js");

var Controller = function(){};

Controller.validate = function(){ };

Controller.validate.pagination = function(ctx,required){
  var pag = ctx.checkQuery("pag");
  if (!required){
    pag = pag.optional();
  }
  pag.isInt(ctx.i18n.__("error.invalid_pagination"));
}

Controller.validate.school = function(ctx,update){
  if (update){
      ctx.checkParams("school_id").notEmpty(ctx.i18n.__("error.invalid_school"));
  }
  ctx.checkBody("name").notEmpty(ctx.i18n.__("error.invalid_school_name"));
  ctx.checkBody("school_number").notEmpty(ctx.i18n.__("error.invalid_school_number"));
  ctx.checkBody("address").notEmpty(ctx.i18n.__("error.invalid_school_address"));
  ctx.checkBody("latitude").optional().isFloat(ctx.i18n.__("error.invalid_latitude"));
  ctx.checkBody("longitude").optional().isFloat(ctx.i18n.__("error.invalid_longitude"));
}

Controller.validate.dataSchool = async(ctx,school)=>{
  school = typeof school !== "object" ? null : school;

  //find duplicate school with name
  var existingSchoolName = await School.findExisting({
    name: ctx.request.body.name
  },school);

  if (existingSchoolName != null){
    ctx.ws.oError(ctx,"4006");
    return false;
  }
  //end: find duplicate school with name


  //find duplicate school with school number
  var existingSchoolNumber = await School.findExisting({
    schoolNumber: ctx.request.body.school_number
  },school);

  if (existingSchoolNumber != null){
    ctx.ws.oError(ctx,"4007");
    return false
  }
  //end: find duplicate school with school number

  return true;
}


Controller.validate.table = function(ctx, update){
  if (update){
      ctx.checkParams("table_id").notEmpty(ctx.i18n.__("error.invalid_table"));
  }
  ctx.checkBody("school_id").notEmpty(ctx.i18n.__("error.invalid_school"));
  ctx.checkBody("table_number")
    .notEmpty(ctx.i18n.__("error.invalid_table_number"))
    .len(2,4,ctx.i18n.__("error.invalid_table_number"));
}

Controller.validate.voter = function(ctx,update){
  if (update){
    ctx.checkParams("voter_id").notEmpty(ctx.i18n.__("error.invalid_voter"));
  }
  ctx.checkBody("fullname").notEmpty(ctx.i18n.__("error.invalid_fullname_voter"));
  ctx.checkBody("document")
    .notEmpty(ctx.i18n.__("error.invalid_document_voter"))
    .isNumeric(ctx.i18n.__("error.invalid_document_voter"))
    .isLength(10,10,ctx.i18n.__("error.invalid_document_voter"));

  ctx.checkBody("address").notEmpty(ctx.i18n.__("error.invalid_address_voter"));

  ctx.checkBody("phone")
    .notEmpty(ctx.i18n.__("error.invalid_phone_voter"))
    .isInt(ctx.i18n.__("error.invalid_phone_voter"));

  ctx.checkBody("mobile")
    .optional()
    .isInt(ctx.i18n.__("error.invald_mobile_voter"));

    ctx.checkBody("table_id")
      .notEmpty(ctx.i18n.__("error.invalid_table"))
      .isInt(ctx.i18n.__("error.invalid_table"));

    ctx.checkBody("is_coordinator")
      .optional()
      .isInt(ctx.i18n.__("error.invalid_is_coordinator")).toBoolean();

    ctx.checkBody("coordinator_id")
      .optional()
      .isInt(ctx.i18n.__("error.invalid_coordinator"));
}

Controller.validate.dataVoter = async(ctx,voter)=>{
  voter = typeof voter !== "object" ? null : voter;

  //find duplicate voter with document
  var existingVoterDocument = await Voter.findExisting({
    document: ctx.request.body.document
  },voter);

  if (existingVoterDocument != null){
    ctx.ws.oError(ctx,"4010");
    return false;
  }
  //end: find duplicate voter with document

  var table = await Table.findOne({
    where: {
      active: true,
      tableId: ctx.request.body.table_id
    }
  });

  if (table == null){
    ctx.ws.oError(ctx,"4004");
    return null;
  }

  //validate the coordinator
  var isCoordinator = typeof ctx.request.body.is_coordinator === "number" && ctx.request.body.is_coordinator == 1;

  if (!isCoordinator){
    if (typeof ctx.request.body.coordinator_id !== "number"){
      ctx.ws.oError(ctx,"4013");
      return null;
    }

    var coordinator = await Voter.findOne({
      where: {
        active: true,
        voterId: ctx.request.body.coordinator_id
      }
    })

    if (coordinator == null){
      ctx.ws.oError(ctx,"4011");
      return false;
    }else if (!coordinator.isCoordinator){
      ctx.ws.oError(ctx,"4012");
      return false;
    }
  }

  return true;
}


Controller.mapModel = function(){};

Controller.mapModel.school = function(ctx){
  return {
    name: ctx.request.body.name,
    schoolNumber: ctx.request.body.school_number,
    address: ctx.request.body.address,
    latitude: ctx.request.body.latitude,
    longitude: ctx.request.body.longitude
  }
};

Controller.mapModel.table = function(ctx){
  return {
    schoolId: ctx.request.body.school_id,
    tableNumber: ctx.request.body.table_number
  };
};

Controller.mapModel.voter = function(ctx){
  var model = {
    fullname: ctx.request.body.fullname,
    document: ctx.request.body.document,
    address: ctx.request.body.address,
    phone: ctx.request.body.phone,
    mobile: ctx.request.body.mobile,
    tableId: ctx.request.body.table_id,
    tableDirection: ctx.request.body.table_direction
  };

  if (typeof ctx.request.body.coordinator_id === "number"){
    model.coordinatorId = ctx.request.body.coordinator_id
    model.isCoordinator = 0;
  }
  else if (typeof ctx.request.body.is_coordinator === "number"){
    model.isCoordinator = ctx.request.body.is_coordinator
    if (model.isCoordinator){
      model.coordinatorId = null;
    }
  }
  return model;
}

module.exports = Controller;
