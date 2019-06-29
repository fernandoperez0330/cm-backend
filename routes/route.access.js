"use strict";

var route = function(router){
  router.post("/login", async (ctx, next) => {
    ctx.ws.outputSuccess(ctx);
  });
}

module.exports = route;
