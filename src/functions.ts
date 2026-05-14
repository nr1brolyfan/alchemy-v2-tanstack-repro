import { createServerFn } from "@tanstack/react-start";

export const getGreeting = createServerFn({ method: "GET" }).handler(() => {
  return {
    message: "Hello from a TanStack Start server function",
    renderedAt: "2026-05-14T00:00:00.000Z",
  };
});
