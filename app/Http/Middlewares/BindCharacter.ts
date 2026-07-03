import Character from "../../Models/Character.ts";

export default class BindCharacter {
  public handle: HttpMiddleware = async ({ request }, next) => {
    request.bindRoute({
      character: Character,
    });
    return next();
  };
}
