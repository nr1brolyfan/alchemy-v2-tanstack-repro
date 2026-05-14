import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export const App = Cloudflare.Vite("app", {
  compatibility: {
    flags: ["nodejs_compat"],
  },
});

export default Alchemy.Stack(
  "tanstack-start-alchemy-vite-repro",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const app = yield* App;

    return {
      url: app.url,
      domains: app.domains,
    };
  }),
);
