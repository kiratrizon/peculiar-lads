import type { AppInteraction, Command } from "../types.ts";

// Discord's epoch (2015-01-01T00:00:00.000Z), used to derive a snowflake's
// creation timestamp the same way discord.js's `createdTimestamp` does.
const DISCORD_EPOCH = 1420070400000n;

const snowflakeTimestamp = (id: bigint) =>
  Number((id >> 22n) + DISCORD_EPOCH);

const execute = async (interaction: AppInteraction) => {
  const requestedAt = Date.now();

  const result = await interaction.respond(
    { content: "Pinging..." },
    { withResponse: true },
  );

  const replyMessageId = result && typeof result === "object" &&
      "resource" in result
    ? result.resource?.message?.id
    : undefined;

  const pingTime = replyMessageId
    ? snowflakeTimestamp(replyMessageId) - requestedAt
    : Date.now() - requestedAt;

  // Discordeno has no `client.ws.ping`-style single metric. The closest
  // equivalent is the per-shard heartbeat round-trip-time tracked by the
  // gateway manager, exposed on the interaction via `interaction.bot`.
  const shard = interaction.bot.gateway.shards.get(0);
  const apiLatency = shard?.heart.rtt;

  await interaction.edit(
    `Pong! \nBot Latency: ${pingTime}ms \nAPI Latency: ${
      apiLatency !== undefined ? `${Math.round(apiLatency)}ms` : "n/a"
    }`,
  );
};

export default {
  data: {
    name: "ping",
    description: "Replies with Pong and latency info.",
  },
  execute,
} satisfies Command;
