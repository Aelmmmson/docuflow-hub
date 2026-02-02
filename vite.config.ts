import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,

    proxy: {
      // All requests that start with /v1/api/dms → forward to backend port 4000 (or 3006)
      "/v1/api/dms": {
        target: "http://localhost:3006",       // ← change to 3006 if that's your real backend port now
        changeOrigin: true,
        secure: false,
      },
    },
  },

  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));