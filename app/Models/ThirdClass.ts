import Model from "Illuminate/Database/Eloquent/Model.ts";

export type ThirdClassSchema = {
  id?: number;
  second_class_id: number;
  name: string;
};

class ThirdClass extends Model<ThirdClassSchema> {
  protected static override _fillable = ["second_class_id", "name"];
}

export default ThirdClass;
