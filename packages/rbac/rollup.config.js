import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

export default {
  input: {
    index: "index.ts",
    directive: "directive.ts",
    rbac: "rbac.ts",
    "core/role": "core/role.ts",
    "config/default": "config/default.ts",
    "config/schema": "config/schema.ts",
  },
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: ".",
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist",
      rootDir: ".",
    }),
    terser(),
  ],
  external: ["vue"],
};
