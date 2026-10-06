import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { store } from "./store/store";

// Self-hosted fonts. These replace the Google Fonts stylesheet that used to sit in
// index.html, which blocked first paint for 951 ms waiting on a third-party origin.
// Served same-origin and hashed by Vite, so there is no extra DNS/TLS round trip.
// Variable files cover every weight the design uses (400-700) in one request each;
// only the two Cormorant italics the .accent style needs are pulled in.
import "@fontsource-variable/inter";
import "@fontsource-variable/inter-tight";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";

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
