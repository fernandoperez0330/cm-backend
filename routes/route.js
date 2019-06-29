var route = require("koa-router")(),
    Webservice  = require("../core/webservice.js");

var Router = function(app){
  app.use(async (ctx, next)=>{
    ctx.ws = new Webservice();
    next();
  });


  require("./route.access.js")(route);

  app.use(async (ctx, next)=>{
      try{
        await next();
        if (ctx.body === undefined || ctx.body === null) ws.oError(ctx,"404",404);
      }catch(err){
        ctx.ws.oError(ctx,"500",500);
        /*global.logger.default.error("Unhandled Error",{
          error: err,
           ctx: ctx
        });*/
      }
  });

  app.use(route.routes());
  app.use(route.allowedMethods());
}

/**
 * Method to get router
 * @return {koa-router} [description]
 */
Router.prototype.getRoute = function(){
  return route;
}

module.exports = Router;
