import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import Character from "App/Models/Character.ts";

export default class CharacterFactory extends Factory {

  protected override _model = Character;

  public definition() {
    return {
      email: this.faker.email(),
      password: this.faker.password(12),
      name: this.faker.name()
    };
  }
}
