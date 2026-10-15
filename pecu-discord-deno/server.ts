import { startScheduledMessagesCron } from "./scheduler.ts";

await import("../vendor/honovel/framework/src/hono-globals/index.ts");
await import("./main.ts");
startScheduledMessagesCron();
