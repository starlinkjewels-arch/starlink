import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Override with PORT=xxxx when 8080 is taken by another local project.
const port = Number(process.env.PORT) || 8080;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port,
    strictPort: true,
    hmr: {
      host: "localhost",
      protocol: "ws",
      port,
      clientPort: port,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
