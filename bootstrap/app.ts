import Application from "Illuminate/Foundation/Application.ts";
import NotFoundHttpException from "Illuminate/Foundation/HttpExecptions/NotFoundHttpException.ts";
import IsAdmin from "App/Http/Middlewares/IsAdmin.ts";
import BindRecruit from "App/Http/Middlewares/BindRecruit.ts";
import AllowedUser from "App/Http/Middlewares/AllowedUser.ts";


export default Application.withRouting({
  web: async () => await import("../routes/web.ts"),
  // api: async () => await import("../routes/api.ts"),
}).withMiddleware((middleware) => {
  middleware.alias({
    "isAdmin": IsAdmin,
    "bind_recruit": BindRecruit,
    "allowed_user": AllowedUser,
  })
})
  .withExceptions((exceptions) => {
    exceptions.render<typeof NotFoundHttpException>(NotFoundHttpException, async ({ request }, e) => {
      if (request.expectsJson() || request.is("api/*") || request.ajax()) {
        return response().json({ message: "Not Found" }, 404);
      }
      return "Not Found";
    });
  })
  .create();
