import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// TourCo — Vite + React. The editable source lives in /src; `npm run build`
// bundles it into /dist as a deployable static app.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
});
