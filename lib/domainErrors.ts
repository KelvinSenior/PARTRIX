export class DomainError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Record not found.") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class InvalidOperationError extends DomainError {
  constructor(message: string) {
    super(message, 400);
    this.name = "InvalidOperationError";
  }
}