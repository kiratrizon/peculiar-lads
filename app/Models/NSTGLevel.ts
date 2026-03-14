import Model from "Illuminate/Database/Eloquent/Model.ts";

export type NSTGLevelSchema = {
  id?: number;
  name: string;
  code: string;
};

class NSTGLevel extends Model<NSTGLevelSchema> {
  protected static override _table = "nstg_level";

  protected static override _fillable = ["name", "code"];
}

export default NSTGLevel;
