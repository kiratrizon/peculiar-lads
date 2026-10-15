import { startScheduledMessagesCron } from "pecu-discord-deno/scheduler.ts";

const discordApp = async () => {
  await import("pecu-discord-deno/main.ts");
};

if (config("app.env") == "production") {
  await discordApp();
  startScheduledMessagesCron();
}
