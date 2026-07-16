import Model from "Illuminate/Database/Eloquent/Model.ts";

export type AdminChannelOrderSchema = {
  id?: number;
  admin_id: number;
  discord_channel_id: number;
  position: number;
};

class AdminChannelOrder extends Model<AdminChannelOrderSchema> {
  protected static override _fillable = [
    "admin_id",
    "discord_channel_id",
    "position",
  ];
}

export default AdminChannelOrder;
