import Seeder from "Illuminate/Database/Seeder.ts";

import { randomBytes } from "node:crypto";
import Admin from "App/Models/Admin.ts";

export function createApiToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export default class AdminTokenSeeder extends Seeder {
  public async run() {
    // Call your factories here
    const token = createApiToken();
    const firstAdmin = await Admin.first();
    if (firstAdmin) {
      firstAdmin.fill({ api_token: token });
      await firstAdmin.save();
      console.log(`Generated API token for admin: ${token}`);
    } else {
      console.error("No admin found to assign API token.");
    }
  }
}
