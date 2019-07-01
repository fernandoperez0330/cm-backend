"use strict";

var route = function(router){
  router.post("/login", async(ctx, next) => {
    await ctx.ws.auth.validate(ctx, ctx.ws, async (apiUser,session)=>{
        ctx.ws.outputSuccess(ctx,null, {
          "session_id": "41e55b42-8dbd-4013-bdbe-ad7041a748fd"
        });
    },false);
  });
}

module.exports = route;
