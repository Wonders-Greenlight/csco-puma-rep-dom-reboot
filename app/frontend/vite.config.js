import 'dotenv/config'
import { dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

if (
  process.env.npm_lifecycle_event === "build" &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  console.warn(
    "\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n"
  );
}

const proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, "")
  : 'localhost';

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: process.env.FRONTEND_PORT,
    clientPort: 443,
  };
}

export default defineConfig({
  envDir: process.cwd(),
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [react(),
  // {
  //   name: 'log-imports',
  //   resolveId(source, importer) {
  //     if (importer) {
  //       console.log(`Imported '${source}' in '${importer}'`);
  //     } else {
  //       console.log(`Entry file: '${source}'`);
  //     }
  //     return null; // Let Vite handle resolving as usual
  //   }
  // }
  ],

  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  optimizeDeps: {
    include: ['@shopify/app-bridge']
  },
  build: {
    minify: true,
    commonjsOptions: {
      include: [/@shopify\/app-bridge/, /node_modules/]
    }
  },
  resolve: {
    preserveSymlinks: true,
    alias: [
      { find: '@', replacement: process.cwd() }
    ],
    dedupe: ['react'],
  },
  server: {
    host: 'localhost',
    port: process.env.FRONTEND_PORT,
    hmr: hmrConfig,
    proxy: {
      "^/(\\?.*)?$": proxyOptions,
      "^/api(/|(\\?.*)?$)": proxyOptions,
    }
  },
});