import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import BlockListedPlayer from "App/Models/BlockListedPlayer.ts";

export default class BlockListedPlayerFactory extends Factory {

  protected override _model = BlockListedPlayer;

  public definition() {
    return {
      email: this.faker.email(),
      password: this.faker.password(12),
      name: this.faker.name()
    };
  }
}
