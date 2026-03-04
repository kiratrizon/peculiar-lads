import { Route } from "Illuminate/Support/Facades/index.ts";
import FirstClass from "App/Models/FirstClass.ts";

Route.view("/", "welcome");

Route.get("/test", async () => {
  const classes = await FirstClass.with("secondClasses.thirdClasses").first();

  console.log(classes);

  return response().json(classes);
});
