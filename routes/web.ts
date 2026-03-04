import { Route } from "Illuminate/Support/Facades/index.ts";
import FirstClass from "App/Models/FirstClass.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import NSTGLevel from "App/Models/NSTGLevel.ts";

Route.get("/", async ({ request }) => {
  const allClass = await ThirdClass.all();
  const nstg = await NSTGLevel.all();
  return view("welcome", {
    allClass,
    nstg,
  });
});
