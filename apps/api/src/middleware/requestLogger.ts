import { Request, Response, NextFunction } from 'express'
import { logger } from '../logger'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  res.on('finish', () => {
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
    })
  })
  next()
}
