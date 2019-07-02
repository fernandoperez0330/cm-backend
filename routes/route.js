var route       = require("koa-router")(),
    Webservice  = require("../core/webservice.js"),
    Auth        = require("../core/auth.js"),
    Validator   = require("../core/validator.js");

var Router = function(app){
  app.use(async (ctx, next)=>{
    ctx.ws = new Webservice();
    ctx.ws.auth = new Auth(app);
    ctx.ws.validator = new Validator(app);
    await next();
  });

  require("./route.general.js")(route);
  require("./route.access.js") (route);

  app.use(async (ctx, next)=>{
      try{
        await next();
        if (ctx.body === undefined || ctx.body === null){
          ctx.ws.oError(ctx,"404",404);
        }
      }catch(err){
        console.log(err);
        ctx.ws.oError(ctx,"500",500);
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
