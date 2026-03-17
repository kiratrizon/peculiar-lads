import Seeder from "Illuminate/Database/Seeder.ts";
import User from "App/Models/User.ts";

export default class UserSeeder extends Seeder {
  public async run() {
    // Call your factories here
    
    const userFactory = await User.factory();
    userFactory.count(10);
    await userFactory.create();
  }
}
