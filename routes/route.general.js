"use strict";

let bcrypt    = require('bcrypt');
let config    = require('../config/config.js');

var route = function(router){
  router.get("/", async (ctx, next) => {
    ctx.body = {
        "api": "9025f462-9b44-48ee-8d64-8be8d2da13f8",
        "secret": bcrypt.hashSync("379b4bfe-9f94-4d54-b388-0b2b05de133d", config.crypt.salt.rounds)
    };
  });
};

module.exports = route;
