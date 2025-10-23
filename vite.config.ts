import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ["src"], outDir: "dist", rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "NcTable",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.es.js" : "index.cjs"),
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-i18next",
        "lucide-react",
        "clsx",
        "class-variance-authority",
        "tailwind-merge",
        "date-fns",
        // Externalize ALL Radix UI dependencies to avoid version conflicts
        /^@radix-ui\/.*/,
      ],
    },
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
  },
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, "src/components"),
      "@/hooks": path.resolve(__dirname, "src/hooks"),
      "@/lib": path.resolve(__dirname, "src/lib"),
      "@/models": path.resolve(__dirname, "src/models"),
      "nc-table": path.resolve(__dirname, "src"),
    },
  },
});
