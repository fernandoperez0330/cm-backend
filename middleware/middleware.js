"use strict";

let bodyParser  = require('koa-bodyparser'),
    koa_compress = require('koa-compress'),
    userAgent   = require('koa-useragent');


var middleware = function(app){
  app.use(koa_compress({
    filter: function (content_type) {
    	return /text/i.test(content_type)
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
  }));

  app.use(bodyParser());

  app.use(userAgent);
};


module.exports = middleware;
