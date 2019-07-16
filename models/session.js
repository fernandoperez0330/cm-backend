

let bcrypt      = require('bcrypt'),
    uuidv4      = require('uuid/v4'),
    dateformat  = require('date-and-time'),
    Promise     = require('promise'),
    Config      = require("../config/config.js"),
    Database    = require("../core/ormdatabase.js"),
    Model       = require("./model.js"),
    Common      = require('../core/common.js')(),
    User        = require("./user.js"),
    UserStatus  = require("./userstatus.js"),
    database    = new Database();


var Session = database.sequelize.define("session",{
  sessionId: {
    type: Database.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "session_id"
  },
  sessionKey: {
    type: Database.Sequelize.STRING(100),
    field: "session_key"
  },
  userId: {
    type: Database.Sequelize.INTEGER,
    field: "user_id",
    references: {
      model: User,
      key: "userId"
    }
  },
  expirationDate: {
    type: Database.Sequelize.DATE,
    field: "expiration_date"
  },
  active: {
    type: Database.Sequelize.INTEGER
  },
  dateCreated: {
    type: Database.Sequelize.DATE,
    field: "date_created"
  }
},{
  tableName: Model.getTableName("SESSION"),
  hooks: {
    beforeCreate: function(session){
      session.sessionKey = uuidv4();
      session.generateExpirationDate();
    }
  }
});

/**
* Method to find a session by key
* @param User user
* @param boolean [active]
*/
Session.findByUser = async function(user,active){
  if (typeof active !== "boolean" && active !== null) active = true;
  var filter = {userId:user.userId};
  if (active !== null) filter.active = active;
  return Session.findOne({where:filter});
};

/**
 * Method to make logout of the session (expiration date in null)
 * @param  {[type]} session [description]
 * @return {[type]}         [description]
 */
Session.logout = async function(session){
  if (typeof session !== "object" && typeof session.key !== "string") {
    //TODO: put logger with warning as level: The session doesn't exists
    return false;
  }
  session.active = false;
  var saved = await session.save();
  if (Config.app.debug) global.logger.default.warn("session to logout",session.dataValues);
  return saved;
}

/**
 * Method to validate if a input password is valid for the user
 * @param  {Object} user
 * @param  {String} password
 * @return {Boolean}
 */
Session.isValidPassword = function(user,password){
  console.log("user.password",user.password);
  return bcrypt.compareSync(password, user.password);
}

/**
 * Method to make login and generate a session
 * @param  {string} email
 * @param  {String} password
 * @return {Promise}
 */
Session.login = function(email, password){
  var filter = {
    active: true,
    statusId: UserStatus.TYPES.ACTIVE
  }
  return new Promise((resolve,reject)=>{
     User.findByEmail(email).then(async user=>{
       //verify if there any session available, proceed to close it
      var oldSession = await Session.findByUser(user);
      //console.log("oldSession",oldSession);
      if (typeof oldSession === "object" && oldSession !== null) {
        console.log("there's a session active, going to proceed to close it",oldSession.dataValues);
        if (!Session.logout(oldSession)){
          //TODO: put a logger in case the session cannot be logout
          global.logger.default.error("The session cannot be logout",{
            old_session: oldSession.dataValues
          });
        }//generate a session from pinless Provider
      }
      //end: verify if there any session available, proceed to close it

      //validate if the current password is valid
      if (!Session.isValidPassword(user, password)){
        reject("4001");
        return;
      }
      //end: validate if the current password is valid

      var session = Session.build({
        userId: user.userId
      });

      var onErrorSession = function(){
        reject("5023");
      }

      session.save().then(savedSession =>{
        //update user with lastlogin
        user.lastLogin = new Date();
        user.save().then(lastLoginSaved=>{
          resolve({
            user: user,
            session: savedSession
          });
        }).catch(err=>{
          console.error("the last login cannot be updated",user,err);
          onErrorSession();
          return;
        })
        //end: udpate user with last login
      }).catch(err=>{
        console.error("err",err);
        onErrorSession();
        return;
      });
    }).catch(err=>{
      console.log("err",err);
        reject("4001");
    });
  });
};

/**
* Method to determine if the session has expired
*/
let isSessionExpired = function(session){
  var now = Common.DateUtils.getNowUTC();
  return typeof session.expirationDate !== "object" || session.expirationDate < now;
};

/**
 * Method to find a session by key
 * @param  {[type]} key    [description]
 * @param  {[type]} active [description]
 * @return {Promise}        Promise, return session if it's valid, otherwise will return null
 */
Session.validateSession = async function(key,active){
    if (typeof active !== "boolean" && active !== null) active = true;
    if (typeof key !== "string" || key === null) return null;
    //console.log("key",key);
    var session = await Session.findByKey(key,active);
    if (typeof session !== "object" || session === null) return null;
    //verify if this session has expired
    return isSessionExpired(session) ? null : session;
};

/**
 * Method to find a session by key
 * @param  {[type]} sessionKey [description]
 * @param  {[type]} active     [description]
 * @param  {[type]} attributes [description]
 * @return {[type]}            [description]
 */
Session.findByKey = async function(sessionKey,active,attributes){
  if (typeof active !== "boolean" && active !== null) active = true;
  var filter = {"session_key":sessionKey};
  if (active !== null) filter.active = active;
  var params = {where:filter};
  if (typeof attributes === "object" && attributes !== undefined) params.attributes = attributes;
  return Session.findOne(params);
};

/**
 * Method to generate a expiration date based of current date
 * @return {[type]} [description]
 */
Session.prototype.generateExpirationDate = function(){
  this.expirationDate = dateformat.addMinutes(new Date(),Config.session.duration);
  return this.expirationDate;
}

module.exports = Session;
