export type AppError = Error & {
  status?: number;
  code?: string;
  details?: unknown;
};