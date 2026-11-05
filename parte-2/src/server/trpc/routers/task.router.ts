import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../init";
import { createTaskSchema, updateTaskSchema } from "../../schemas/task.schema";
import { taskService } from "../../services/task.service";
import { TaskNotFoundError, TaskValidationError } from "../../errors/task.errors";

export const taskRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(10).optional(),
          cursor: z.string().uuid({ message: "Invalid cursor format." }).optional(),
        })
        .optional()
    )
    .query(({ input }) => {
      try {
        const limit = input?.limit ?? 10;
        const cursor = input?.cursor;
        return taskService.getPaginatedTasks(limit, cursor);
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list tasks.",
          cause: err,
        });
      }
    }),

  getAll: publicProcedure.query(() => {
    try {
      return taskService.getAllTasks();
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve full task list.",
        cause: err,
      });
    }
  }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string().uuid({ message: "ID must be a valid UUID." }),
      })
    )
    .query(({ input }) => {
      try {
        return taskService.getTaskById(input.id);
      } catch (err) {
        if (err instanceof TaskNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: err.message,
            cause: err,
          });
        }
        if (err instanceof TaskValidationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: err.message,
            cause: err,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to retrieve task with ID "${input.id}".`,
          cause: err,
        });
      }
    }),

  create: publicProcedure
    .input(createTaskSchema)
    .mutation(({ input }) => {
      try {
        return taskService.createTask(input);
      } catch (err) {
        if (err instanceof TaskValidationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: err.message,
            cause: err,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An internal error occurred while creating the task.",
          cause: err,
        });
      }
    }),

  update: publicProcedure
    .input(updateTaskSchema)
    .mutation(({ input }) => {
      try {
        return taskService.updateTask(input);
      } catch (err) {
        if (err instanceof TaskNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: err.message,
            cause: err,
          });
        }
        if (err instanceof TaskValidationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: err.message,
            cause: err,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `An internal error occurred while updating task with ID "${input.id}".`,
          cause: err,
        });
      }
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string().uuid({ message: "ID for deletion must be a valid UUID." }),
      })
    )
    .mutation(({ input }) => {
      try {
        taskService.deleteTask(input.id);
        return {
          success: true,
          message: "Task deleted successfully.",
          id: input.id,
        };
      } catch (err) {
        if (err instanceof TaskNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: err.message,
            cause: err,
          });
        }
        if (err instanceof TaskValidationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: err.message,
            cause: err,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `An internal error occurred while deleting task with ID "${input.id}".`,
          cause: err,
        });
      }
    }),
});
