import {
  Model,
} from "Illuminate/Database/Eloquent/index.ts";

export type ThirdClassSchema = {
  id?: number;
  email: string;
  password: string;
  name: string;
};

class ThirdClass extends Model<ThirdClassSchema> {
  protected static override _fillable = [];

  
}

export default ThirdClass;
