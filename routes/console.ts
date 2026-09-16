import { startScheduledMessagesCron } from "pecu-discord-deno/scheduler.ts";

// Only the cron lives here. The gateway bot doesn't boot from this process
// anymore: it's a long-lived WebSocket, which Deploy's isolates can't hold -
// the app is stopped when traffic goes quiet and restarted on the next
// request, so every cold start re-IDENTIFYs, and two live instances mean two
// bots handling the same guildMemberAdd/messageCreate. It runs on its own
// always-on host instead (`deno task discord`, see Dockerfile/fly.toml).
if (config("app.env") == "production") {
  startScheduledMessagesCron();
}
