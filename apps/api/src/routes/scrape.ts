import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { scrapeAndPersist } from '../scraper/service'
import { logger } from '../logger'

export const scrapeRouter = Router()

const scrapeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many scrape requests, please wait a minute.' },
})

scrapeRouter.post('/', scrapeLimiter, async (req, res, next) => {
  try {
    logger.info('Scrape triggered via API')
    const result = await scrapeAndPersist()
    res.json(result)
  } catch (err) {
    next(err)
  }
})
