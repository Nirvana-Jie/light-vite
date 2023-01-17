import http, { Server } from "http";
import chokidar, { FSWatcher } from "chokidar";
import chalk from "chalk";
import express from "express";
import { createWebSocketServer } from "./ws";
import { ModuleGraph } from "../ModuleGraph";
import { createPluginContainer, PluginContainer } from "../pluginContainer";
import { resolvePlugins } from "../plugins";
import { Plugin } from "../plugin";
import { bindingHMREvents } from "../hmr";
import { indexHtmlMiddware } from "./middlewares/indexHtml";
import { transformMiddleware } from "./middlewares/transform";
import { staticMiddleware } from "./middlewares/static";
import { optimize } from "../optimizer";
const { greenBright, blueBright, gray, red } = chalk;

export interface ServerContext {
  root: string;
  pluginContainer: PluginContainer;
  server: Server;
  plugins: Plugin[];
  moduleGraph: ModuleGraph;
  ws: { send: (data: any) => void; close: () => void };
  watcher: FSWatcher;
}

export async function startDevServer() {
  //新建express中间件
  const app = express();
  const root = process.cwd();
  const startTime = Date.now();
  const watcher = chokidar.watch(root, {
    ignored: ["**/node_modules/**", "**/.git/**"],
    ignoreInitial: true,
  });
  //创建ws服务器
  const ws = createWebSocketServer(app);
  //创建服务器
  const server = http.createServer(app);
  //创建插件
  const plugins = resolvePlugins();
  //创建模块依赖图。便于HMR的检测判断
  const moduleGraph = new ModuleGraph((url) => pluginContainer.resolveId(url));
  const pluginContainer = createPluginContainer(plugins);
  //创建服务器上下文，以便于hmr
  const serverContext: ServerContext = {
    root: process.cwd(),
    server,
    pluginContainer,
    plugins,
    moduleGraph,
    ws,
    watcher,
  };
  bindingHMREvents(serverContext);
  for (const plugin of plugins) {
    if (plugin.configureServer) {
      await plugin.configureServer(serverContext);
    }
  }
  app.use(transformMiddleware(serverContext));
  debugger;
  // 入口 HTML 资源
  app.use(indexHtmlMiddware(serverContext));

  // 静态资源
  app.use(staticMiddleware());
  server.listen(5174, async function () {
    await optimize(root);
    console.log(
      greenBright.bold("🚀 LIGHT-VITE v1.0.0"),
      `${gray.bold("耗时:")} ${red.bold(Date.now() - startTime + "ms")}\r\n`
    );
    console.log(
      `👉 ${gray.bold("本地访问路径: ")}` +
        blueBright.bold("http://localhost:5174/")
    );
  });
}
