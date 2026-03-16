import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import Recruit from "App/Models/Recruit.ts";

export default class RecruitFactory extends Factory {

  protected override _model = Recruit;

  public definition() {
    return {
      email: this.faker.email(),
      password: this.faker.password(12),
      name: this.faker.name()
    };
  }
}
