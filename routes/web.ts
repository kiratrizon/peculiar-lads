import { Route } from "Illuminate/Support/Facades/index.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import NSTGLevel from "App/Models/NSTGLevel.ts";
import HomeController from "App/Http/Controllers/HomeController.ts";
import AdminController from "App/Http/Controllers/AdminController.ts";
import RecruitController from "App/Http/Controllers/RecruitController.ts";


Route.middleware("guest").group(() => {


  Route.get("/", async ({ request }) => {
    const allClass = await ThirdClass.all();
    const nstg = await NSTGLevel.all();
    return view("welcome", {
      allClass,
      nstg,
    });
  }).name("welcome");


  const throttleTime = 1 * 60 * 24; // 1 day
  const testDev = config("app").env !== "production";
  const throttleMax = !testDev ? 5 : 100;
  Route.post("/join-guild", [RecruitController, "store"]).name("apply").middleware(`throttle:${throttleMax},${throttleTime}`);

})


Route.get("/home", [HomeController, "index"]).middleware("auth");

const adminPrefix = "/admin";

Route.prefix(adminPrefix).as("admin").group(() => {
  Route.middleware("isAdmin").group(() => {
    Route.get("/", [AdminController, "index"]).name("index");
    Route.get("/members", [AdminController, "members"]).name("members");
    Route.get("/recruits", [AdminController, "recruits"]).name("recruits");
    Route.get("/events", [AdminController, "events"]).name("events");
    Route.get("/settings", [AdminController, "index"]).name("settings");

    Route.get("/get-members", [AdminController, "getMembers"]).name("get-members").middleware("ensure_accepts_json");
    Route.get("/get-recruits", [RecruitController, "getRecruits"]).name("get-recruits").middleware("ensure_accepts_json");


    Route.get("/logout", [AdminController, "logout"]).name("logout");
  });
  Route.match(["get", "post"], "/login", [AdminController, "login"]).name("login").middleware(`guest:admin,${adminPrefix}`);
});