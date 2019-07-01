"use strict";

let bodyParser  = require('koa-bodyparser'),
    koa_compress = require('koa-compress'),
    userAgent   = require('koa-useragent'),
    config = require("../config/config.js");

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

  app.use(async (ctx, next) => {
    await next();

    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);

    /*console.log("[REQUEST]", JSON.stringify({
      method: ctx.request.method,
      headers: ctx.request.headers,
      length: ctx.request.length,
      url : ctx.request.url,
      originalUrl: ctx.request.originalUrl,
      origin: ctx.request.origin,
      protocol: ctx.request.protocol,
      path: ctx.request.path,
      host: ctx.request.host,
      userAgent: ctx.userAgent,
      type: ctx.request.type,
      href: ctx.request.href,
      ip: ctx.remoteIp,
      query: ctx.request.query
    }));*/
    //await next();
    /*console.log("[RESPONSE]",JSON.stringify({
      status: ctx.response.status,
      message: ctx.response.message,
      length: ctx.response.length,
      body: ctx.response.body,
      headers: ctx.response.headers,
      type: ctx.response.type
    }));*/
});

};

module.exports = middleware;
