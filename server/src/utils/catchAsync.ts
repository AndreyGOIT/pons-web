// utils/catchAsync.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

export const catchAsync = <
  Req = Request,
  Res = Response,
  Next = NextFunction
>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};