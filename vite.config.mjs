import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API ke `npm run dev:api` (wrangler dev di port 8788)
    proxy: {
      "/api": "http://localhost:8788",
      "/images": "http://localhost:8788",
    },
  },
});
