import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/router";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
    onError({ error, path }) {
      if (process.env.NODE_ENV === "development") {
        console.error(`[tRPC Error] Falha na rota "${path}":`, error);
      }
    },
  });

export { handler as GET, handler as POST };

