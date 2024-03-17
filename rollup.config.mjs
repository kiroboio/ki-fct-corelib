import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

function getConfig(opts) {
  if (opts == null) {
    opts = {};
  }

  const file = `./dist/core${opts.suffix || ""}.js`;
  const exportConditions = ["import", "default"];
  const mainFields = ["module", "main"];
  if (opts.browser) {
    mainFields.unshift("browser");
  }

  return {
    input: "./lib.esm/index.js",
    output: {
      inlineDynamicImports: true,
      file,
      name: opts.name || undefined,
      format: opts.format || "esm",
      sourcemap: true,
    },
    treeshake: true,
    plugins: [
      nodeResolve({
        exportConditions,
        mainFields,
        modulesOnly: true,
        preferBuiltins: false,
      }),
      json(),
    ],
  };
}

export default [getConfig({ browser: true })];
