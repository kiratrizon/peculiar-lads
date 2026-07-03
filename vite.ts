// don't import any modules that's related to vite to avoid deployment issues

// make Type manually
type ViteConfig = {
  server?: {
    port?: number;
    host?: string;
    cors?: boolean;
    strictPort?: boolean;
    ssl?: {
      cert?: string;
      key?: string;
      keyFormat?: string;
    };
    watch?: {
      ignored?: string | string[];
    };
  };
  cors?: {
    origin?: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
  };
  headers?: {
    "Access-Control-Allow-Origin": string;
  };

  build: {
    outDir: string;
    emptyOutDir: boolean;
    manifest: boolean;
    rollupOptions?: {
      input?: string[];
    };
  };
  publicDir: string;
};

const input: string[] = [
  "resources/css/guest.css",
  "resources/ts/app.ts",
  "resources/ts/welcome.ts",
  "resources/ts/admin/members.ts",
  "resources/ts/recruit/view.ts",
  "resources/css/login.css",
  "resources/ts/admin/recruits.ts",
  "resources/ts/stay-login.ts",
  "resources/css/dark.css",
  "resources/ts/shared/members.ts",
  "resources/ts/shared/member-show.ts",
  "resources/ts/shared/lang-select.ts",
];

export default <ViteConfig>{
  server: {
    cors: true,
    strictPort: true,
    port: 5173, // keep default unless you REALLY need 9000
    watch: {
      ignored: ["**/.env", "**/.env.*", "**/node_modules/**"],
    },
  },

  // add cors
  cors: {
    origin: [
      "https://peculiarlads.com",
      "http://peculiarlads.com",
      "http://127.0.0.1",
      "https://127.0.0.1",
    ],
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["*"],
  },

  headers: {
    "Access-Control-Allow-Origin": "*",
  },

  build: {
    outDir: "public/build",
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input,
    },
  },
  publicDir: "public/build/assets",
};
