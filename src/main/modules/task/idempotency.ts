import { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: uuid } = require('uuid');

export function attachIdempotencyKey(req: Request, res: Response, next: NextFunction): void {
  // Only generate for POST/PUT/PATCH/DELETE
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    req.idempotencyKey = uuid();
  }
  next();
}
