import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import Admin from "App/Models/Admin.ts";
import { Hash } from "Illuminate/Support/Facades/index.ts";

export default class AdminFactory extends Factory {

  protected override _model = Admin;

  public definition() {
    return {
      email: "tgenesistroy@gmail.com",
      password: Hash.make("asterda23"),
      name: this.faker.name()
    };
  }
}
