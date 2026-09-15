import { startScheduledMessagesCron } from "pecu-discord-deno/scheduler.ts";

const isProduction = config("app.env") == "production";

// The gateway is a long-lived WebSocket, which Deploy's isolates can't hold:
// the app is stopped when traffic goes quiet and restarted on the next
// request, so every cold start re-IDENTIFYs, and two live instances mean two
// bots handling the same guildMemberAdd/messageCreate. It runs on its own
// always-on host instead (`deno task discord`, see Dockerfile/fly.toml) - set
// RUN_DISCORD_GATEWAY=false on the web deployment once that host is up.
const runGateway = env("RUN_DISCORD_GATEWAY", isProduction);

const discordApp = async () => {
  await import("pecu-discord-deno/main.ts");
};

if (runGateway) {
  await discordApp();
}

// The cron stays with the web app rather than the bot: its callback resolves
// route("keep-alive"), and `route()` only exists in a process that booted the
// HTTP server (it's defined by Server.init).
if (isProduction) {
  startScheduledMessagesCron();
}
