import Model from "Illuminate/Database/Eloquent/Model.ts";

export type BlockListedPlayerSchema = {
  id?: number;
  ign: string;
  first_class_id?: number;
  social_links?: Record<string, string>;
  reason?: string;
};

class BlockListedPlayer extends Model<BlockListedPlayerSchema> {
  protected static override _fillable = [
    "ign",
    "first_class_id",
    "social_links",
    "reason",
  ];


}

export default BlockListedPlayer;
