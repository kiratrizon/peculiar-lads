import { Route } from "Illuminate/Support/Facades/index.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import NSTGLevel from "App/Models/NSTGLevel.ts";
import HomeController from "App/Http/Controllers/HomeController.ts";
import AdminController from "App/Http/Controllers/AdminController.ts";
import RecruitController from "App/Http/Controllers/RecruitController.ts";
import BlockListedPlayerController from "App/Http/Controllers/BlockListedPlayerController.ts";
import UserController from "App/Http/Controllers/UserController.ts";


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

  // regex pattern for invite link 1-20260319145735-59cf78fd-02f7-4ab6-a41a-cd9d85319bbc
  Route.match(["get", "post"], "/signup/{inviteLink}", [UserController, "signup"]).name("signup").where("inviteLink", /^\d+-\d{14}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

Route.middleware("isUser").as("user").group(() => {
  Route.get("/prompt-stay-login", [UserController, "promptStayLogin"]).name("promptStayLogin");
  Route.get("/home", [HomeController, "index"]).name("index");
  Route.get("/logout", [UserController, "logout"]).name("logout");
  Route.get("/members", [UserController, "members"]).name("members");
  Route.get("/events", [UserController, "events"]).name("events");
  Route.get("/settings", [UserController, "settings"]).name("settings");
});

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

      // View Recruit
      Route.resource("recruits", RecruitController).only(["show"]);

      // POST /admin/recruits/{id}/invite
      Route.post("/recruits/{recruit}/invite", [RecruitController, "inviteRecruit"]).name("invite-recruit").middleware("ensure_accepts_json");
      Route.post("/recruits/{recruit}/verify", [RecruitController, "verify"]).name("verify-recruit").middleware("ensure_accepts_json");
    });


    // Logout Admin
    Route.get("/logout", [AdminController, "logout"]).name("logout");
  });
  Route.match(["get", "post"], "/login", [AdminController, "login"]).name("login").middleware(`guest:admin,${adminPrefix}`);
});

Route.prefix("/blocklisted").group(() => {
  Route.resource("players", BlockListedPlayerController).only(["index", "show"]);
  Route.middleware("allowed_user").group(() => {
    Route.resource("players", BlockListedPlayerController).only(["create", "store", "edit", "update"]);
    Route.middleware("isAdmin").group(() => {
      Route.resource("players", BlockListedPlayerController).only(["destroy"]);
    });
  });
});