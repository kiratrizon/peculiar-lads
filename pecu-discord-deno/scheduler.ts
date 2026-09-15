export const startScheduledMessagesCron = () => {
  Deno.cron("scheduled-messages", "* * * * *", async () => {
    const myToken = env("MY_TOKEN");
    if (!myToken) {
      console.error("MY_TOKEN is not set in the environment variables.");
      return;
    }

    try {
      const response = await fetch(route("keep-alive"), {
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
