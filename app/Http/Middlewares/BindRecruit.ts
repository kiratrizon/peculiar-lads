import Recruit from "../../Models/Recruit.ts";

export default class BindRecruit {
  public handle: HttpMiddleware = async ({ request }, next) => {
    // Implement logic here

    request.bindRoute({
      recruit: Recruit,
    })
    return next();
  };
}
