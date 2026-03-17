import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import Event from "App/Models/Event.ts";

export default class EventFactory extends Factory {

  protected override _model = Event;

  public definition() {
    return {
      email: this.faker.email(),
      password: this.faker.password(12),
      name: this.faker.name()
    };
  }
}
