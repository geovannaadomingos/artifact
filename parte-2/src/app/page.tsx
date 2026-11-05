import { trpc, HydrateClient } from "@/trpc/server";
import { TaskList } from "@/components/tasks/task-list";

export default async function HomePage() {
  void trpc.task.list.prefetchInfinite({ limit: 10 });

  return (
    <HydrateClient>
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Task Manager
          </h1>
          <p className="text-sm text-slate-500">
            Full-Stack application built with Next.js 15 App Router, Server-Side Rendering (SSR), and tRPC.
          </p>
        </header>

        <TaskList />
      </div>
    </HydrateClient>
  );
}
