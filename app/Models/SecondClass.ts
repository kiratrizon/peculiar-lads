import {
  Model,
} from "Illuminate/Database/Eloquent/index.ts";

export type SecondClassSchema = {
  id?: number;
  email: string;
  password: string;
  name: string;
};

class SecondClass extends Model<SecondClassSchema> {
  protected static override _fillable = [];

  
}

export default SecondClass;
