export default class IsAdminApi {
  public handle: HttpMiddleware = async ({ request, Auth }, next) => {
    // Implement logic here
    if (env("MY_TOKEN") !== request.bearerToken()) {
      abort(401, "Unauthorized: Admin API token is missing or invalid.");
    }
    return next();
  };
}
