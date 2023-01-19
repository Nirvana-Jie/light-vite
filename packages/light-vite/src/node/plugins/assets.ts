import { Plugin } from "../plugin";
import { ServerContext } from "../server";
import {
  cleanUrl,
  getShortName,
  normalizePath,
  removeImportQuery,
} from "../utils";

export function assetPlugin(): Plugin {
  let serverContext: ServerContext;

  return {
    name: "l-vite:asset",
    configureServer(s) {
      serverContext = s;
    },
    async load(id) {
      const cleanedId = removeImportQuery(cleanUrl(id));
      const resolvedId = `/${getShortName(
        normalizePath(id),
        serverContext.root
      )}`;
      // console.log("resolvedId",resolvedId );
      // console.log(1);

      // 这里仅处理 svg
      if (cleanedId.endsWith(".svg")) {
        return {
          code: `export default "${resolvedId}"`,
        };
      }
    },
  };
}
