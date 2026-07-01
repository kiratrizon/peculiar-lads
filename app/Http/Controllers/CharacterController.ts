import Controller from "App/Http/Controllers/Controller.ts";
import { DB, Validator } from "Illuminate/Support/Facades/index.ts";
import Character from "App/Models/Character.ts";

class CharacterController extends Controller {
  public index: HttpDispatch = async ({ request }) => {
    const notif = await this.getUnreads({ request });

    const [page, perPage] = [
      parseInt((request.query("page") as string) || "1"),
      parseInt((request.query("perPage") as string) || "10"),
    ];
    const urlInstance = new URL(request.url);
    const characterQuery = Character.query();

    const fields = [
      "users.id as uid",
      "characters.id",
      "characters.ign",
      "nstg_level.code as nstg",
      "third_classes.name as class",
      "users.discord",
      "users.name as nickname",
      "characters.main",
      "COALESCE(characters.duration, null) AS duration",
    ];

    characterQuery.select(...fields.map((e) => DB.raw(e)));
    characterQuery
      .join("nstg_level", "characters.nstg_level_id", "=", "nstg_level.id")
      .join(
        "third_classes",
        "characters.third_class_id",
        "=",
        "third_classes.id",
      )
      .leftJoin("users", "characters.user_id", "=", "users.id");

    const search_ign = request.query("search_ign");
    if (isset(search_ign)) {
      const validator = await Validator.make(request.query(), {
        search_ign: "required|max:10|alpha_num",
      });
      if (!validator.fails()) {
        characterQuery.where("characters.ign", "like", `%${search_ign}%`);
      }
    }

    characterQuery.orderBy("characters.nstg_level_id", "desc");
    characterQuery.orderByRaw(DB.raw("characters.duration is null"));
    characterQuery.orderBy("characters.duration");

    const characters = await characterQuery.paginate(
      page,
      perPage,
      urlInstance,
    );

    return view("shared.characters", {
      selected: "characters",
      title: "Characters",
      notif,
      characters,
      search_ign,
    });
  };

  // GET /resource/{Character}
  public show: HttpDispatch = async ({ request }, { Character }) => {
    // Show a single resource by ID
    return response().json({
      message: `show ${Character}`,
    });
  };

  // GET /resource/create
  public create: HttpDispatch = async ({ request }) => {
    // Return form or data for creating resource
    return response().json({
      message: `create`,
    });
  };

  // POST /resource
  public store: HttpDispatch = async ({ request }) => {
    // Create a new resource
    return response().json({
      message: `store`,
    });
  };

  // GET /resource/{Character}/edit
  public edit: HttpDispatch = async ({ request }, { Character }) => {
    // Return form or data for editing resource
    return response().json({
      message: `edit ${Character}`,
    });
  };

  // PUT or PATCH /resource/{Character}
  public update: HttpDispatch = async ({ request }, { Character }) => {
    // Update a resource by ID
    return response().json({
      message: `update ${Character}`,
    });
  };

  // DELETE /resource/{Character}
  public destroy: HttpDispatch = async ({ request }, { Character }) => {
    // Delete a resource by ID
    return response().json({
      message: `delete ${Character}`,
    });
  };
}

export default CharacterController;
