const { spawn } = require("child_process"),
  path = require("path");
const names = [
  "experiment-02-wedding",
  "experiment-04-food-list",
  "experiment-05-questionnaire",
  "experiment-06-music-player",
];
const children = names.map((n) =>
  spawn(process.execPath, [path.join(__dirname, n, "server/index.js")], {
    stdio: "inherit",
  }),
);
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  children.forEach((c) => c.kill("SIGTERM"));
  setTimeout(() => process.exit(), 300);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
children.forEach((c) =>
  c.on("exit", (code) => {
    if (code && !stopping) {
      console.error("服务启动失败，请检查3002/3004/3005/3006端口");
      stop();
    }
  }),
);
