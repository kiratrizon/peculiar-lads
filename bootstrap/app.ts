import Application from "Illuminate/Foundation/Application.ts";
import IsAdmin from "App/Http/Middlewares/IsAdmin.ts";
import BindRecruit from "App/Http/Middlewares/BindRecruit.ts";
import AllowedUser from "App/Http/Middlewares/AllowedUser.ts";
import IsUser from "App/Http/Middlewares/IsUser.ts";
import SavePath from "App/Http/Middlewares/SavePath.ts";
import NotFoundHttpException from "Illuminate/Foundation/HttpExecptions/NotFoundHttpException.ts";


export default Application.withRouting({
  web: async () => await import("../routes/web.ts"),
  // api: async () => await import("../routes/api.ts"),
}).withMiddleware((middleware) => {
  middleware.alias({
    "isAdmin": IsAdmin,
    "bind_recruit": BindRecruit,
    "allowed_user": AllowedUser,
    "isUser": IsUser,
    "save_path": SavePath,
  })
})
  .withExceptions((exceptions) => {
    exceptions.render(NotFoundHttpException, async ({ request }, _e) => {
      if (request.expectsJson() || request.is("api/*") || request.ajax()) {
        return response().json({ message: "Not Found" }, 404);
      }
    })
  })
  .create();
