import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
// noinspection JSUnusedGlobalSymbols
export default defineConfig(async () => {
  const { internalIpV4 } = await import("internal-ip");
  const host = await internalIpV4();

  return {
    plugins: [
      react(),
      {
        name: "add react-devtools",
        transformIndexHtml(html) {
          if (process.env.NODE_ENV === "development")
            return html.replace(
              "<!--react-devtools-placeholder-->",
              '<script src="http://localhost:8097"></script>'
            );
          else
            return html.replace(
              /\n\W*?<!--react-devtools-placeholder-->\W*?\n/,
              "\n"
            );
        },
      },
    ],

    build: {
      // Tauri supports es2021
      target: ["esnext"],
      // don't minify for debug builds
      minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
      // produce sourcemaps for debug builds
      sourcemap: !!process.env.TAURI_DEBUG,
    },
    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    // prevent vite from obscuring rust errors
    clearScreen: false,
    // tauri expects a fixed port, fail if that port is not available
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      hmr: {
        protocol: "ws",
        host,
        port: 5183,
      },
    },
    // to make use of `TAURI_DEBUG` and other env variables
    // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
    envPrefix: ["VITE_", "TAURI_"],
  };
});