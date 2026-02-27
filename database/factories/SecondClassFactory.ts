import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import SecondClass from "App/Models/SecondClass.ts";

export default class SecondClassFactory extends Factory {

  protected override _model = SecondClass;

  public definition() {
    return {
      email: this.faker.email(),
      password: this.faker.password(12),
      name: this.faker.name()
    };
  }
}
