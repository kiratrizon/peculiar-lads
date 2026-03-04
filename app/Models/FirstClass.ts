import { Model } from "Illuminate/Database/Eloquent/index.ts";
import SecondClass from "./SecondClass.ts";

export type FirstClassSchema = {
  id?: number;
  name: string;
};

class FirstClass extends Model<FirstClassSchema> {
  protected static override _fillable = ["name"];

  public secondClasses() {
    return this.hasMany(SecondClass);
  }
}

export default FirstClass;
