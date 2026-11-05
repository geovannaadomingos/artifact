import { ITaskRepository, taskRepository } from "../repositories/task.repository";
import { CreateTaskInput, Task, UpdateTaskInput } from "../schemas/task.schema";
import { TaskNotFoundError, TaskValidationError } from "../errors/task.errors";

export class TaskService {
  constructor(private readonly repository: ITaskRepository = taskRepository) {}

  getAllTasks(): Task[] {
    return this.repository.getAll();
  }

  getPaginatedTasks(
    limit: number = 10,
    cursor?: string
  ): { items: Task[]; nextCursor?: string } {
    const safeLimit = Math.max(1, Math.min(limit, 50));
    return this.repository.getPaginated(safeLimit, cursor);
  }

  getTaskById(id: string): Task {
    if (!id || id.trim() === "") {
      throw new TaskValidationError("Task identifier cannot be empty.");
    }

    const task = this.repository.getById(id);
    if (!task) {
      throw new TaskNotFoundError(id);
    }

    return task;
  }

  createTask(input: CreateTaskInput): Task {
    const trimmedTitle = input.titulo?.trim();

    if (!trimmedTitle || trimmedTitle.length === 0) {
      throw new TaskValidationError("Task title is required and cannot contain only whitespace.");
    }

    if (trimmedTitle.length > 100) {
      throw new TaskValidationError("Task title cannot exceed 100 characters.");
    }

    return this.repository.create({
      titulo: trimmedTitle,
      descricao: input.descricao?.trim(),
    });
  }

  updateTask(input: UpdateTaskInput): Task {
    const existingTask = this.repository.getById(input.id);
    if (!existingTask) {
      throw new TaskNotFoundError(input.id);
    }

    const trimmedTitle = input.titulo?.trim();
    if (!trimmedTitle || trimmedTitle.length === 0) {
      throw new TaskValidationError("Task title cannot be empty or contain only whitespace.");
    }

    if (trimmedTitle.length > 100) {
      throw new TaskValidationError("Task title cannot exceed 100 characters.");
    }

    const updated = this.repository.update(input.id, {
      titulo: trimmedTitle,
      descricao: input.descricao?.trim(),
    });

    if (!updated) {
      throw new TaskNotFoundError(input.id);
    }

    return updated;
  }

  deleteTask(id: string): void {
    if (!id || id.trim() === "") {
      throw new TaskValidationError("Task identifier for deletion cannot be empty.");
    }

    const existing = this.repository.getById(id);
    if (!existing) {
      throw new TaskNotFoundError(id);
    }

    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new TaskNotFoundError(id);
    }
  }
}

export const taskService = new TaskService();
