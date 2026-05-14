import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const serverDir = join(process.cwd(), "dist/server");

if (!existsSync(serverDir)) {
  console.error("dist/server does not exist. Run `bun run build` first.");
  process.exit(1);
}

const files = listFiles(serverDir).filter((file) => file.endsWith(".js"));
const contents = files.map((file) => readFileSync(file, "utf8"));

const result = {
  files: files.map((file) => file.replace(`${process.cwd()}/`, "")),
  hasVirtualClientEntry: contents.some((code) =>
    code.includes("/@id/virtual:tanstack-start-client-entry"),
  ),
  hasEmptyServerFunctionManifest: contents.some(
    (code) => /(?:const|var)\s+manifest\s*=\s*\{\s*\}/.test(code),
  ),
  hasServerFunctionResolver: contents.some((code) =>
    code.includes("Server function info not found"),
  ),
  hasServerRpcHandler: contents.some((code) => code.includes("createServerRpc")),
};

console.log(JSON.stringify(result, null, 2));

if (result.hasVirtualClientEntry || result.hasEmptyServerFunctionManifest) {
  process.exitCode = 1;
}

function listFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    return statSync(fullPath).isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}
