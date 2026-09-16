# Image for the whole app: the Honovel HTTP server, plus the Discord gateway
# that routes/console.ts boots inside the same process.
#
# Entry point is run-server.ts rather than index.ts: index.ts only exports the
# Hono app (Deno Deploy serves a default export for you), so `deno run index.ts`
# would listen on nothing - and with the gateway holding the event loop open,
# you'd get a machine that looks healthy while serving no HTTP at all.
# run-server.ts imports that same app and calls Deno.serve on it.
#
# Not `deno task smelt serve`: that spawns a child `deno --watch run-server.ts`
# (a dev launcher that also kills whatever owns the port), which in a container
# just adds a file watcher and a parent/child split that complicates SIGTERM on
# every deploy.
FROM denoland/deno:2.7.11

WORKDIR /app

COPY . .

# Debian-based image on purpose: the welcome/bye banners use @napi-rs/canvas,
# which resolves to its prebuilt linux-gnu binary here (a musl/alpine base
# would need the -musl build instead).
#
# deno.json sets nodeModulesDir: "auto", so this both populates node_modules and
# warms the remote module graph - including routes/console.ts and the bot behind
# it, which deno reaches through the static dynamic import in bootstrap/app.ts.
RUN deno install --entrypoint vendor/honovel/framework/src/hono/run-server.ts

CMD ["deno", "run", "-A", "vendor/honovel/framework/src/hono/run-server.ts"]
