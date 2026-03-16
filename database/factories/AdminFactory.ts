import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import Admin from "App/Models/Admin.ts";

export default class AdminFactory extends Factory {

  protected override _model = Admin;

  public definition() {
    return {
      email: "admin@admin.com",
      password: "password",
      name: this.faker.name()
    };
  }
}
