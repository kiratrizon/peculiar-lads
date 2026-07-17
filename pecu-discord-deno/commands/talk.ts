import { ApplicationCommandOptionTypes } from "@discordeno/bot";

import { ask } from "../chat.ts";
import type { AppInteraction, Command } from "../types.ts";

const QUESTION_OPTION_NAME = "question";

const execute = async (interaction: AppInteraction) => {
  const question = String(
    interaction.data?.options?.find(
      (option) => option.name === QUESTION_OPTION_NAME,
    )?.value ?? "",
  );

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
    options: [
      {
        name: QUESTION_OPTION_NAME,
        description: "What do you want to talk about?",
        type: ApplicationCommandOptionTypes.String,
        required: true,
      },
    ],
  },
  execute,
} satisfies Command;
