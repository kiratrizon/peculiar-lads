import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { ask } from "../chat.ts";
import type { Command } from "../types.ts";

const execute = async (interaction: ChatInputCommandInteraction) => {
  const question = interaction.options.getString("question", true);

  await interaction.reply({
    content: `Calculating answer to "${question}"...`,
  });

  const answer = await ask(interaction.user.id, question);

  if (answer === null) {
    await interaction.editReply("Internal Server Error");
  } else {
    const newReply = `Q: ${question}${answer}`;

    await interaction.editReply(newReply);
  }
};

export default {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask a question and get an answer.")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The question you want to ask")
        .setRequired(true),
    ),
  execute,
} satisfies Command;
