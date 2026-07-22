import {
  Authenticatable,
  JWTSubject,
} from "Illuminate/Contracts/Auth/index.ts";
import { HasFactory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import Character from "./Character.ts";

export type UserSchema = {
  id?: number;
  email: string | null;
  password: string | null;
  name: string;
  api_token?: string | null;
  discord: string;
  discord_id: string | null;
  deactivated: boolean;
  reason: string | null;
  // 0: pending, 1: invited, 2: rejected, 3: accepted
  status: 0 | 1 | 2 | 3;
  invitation_link: string | null;
  // 0: not verified, 1: verified, 2: blocklisted
  verified: 0 | 1 | 2;
};

class User extends Authenticatable<UserSchema> implements JWTSubject {
  // Laravel-like implementation here
  protected static override _fillable = [
    "email",
    "password",
    "name",
    "api_token",
    "discord",
    "discord_id",
    "deactivated",
    "reason",
    "status",
    "invitation_link",
    "verified",
  ];
  protected static override _guarded: string[] = [];

  protected static override use = {
    HasFactory,
  };

  protected static override _hidden = ["password", "api_token"];

  public getJWTCustomClaims(): Record<string, unknown> {
    return {
      email: this.getRawAttribute("email"),
      name: this.getRawAttribute("name"),
    };
  }

  public getJWTIdentifier(): string | number {
    return this.getAuthIdentifier() || "";
  }

  public characters() {
    return this.hasMany(Character);
  }
}

export default User;
