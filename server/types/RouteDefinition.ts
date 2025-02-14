import type { NextFunction, Request, Response } from 'express';

export type RouteDefinition = {
  path: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  handler: (req: Request, res: Response, next: NextFunction) => void;
};
