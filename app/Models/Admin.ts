import { Authenticatable } from "Illuminate/Contracts/Auth/index.ts";
import { HasFactory } from "Illuminate/Database/Eloquent/Factories/index.ts";

export type AdminSchema = {
  id?: number;
  email: string;
  password: string;
  name: string;
};

class Admin extends Authenticatable<AdminSchema> {
  protected static override _fillable = [
    "email",
    "password",
    "name",
  ];

  protected static override use = {
    HasFactory,
  };

  protected static override _hidden = [
    "password",
  ];
}

export default Admin;
