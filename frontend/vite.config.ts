import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" permite abrir el build desde cualquier carpeta o subruta.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: { port: 5173, open: false },
  build: {
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          mapa: ["leaflet", "react-leaflet"],
          maplibre: ["maplibre-gl"],
          graficas: ["recharts"],
        },
      },
    },
  },
});
