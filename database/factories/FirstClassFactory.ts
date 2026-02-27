import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import FirstClass from "App/Models/FirstClass.ts";

export default class FirstClassFactory extends Factory {

  protected override _model = FirstClass;

  public definition() {
    return {
      email: this.faker.email(),
      password: this.faker.password(12),
      name: this.faker.name()
    };
  }
}
