import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid query parameters',
        issues: result.error.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      })
      return
    }
    req.query = result.data as any
    next()
  }
}
