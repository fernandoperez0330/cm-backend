'use strict'

const excel   = require('node-excel-export'),
      fs = require('fs');

var School = require("../models/school.js"),
    Table = require("../models/table.js"),
    Voter  = require("../models/voter.js"),
    VoterZone = require("../models/voterzone.js"),
    User = require("../models/user.js"),
    Election = require("../models/election.js"),
    UserGroup = require("../models/usergroup.js");

const modelUtils = require("../core/common.js")().ModelUtils;

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
  ctx.checkBody("name").notEmpty(ctx.i18n.__("error.invalid_school_name")).trim();
  ctx.checkBody("address").notEmpty(ctx.i18n.__("error.invalid_school_address")).trim();
  ctx.checkBody("latitude").optional().isFloat(ctx.i18n.__("error.invalid_latitude")).trim();
  ctx.checkBody("longitude").optional().isFloat(ctx.i18n.__("error.invalid_longitude")).trim();
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

  return true;
}

Controller.validate.password = function(ctx,field, msgRequiredPassword, msgInvalidPassword){
  if (typeof msgRequiredPassword !== "string")
    msgRequiredPassword = "error.required_password";
  if (typeof msgInvalidPassword !== "string"){
    msgInvalidPassword = "error.invalid_pasword";
  }

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
    .len(1,6,ctx.i18n.__("error.invalid_table_number")).trim();
}

Controller.validate.voter = function(ctx,update){
  if (update){
    ctx.checkParams("voter_id").notEmpty(ctx.i18n.__("error.invalid_voter"));
  } else {
    ctx.checkParams("election_id").notEmpty(ctx.i18n.__("error.election_id")).toInt();
  }
  ctx.checkBody("fullname").notEmpty(ctx.i18n.__("error.invalid_fullname_voter")).trim();
  ctx.checkBody("document")
    .notEmpty(ctx.i18n.__("error.invalid_document_voter"))
    .isNumeric(ctx.i18n.__("error.invalid_document_voter"))
    .isLength(11,11,ctx.i18n.__("error.invalid_document_voter")).trim();

  ctx.checkBody("address")
    .notEmpty(ctx.i18n.__("error.invalid_address_voter")).trim();

  ctx.checkBody("election_id")
    .isInt(ctx.i18n.__("error.election_id")).toInt();

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

      ctx.checkBody('make_votation')
      .optional()
      .isInt(ctx.i18n.__("error.invalid_make_votation"));
}

Controller.validate.user = function(ctx,update){
  if (update){
    ctx.checkParams("user_id").notEmpty(ctx.i18n.__("error.invalid_user"));
  }

  ctx.checkBody("email").isEmail(ctx.i18n.__("error.invalid_email"));

  if (!update){
      ctx.checkBody("gen_password").optional().isInt(ctx.i18n.__("error.invalid_value_gen_password")).toInt();

      if (typeof ctx.request.body.gen_password !== "number" || ctx.request.body.gen_password === 0){
        Controller.validate.password(ctx,ctx.checkBody("password"));
      }
  }

  ctx.checkBody("firstname").notEmpty(ctx.i18n.__("error.invalid_firstname")).trim();
  ctx.checkBody("lastname").notEmpty(ctx.i18n.__("error.invalid_lastname")).trim();
  ctx.checkBody("phone1").isInt(ctx.i18n.__("error.invalid_phone")).trim();
  ctx.checkBody("phone2").optional().isInt(ctx.i18n.__("error.invalid_phone")).trim();
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

Controller.validate.dataVoter = async(ctx, voter) => {
  voter = typeof voter !== "object" ? null : voter;

  var election = await Election.findOne({
    where: {
      electionId: ctx.request.body.election_id,
      active: 1
    }
  });

  if (election === null) {
    ctx.ws.oError(ctx,"4021");
    return false;
  }

  //find duplicate voter with document
  var existingVoterDocument = await Voter.findExisting({
    document: ctx.request.body.document,
    electionId: election.electionId
  },voter);

  if (existingVoterDocument != null){
    ctx.ws.oError(ctx,"4010");
    return false;
  }
  //end: find duplicate voter with document

  var table = await Table.findOne({
    where: {
      active: 1,
      tableId: ctx.request.body.table_id
    }
  });

  if (table == null){
    ctx.ws.oError(ctx,"4004");
    return null;
  }

  //validate the coordinator
  var isCoordinator = typeof ctx.request.body.is_coordinator === "number" && ctx.request.body.is_coordinator == 1;

  if (!isCoordinator) {
    if (typeof ctx.request.body.coordinator_id !== "number"){
      ctx.ws.oError(ctx,"4013");
      return null;
    }

    var coordinator = await Voter.findOne({
      where: {
        active: 1,
        electionId: election.electionId,
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

Controller.validate.voterByRole = async(ctx, session, filter, voter)=>{
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
  var includeCoordinatorInFilter = !(typeof ctx.query.include_coordinator_for_editor != "number" || ctx.query.include_coordinator_for_editor !== 1);

  if (user.userGroupId == UserGroup.TYPES.EDITOR && !includeCoordinatorInFilter){
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

Controller.validate.reportSummary = (ctx) => {
  ctx.checkParams("election_id").notEmpty(ctx.i18n.__("error.invalid_election_id"));
}

Controller.validate.reportTableVoterTotalPerformedVotation =  (ctx) => {
  ctx.checkParams("election_id").notEmpty(ctx.i18n.__("error.invalid_election_id")).trim().toInt();
  ctx.checkParams("table_id").notEmpty(ctx.i18n.__("error.invalid_table_id")).trim().toInt();
}

Controller.validate.tableElection = (ctx) => {
  ctx.checkParams("table_id").isInt(ctx.i18n.__("error.invalid_table_id")).toInt();
  ctx.checkParams("election_id").isInt(ctx.i18n.__("error.invalid_election_id")).toInt();
  ctx.checkBody("total_voters").isInt(ctx.i18n.__("error.invalid_total_voters")).toInt();
}

Controller.mapModel = function(){};

Controller.mapModel.school = function(ctx){
  return {
    name: ctx.request.body.name,
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

Controller.mapModel.tableElection = function(ctx) {
  return {
    tableId: ctx.params.tableId,
    electionId: ctx.params.electionId,
    totalVoters: ctx.request.body.total_voters
  }
}

Controller.mapModel.voter = function(ctx,session){
  var makeVotation = typeof ctx.request.body.make_votation === "number" ? ctx.request.body.make_votation : 0;
  makeVotation = makeVotation == 1;

  var model = {
    fullname: ctx.request.body.fullname,
    document: ctx.request.body.document,
    address: ctx.request.body.address,
    zoneId: ctx.request.body.zone_id,
    phone: ctx.request.body.phone,
    mobile: ctx.request.body.mobile,
    tableId: ctx.request.body.table_id,
    makeVotation: makeVotation,
    electionId: ctx.request.body.election_id,
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

  model.makeVotationAssignBy = null;
  if (typeof session === "object"){
    model.createdBy = session.userId
    if (model.makeVotation) {
      model.makeVotationAssignBy = session.userId;
    }
  }
  return model;
}

Controller.mapModel.user = function(ctx,session,update){
  update = typeof update === "boolean" ? update : false;

  var model = {
    email       : ctx.request.body.email,
    firstname   : ctx.request.body.firstname,
    lastname    : ctx.request.body.lastname,
    phone1      : ctx.request.body.phone1,
    userGroupId : ctx.request.body.user_group_id
  };

  if (!update){
    var isGenPassword = ctx.request.body.gen_password === 1;
    model.password = isGenPassword ? User.generatePassword() : ctx.request.body.password;
  }

  if (typeof ctx.request.body.phone2 === "string"){
    model.phone2 = ctx.request.body.phone2;
  }

  return model;
};

Controller.mapModel.tableElection = (ctx) => {
  return {
    tableId: ctx.params.table_id,
    electionId: ctx.params.election_id,
    totalVoters: ctx.request.body.total_voters
  }
};


/**
* Method to export file
*/
Controller.list = async(ctx, cells, dataSet, pag, name, filename, onPrepareCell) =>{
  filename = typeof filename !== "string" ? "file" : ctx.i18n.__(filename);
  name = typeof filename !== "string" ? "report" : ctx.i18n.__(name);

  var formatFile = typeof formatFile !== "string" ? "excel" : formatFile;

  var exportFile = false;

  var allowedType = ["excel"];
  var headerExport = ctx.request.headers["xrqt-export"];

  if (typeof headerExport === "string"){
      if (allowedType.indexOf(headerExport) == -1){
          ctx.ws.oError(ctx,"4020");
          return;
      }
      exportFile = true;
  }

  if (exportFile){
    if (pag !== null){
      console.error("the pagination must be null when the export file is actived");
      return
    }

    const styles = {
      headerDefault: {
        font: {
          bold: true
        }
      },
      default: {
        fill: {
          patternType: "none"
        }
      }
    };

    var createColumn = function(row){
        var model = {};
        model[row.index] = {
          displayName: ctx.i18n.__(row.value),
          headerStyle: styles.headerDefault,
          cellStyle: styles.default,
          width: 220
        };
        return model;
    };

    var heading = [];

    var specification = {};
    var index;
    for (index in cells){
      specification = Object.assign({},specification, createColumn(cells[index]));
    }

    if (typeof onPrepareCell === "function"){
        try{
          var keyData;
          for (keyData in dataSet){
            dataSet[keyData] = onPrepareCell(dataSet[keyData]);
          }
        }catch(err){
          console.log(err);
        }
    }

    var config = [
      {
        name: name,
        heading: heading,
        specification: specification,
        data: dataSet
      }
    ];

    var report = excel.buildExport(config);

    var format = "xlsx";

    await new Promise((resolve,reject)=>{
      try{
        var file = __dirname + "/../tmp/" + filename + "." + format;
        fs.writeFile(file, report, async(err) =>{
          if (err){
            console.error(err);
            reject("5025");
            return;
          }
          resolve(fs.createReadStream(file));
        });
      }catch(exc){
        reject("5025");
        console.error(exc);
      }
    }).then(body=>{
        ctx.body = body;
        ctx.attachment(filename + "." + format);
    }).catch(errCode=>{
      ctx.ws.oError(ctx,errCode);
    });
  } else {
    if (pag == null){
      dataSet = modelUtils.rowsToJson(ctx, dataSet);
    }
    ctx.ws.outputSuccess(ctx,null,dataSet)
  }
}

module.exports = Controller;
