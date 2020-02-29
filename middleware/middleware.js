"use strict";

let bodyParser    = require('koa-bodyparser'),
    koa_compress  = require('koa-compress'),
    userAgent     = require('koa-useragent'),
    Common        = require('../core/common.js')(),
    config        = require("../config/config.js");

var middleware = function(app){
  app.use(koa_compress({
    filter: function (content_type) {
    	return /text/i.test(content_type)
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
  }));

  app.use((ctx, next) => {
    ctx.remoteIp = ctx.request.header["x-real-ip"] || Common.ip.address();
    return next();
  });

  app.use(bodyParser());

  app.use(userAgent);

  app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
  });

};

module.exports = middleware;
