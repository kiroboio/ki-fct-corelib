import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import { default as dts } from "rollup-plugin-dts";

const transpile = {
  input: "src/index.ts",
  plugins: [
    json(),
    commonjs(),
    typescript({
      compilerOptions: {
        rootDir: "src",
        target: "ESNext",
      },
    }),
  ],
};

const esm = {
  ...transpile,
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: false,
  },
};
const cjs = {
  ...transpile,
  output: {
    dir: "dist/cjs",
    entryFileNames: "[name].cjs",
    chunkFileNames: "[name]-[hash].cjs",
    format: "cjs",
    sourcemap: false,
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
