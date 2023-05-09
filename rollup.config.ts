/* eslint-disable @typescript-eslint/ban-ts-comment */
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import { default as dts } from "rollup-plugin-dts";

// @ts-ignore
const getEsmAndCjs = ({ input, output }) => {
  const plugins = [
    json(),
    commonjs(),
    typescript({
      compilerOptions: {
        rootDir: "src",
        target: "ESNext",
      },
    }),
  ];

  const external = ["ethers", "@kirobo/fct-plugins", "lodash", "graphlib", "util"];

  const defaultData = {
    input,
    plugins,
    external,
  };

  return [
    {
      ...defaultData,
      output: {
        dir: output,
        format: "esm",
        sourcemap: false,
      },
    },
    {
      ...defaultData,
      output: {
        dir: `${output}/cjs`,
        entryFileNames: "[name].cjs",
        chunkFileNames: "[name]-[hash].cjs",
        format: "cjs",
        sourcemap: false,
      },
    },
    { input, output: [{ file: `${output}/index.d.ts` }], plugins: [dts({})] },
  ];
};

const main = getEsmAndCjs({
  input: "src/index.ts",
  output: "dist",
});

const plugins = getEsmAndCjs({
  input: "src/plugins.ts",
  output: "dist/plugins",
});

const types = {
  input: "src/types/index.ts",
  output: [{ file: `dist/types/index.d.ts` }],
  plugins: [dts({})],
};

export default [...main, ...plugins, types];

// export default [esm, cjs, types, ...plugins];
// export default [esm, cjs];
