export class TaskNotFoundError extends Error {
  public readonly code = "NOT_FOUND";

  constructor(id: string) {
    super(`Task with ID "${id}" was not found.`);
    this.name = "TaskNotFoundError";
  }
}

export class TaskValidationError extends Error {
  public readonly code = "BAD_REQUEST";

  constructor(message: string) {
    super(message);
    this.name = "TaskValidationError";
  }
}
