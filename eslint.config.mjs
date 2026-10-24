import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next. Patterns without a leading
    // wildcard are root-relative, so nested worktrees and their build
    // output need their own patterns.
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/next-env.d.ts",
    ".worktrees/**",
    "**/.worktrees/**",
  ]),
]);

export default eslintConfig;
