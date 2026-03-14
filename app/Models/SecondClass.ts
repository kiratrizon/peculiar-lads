import Model from "Illuminate/Database/Eloquent/Model.ts";
import ThirdClass from "./ThirdClass.ts";

export type SecondClassSchema = {
  id?: number;
  first_class_id: number;
  name: string;
};

class SecondClass extends Model<SecondClassSchema> {
  protected static override _fillable = ["first_class_id", "name"];

  public thirdClasses() {
    return this.hasMany(ThirdClass);
  }
}

export default SecondClass;
