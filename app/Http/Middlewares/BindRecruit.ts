import User from "../../Models/User.ts";

export default class BindRecruit {
  public handle: HttpMiddleware = async ({ request }, next) => {
    // A "recruit" is just a User row that hasn't completed signup yet
    // (status < 3) - see the merge described in app/Http/Controllers/RecruitController.ts.
    request.bindRoute({
      recruit: User,
    })
    return next();
  };
}
