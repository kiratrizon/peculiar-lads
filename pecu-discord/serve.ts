await import("../vendor/honovel/framework/src/hono-globals/index.ts");

const { tryAcquireLock, renewLock, releaseLock } = await import(
  "./leader-lock.ts"
);

const ACQUIRE_RETRY_MS = 5000;
const RENEW_INTERVAL_MS = 10_000;

let isLeader = false;

const becomeLeader = async () => {
  isLeader = true;
  console.log("Acquired leader lock — starting Discord bot.");
  await import("./main.ts");
};

(async () => {
  while (!isLeader) {
    if (await tryAcquireLock()) {
      await becomeLeader();
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, ACQUIRE_RETRY_MS));
  }
})();

setInterval(async () => {
  if (!isLeader) return;
  const status = await renewLock();
  if (status === "lost") {
    console.error("Lost leader lock to another instance — shutting down.");
    Deno.exit(1);
  } else if (status === "error") {
    console.warn(
      "Could not renew leader lock (transient error); retrying next interval.",
    );
  }
}, RENEW_INTERVAL_MS);

const shutdown = async () => {
  if (isLeader) {
    console.log("Releasing leader lock before shutdown.");
    await releaseLock();
  }
  Deno.exit(0);
};

Deno.addSignalListener("SIGTERM", shutdown);
Deno.addSignalListener("SIGINT", shutdown);

export default {
  fetch: () =>
    new Response(isLeader ? "leader" : "standby", {
      status: 200,
      headers: { "content-type": "text/plain" },
    }),
};
