// Contents of the file /rollup.config.js
import json from "@rollup/plugin-json";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

const config = [
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "esm",
      sourcemap: false,
    },
    plugins: [esbuild(), json()],
  },
  {
    input: "src/index.ts",
    output: {
      dir: "dist/cjs",
      format: "cjs",
      sourcemap: false,
    },
    watch: false,
    plugins: [esbuild(), json()],
  },
  {
    input: "dts/index.d.ts",
    output: { file: "dist/index.d.ts" },
    plugins: [dts({ compilerOptions: { baseUrl: "dts" } })],
    watch: false,
  },
];
export default config;
