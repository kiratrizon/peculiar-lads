import User from "App/Models/User.ts";
import Admin from "App/Models/Admin.ts";
import { AuthConfig } from "configs/@types/index.d.ts";

const constant: AuthConfig = {
  default: {
    guard: "user",
  },
  guards: {
    user: {
      driver: "session",
      provider: "users",
    },
    admin: {
      driver: "session",
      provider: "admins",
    },
  },
  providers: {
    users: {
      driver: "eloquent",
      model: User,
    },
    admins: {
      driver: "eloquent",
      model: Admin,
    },
  },
};

export default constant;
