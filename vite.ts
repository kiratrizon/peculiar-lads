// don't import any modules that's related to vite to avoid deployment issues

const inlineConfig = {
  server: {
    port: 5173,
  },

  build: {
    outDir: "public/build",
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: ["resources/ts/app.ts", "resources/ts/welcome.ts"],
    },
  },
  publicDir: "public/assets",
};

export default inlineConfig;
