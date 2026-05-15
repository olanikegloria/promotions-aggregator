import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { runMigrations } from './db'
import { promotionsRouter } from './routes/promotions'
import { brandsRouter } from './routes/brands'
import { scrapeRouter } from './routes/scrape'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { logger } from './logger'

const app = express()
const PORT = process.env.PORT ?? 4000

app.use(helmet())
app.use(cors({ origin: ['http://localhost:3000'] }))
app.use(express.json())
app.use(requestLogger)

app.use('/promotions', promotionsRouter)
app.use('/brands', brandsRouter)
app.use('/scrape', scrapeRouter)
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

runMigrations()
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'API server started')
})
