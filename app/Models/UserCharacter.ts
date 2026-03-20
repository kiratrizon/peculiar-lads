import Model from "Illuminate/Database/Eloquent/Model.ts";

export type UserCharacterSchema = {
  id?: number;
  user_id: number;
  main: boolean;
  third_class_id: number;
  nstg_level_id: number;
  ign: string;
  duration?: number;
};

class UserCharacter extends Model<UserCharacterSchema> {
  protected static override _fillable = [
    "user_id",
    "main",
    "third_class_id",
    "nstg_level_id",
    "ign",
    "duration",
  ];


}

export default UserCharacter;
