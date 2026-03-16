import RouteServiceProvider from "App/Providers/RouteServiceProvider.ts";

export default class RedirectIfAuthenticated {
  public handle: HttpMiddleware = async ({ Auth }, next, guard, redirectTo = RouteServiceProvider.home) => {
    if (await Auth.guard(guard).check()) {
      return redirect(redirectTo);
    }
    // Implement logic here
    return next();
  };
}
