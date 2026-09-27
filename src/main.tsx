import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { store } from "./store/store";
import "./index.css";

// Register service worker for persistent Firebase Storage image caching.
// After first load, images are served instantly from Cache Storage on all future visits.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failure is non-critical — site still works normally
    });
  });
}

// Pages are pre-rendered at build time (scripts/prerender.mjs) with their own title, meta, canonical and
// JSON-LD. Drop those before React starts so react-helmet-async is the single source of head tags.
document.querySelectorAll("[data-prerender]").forEach((node) => node.remove());

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);

// Fade out the boot splash once the first real frame has painted, then drop it from the DOM.
requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    document.documentElement.classList.add("app-ready");
    window.setTimeout(() => document.getElementById("boot-splash")?.remove(), 600);
  })
);
