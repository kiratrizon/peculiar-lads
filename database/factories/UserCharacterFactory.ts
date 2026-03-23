import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import UserCharacter, { UserCharacterSchema } from "App/Models/UserCharacter.ts";

export default class UserCharacterFactory extends Factory {

  protected override _model = UserCharacter;

  public definition(): UserCharacterSchema {
    return {
      user_id: this.faker.numberBetween(1, 100),
      main: this.faker.boolean(),
      third_class_id: this.faker.numberBetween(1, 52),
      nstg_level_id: this.faker.numberBetween(1, 10),
      ign: this.faker.firstName(),
      duration: this.faker.numberBetween(0, 5 * 60)
    };
  }
}
