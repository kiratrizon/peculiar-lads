import { dispatchDueScheduledMessages } from "./scheduledMessages.ts";
import { logErrorToDiscord } from "./errorLog.ts";

// Runs the dispatcher in-process. There used to be a POST to /api/keep-alive
// here, because the cron and the Discord side lived in separate processes -
// one app on Fly means the cron can just call the code.
export const startScheduledMessagesCron = () => {
  Deno.cron("scheduled-messages", "* * * * *", async () => {
    try {
      await dispatchDueScheduledMessages();
    } catch (e) {
      console.error("Error while dispatching scheduled messages:", e);
      logErrorToDiscord("cron: scheduled messages", e);
    }
  });
};
