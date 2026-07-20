// Runs the Discord bot inside an isolated Deno Deploy sandbox (jsr:@deno/sandbox)
// instead of on this machine. Useful for trying out changes without touching
// your local Discord token/session, or for a throwaway environment matching
// what production would look like.
//
// Usage: deno run -A pecu-discord-deno/sandbox.ts
//
// The sandbox is created with the default "session" timeout, meaning it stays
// alive for as long as this script keeps running. Ctrl+C to stop the bot and
// tear down the sandbox.

import { Sandbox } from "@deno/sandbox";
import { load } from "dotenv";

const REPO_URL = "https://github.com/kiratrizon/peculiar-lads.git";
const PROJECT_DIR = "/home/app/project";

const localEnv = await load({
  envPath: new URL("../.env", import.meta.url).pathname,
  examplePath: null,
});

await using sandbox = await Sandbox.create({
  token: localEnv.DENO_DEPLOY_TOKEN,
});

console.log(`Sandbox created: ${sandbox.id}`);
console.log(`Cloning ${REPO_URL} into the sandbox...`);

const clone = await sandbox.spawn("git", {
  args: ["clone", "--depth", "1", REPO_URL, PROJECT_DIR],
  stdout: "inherit",
  stderr: "inherit",
});
const cloneStatus = await clone.status;
if (!cloneStatus.success) {
  throw new Error(`git clone failed with exit code ${cloneStatus.code}`);
}

// .env is gitignored, so the clone above won't have it — copy it in directly.
await sandbox.fs.writeTextFile(
  `${PROJECT_DIR}/.env`,
  await Deno.readTextFile(new URL("../.env", import.meta.url)),
);

console.log("Starting the bot with `deno task discord`...");

const bot = await sandbox.spawn("deno", {
  args: ["task", "discord"],
  cwd: PROJECT_DIR,
  stdout: "inherit",
  stderr: "inherit",
});

const status = await bot.status;
console.log(`Bot process exited with code ${status.code}`);
