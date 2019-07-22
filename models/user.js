"use strict";

let bcrypt      = require('bcrypt'),
    generator   = require('generate-password'),
    Database    = require("../core/ormdatabase.js"),
    Model       = require("./model.js"),
    Common      = require('../core/common.js')(),
    Config      = require("../config/config.js"),
    Timezone    = require("./timezone.js"),
    UserGroup   = require("./usergroup.js"),
    UserStatus  = require("./userstatus.js"),
    database = new Database();


const Op = Database.Sequelize.Op;

/**
* Constructor
*/
var User = database.sequelize.define("user",{
    userId: {
      type: Database.Sequelize.INTEGER,
      primaryKey: true,
      field: "user_id",
      autoIncrement: true
    },
    email: {
      type: Database.Sequelize.STRING,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Database.Sequelize.STRING,
      validate: {
        notEmpty: true
      }
    },
    firstname: {
      type: Database.Sequelize.STRING
    },
    lastname: {
      type: Database.Sequelize.STRING
    },
    verifiedEmail: {
      type: Database.Sequelize.INTEGER,
      field: "verified_email"
    },
    phone1: {
      type: Database.Sequelize.STRING
    },
    phone2: {
      type: Database.Sequelize.STRING
    },
    statusId: {
      type: Database.Sequelize.INTEGER,
      field: "status_id",
      defaultValue: UserStatus.TYPES.ACTIVE
    },
    timezoneId: {
      type: Database.Sequelize.INTEGER,
      field: "timezone_id",
      defaultValue: Timezone.ID.AMERICA__SANTO_DOMINGO
    },
    userGroupId: {
      type: Database.Sequelize.INTEGER,
      field: "user_group_id"
    },
    lastLogin: {
      type: Database.Sequelize.DATE,
      field: "last_login"
    },
    active: {
      type: Database.Sequelize.INTEGER
    },
    dateCreated: {
      type: Database.Sequelize.DATE,
      field: "date_created"
    }
},{
  tableName: Model.getTableName("USER"),
  hooks: {
    beforeValidate: (user, options) => {
      user.email = user.email.toLowerCase();
    },
    beforeSave: (user, options) =>{
      if (user.changed("password")){
        console.log("user.password",user.password);
        user.password = bcrypt.hashSync(user.password,Config.crypt.salt.rounds);
        console.log("user.password",user.password);
      }
    },
    beforeUpdate: (user, options) => {
      if (user.changed("email"))
        user.verifiedEmail = 0
    }
  }
});

/**
 * Method to find a username by id
 * @param  int id     [description]
 * @param  boolean active [description]
 * @return {[type]}        [description]
 */
User.findById = async function(id,active){
  if (typeof active !== "boolean") active = true;
  var filter = {userId:id};
  if (active !== null) filter.active = active ? 1 : 0;
  return User.findOne({where: filter});
};

/**
 * Method to find a user by username
 * @param  {[type]} username [description]
 * @param  boolean active   [description]
 * @return {[type]}          [description]
 */
User.findByUsername = async function(username,active){
  if (typeof active !== "boolean") active = true;
  var filter = {username:username};
  if (active !== null) filter.active = active ? 1 : 0;
  return User.findOne({where: filter});
};

/**
* Method to generate the password to a new user
*/
User.generatePassword = ()=>{
  return generator.generate({
    length: 8,
    numbers: true
  })
};


/**
 * Method to find a user by username
 * @param  {[type]} email [description]
 * @param  boolean active   [description]
 * @return {[type]}          [description]
 */
User.findByEmail = function(email,active){
  if (typeof active !== "boolean") active = true;
  var filter = {email:email};
  if (active !== null) filter.active = active ? 1 : 0;
  return new Promise((resolve,reject)=>{
    User.findOne({where: filter}).then(user=>{
      if (user == null){
        reject(null);
        return
      }
      resolve(user);
    }).catch(err=>{
      reject(err);
    });
  })
};

User.belongsTo(UserGroup,{foreignKey:"userGroupId" });
User.belongsTo(UserStatus,{foreignKey:"statusId" });

/**
 * Method to find if there any account with the current email before create it
 * @param  {[type]} email [description]
 * @return {[type]}       [description]
 */
User.prototype.findExistingEmail = async function(email){
  var _this = this;
  return await User.findOne({
    where: {
      email: email,
      userId: {
        [Op.ne] : _this.userId
      }
    }
  });
};



/**
* Method to find and existing user
* @param filter object to filter the find existing user
*/
User.findExisting = (filter,user)=>{
  return new Promise((resolve,reject)=>{
      if (typeof filter !== "object") {
        //invalid table number to verify
        reject();
        return;
      }

      var where = {};
      if (typeof user === "object" && user != null){
          where = {
            userId: { [Op.ne]: user.userId }
          };
      }

      where = Object.assign({},filter,where);
      User.findOne({
        attributes: ["userId"],
        where: where
      }).then(results=>{
        resolve(results);
      }).catch(err=>{
        reject(err);
      });
  });
}

/**
* Method to find users (with or without pagination)
*/
User.find = (ctx,filter,pag )=>{
  if (typeof filter == "undefined") { filter = {}; }
  if (typeof pag == "undefined") { pag = null }

  filter = Object.assign({},{
    where: {active: true},
    order: [
      ['userId','DESC']
    ]
  }, filter);

  return new Promise(async(resolve,reject)=>{
    var onError = function(err){
      reject(err);
    }

    if (pag != null){
        await database.sequelize.findAllWithPagination(ctx,User,{},{
          currentPage: pag
        }).then(results=>{
          resolve(results);
        }).catch(err=>{
            onError(err);
        });
    }else{
      await User.findAll(filter).then(users=>{
          resolve(users);
      }).catch(err=>{
          onError(err);
      });
    }
  });
}

User.Op = Database.Sequelize.Op;

module.exports = User;
