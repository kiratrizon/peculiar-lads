import { Route } from "Illuminate/Support/Facades/index.ts";
import FirstClass from "App/Models/FirstClass.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import NSTGLevel from "App/Models/NSTGLevel.ts";
import Recruit from "App/Models/Recruit.ts";
import HomeController from "App/Http/Controllers/HomeController.ts";


Route.middleware("guest").group(() => {
  Route.get("/", async ({ request }) => {
    const allClass = await ThirdClass.all();
    const nstg = await NSTGLevel.all();
    return view("welcome", {
      allClass,
      nstg,
    });
  }).name("welcome");
  Route.post("/join-guild", async ({ request }) => {
    const credentials = await request.validate({
      ign: "required|min:4|max:10",
      class: "required",
      nstg: "required",
      discord: "required|min:4|max:20",
      reason: "required|min:10|max:500",
    });
    
    // check if class is a number and exist in ThirdClass
    const classId = parseInt(credentials.class);
    if (!isInteger(classId)) {
      return redirect().back();
    }
    // @ts-ignore //
    credentials.class = classId;
    const classExist = await ThirdClass.find(classId);
    if (!classExist) {
      return redirect().back();
    }
    // check if nstg is a number and exist in NSTGLevel
    const nstgId = parseInt(credentials.nstg);
    if (!isInteger(nstgId)) {
      return redirect().back();
    }
    // @ts-ignore //
    credentials.nstg = nstgId;
    const nstgExist = await NSTGLevel.find(nstgId);
    if (!nstgExist) {
      return redirect().back();
    }
    const recruit = await Recruit.create(credentials);
    return view("welcome", {
      message: `Hello ${recruit.ign}, your application has been submitted successfully. Please wait for review.`,
    });
  }).name("apply");
})


Route.get("/home", [HomeController, "index"]).middleware("auth")