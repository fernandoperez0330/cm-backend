'use strict';

const Koa 		= require('koa');
const locale	= require('koa-locale');
let i18n	  = require('koa-i18n');
let util 		= require('util');

let route 		 = require('./routes/route.js');
let middleware = require('./middleware/middleware.js');

const app = new Koa();

app.config = require("./config/config.js");

locale(app);

app.use(i18n(app, app.config.app.locale));

middleware(app);

route(app);

var server = app.listen(app.config.server.port, function(){
	console.log(util.format("Server Running on %s://%s:%i",
			app.config.server.protocol,
										app.config.server.host,
										app.config.server.port))
});

module.exports = server;
