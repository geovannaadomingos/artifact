import { router } from "./init";
import { taskRouter } from "./routers/task.router";

/**
 * Router principal da aplicação (Root Router).
 * Agrupa todos os submódulos e rotas da API tRPC.
 */
export const appRouter = router({
  task: taskRouter,
});

/**
 * Definição do tipo estático do AppRouter para consumo no cliente (End-to-End Type Safety).
 */
export type AppRouter = typeof appRouter;

