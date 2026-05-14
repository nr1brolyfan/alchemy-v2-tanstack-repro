const url = process.argv[2];

if (!url) {
  console.error("Usage: bun run inspect:live -- https://your-worker.workers.dev/");
  process.exit(1);
}

const response = await fetch(url, {
  headers: {
    "cache-control": "no-cache",
    pragma: "no-cache",
  },
});
const html = await response.text();
const dynamicImports = [...html.matchAll(/import\("([^"]+)"\)/g)].map((match) => match[1]);
const serverFunctionError = html.match(/Server function info not found[^"<]*/)?.[0] ?? null;
const result = {
  status: response.status,
  contentType: response.headers.get("content-type"),
  hasVirtualClientEntry: html.includes("/@id/virtual:tanstack-start-client-entry"),
  dynamicImports,
  serverFunctionError,
  bodyLength: html.length,
};

console.log(JSON.stringify(result, null, 2));

if (result.status >= 500 || result.hasVirtualClientEntry || result.serverFunctionError) {
  process.exitCode = 1;
}
