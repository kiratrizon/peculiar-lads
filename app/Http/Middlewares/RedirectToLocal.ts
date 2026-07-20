export default class RedirectToLocal {
  public handle: HttpMiddleware = async ({ request }, next) => {
    // Implement logic here
    if (
      request.getHost().toLowerCase() !==
      "peculiarlads--local.kiratrizon.deno.net"
    ) {
      return redirect(
        `peculiarlads--local.kiratrizon.deno.net${request.fullPath()}`,
      );
    }
    return next();
  };
}
