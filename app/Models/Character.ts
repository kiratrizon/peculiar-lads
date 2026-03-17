import Model from "Illuminate/Database/Eloquent/Model.ts";
import NSTGLevel from "./NSTGLevel.ts";

export type CharacterSchema = {
  id?: number;
  user_id: number;
  main: boolean;
  third_class_id: number;
  nstg_level_id: number;
  ign: string;
  duration?: number;
};

class Character extends Model<CharacterSchema> {
  protected static override _fillable = [
    "user_id",
    "main",
    "third_class_id",
    "nstg_level_id",
    "ign",
    "duration",
  ];

  public myNstgLevel() {
    return this.hasOne(NSTGLevel, "nstg_level_id");
  }
}

export default Character;
