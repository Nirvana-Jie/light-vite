import { Command } from "commander";
import config from "../../package.json";
import { startDevServer } from "./server";

const program = new Command();
const version = config.version;
program.version(version, "-v,--version");

program
  .command("[root]", "start devServer")
  .alias("serve")
  .alias("dev")
  .action(async () => {
    console.log("测试cli");
    await startDevServer();
  });
program.parse(process.argv);
