import {
  CLIENT_PUBLIC_PATH,
  HASH_RE,
  JS_TYPES_RE,
  QEURY_RE,
} from "./constants";
import path from "path";
import os from "os";
import fs from "fs";

const INTERNAL_LIST = [CLIENT_PUBLIC_PATH, "/@react-refresh"];
export function slash(p: string): string {
  return p.replace(/\\/g, "/");
}

export const isWindows = os.platform() === "win32";

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id);
}

export const cleanUrl = (url: string): string =>
  url.replace(HASH_RE, "").replace(QEURY_RE, "");

export const isCSSRequest = (id: string): boolean =>
  cleanUrl(id).endsWith(".css");

export const isJSRequest = (id: string): boolean => {
  id = cleanUrl(id);
  if (JS_TYPES_RE.test(id)) {
    return true;
  }
  if (!path.extname(id) && !id.endsWith("/")) {
    return true;
  }
  return false;
};

export function isImportRequest(url: string): boolean {
  return url.endsWith("?import");
}

export function isInternalRequest(url: string): boolean {
  return INTERNAL_LIST.includes(url);
}

export function removeImportQuery(url: string): string {
  return url.replace(/\?import$/, "");
}

export function isPlainObject(obj: any): boolean {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

export function getShortName(file: string, root: string) {
  return file.startsWith(root + "/") ? path.posix.relative(root, file) : file;
}

export const flattenId = (id: string): string =>
  id
    .replace(/[/:]/g, "_")
    .replace(/\./g, "__")
    .replace(/(\s*>\s*)/g, "___");

//获取第三方包的逻辑
export function getPkgModulePath(moduleName: string, root: string) {
  //处理react/jsx-runtime
  if (moduleName.includes("/")) {
    let ext = "";
    const resolvedRoot = path.resolve(root, "node_modules", moduleName);
    //如果不是.js或则.ts结尾需要添加
    if (!resolvedRoot.endsWith(".ts") && !resolvedRoot.endsWith(".js")) {
      if (fs.existsSync(resolvedRoot + ".js")) {
        ext = ".js";
      } else if (fs.existsSync(resolvedRoot + ".ts")) {
        ext = ".ts";
      }
    }
    const normalizedRoot = normalizePath(resolvedRoot + ext); //后续做虚拟模块的时候 使用\\这个斜杠会报错改成/
    return normalizedRoot;
  }
}
