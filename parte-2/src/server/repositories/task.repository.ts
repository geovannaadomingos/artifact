import { Task } from "../schemas/task.schema";

export interface ITaskRepository {
  getAll(): Task[];
  getPaginated(limit: number, cursor?: string): { items: Task[]; nextCursor?: string };
  getById(id: string): Task | null;
  create(data: { titulo: string; descricao?: string }): Task;
  update(id: string, data: { titulo?: string; descricao?: string }): Task | null;
  delete(id: string): boolean;
  clear(): void;
  seedInitialData(): void;
}

declare global {
  // eslint-disable-next-line no-var
  var __tasksStore: Map<string, Task> | undefined;
}

export class InMemoryTaskRepository implements ITaskRepository {
  private get store(): Map<string, Task> {
    if (!globalThis.__tasksStore) {
      globalThis.__tasksStore = new Map<string, Task>();
      this.seedInitialData();
    }
    return globalThis.__tasksStore;
  }

  getAll(): Task[] {
    return Array.from(this.store.values()).sort(
      (a, b) => b.dataCriacao - a.dataCriacao
    );
  }

  getPaginated(
    limit: number,
    cursor?: string
  ): { items: Task[]; nextCursor?: string } {
    const allTasks = this.getAll();

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = allTasks.findIndex((task) => task.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const items = allTasks.slice(startIndex, startIndex + limit);
    const nextCursor =
      startIndex + limit < allTasks.length ? items[items.length - 1]?.id : undefined;

    return {
      items,
      nextCursor,
    };
  }

  getById(id: string): Task | null {
    return this.store.get(id) ?? null;
  }

  create(data: { titulo: string; descricao?: string }): Task {
    const newTask: Task = {
      id: crypto.randomUUID(),
      titulo: data.titulo.trim(),
      descricao: data.descricao?.trim() || undefined,
      dataCriacao: Date.now(),
    };

    this.store.set(newTask.id, newTask);
    return newTask;
  }

  update(
    id: string,
    data: { titulo?: string; descricao?: string }
  ): Task | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const updatedTask: Task = {
      ...existing,
      ...(data.titulo !== undefined && { titulo: data.titulo.trim() }),
      ...(data.descricao !== undefined && {
        descricao: data.descricao.trim() || undefined,
      }),
    };

    this.store.set(id, updatedTask);
    return updatedTask;
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }

  seedInitialData(): void {
    if (this.store.size > 0) return;

    const baseTimestamp = Date.now() - 1000 * 60 * 60 * 24;

    const seeds = [
      {
        titulo: "Review technical challenge specifications",
        descricao: "Analyze functional and non-functional requirements for Next.js 15 and tRPC.",
        minutesAgo: 120,
      },
      {
        titulo: "Set up layered architecture (Router, Service, Repository)",
        descricao: "Ensure strict decoupling and isolation of responsibilities.",
        minutesAgo: 110,
      },
      {
        titulo: "Model validation schemas with Zod",
        descricao: "Enforce strict runtime validation against unauthorized field injections.",
        minutesAgo: 100,
      },
      {
        titulo: "Implement resilient in-memory repository",
        descricao: "Use globalThis Map storage to survive Next.js HMR cycles.",
        minutesAgo: 90,
      },
      {
        titulo: "Implement Service layer with semantic error handling",
        descricao: "Throw structured TRPCErrors when non-existent tasks are queried or mutated.",
        minutesAgo: 80,
      },
      {
        titulo: "Configure tRPC HTTP Handler in App Router",
        descricao: "Expose create, list, getById, update, and delete procedures via route.ts.",
        minutesAgo: 70,
      },
      {
        titulo: "Configure SSR Hydration with React Query",
        descricao: "Prefetch initial tasks on the server for instant First Contentful Paint.",
        minutesAgo: 60,
      },
      {
        titulo: "Build task listing page with deletion and visual feedback",
        descricao: "Display user-friendly alerts upon interacting with tasks.",
        minutesAgo: 50,
      },
      {
        titulo: "Create reusable task creation and edit form",
        descricao: "Manage local form state with hooks and client-side validation.",
        minutesAgo: 40,
      },
      {
        titulo: "Implement Infinite Scroll bonus feature",
        descricao: "Add IntersectionObserver for seamless on-demand cursor pagination.",
        minutesAgo: 30,
      },
      {
        titulo: "Document architectural decisions in README",
        descricao: "Explain trade-offs, singleton persistence, and execution flow.",
        minutesAgo: 20,
      },
      {
        titulo: "Execute build and automated TypeScript tests",
        descricao: "Ensure zero compilation errors and 100% test pass rate.",
        minutesAgo: 10,
      },
    ];

    for (const seed of seeds) {
      const task: Task = {
        id: crypto.randomUUID(),
        titulo: seed.titulo,
        descricao: seed.descricao,
        dataCriacao: baseTimestamp + seed.minutesAgo * 60 * 1000,
      };
      this.store.set(task.id, task);
    }
  }
}

export const taskRepository: ITaskRepository = new InMemoryTaskRepository();
