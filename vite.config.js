import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        sleep: resolve(__dirname, "sleep.html"),
        nutrition: resolve(__dirname, "nutrition.html"),
        fitness: resolve(__dirname, "fitness.html"),
      },
    },
  },
});
