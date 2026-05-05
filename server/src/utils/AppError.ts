// src/utils/AppError.ts
export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;
  isOperational: boolean;

  constructor(message: string, status = 500, code = "INTERNAL_ERROR", details?: unknown) {
    super(message);

    this.status = status;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}