import {
  isJSRequest,
  isCSSRequest,
  isImportRequest,
  cleanUrl,
} from "../../utils";
import { ServerContext } from "../index";
import createDebug from "debug";

const debug = createDebug("dev");

export async function transformRequest(
  url: string,
  serverContext: ServerContext
) {
  const { moduleGraph, pluginContainer } = serverContext;
  url = cleanUrl(url);
  let mod = await moduleGraph.getModuleByUrl(url);
  if (mod && mod.transformResult) {
    return mod.transformResult;
  }
  const resolvedResult = await pluginContainer.resolveId(url);
  let transformResult;
  if (resolvedResult?.id) {
    let code = await pluginContainer.load(resolvedResult.id);
    if (typeof code === "object" && code !== null) {
      code = code.code;
    }
    mod = await moduleGraph.ensureEntryFromUrl(url);
    if (code) {
      transformResult = await pluginContainer.transform(
        code as string,
        resolvedResult?.id
      );
    }
  }
  if (mod) {
    mod.transformResult = transformResult;
  }
  // console.log("transformResult",transformResult);

  return transformResult;
}

export function transformMiddleware(serverContext: ServerContext) {
  return async (
    req: { method: string; url: any },
    res: {
      statusCode: number;
      setHeader: (arg0: string, arg1: string) => void;
      end: (arg0: string | undefined) => any;
    },
    next: () => void
  ) => {
    if (req.method !== "GET" || !req.url) {
      return next();
    }
    const url = req.url;
    // console.log(url);
    debug("transformMiddleware: %s", url);
    // transform JS and CSS request
    if (isJSRequest(url) || isCSSRequest(url) || isImportRequest(url)) {
      let result = await transformRequest(url, serverContext);

      if (!result) {
        return next();
      }
      if (result && typeof result !== "string") {
        result = result.code;
        if (result!.includes("?import")) {
          console.log(result + "\n");
        }
      }
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/javascript");
      return res.end(result);
    }

    next();
  };
}
