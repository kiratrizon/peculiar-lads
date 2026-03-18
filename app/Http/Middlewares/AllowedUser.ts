export default class AllowedUser {
  public handle: HttpMiddleware = async ({ request, Auth }, next) => {
    const guards = config("auth.guards");
    const keys = Object.keys(guards as Record<string, any>);
    let pass = false;

    for (const key of keys) {
      const guard = Auth.guard(key);
      if (await guard.check()) {
        pass = true;
        break;
      }
    }
    if (!pass) {
      return redirect().back();
    }
    // Implement logic here
    return next();
  };
}
