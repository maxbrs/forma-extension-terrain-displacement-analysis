
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    port: 8081,
  },
  optimizeDeps: {
    exclude: ['js-big-decimal']
  }
});
