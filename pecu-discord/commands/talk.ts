import {
  ChatInputCommandInteraction,
  LabelBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

import { ask } from "../chat.ts";
import type { Command } from "../types.ts";

const MODAL_CUSTOM_ID = "talk:modal";
const QUESTION_FIELD_ID = "question";

const execute = async (interaction: ChatInputCommandInteraction) => {
  const modal = new ModalBuilder()
    .setCustomId(MODAL_CUSTOM_ID)
    .setTitle("Talk to the bot")
    .addLabelComponents(
      new LabelBuilder()
        .setLabel("What do you want to talk about?")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId(QUESTION_FIELD_ID)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true),
        ),
    );

  await interaction.showModal(modal);
};

const handleModal = async (interaction: ModalSubmitInteraction) => {
  const question = interaction.fields.getTextInputValue(QUESTION_FIELD_ID);

  await interaction.reply({
    content: `Calculating answer to "${question}"...`,
  });

  const answer = await ask(interaction.user.id, question);

  if (answer === null) {
    await interaction.editReply("Internal Server Error");
  } else {
    const newReply = `${interaction.user.username}: ${question}${answer}`;

    await interaction.editReply(newReply);
  }
};

export default {
  data: new SlashCommandBuilder()
    .setName("talk")
    .setDescription("Have a casual conversation with the bot."),
  execute,
  handleModal,
} satisfies Command;
