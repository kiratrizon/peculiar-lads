import { MessageFlags } from "@discordeno/bot";
import { discordRest } from "./rest.ts";

// Gateway-free (uses discordRest, not bot.helpers), so this is safe to call
// from both the web process (controllers) and the bot process (main.ts) -
// they're one Honovel process, but importing main.ts from a controller
// would boot a second Discord connection (see rest.ts's own comment).
const MAX_STACK_LENGTH = 1500;
const ERROR_COLOR = 0xef4444;

export const logErrorToDiscord = async (
  context: string,
  error: unknown,
): Promise<void> => {
  const channelId = env("ERROR_LOG_CHANNEL_ID") as string | null;
  if (!channelId) return;

  const err = error instanceof Error ? error : new Error(String(error));
  const stack = (err.stack ?? "").slice(0, MAX_STACK_LENGTH);

  // Await this when the log has to land before the caller moves on; leaving it
  // un-awaited keeps the old fire-and-forget behaviour. Either way a logging
  // failure is swallowed here, so it can never mask the error being reported.
  try {
    await discordRest.sendMessage(channelId, {
      flags: MessageFlags.SuppressNotifications,
      embeds: [
        {
          title: `Error: ${context}`.slice(0, 256),
          description: `\`\`\`\n${(err.message || "Unknown error").slice(0, 1900)}\n\`\`\``,
          fields: stack
            ? [{ name: "Stack", value: `\`\`\`\n${stack}\n\`\`\`` }]
            : [],
          color: ERROR_COLOR,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  } catch (loggingError) {
    console.error("Failed to send error log to Discord", loggingError);
  }
};
