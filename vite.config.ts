import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8046,

    proxy: {
      "/v1/api/dms": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:8087",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:8087",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      "/api/v1/xauth": {
        target: "http://10.203.14.15:8080",
        changeOrigin: true,
        secure: false,
      },
      // Proxy /dms/ requests to the DMS file server — avoids CORS when fetching/updating PDFs
      "/dms": {
        target: "http://10.203.14.169",
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