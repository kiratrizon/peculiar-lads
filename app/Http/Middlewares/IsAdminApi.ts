export default class IsAdminApi {
  public handle: HttpMiddleware = async ({ request, Auth }, next) => {
    // Implement logic here
    if (!(await Auth.guard("api_admin").check())) {
      abort(401, "Unauthorized: Admin API token is missing or invalid.");
    }
    return next();
  };
}
