import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isUserSite = repository?.toLowerCase().endsWith(".github.io");

export default defineConfig({
  base: repository && !isUserSite ? `/${repository}/` : "/",
  plugins: [react()],
});
