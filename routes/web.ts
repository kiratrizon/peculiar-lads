import { Route } from "Illuminate/Support/Facades/index.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import NSTGLevel from "App/Models/NSTGLevel.ts";
import HomeController from "App/Http/Controllers/HomeController.ts";
import AdminController from "App/Http/Controllers/AdminController.ts";
import RecruitController from "App/Http/Controllers/RecruitController.ts";
import BlockListedPlayerController from "App/Http/Controllers/BlockListedPlayerController.ts";


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
    Route.get("/settings", [AdminController, "settings"]).name("settings");

    Route.get("/get-members", [AdminController, "getMembers"]).name("get-members").middleware("ensure_accepts_json");
    Route.get("/get-recruits", [AdminController, "getRecruits"]).name("get-recruits").middleware("ensure_accepts_json");

    Route.middleware("bind_recruit").group(() => {
      Route.resource("recruits", RecruitController).only(["show"]);
    });


    Route.get("/logout", [AdminController, "logout"]).name("logout");
  });
  Route.match(["get", "post"], "/login", [AdminController, "login"]).name("login").middleware(`guest:admin,${adminPrefix}`);
});

Route.prefix("/blocklisted").group(() => {
  Route.resource("blocklistedplayers", BlockListedPlayerController).only(["show"]);
  Route.middleware("allowed_user").group(() => {
    Route.resource("blocklistedplayers", BlockListedPlayerController).only(["create", "store", "edit", "update"]);
    Route.middleware("isAdmin").group(() => {
      Route.resource("blocklistedplayers", BlockListedPlayerController).only(["destroy"]);
    });
  });
});