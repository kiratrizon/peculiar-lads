import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.ts";

const execute = async (interaction: ChatInputCommandInteraction) => {
  const { resource } = await interaction.reply({
    content: "Pinging...",
    withResponse: true,
  });
  const pingTime = resource?.message
    ? resource.message.createdTimestamp - interaction.createdTimestamp
    : Date.now() - interaction.createdTimestamp;

  await interaction.editReply(
    `Pong! \nBot Latency: ${pingTime}ms \nAPI Latency: ${Math.round(interaction.client.ws.ping)}ms`,
  );
};

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong and latency info."),
  execute,
} satisfies Command;
