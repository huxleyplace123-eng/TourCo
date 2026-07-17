import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

// TourCo — Vite + React. The editable source lives in /src; `npm run build`
// bundles it into /dist as a deployable static app.
// Pages that ship from one build:
//   /        → the TicoWild customer site (index.html)
//   /admin/  → the internal TicoWild CRM (admin/index.html)
//   /my/     → the customer portal — log in, see your trip (my/index.html)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: {
    rollupOptions: {
      input: {
        main: r("index.html"),
        admin: r("admin/index.html"),
        my: r("my/index.html"),
      },
    },
  },
});
