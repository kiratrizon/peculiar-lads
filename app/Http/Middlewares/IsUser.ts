export default class IsUser {
  public handle: HttpMiddleware = async ({ request, Auth }, next) => {
    // Implement logic here
    if (!(await Auth.guard("web").check())) {
      let redirectUrl = null;
      if (request.method === "GET" && !request.expectsJson() && !request.isBot() && !request.ajax() && !request.is("api/*")) {
        redirectUrl = request.get("path");
      }

      return redirect().route("login", { redirect: redirectUrl });
    }
    return next();
  };
}
