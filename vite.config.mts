import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
  ],
  resolve: {
    alias: {
      // Use the appropriate Prisma client build for Cloudflare Workers
      "@prisma/client": "@prisma/client/wasm",
    },
  },
  optimizeDeps: {
    exclude: ["@prisma/client"],
  },
  ssr: {
    external: ["@prisma/client"],
  },
});
