import { Route } from "Illuminate/Support/Facades/index.ts";
import FirstClass from "App/Models/FirstClass.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import NSTGLevel from "App/Models/NSTGLevel.ts";
import Recruit from "App/Models/Recruit.ts";
import HomeController from "App/Http/Controllers/HomeController.ts";
import AdminController from "App/Http/Controllers/AdminController.ts";


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
      discord: "required|min:4|max:50",
      reason: "required|min:10|max:500",
    });
    
    // check if class is a number and exist in ThirdClass
    const classId = parseInt(credentials.class);
    if (!isInteger(classId)) {
      return redirect().back().withErrors({
        class: "Class is required",
      }).withInput(request.except(['class']));
    }
    // @ts-ignore //
    credentials.class = classId;
    const classExist = await ThirdClass.find(classId);
    if (!classExist) {
      return redirect().back().withErrors({
        class: "Class is not valid",
      }).withInput(request.except(['class']));
    }
    // check if nstg is a number and exist in NSTGLevel
    const nstgId = parseInt(credentials.nstg);
    if (!isInteger(nstgId)) {
      return redirect().back().withErrors({
        nstg: "NSTG is required",
      }).withInput(request.except(['nstg']));
    }
    // @ts-ignore //
    credentials.nstg = nstgId;
    const nstgExist = await NSTGLevel.find(nstgId);
    if (!nstgExist) {
      return redirect().back().withErrors({
        nstg: "NSTG is not valid",
      }).withInput(request.except(['nstg']));
    }
    const recruit = await Recruit.create(credentials);
    return redirect().route("welcome").with("message", `Hello ${recruit.getAttribute("ign")}, your application has been submitted successfully. Please wait for review.`);
  }).name("apply");
})


Route.get("/home", [HomeController, "index"]).middleware("auth");


Route.prefix("/admin").group(()=>{
  
  Route.middleware("isAdmin").group(()=>{
    Route.get("/", [AdminController, "index"]).name("admin.index");
  })
  Route.match(["get", "post"], "/login", [AdminController, "login"]).name("admin.login").middleware("guest:admin,/admin");
});