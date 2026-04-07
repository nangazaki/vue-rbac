import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
  input: { index: "index.ts" },

  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: ".",   
  },

  external: ["vue"],

  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      rootDir: ".",            
      declaration: true,
      declarationDir: "dist",
    }),
    terser(),
  ],
};
