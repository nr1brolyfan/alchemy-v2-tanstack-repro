import { createRouter } from "@tanstack/react-router";

import "./style.css";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultNotFoundComponent: () => <div>Not found</div>,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
