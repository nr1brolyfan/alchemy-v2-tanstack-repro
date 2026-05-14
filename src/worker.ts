import type { Register } from "@tanstack/react-router";
import {
  createStartHandler,
  defaultStreamHandler,
  type RequestHandler,
} from "@tanstack/react-start/server";

const fetch = createStartHandler(defaultStreamHandler);

export default {
  fetch,
} satisfies { fetch: RequestHandler<Register> };
