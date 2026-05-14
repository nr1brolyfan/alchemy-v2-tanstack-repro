import { createFileRoute } from "@tanstack/react-router";

import { getGreeting } from "../functions";

export const Route = createFileRoute("/")({
  loader: () => getGreeting(),
  component: IndexRoute,
});

function IndexRoute() {
  const greeting = Route.useLoaderData();

  return (
    <main>
      <h1>TanStack Start + Alchemy Cloudflare.Vite repro</h1>
      <p data-testid="server-message">{greeting.message}</p>
      <p data-testid="server-rendered-at">{greeting.renderedAt}</p>
    </main>
  );
}
