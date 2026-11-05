import { z } from "zod";

export const taskSchema = z.object({
  id: z
    .string()
    .uuid({ message: "ID must be a valid UUID." }),
  titulo: z
    .string()
    .trim()
    .min(1, { message: "Title cannot be empty or contain only whitespace." })
    .max(100, { message: "Title cannot exceed 100 characters." }),
  descricao: z
    .string()
    .trim()
    .max(500, { message: "Description cannot exceed 500 characters." })
    .optional(),
  dataCriacao: z
    .number()
    .int()
    .positive({ message: "Creation date must be a valid positive timestamp." }),
});

export type Task = z.infer<typeof taskSchema>;

export const createTaskSchema = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(1, { message: "Title cannot be empty or contain only whitespace." })
      .max(100, { message: "Title cannot exceed 100 characters." }),
    descricao: z
      .string()
      .trim()
      .max(500, { message: "Description cannot exceed 500 characters." })
      .optional(),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    id: z
      .string()
      .uuid({ message: "Provided ID must be a valid UUID." }),
    titulo: z
      .string()
      .trim()
      .min(1, { message: "Title cannot be empty or contain only whitespace." })
      .max(100, { message: "Title cannot exceed 100 characters." }),
    descricao: z
      .string()
      .trim()
      .max(500, { message: "Description cannot exceed 500 characters." })
      .optional(),
  })
  .strict();

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
