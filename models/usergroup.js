"use strict";

var Config      = require("../config/config.js"),
    Database    = require("../core/ormdatabase.js"),
    Common      = require('../core/common.js')(),
    Model       = require("./model.js"),
    Permission  = require("./permission.js"),
    UserGroupHasPermission = require("./usergrouphaspermission.js");

var database = new Database();

var UserGroup = database.sequelize.define("userGroup",{
  userGroupId : {
    type: Database.Sequelize.INTEGER,
    primaryKey: true,
    field: "user_group_id",
    autoIncrement: true
  },
  name : {
    type: Database.Sequelize.STRING
  },
  active: {
    type: Database.Sequelize.BOOLEAN
  },
  dateCreated: {
    type: Database.Sequelize.DATE,
    field: "date_created"
  }
},{
  tableName: Model.getTableName("USER_GROUP")
});

/**
 * Method to add permision to a user group
 * @param Permission permission
 * @param String method
 * @return {[type]} [description]
 */
UserGroup.prototype.addPermission = async function(permission,method,active){
  if (typeof method !== "string") method = "GET";
  if (typeof active !== "boolean") active = true;
  var _this = this;
  var attr = {
    userGroupId:_this.userGroupId,
    permissionId: permission.permissionId,
    method: method
  };
  var userGroupHasPermission = await UserGroupHasPermission.findOne({where: attr});
  if (userGroupHasPermission === null) userGroupHasPermission = UserGroupHasPermission.build(attr);
  userGroupHasPermission.active = active;
  return await userGroupHasPermission.save();
}

/**
 * Method to get the permissions that belongs to user group
 * @return {Promise}
 */
UserGroup.prototype.getPermissions = async function(){
  var _this = this;
  return new Promise(async function(resolve,reject){
    await Permission.findAll({
      include: [{model: UserGroup, where: {active: true, userGroupId: _this.userGroupId}}],
      where: {active: true}
    }).then(results=>{
      resolve(results);
    }).catch(err=>{
        reject(err);
    });
  });
}

UserGroup.TYPES = {
  ADMIN:            1,
  EDITOR:           2
}

UserGroup.belongsToMany(Permission,{ through: UserGroupHasPermission, foreignKey: "userGroupId"});
Permission.belongsToMany(UserGroup,{ through: UserGroupHasPermission, foreignKey: "permissionId"});


/**
 * [description]
 * @param  {[type]} ctx [description]
 * @return {[type]}     [description]
 */
UserGroup.validPermission = function(resource, method, userId){
  //fixed problem with indefined user
  var User = require("./user");
  return new Promise(function(resolve,reject){
    User.findOne({
      attributes: ["userId","userGroupId"],
      where: {userId: userId}
    }).then(user=>{
      Permission.findOne({
        attributes: ["permissionId"],
        where: { name: resource, active: true },
        include: [
          {
            model: UserGroup,
            attributes: [],
            where: { userGroupId: user.userGroupId },
            through: {  model: UserGroupHasPermission, attributes: [], where: { method: method}}
          }
        ]
      }).then(permission=>{
        resolve(permission !== null);
      }).catch(err=>{
        resolve(false);
      });
    }).catch(err=>{
      global.logger.default.error("user not found",{
        userId: userId
      });
      resolve(false);
    });
  });
}

module.exports = UserGroup;
