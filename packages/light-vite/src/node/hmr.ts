import { ServerContext } from "./server/index";
import chalk from "chalk";
import { getShortName } from "./utils";

const { green, blue } = chalk;
export function bindingHMREvents(serverContext: ServerContext) {
  const { watcher, ws, root } = serverContext;

  watcher.on("change", async (file: any) => {
    console.log(`✨${blue("[hmr]")} ${green(file)} changed`);
    const { moduleGraph } = serverContext;
    await moduleGraph.invalidateModule(file);
    ws.send({
      type: "update",
      updates: [
        {
          type: "js-update",
          timestamp: Date.now(),
          path: "/" + getShortName(file, root),
          acceptedPath: "/" + getShortName(file, root),
        },
      ],
    });
  });
}
