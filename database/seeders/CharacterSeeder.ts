import Seeder from "Illuminate/Database/Seeder.ts";
import Character from "App/Models/Character.ts";

export default class CharacterSeeder extends Seeder {
  public async run() {
    // Call your factories here
    const characterFactory = await Character.factory();
    const number = 11;
    for (let i = 1; i <= number; i++) {
      const user_id = i;
      await characterFactory.createMany(6, { main: false, user_id });
    }
  }
}
