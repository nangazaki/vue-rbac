// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,          // gerar .d.ts
      declarationDir: "dist",     // onde colocar .d.ts
      rootDir: "src",             // origem dos arquivos
      emitDeclarationOnly: false, // ⬅️⬅️ MUITO IMPORTANTE: também gera JS!!
    }),
    terser(),
  ],
  external: ["vue"], // tratar vue como peer, não embutir
};
