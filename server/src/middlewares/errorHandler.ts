// pons-web/server/src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/errors";

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    code: err.code || "INTERNAL_ERROR"
  });
}