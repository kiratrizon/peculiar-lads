import { MessageComponentTypes, TextStyles } from "@discordeno/bot";

import { ask } from "../chat.ts";
import type { AppInteraction, Command } from "../types.ts";

const MODAL_CUSTOM_ID = "talk:modal";
const QUESTION_FIELD_ID = "question";

const execute = async (interaction: AppInteraction) => {
  // `interaction.respond()` picks the response type based on the payload
  // shape: a `title` field means it sends a MODAL response (see
  // baseInteraction.respond in @discordeno/bot's transformers/interaction).
  await interaction.respond({
    title: "Talk to the bot",
    customId: MODAL_CUSTOM_ID,
    components: [
      {
        type: MessageComponentTypes.ActionRow,
        components: [
          {
            type: MessageComponentTypes.InputText,
            style: TextStyles.Paragraph,
            customId: QUESTION_FIELD_ID,
            label: "What do you want to talk about?",
            required: true,
          },
        ],
      },
    ],
  });
};

const getSubmittedValue = (interaction: AppInteraction, customId: string) => {
  for (const row of interaction.data?.components ?? []) {
    for (const component of row.components ?? []) {
      if (component.customId === customId) {
        return component.value;
      }
    }
  }
  return undefined;
};

const handleModal = async (interaction: AppInteraction) => {
  const question = getSubmittedValue(interaction, QUESTION_FIELD_ID) ?? "";

  await interaction.respond({
    content: `Calculating answer to "${question}"...`,
  });

  const answer = await ask(interaction.user.id.toString(), question);

  if (answer === null) {
    await interaction.edit("Internal Server Error");
  } else {
    const newReply = `${interaction.user.username}: ${question}${answer}`;

    await interaction.edit(newReply);
  }
};

export default {
  data: {
    name: "talk",
    description: "Have a casual conversation with the bot.",
  },
  execute,
  handleModal,
} satisfies Command;
