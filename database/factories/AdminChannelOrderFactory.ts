import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import AdminChannelOrder from "App/Models/AdminChannelOrder.ts";

export default class AdminChannelOrderFactory extends Factory {
  protected override _model = AdminChannelOrder;

  public definition() {
    return {
      admin_id: 1,
      discord_channel_id: 1,
      position: 0,
    };
  }
}
