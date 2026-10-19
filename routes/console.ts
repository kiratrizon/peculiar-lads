import { startScheduledMessagesCron } from "pecu-discord-deno/scheduler.ts";

const discordApp = async () => await import("../pecu-discord-deno/main.ts");

if (config("app.env") === "production") {
  await discordApp();
  startScheduledMessagesCron();
}

Deno.cron("keep-alive", "*/1 * * * *", async () => {
  const { status } = await fetch(config("app.url") + "/up");
  console.log(
    `Keep-alive ping to ${config("app.url")}/up returned status ${status}`,
  );
});
