import Model from "Illuminate/Database/Eloquent/Model.ts";

export type QaPointSchema = {
  id?: number;
  discord_id: string;
  username: string | null;
  points: number;
  level: number;
};

class QaPoint extends Model<QaPointSchema> {
  protected static override _fillable = [
    "discord_id",
    "username",
    "points",
    "level",
  ];
}

export default QaPoint;
