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
  build: {
    rollupOptions: {
      output: {
        // Stable vendor chunks: they change rarely, so returning visitors keep them cached across deploys.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\/]node_modules[\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run)[\/]/.test(id)) return "react-vendor";
          // Only what the public site needs (app + Firestore Lite); Auth and Storage stay in admin-only chunks.
          if (/[\/]node_modules[\/](@firebase[\/](app|firestore|util|logger|component)|firebase[\/](app|firestore))[\/]/.test(id)) return "firebase";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
