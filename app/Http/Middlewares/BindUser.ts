import User from "../../Models/User.ts";

export default class BindUser {
  public handle: HttpMiddleware = async ({ request }, next) => {
    // Implement logic here

    request.bindRoute({
      member: User,
    });
    return next();
  };
}
