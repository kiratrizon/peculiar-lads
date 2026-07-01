export default class LanguageSetter {
  public handle: HttpMiddleware = async ({ request }, next) => {
    // Implement logic here
    // check if the first segment is in the allowed
    if (
      !request.ajax() &&
      !request.is("api/*") &&
      !request.expectsJson() &&
      request.method === "GET"
    ) {
      const path = request.path();
      const allowedLang = config<string[]>("app.supported_locales", ["en"]);
      const segment1 = path.split("/")[1];
      if (!allowedLang.includes(segment1)) {
        if (config("app.locale", "en") !== request.getLanguage()) {
          const querySearch = request.url.split("?");
          querySearch.shift();
          return redirect().to(
            `/${request.getLanguage()}${path}${querySearch.length ? `?${querySearch.join("?")}` : ""}`,
          );
        }
      }
    }
    return next();
  };
}
