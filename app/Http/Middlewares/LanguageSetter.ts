export default class LanguageSetter {
  public handle: HttpMiddleware = async ({ request }, next) => {
    // Implement logic here
    // check if the first segment is in the allowed

    const allowedLang = config<string[]>("app.supported_locales", ["en"]);
    if (
      !request.ajax() &&
      !request.is("api/*") &&
      !request.expectsJson() &&
      request.method === "GET"
    ) {
      const query = request.query();
      const queryString = Object.entries(query)
        .flatMap(([key, val]) => {
          if (key.toLowerCase() === "lang") {
            return [];
          }
          if (isset(val)) {
            return [`${key}=${val}`];
          }
          return [];
        })
        .join("&");
      // if there is lang but not in allowed lang
      if (
        isset(request.route("lang")) &&
        !allowedLang.includes(request.route("lang") as string)
      ) {
        const path = request.path().split("/"); // remove the first segment here
        path.shift();
        path.shift();

        const redirectPath = [
          `${config("app.locale", "en") !== request.getLanguage() ? `/${request.getLanguage()}` : ""}${path.length ? `/${path.join("/")}` : ""}`,
        ];
        if (isset(queryString) && !empty(queryString)) {
          redirectPath.push(queryString);
        }
        return redirect().to(redirectPath.join("?"));
      }
      // if no lang
      if (
        !isset(request.route("lang")) &&
        request.getLanguage() !== config("app.locale", "en")
      ) {
        const path = request.path().endsWith("/")
          ? request.path().substring(0, request.path().length - 1)
          : request.path();
        const redirectPath = [`/${request.getLanguage()}${path}`];
        if (isset(queryString) && !empty(queryString)) {
          redirectPath.push(queryString);
        }
        return redirect().to(redirectPath.join("?"));
      }
    }
    return next();
  };
}
