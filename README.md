# TanStack Start + Alchemy `Cloudflare.Vite` Repro

This is a minimal repro for a TanStack Start SSR app deployed through Alchemy's
`Cloudflare.Vite` resource.

## Problem

When deployed via `Cloudflare.Vite`, the SSR Worker contains TanStack Start's
dev/internal client entry instead of the built client asset:

```text
/@id/virtual:tanstack-start-client-entry
```

In a larger app using the same deployment path, server function resolution also
failed with:

```text
Server function info not found for <server-function-id>
```

The minimal repro in this directory reliably reproduces the virtual client entry
issue. The browser attempts to request
`https://<host>/@id/virtual:tanstack-start-client-entry` and receives 404.

## Versions

- Bun: 1.3.14
- Vite: 8.0.8
- React: 19.2.5
- `@tanstack/react-start`: 1.167.41
- `@tanstack/react-router`: 1.168.22
- `alchemy`: `https://pkg.ing/alchemy/b281d6a`
- Wrangler: 4.86.0

## Reproduction

```bash
bun install
bun run build
bun run inspect:dist
```

The normal Vite build is expected to pass `inspect:dist`.

Then deploy through Alchemy:

```bash
bun run alchemy:deploy
```

After the Alchemy deploy, `Cloudflare.Vite` has run its own programmatic build.
Inspecting the generated `dist/server` now shows the bad virtual entry:

```bash
bun run inspect:dist
```

Use the `url` printed by Alchemy:

```bash
bun run inspect:live -- https://<printed-worker-url>/
```

If your Alchemy/Cloudflare credentials are provided via `.env`, copy
`.env.example` to `.env` and add `--env-file .env` to the Alchemy commands.

## Expected

- The deployed HTML imports the built client asset, for example `/assets/index-xxxxx.js`.
- No request is made to `/@id/virtual:tanstack-start-client-entry`.
- The route loader can call the TanStack Start server function successfully.

## Actual

Verified minimal repro deploy URL:

```text
https://tanstack-start-alchemy-vite-repro-app-7ph72p4gh3sdphq6.itsbroly.workers.dev/
```

After `bun run alchemy:deploy`, `bun run inspect:dist` reports:

```json
{
  "hasVirtualClientEntry": true,
  "hasEmptyServerFunctionManifest": false,
  "hasServerFunctionResolver": true,
  "hasServerRpcHandler": true
}
```

`bun run inspect:live -- https://tanstack-start-alchemy-vite-repro-app-7ph72p4gh3sdphq6.itsbroly.workers.dev/` reports:

```json
{
  "status": 200,
  "contentType": "text/html; charset=utf-8",
  "hasVirtualClientEntry": true,
  "dynamicImports": ["/@id/virtual:tanstack-start-client-entry"],
  "serverFunctionError": null
}
```

In the larger affected app, the same deployment path also produced this response:

```json
{
  "status": 500,
  "dynamicImports": ["/@id/virtual:tanstack-start-client-entry"],
  "serverFunctionError": "Server function info not found for b74d674675b33d1a81606876392364d392e786a3179848704811a4713af73d84"
}
```

The browser then requested:

```text
GET /@id/virtual:tanstack-start-client-entry 404
```

## Notes

The same app shape works when deploying the normal `vite build` output directly
as a prebuilt Worker with `main: ./dist/server/worker.js` and assets from
`./dist/client`. The issue appears specific to the programmatic `Cloudflare.Vite`
build/deploy path.
