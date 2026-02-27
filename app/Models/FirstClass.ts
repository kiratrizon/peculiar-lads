import {
  Model,
} from "Illuminate/Database/Eloquent/index.ts";

export type FirstClassSchema = {
  id?: number;
  email: string;
  password: string;
  name: string;
};

class FirstClass extends Model<FirstClassSchema> {
  protected static override _fillable = [];

  
}

export default FirstClass;
