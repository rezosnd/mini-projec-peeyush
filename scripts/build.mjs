import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const env = {
  ...process.env,
  NEXT_DISABLE_ESLINT: "1",
};

const nextBin = resolve("node_modules", "next", "dist", "bin", "next");

const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env,
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
