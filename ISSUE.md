## Title

`Cloudflare.Vite` deploys TanStack Start SSR bundle with virtual client entry

## Description

I am seeing a TanStack Start SSR app fail after deployment through Alchemy's
`Cloudflare.Vite` resource. The deployed Worker returns HTML that still contains
TanStack Start's dev/internal client entry:

```text
/@id/virtual:tanstack-start-client-entry
```

The browser then requests that URL from the deployed host and gets a 404.

In a larger app using the same deployment path, the deployed SSR response also
failed server function resolution:

```text
Server function info not found for <server-function-id>
```

The minimal repro below reliably reproduces the virtual client entry issue.

## Repro Repository

This directory contains a minimal repro:

```bash
bun install
bun run build
bun run inspect:dist
bun run alchemy:deploy
bun run inspect:dist
bun run inspect:live -- https://<printed-worker-url>/
```

The first `inspect:dist`, immediately after normal `vite build`, passes. The
second `inspect:dist`, after the `Cloudflare.Vite` deploy/build path, reports the
bad virtual client entry.

## Expected Behavior

- The deployed SSR HTML should import the built client entry, for example `/assets/index-xxxxx.js`.
- The deployed Worker should not reference `/@id/virtual:tanstack-start-client-entry`.
- Server functions used by a route loader should resolve successfully.

## Actual Behavior

Minimal repro live output:

```json
{
  "status": 200,
  "contentType": "text/html; charset=utf-8",
  "hasVirtualClientEntry": true,
  "dynamicImports": ["/@id/virtual:tanstack-start-client-entry"],
  "serverFunctionError": null
}
```

Minimal repro generated `dist/server` after `Cloudflare.Vite` deploy/build path:

```json
{
  "hasVirtualClientEntry": true,
  "hasEmptyServerFunctionManifest": false,
  "hasServerFunctionResolver": true,
  "hasServerRpcHandler": true
}
```

In the larger affected app, the deployed SSR response also contained:

```json
{
  "status": 500,
  "dynamicImports": ["/@id/virtual:tanstack-start-client-entry"],
  "serverFunctionError": "Server function info not found for b74d674675b33d1a81606876392364d392e786a3179848704811a4713af73d84"
}
```

And the browser console showed:

```text
GET https://beta.guessdcharacter.com/@id/virtual:tanstack-start-client-entry 404 (Not Found)
Uncaught (in promise) TypeError: Failed to fetch dynamically imported module: https://beta.guessdcharacter.com/@id/virtual:tanstack-start-client-entry
```

Minimal repro deployed URL from my run:

```text
https://tanstack-start-alchemy-vite-repro-app-7ph72p4gh3sdphq6.itsbroly.workers.dev/
```

## Environment

- Bun: 1.3.14
- Vite: 8.0.8
- React: 19.2.5
- `@tanstack/react-start`: 1.167.41
- `@tanstack/react-router`: 1.168.22
- `alchemy`: `https://pkg.ing/alchemy/b281d6a`
- Wrangler: 4.86.0

## Additional Context

Deploying the normal `vite build` output directly as a prebuilt Worker avoids the
runtime failure. The issue appears specific to Alchemy's programmatic
`Cloudflare.Vite` path, where the captured SSR bundle seems to contain the
fallback TanStack Start manifest.
