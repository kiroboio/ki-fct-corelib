import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import { default as dts } from "rollup-plugin-dts";

const transpile = {
  input: "src/index.ts",
  plugins: [json(), commonjs(), typescript()],
};

const esm = {
  ...transpile,
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
  },
};
const cjs = {
  ...transpile,
  output: {
    dir: "dist/cjs",
    entryFileNames: "[name].cjs",
    chunkFileNames: "[name]-[hash].cjs",
    format: "cjs",
    sourcemap: true,
  },
  watch: false,
};

const types = {
  input: "src/index.ts",
  output: [{ file: "dist/index.d.ts" }],
  plugins: [dts({})],
};

export default [esm, cjs, types];
// export default [esm, cjs];
