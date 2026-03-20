export default class SavePath {
  public handle: HttpMiddleware = async ({ request }, next,) => {
    if (request.method === "GET") {
      request.set("path", request.url);
    }
    // Implement logic here
    return next();
  };
}
