// Built from config instead of route("keep-alive"): `route()` is defined by
// the web process's Server.init, and this cron runs in the bot process (its
// entry point is server.ts, which never loads hono/main.ts) - calling route()
// there throws, and the throw would be swallowed by the catch below, leaving
// scheduled messages silently unsent. Same URL either way:
// https://<app.url>/api/keep-alive
const keepAliveUrl = () => {
  const appUrl = String(config("app.url") ?? "").replace(/\/+$/, "");
  return `${appUrl}/api/keep-alive`;
};

export const startScheduledMessagesCron = () => {
  Deno.cron("scheduled-messages", "* * * * *", async () => {
    const myToken = env("MY_TOKEN");
    if (!myToken) {
      console.error("MY_TOKEN is not set in the environment variables.");
      return;
    }

    try {
      const response = await fetch(keepAliveUrl(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${myToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (_e) {
      // report error to discord channel
      console.error("Error while sending keep-alive request:", _e);
    }
  });
};
