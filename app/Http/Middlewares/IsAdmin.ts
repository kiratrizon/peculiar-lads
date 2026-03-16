export default class IsAdmin {
  public handle: HttpMiddleware = async ({ request, Auth }, next) => {
    // Implement logic here

    if (!(await Auth.guard("admin").check())) {
      return redirect().route("admin.login");
    }
    return next();
  };
}
