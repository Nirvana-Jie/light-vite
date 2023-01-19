import { build } from "esbuild";
import green from "chalk";
import path from "path";
import { scanPlugin } from "./scanPlugin";
import { preBundlePlugin } from "./preBundlePlugin";
import { PRE_BUNDLE_DIR } from "../constants";
import { flattenId, getPkgModulePath } from "../utils";

export async function optimize(root: string) {
  // 1. 确定入口
  const entry = path.resolve(root, "src/main.tsx");
  const flattenDeps = new Set<string>();
  const flattenDepsMapEntries: Record<string, string> = {};
  // 2. 从入口处扫描依赖
  const deps = new Set<string>();
  await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [scanPlugin(deps)],
  });
  console.log(
    `${green("需要预构建的依赖")}:\n${[...deps]
      .map((item) => `  ${item}`)
      .join("\n")}\n`
  );
  deps.forEach((dep: string) => {
    const flattenDep = flattenId(dep);
    // console.log(flattenDep);
    const newEntry = getPkgModulePath(dep, root)!;

    // console.log(newEntry);
    flattenDeps.add(flattenDep);
    flattenDepsMapEntries[flattenDep] = newEntry;
    // console.log(flattenDepsMapEntries);
  });
  // 3. 预构建依赖
  await build({
    entryPoints: [...flattenDeps],
    write: true,
    bundle: true,
    format: "esm",
    splitting: true,
    outdir: path.resolve(root, PRE_BUNDLE_DIR),
    plugins: [preBundlePlugin(flattenDepsMapEntries)],
  });
}
