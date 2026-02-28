import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { execSync } from "child_process";
import { existsSync, readFileSync, rmSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const vinextPkgPath = join(__dirname, "node_modules/vinext/package.json");
const vinextVersion = JSON.parse(readFileSync(vinextPkgPath, "utf-8")).version;
const gitHash = execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  define: {
    __VINEXT_VERSION__: JSON.stringify(vinextVersion),
    __GIT_HASH__: JSON.stringify(gitHash),
  },
  optimizeDeps: {
    include: ["react/jsx-runtime", "react/jsx-dev-runtime", "react", "react-dom", "nprogress"],
  },
  build: {
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.message?.includes("sourcemap")) return;
        if (warning.message?.includes("dynamic import will not move module")) return;
        defaultHandler(warning);
      },
    },
  },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
    {
      name: "strip-dev-vars",
      closeBundle() {
        const p = join(__dirname, "dist/server/.dev.vars");
        if (existsSync(p)) rmSync(p);
      },
    },
  ],
});
