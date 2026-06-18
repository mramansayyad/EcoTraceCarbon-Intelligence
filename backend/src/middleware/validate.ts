import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Optionally re-assign verified values to request
      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;
      next();
      return;
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: err.errors.map((e) => ({
            field: e.path.join('.').replace(/^(body|query|params)\./, ''),
            message: e.message,
          })),
        });
      }
      next(err);
      return;
    }
  };
}
