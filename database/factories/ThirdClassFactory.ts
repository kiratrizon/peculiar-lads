import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import ThirdClass from "App/Models/ThirdClass.ts";

export default class ThirdClassFactory extends Factory {

  protected override _model = ThirdClass;

  public definition() {
    return {
      email: this.faker.email(),
      password: this.faker.password(12),
      name: this.faker.name()
    };
  }
}
