// Contents of the file /rollup.config.js
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";

const config = [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.mjs",
      format: "esm",
    },
    plugins: [
      typescript({
        tsconfig: "tsconfig.build.json",
      }),
      json(),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs",
    },
    plugins: [
      typescript({
        tsconfig: "tsconfig.build.json",
      }),
      json(),
    ],
  },
  // {
  //   input: "src/index.ts",
  //   output: {
  //     dir: "dist/cjs",
  //     format: "cjs",
  //   },
  //   plugins: [
  //     typescript({
  //       tsconfig: "tsconfig.build.json",
  //     }),
  //     json(),
  //   ],
  // },
];
export default config;
