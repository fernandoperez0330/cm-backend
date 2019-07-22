'use strict'
var School = require("../models/school.js"),
    Table = require("../models/table.js"),
    Voter  = require("../models/voter.js"),
    VoterZone = require("../models/voterzone.js"),
    User = require("../models/user.js"),
    UserGroup = require("../models/usergroup.js");

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

Controller.validate.password = function(ctx,field, msgRequiredPassword, msgInvalidPassword){
  field
    .notEmpty(ctx.i18n.__(msgRequiredPassword))
    .len(8,16,ctx.i18n.__(msgInvalidPassword))
    .trim();
}


Controller.validate.voterZone = function(ctx,update){
  if (update){
      ctx.checkParams("zone_id").notEmpty(ctx.i18n.__("error.invalid_zone"));
  }
  ctx.checkBody("name").notEmpty(ctx.i18n.__("error.invalid_zone_name")).trim();
}

Controller.validate.table = function(ctx, update){
  if (update){
      ctx.checkParams("table_id").notEmpty(ctx.i18n.__("error.invalid_table"));
  }
  ctx.checkBody("school_id").notEmpty(ctx.i18n.__("error.invalid_school"));
  ctx.checkBody("table_number")
    .notEmpty(ctx.i18n.__("error.invalid_table_number"))
    .len(2,4,ctx.i18n.__("error.invalid_table_number")).trim();
}

Controller.validate.voter = function(ctx,update){
  if (update){
    ctx.checkParams("voter_id").notEmpty(ctx.i18n.__("error.invalid_voter"));
  }
  ctx.checkBody("fullname").notEmpty(ctx.i18n.__("error.invalid_fullname_voter")).trim();
  ctx.checkBody("document")
    .notEmpty(ctx.i18n.__("error.invalid_document_voter"))
    .isNumeric(ctx.i18n.__("error.invalid_document_voter"))
    .isLength(11,11,ctx.i18n.__("error.invalid_document_voter"));

  ctx.checkBody("address")
    .notEmpty(ctx.i18n.__("error.invalid_address_voter"));

  ctx.checkBody("zone_id")
    .isInt(ctx.i18n.__("error.invalid_zone")).toInt();

  ctx.checkBody("phone")
    .notEmpty(ctx.i18n.__("error.invalid_phone_voter"))
    .isInt(ctx.i18n.__("error.invalid_phone_voter"));

  ctx.checkBody("mobile")
    .optional()
    .isInt(ctx.i18n.__("error.invald_mobile_voter"));

    ctx.checkBody("email")
      .optional()
      .isEmail(ctx.i18n.__("error.invalid_voter_email"));

    ctx.checkBody("table_id")
      .notEmpty(ctx.i18n.__("error.invalid_table"))
      .isInt(ctx.i18n.__("error.invalid_table"));

    ctx.checkBody("is_coordinator")
      .optional()
      .isInt(ctx.i18n.__("error.invalid_is_coordinator")).toInt();

    ctx.checkBody("coordinator_id")
      .optional()
      .isInt(ctx.i18n.__("error.invalid_coordinator"));
}

Controller.validate.user = function(ctx,update){
  if (update){
    ctx.checkParams("user_id").notEmpty(ctx.i18n.__("error.invalid_user"));
  }

  ctx.checkBody("email").isEmail(ctx.i18n.__("error.invalid_email"));
  ctx.checkBody("gen_password").optional().isInt(ctx.i18n.__("error.invalid_value_gen_password")).toInt();

  if (typeof ctx.request.body.gen_password !== "number" || ctx.request.body.gen_password === 0){
    Controller.validate.password(ctx,ctx.checkBody("password"),"error.required_password","error.invalid_pasword");
  }

  ctx.checkBody("firstname").notEmpty(ctx.i18n.__("error.invalid_firstname"));
  ctx.checkBody("lastname").notEmpty(ctx.i18n.__("error.invalid_lastname"));
  ctx.checkBody("phone1").isInt(ctx.i18n.__("error.invalid_phone"));
  ctx.checkBody("phone2").optional().isInt(ctx.i18n.__("error.invalid_phone"));
  ctx.checkBody("user_group_id").isInt(ctx.i18n.__("error.invalid_user_group")).toInt();
};

Controller.validate.dataUser = async(ctx,user) =>{
  user = typeof user !== "object" ? null : user;

  var existingUserEmail = await User.findExisting({
    email: ctx.request.body.email
  },user);

  if (existingUserEmail != null){
    ctx.ws.oError(ctx,"4018");
    return false;
  }

  return true;
}

Controller.validate.dataVoterZone = async(ctx,voterZone)=>{
  voterZone = typeof voterZone !== "object" ? null : voterZone;

  var existingZone = await VoterZone.findExisting({
    name: ctx.request.body.name
  },voterZone);

  if (existingZone != null){
    ctx.ws.oError(ctx,"4016");
    return false;
  }
  return true;
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

Controller.validate.voterByRole = async(ctx,session,filter,voter)=>{
  var returnFilter = typeof filter === "object";
  //filter by role
  var user = await User.findOne({
    where: { userId: session.userId },
    attributes: ["userGroupId"]
  });

  if (user == null){
      ctx.ws.oError(ctx,"5010");
      return returnFilter ? null : false;
  }
  //show only the list of coordinators for editor role, only to select the coordinator when is adding a voter
  var isVoters = typeof ctx.query.is_coordinator != "number" || ctx.query.is_coordinator !== 1;

  if (user.userGroupId == UserGroup.TYPES.EDITOR && isVoters){
    if (returnFilter){
      var where = typeof filter.where === "object" ? filter.where : {};
      where.createdBy = session.userId
      filter.where = where;
    }else if (typeof voter === "object" && voter.createdBy !== session.userId){
      ctx.ws.oError(ctx,"4014");
      return false;
    }
  }
  return returnFilter ? filter : true;
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

Controller.mapModel.voterZone = function(ctx){
  return {
    name: ctx.request.body.name
  };
};


Controller.mapModel.table = function(ctx){
  return {
    schoolId: ctx.request.body.school_id,
    tableNumber: ctx.request.body.table_number
  };
};

Controller.mapModel.voter = function(ctx,session){
  var model = {
    fullname: ctx.request.body.fullname,
    document: ctx.request.body.document,
    address: ctx.request.body.address,
    zoneId: ctx.request.body.zone_id,
    phone: ctx.request.body.phone,
    mobile: ctx.request.body.mobile,
    tableId: ctx.request.body.table_id,
    tableDirection: ctx.request.body.table_direction
  };

  if (typeof ctx.request.body.email === "string"){
    model.email = ctx.request.body.email
  }

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
  if (typeof session === "object"){
    model.createdBy = session.userId
  }
  return model;
}


Controller.mapModel.user = function(ctx){
  var model = {
    email       : ctx.request.body.email,
    firstname   : ctx.request.body.firstname,
    lastname    : ctx.request.body.lastname,
    phone1      : ctx.request.body.phone1,
    userGroupId : ctx.request.body.user_group_id
  };

  var isGenPassword = ctx.request.body.gen_password === 1;
  model.password = isGenPassword ? User.generatePassword() : ctx.request.body.password;

  if (typeof ctx.request.body.phone2 === "string"){
    model.phone2 = ctx.request.body.phone2;
  }

  return model;
};

module.exports = Controller;
