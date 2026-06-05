import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/momcozy-app-demo/",
  plugins: [react()],
});
