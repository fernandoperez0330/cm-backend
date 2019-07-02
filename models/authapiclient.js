let bcrypt    = require('bcrypt'),
    Database  = require("../core/ormdatabase.js"),
    Model     = require("../models/model.js"),
    User      = require("../models/user.js"),
    Platform  = require("../models/platform.js"),
    database  = new Database();

var AuthApiClient = database.sequelize.define("authApiClient",{
  authApiClientId: {
    type: Database.Sequelize.INTEGER,
    primaryKey: true,
    field: "auth_api_client_id",
    autoIncrement: true
  },
  userId: {
      type: Database.Sequelize.INTEGER,
      field: "user_id",
      references: {
          model: User,
          key: "userId"
      }
  },
  apiKey: {
    type: Database.Sequelize.UUIDV4,
    defaultValue: Database.Sequelize.UUIDV4,
    field: "api_key"
  },
  secret: {
    type: Database.Sequelize.UUIDV4,
    defaultValue: Database.Sequelize.UUIDV4
  },
  description: {
    type: Database.Sequelize.STRING(200)
  },
  platformId:{
    type: Database.Sequelize.INTEGER,
    field: "platform_id",
    references: {
      model: Platform,
      foreignKey: "platformId"
    }
  },
  active: {
      type: Database.Sequelize.BOOLEAN
  },
  dateCreated: {
      type: Database.Sequelize.DATE,
      field: "date_created"
  }
},{
  tableName: Model.getTableName("AUTH_API_CLIENT")
},{
  hooks:{
    beforeCreate: (user,options) =>{
        apiClient.secret = bcrypt.hashSync(apiClient.secret, Config.crypt.salt.rounds)
    }
  }
});

AuthApiClient.belongsTo(Platform,{foreignKey: "platformId", targetKey: "platformId"})

/**
 * Method to find a username by id
 * @param  int id     [description]
 * @param  boolean active [description]
 * @return {[type]}        [description]
 */
AuthApiClient.findByKey = async function(apiKey,active){
  if (typeof active !== "boolean") active = true;
  var filter = {apiKey:apiKey};
  if (active !== null) filter.active = active;

  return AuthApiClient.findOne({where: filter});
};

module.exports = AuthApiClient;
