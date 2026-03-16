import Application from "Illuminate/Foundation/Application.ts";
import NotFoundHttpException from "Illuminate/Foundation/HttpExecptions/NotFoundHttpException.ts";
import IsAdmin from "App/Http/Middlewares/IsAdmin.ts";

export default Application.withRouting({
  web: async () => await import("../routes/web.ts"),
  // api: async () => await import("../routes/api.ts"),
}).withMiddleware((middleware) => {
  middleware.alias({
    "isAdmin": IsAdmin,
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
