import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
  },
  plugins: [preact()],
});
