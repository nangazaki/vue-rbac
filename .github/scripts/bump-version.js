import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const PACKAGE_PATH = resolve("packages/lib/package.json");

const bumpType = process.argv[2]; // "major" | "minor" | "patch"

const pkg = JSON.parse(readFileSync(PACKAGE_PATH, "utf-8"));
const [major, minor, patch] = pkg.version.split(".").map(Number);

const next = {
  major: `${major + 1}.0.0`,
  minor: `${major}.${minor + 1}.0`,
  patch: `${major}.${minor}.${patch + 1}`,
}[bumpType];

if (!next) {
  throw new Error("Invalid bump type");
  process.exit(1);
}

pkg.version = next;

writeFileSync(PACKAGE_PATH, JSON.stringify(pkg, null, 2) + "\n");
console.log(next);
