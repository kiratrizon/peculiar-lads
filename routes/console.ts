import { startScheduledMessagesCron } from "pecu-discord-deno/scheduler.ts";

// Both the gateway and the cron run in this process now. That's only safe
// because the app is hosted on one always-on Fly machine (auto_stop_machines
// off, one machine): on Deploy's isolates the gateway would re-IDENTIFY on
// every cold start, and two live instances would mean two bots handling the
// same guildMemberAdd/messageCreate.
const discordApp = async () => {
  await import("pecu-discord-deno/main.ts");
};

if (config("app.env") == "production") {
  await discordApp();
  startScheduledMessagesCron();
}
