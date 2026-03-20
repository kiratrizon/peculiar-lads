import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import UserCharacter from "App/Models/UserCharacter.ts";

export default class UserCharacterFactory extends Factory {

  protected override _model = UserCharacter;

  public definition() {
    return {
      email: this.faker.email(),
      password: this.faker.password(12),
      name: this.faker.name()
    };
  }
}
