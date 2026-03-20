export default class IsAdmin {
  public handle: HttpMiddleware = async ({ request, Auth }, next) => {
    // Implement logic here
    if (!(await Auth.guard("admin").check())) {
      let redirectUrl = null;
      if (request.method === "GET") {
        redirectUrl = request.get("path");
      }

      return redirect().route("admin.login", { redirect: redirectUrl });
    }
    return next();
  };
}
