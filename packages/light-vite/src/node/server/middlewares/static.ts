import { CLIENT_PUBLIC_PATH } from "../../constants";
import { isImportRequest } from "../../utils";
import sirv from "sirv";

export function staticMiddleware() {
  const serveFromRoot = sirv("/", { dev: true });
  return async (req: any, res: any, next: any) => {
    // console.log(req.url);

    if (!req.url) {
      return;
    }
    if (isImportRequest(req.url) || req.url === CLIENT_PUBLIC_PATH) {
      return;
    }
    serveFromRoot(req, res, next);
  };
}
