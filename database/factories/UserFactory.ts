import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import { Hash } from "Illuminate/Support/Facades/index.ts";

export default class UserFactory extends Factory {
  public definition() {
    return {
      email: this.faker.email(),
      password: Hash.make("asterda23"),
      name: this.faker.name(),
      api_token: this.faker.uuid(), // Generate a random API token
      discord: this.faker.username().substring(0,20)
    };
  }
}
