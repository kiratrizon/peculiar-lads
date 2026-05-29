// "vite": "npm:vite@^8.0.3"
import { defineConfig, InlineConfig } from "vite";
import viteConfig from "./vendor/vite/vite-manipulate.ts";
import tailwind from "@tailwindcss/vite";

export default defineConfig(({ command }) => {
  const base = viteConfig as InlineConfig;
  base.plugins = [
    tailwind({
      optimize: {
        // Minifying CSS in dev adds a lot of CPU per request (feels "staggering"); keep it for production builds only.
        minify: command === "build",
      },
    }),
  ];
  return base;
});
