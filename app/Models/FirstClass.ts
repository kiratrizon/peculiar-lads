import Model from "Illuminate/Database/Eloquent/Model.ts";
import SecondClass from "./SecondClass.ts";

export type FirstClassSchema = {
  id?: number;
  name: string;
  icon?: string;
};

class FirstClass extends Model<FirstClassSchema> {
  protected static override _fillable = ["name", "icon"];

  public secondClasses() {
    return this.hasMany(SecondClass);
  }
}

export default FirstClass;
