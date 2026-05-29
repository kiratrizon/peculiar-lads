import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import Character from "App/Models/Character.ts";

export default class CharacterFactory extends Factory {

  protected override _model = Character;

  public definition() {
    return {
      main: this.faker.boolean(),
      third_class_id: this.faker.numberBetween(1, 52),
      ign: this.faker.name().substring(0, this.faker.numberBetween(4, 10)), //substring with only 4-10 characters
      nstg_level_id: this.faker.numberBetween(1, 21),
      duration: this.faker.numberBetween(10, 310),
    };
  }
}
