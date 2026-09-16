// Built from config rather than route("keep-alive") so this works from any
// process: `route()` only exists where Server.init ran (the web app), and a
// throw here would be swallowed by the catch below, leaving scheduled messages
// silently unsent. Resolves to the same URL route() gives:
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
