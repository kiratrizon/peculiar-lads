import type { InternalBot } from "@discordeno/bot";

// `InternalBot` is the concrete Bot type produced when every transformer
// property is marked "desired" (see main.ts's `createDesiredPropertiesObject({}, true)`),
// which is exactly how this prototype's bot is created. Deriving our shared
// types from it (instead of importing the live `bot` instance from main.ts)
// avoids a circular import between main.ts -> built-commands.ts -> commands/*.ts -> types.ts.
type Inferred = InternalBot["transformers"]["$inferredTypes"];

export type AppBot = InternalBot;
export type AppInteraction = Inferred["interaction"];
export type AppMember = Inferred["member"];
export type AppUser = Inferred["user"];

export type CommandData = {
  name: string;
  description: string;
};

export type Command = {
  data: CommandData;
  execute: (interaction: AppInteraction) => Promise<unknown>;
  handleModal?: (interaction: AppInteraction) => Promise<unknown>;
};
