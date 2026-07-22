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

  // POST /members/{member}/characters
  public store: HttpDispatch = async ({ request }, { member }) => {
    const isAdmin = request.get("entity") === "Admin";
    // @ts-ignore //
    if (!isAdmin && member.id !== request.user()?.id) {
      return response().json({ message: "Forbidden" }, 403);
    }
    // @ts-ignore //
    if (member.status !== 3) {
      return response().json({ message: "Member not found" }, 404);
    }

    const validator = await Validator.make(request.all(), {
      ign: "required|max:10|alpha_num",
      third_class_id: "required|integer|exists:third_classes,id",
      nstg_level_id: "required|integer|exists:nstg_level,id",
      main: "boolean",
      duration_minutes: "nullable|integer",
      duration_seconds: "nullable|integer",
    });

    if (validator.fails()) {
      const firstError = Object.values(validator.getErrors()).flat()[0];
      return response().json(
        { message: firstError ?? "Validation failed." },
        422,
      );
    }

    const durationMinutes = request.input("duration_minutes");
    const durationSeconds = request.input("duration_seconds");
    const hasDuration = !empty(durationMinutes) || !empty(durationSeconds);

    await Character.create({
      user_id: member.id,
      ign: request.input("ign") as string,
      third_class_id: Number(request.input("third_class_id")),
      nstg_level_id: Number(request.input("nstg_level_id")),
      main: request.input("main") === true,
      duration: hasDuration
        ? Math.max(0, Number(durationMinutes) || 0) * 60 +
          Math.max(0, Math.min(59, Number(durationSeconds) || 0))
        : undefined,
    });

    return response().json({ message: request.__("save_success") });
  };

  // GET /resource/{Character}/edit
  public edit: HttpDispatch = async ({ request }, { Character }) => {
    // Return form or data for editing resource
    return response().json({
      message: `edit ${Character}`,
    });
  };

  // PUT or PATCH /characters/{character}
  public update: HttpDispatch = async ({ request }, { character }) => {
    const isAdmin = request.get("entity") === "Admin";
    // @ts-ignore //
    if (!isAdmin && character.user_id !== request.user()?.id) {
      return response().json({ message: "Forbidden" }, 403);
    }

    // validate here first if not admin, then check if the character belongs to the user
    if (!isAdmin && character.user_id !== request.user()?.id) {
      return response().json({ message: "Forbidden" }, 403);
    }

    const validator = await Validator.make(request.all(), {
      ign: "required|max:10|alpha_num",
      third_class_id: "required|integer|exists:third_classes,id",
      nstg_level_id: "required|integer|exists:nstg_level,id",
      main: "boolean",
      duration_minutes: "nullable|integer",
      duration_seconds: "nullable|integer",
    });

    if (validator.fails()) {
      const firstError = Object.values(validator.getErrors()).flat()[0];
      return response().json(
        { message: firstError ?? "Validation failed." },
        422,
      );
    }

    const durationMinutes = request.input("duration_minutes");
    const durationSeconds = request.input("duration_seconds");
    const hasDuration = !empty(durationMinutes) || !empty(durationSeconds);

    character.fill({
      ign: request.input("ign") as string,
      third_class_id: Number(request.input("third_class_id")),
      nstg_level_id: Number(request.input("nstg_level_id")),
      main: request.input("main") === true,
      duration: hasDuration
        ? Math.max(0, Number(durationMinutes) || 0) * 60 +
          Math.max(0, Math.min(59, Number(durationSeconds) || 0))
        : undefined,
    });
    await character.save();

    return response().json({ message: request.__("save_success") });
  };

  // DELETE /characters/{character}
  public destroy: HttpDispatch = async ({ request }, { character }) => {
    const isAdmin = request.get("entity") === "Admin";
    // @ts-ignore //
    if (!isAdmin && character.user_id !== request.user()?.id) {
      return response().json({ message: "Forbidden" }, 403);
    }

    await Character.query().where("id", character.id).delete();

    return response().json({ message: request.__("delete_success") });
  };
}

export default CharacterController;
