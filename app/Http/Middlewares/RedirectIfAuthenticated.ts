export default class RedirectIfAuthenticated {
  public static home = "/home";

  public handle: HttpMiddleware = async (
    { Auth },
    next,
    guard,
    redirectTo = RedirectIfAuthenticated.home,
  ) => {
    if (await Auth.guard(guard).check()) {
      return redirect(redirectTo);
    }
    // Implement logic here
    return next();
  };
}
