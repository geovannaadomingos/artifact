import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { makeQueryClient } from "./query-client";
import { appRouter } from "@/server/trpc/router";
import { createCallerFactory } from "@/server/trpc/init";

export const getQueryClient = cache(makeQueryClient);

const caller = createCallerFactory(appRouter)({});

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient
);
