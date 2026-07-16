import { Route } from "Illuminate/Support/Facades/index.ts";
import ThirdClass from "App/Models/ThirdClass.ts";
import NSTGLevel from "App/Models/NSTGLevel.ts";
import HomeController from "App/Http/Controllers/HomeController.ts";
import AdminController from "App/Http/Controllers/AdminController.ts";
import RecruitController from "App/Http/Controllers/RecruitController.ts";
import BlockListedPlayerController from "App/Http/Controllers/BlockListedPlayerController.ts";
import UserController from "App/Http/Controllers/UserController.ts";
import FirstClass from "App/Models/FirstClass.ts";
import PecuRecordsController from "App/Http/Controllers/PecuRecordsController.ts";
import MemberController from "App/Http/Controllers/MemberController.ts";
import CharacterController from "App/Http/Controllers/CharacterController.ts";
import DiscordChannelController from "App/Http/Controllers/DiscordChannelController.ts";
import ScheduledMessageController from "App/Http/Controllers/ScheduledMessageController.ts";

Route.prefix("/{lang?}")
  .where("lang", /[A-Za-z]{2,3}(?:-[A-Za-z]{2,8})?/)
  .middleware("set_lang")
  .group(() => {
    // global setup
    Route.post("/setup-lang", async ({ request }) => {
      const lang = request.input("lang");
      const pathEraser = `/${request.getLanguage()}`;
      const routeLang = request.input("route_lang") as "on" | "off";
      const referrer = (request.server("HTTP_REFERER") || "/") as string;
      const newReturnUrl = new URL(referrer);
      newReturnUrl.searchParams.set("lang", lang as string);
      if (routeLang === "on") {
        newReturnUrl.pathname = newReturnUrl.pathname.replace(pathEraser, "");
      }
      return response().json({
        redirect_url: newReturnUrl.toString(),
      });
    });

    Route.middleware("guest").group(() => {
      Route.get("/", async () => {
        const [allClass, nstg, firstClasses] = await Promise.all([
          ThirdClass.all(),
          NSTGLevel.all(),
          FirstClass.all(),
        ]);
        return view("welcome", {
          allClass,
          nstg,
          firstClasses,
        });
      }).name("welcome");

      const throttleTime = 1 * 60 * 24; // 1 day
      const testDev = config("app").env !== "production";
      const throttleMax = !testDev ? 5 : 100;
      Route.post("/join-guild", [RecruitController, "store"])
        .name("apply")
        .middleware(`throttle:${throttleMax},${throttleTime}`);

      // regex pattern for invite link 1-20260319145735-59cf78fd-02f7-4ab6-a41a-cd9d85319bbc
      Route.match(["get", "post"], "/signup/{inviteLink}", [
        UserController,
        "signup",
      ])
        .name("signup")
        .where(
          "inviteLink",
          /^\d+-\d{14}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        );

      Route.match(["get", "post"], "/login", [UserController, "login"]).name(
        "login",
      );
    });

    Route.middleware("isUser")
      .as("user")
      .group(() => {
        Route.get("/prompt-stay-login", [
          UserController,
          "promptStayLogin",
        ]).name("promptStayLogin");
        Route.get("/home", [HomeController, "index"]).name("index");
        Route.get("/characters", [CharacterController, "index"]).name(
          "characters",
        );
        Route.get("/logout", [UserController, "logout"]).name("logout");
        Route.middleware("bind_member").group(() => {
          Route.resource("members", MemberController);
          Route.post("/members/{member}/characters", [
            CharacterController,
            "store",
          ]).name("members.characters.store");
        });
        Route.middleware("bind_character").group(() => {
          Route.put("/characters/{character}", [
            CharacterController,
            "update",
          ]).name("characters.update");
          Route.delete("/characters/{character}", [
            CharacterController,
            "destroy",
          ]).name("characters.destroy");
        });
        Route.get("/events", [UserController, "events"]).name("events");
        Route.match(["get", "post"], "/settings", [
          UserController,
          "settings",
        ]).name("settings");
      });

    const adminPrefix = "/admin";

    Route.prefix(adminPrefix)
      .as("admin")
      .group(() => {
        Route.middleware("isAdmin").group(() => {
          Route.get("/", [AdminController, "index"]).name("index");
          Route.middleware("bind_member").group(() => {
            Route.resource("members", MemberController);
            Route.post("/members/{member}/characters", [
              CharacterController,
              "store",
            ]).name("members.characters.store");
          });
          Route.get("/recruits", [AdminController, "recruits"]).name(
            "recruits",
          );
          Route.get("/characters", [CharacterController, "index"]).name(
            "characters",
          );
          Route.middleware("bind_character").group(() => {
            Route.put("/characters/{character}", [
              CharacterController,
              "update",
            ]).name("characters.update");
            Route.delete("/characters/{character}", [
              CharacterController,
              "destroy",
            ]).name("characters.destroy");
          });
          Route.get("/schedule/channels", [
            DiscordChannelController,
            "index",
          ]).name("schedule.channels");
          Route.post("/schedule/channels", [
            DiscordChannelController,
            "store",
          ]).name("schedule.channels.store");
          Route.post("/schedule/channels/sync", [
            DiscordChannelController,
            "sync",
          ]).name("schedule.channels.sync");
          Route.post("/schedule/channels/reorder", [
            DiscordChannelController,
            "reorder",
          ])
            .name("schedule.channels.reorder")
            .middleware("ensure_accepts_json");
          Route.delete("/schedule/channels/{discord_channel_id}", [
            DiscordChannelController,
            "destroy",
          ]).name("schedule.channels.destroy");
          Route.get("/schedule/message/{discord_channel_id}", [
            ScheduledMessageController,
            "index",
          ]).name("schedule.message");
          Route.post("/schedule/message/{discord_channel_id}", [
            ScheduledMessageController,
            "store",
          ]).name("schedule.message.store");
          Route.get(
            "/schedule/message/{discord_channel_id}/{scheduledMessage}/edit",
            [ScheduledMessageController, "edit"],
          ).name("schedule.message.edit");
          Route.put(
            "/schedule/message/{discord_channel_id}/{scheduledMessage}",
            [ScheduledMessageController, "update"],
          ).name("schedule.message.update");
          Route.delete(
            "/schedule/message/{discord_channel_id}/{scheduledMessage}",
            [ScheduledMessageController, "destroy"],
          ).name("schedule.message.destroy");

          Route.get("/events", [AdminController, "events"]).name("events");
          Route.match(["get", "post"], "/settings", [
            AdminController,
            "settings",
          ]).name("settings");

          Route.middleware("bind_recruit").group(() => {
            // View Recruit
            Route.resource("recruits", RecruitController).only(["show"]);

            // POST /admin/recruits/{id}/invite
            Route.post("/recruits/{recruit}/invite", [
              RecruitController,
              "inviteRecruit",
            ])
              .name("invite-recruit")
              .middleware("ensure_accepts_json");
            Route.post("/recruits/{recruit}/verify", [
              RecruitController,
              "verify",
            ])
              .name("verify-recruit")
              .middleware("ensure_accepts_json");
            Route.post("/recruits/{recruit}/decline", [
              RecruitController,
              "decline",
            ])
              .name("decline-recruit")
              .middleware("ensure_accepts_json");
          });

          // Logout Admin
          Route.get("/logout", [AdminController, "logout"]).name("logout");
        });
        Route.match(["get", "post"], "/login", [AdminController, "login"])
          .name("login")
          .middleware(`guest:admin,${adminPrefix}`);
      });

    Route.prefix("/blocklisted").group(() => {
      Route.resource("players", BlockListedPlayerController).only([
        "index",
        "show",
      ]);
      Route.middleware("allowed_user").group(() => {
        Route.resource("players", BlockListedPlayerController).only([
          "create",
          "store",
          "edit",
          "update",
        ]);
        Route.middleware("isAdmin").group(() => {
          Route.resource("players", BlockListedPlayerController).only([
            "destroy",
          ]);
        });
      });
    });

    Route.prefix("/pecu-records").group(() => {
      Route.get("/", [PecuRecordsController, "index"]);
    });
  });
