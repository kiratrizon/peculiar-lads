import Application from "Illuminate/Foundation/Application.ts";
import IsAdmin from "App/Http/Middlewares/IsAdmin.ts";
import BindRecruit from "App/Http/Middlewares/BindRecruit.ts";
import AllowedUser from "App/Http/Middlewares/AllowedUser.ts";
import IsUser from "App/Http/Middlewares/IsUser.ts";
import SavePath from "App/Http/Middlewares/SavePath.ts";
import LanguageSetter from "App/Http/Middlewares/LanguageSetter.ts";
import BindUser from "App/Http/Middlewares/BindUser.ts";
import BindCharacter from "App/Http/Middlewares/BindCharacter.ts";
import SetupLangVar from "App/Http/Middlewares/SetupLangVar.ts";
import RedirectToLocal from "App/Http/Middlewares/RedirectToLocal.ts";
import NotFoundHttpException from "Illuminate/Foundation/HttpExceptions/NotFoundHttpException.ts";

export default Application.withRouting({
  web: async () => await import("../routes/web.ts"),
  // api: async () => await import("../routes/api.ts"),
  commands: async () => await import("../routes/console.ts"),
})
  .withMiddleware((middleware) => {
    middleware.alias({
      isAdmin: IsAdmin,
      bind_recruit: BindRecruit,
      allowed_user: AllowedUser,
      isUser: IsUser,
      save_path: SavePath,
      set_lang: LanguageSetter,
      bind_member: BindUser,
      bind_character: BindCharacter,
    });
    middleware.append(RedirectToLocal);
    middleware.append(SetupLangVar);
  })
  .withExceptions((exceptions) => {
    exceptions.render<typeof NotFoundHttpException>(
      NotFoundHttpException,
      async ({ request }, e) => {
        console.log("hello");
        if (request.expectsJson() || request.ajax()) {
          return response().json({ message: "Not Found" }, 404);
        }
        return "Not Found";
      },
    );
  })
  .create();
