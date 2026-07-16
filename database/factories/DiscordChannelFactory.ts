import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import DiscordChannel from "App/Models/DiscordChannel.ts";

const fakeSnowflake = () =>
  String(Math.floor(100000000000000000 + Math.random() * 900000000000000000));

export default class DiscordChannelFactory extends Factory {
  protected override _model = DiscordChannel;

  public definition() {
    return {
      channel_id: fakeSnowflake(),
      guild_id: fakeSnowflake(),
      name: "general",
    };
  }
}
