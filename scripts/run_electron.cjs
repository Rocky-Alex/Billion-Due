const { spawn } = require("child_process");
const electron = require("electron");

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const args = process.argv.slice(2);
const target = args.length ? args : ["app"];

const child = spawn(electron, target, {
  stdio: "inherit",
  env,
  windowsHide: false,
});

child.on("close", (code) => {
  process.exit(code || 0);
});

