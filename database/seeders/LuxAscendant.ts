import Seeder from "Illuminate/Database/Seeder.ts";
import FirstClass from "App/Models/FirstClass.ts";
import SecondClass from "App/Models/SecondClass.ts";
import ThirdClass from "App/Models/ThirdClass.ts";

export default class LuxAscendant extends Seeder {
  public async run() {
    // Call your factories here

    const vandarId = (
      (await FirstClass.where("name", "Vandar")
        .select("id")
        .first()) as FirstClass
    ).id;

    const create2ndClass = await SecondClass.create({
      first_class_id: vandarId,
      name: "Ascendant",
    });

    const create3rdClass = await ThirdClass.create({
      second_class_id: create2ndClass.id,
      name: "Lux Ascendant",
    });
  }
}
