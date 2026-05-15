import { Request, Response, NextFunction } from 'express'
import { logger } from '../logger'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error')
  const isProd = process.env.NODE_ENV === 'production'
  res.status(500).json({
    error: 'Internal server error',
    ...(isProd ? {} : { message: err.message, stack: err.stack }),
  })
}
