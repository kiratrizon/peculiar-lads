import type {
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export type CommandData =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder;

export type Command = {
  data: CommandData;
  execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
  handleModal?: (interaction: ModalSubmitInteraction) => Promise<unknown>;
};
