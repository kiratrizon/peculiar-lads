import Model from "Illuminate/Database/Eloquent/Model.ts";

export type DiscordChannelSchema = {
  id?: number;
  channel_id: string;
  guild_id: string;
  name: string;
};

class DiscordChannel extends Model<DiscordChannelSchema> {
  protected static override _fillable = ["channel_id", "guild_id", "name"];
}

export default DiscordChannel;
