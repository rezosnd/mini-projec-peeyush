import { defineConfig, globalIgnores } from "eslint/config";

const importNextConfig = async (specifier, fallbackSpecifier) => {
  try {
    const mod = await import(specifier);
    return mod.default ?? mod;
  } catch (error) {
    if (
      error?.code === "ERR_MODULE_NOT_FOUND" ||
      error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED"
    ) {
      const mod = await import(fallbackSpecifier);
      return mod.default ?? mod;
    }
    throw error;
  }
};

const nextVitals = await importNextConfig(
  "eslint-config-next/core-web-vitals",
  "eslint-config-next/core-web-vitals.js"
);
const nextTs = await importNextConfig(
  "eslint-config-next/typescript",
  "eslint-config-next/typescript.js"
);

const asArray = (config) => (Array.isArray(config) ? config : [config]);

const eslintConfig = defineConfig([
  ...asArray(nextVitals),
  ...asArray(nextTs),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
