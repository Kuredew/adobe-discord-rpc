import js from "@eslint/js";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "dist/**",
    "node_modules/**",
    "jsx/**",
    "scripts/semver-gen/**",
    "scripts/dep/**"
  ]),
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      sourceType: "module",
      globals: {
        CSInterface: "readonly",
        CSEvent: "readonly",
        ...globals.node,
        ...globals.browser
      }
    }
  }
]);