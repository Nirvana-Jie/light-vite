import { ServerContext } from "../index";
import path from "path";
import { pathExists, readFile } from "fs-extra";

export function indexHtmlMiddware(serverContext: ServerContext) {
  return async (req: any, res: any, next: any) => {
    if (req.url === "/") {
      const { root } = serverContext;
      const indexHtmlPath = path.join(root, "index.html");
      // console.log(indexHtmlPath);

      if (await pathExists(indexHtmlPath)) {
        const rawHtml = await readFile(indexHtmlPath, "utf8");
        let html = rawHtml;
        for (const plugin of serverContext.plugins) {
          if (plugin.transformIndexHtml) {
            html = await plugin.transformIndexHtml(html);
          }
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");

        return res.end(html);
      }
    }
    return next();
  };
}
