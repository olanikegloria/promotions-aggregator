import { Router } from 'express'
import { db } from '../db'
import { promotions, brands } from '../db/schema'
import { eq, like, and, gte, lte, sql } from 'drizzle-orm'
import { validateQuery } from '../middleware/validate'
import { GetPromotionsQuerySchema } from '@promo/shared'
import type { PaginatedResponse, PromotionWithBrand } from '@promo/shared'

export const promotionsRouter = Router()

promotionsRouter.get('/', validateQuery(GetPromotionsQuerySchema), async (req, res, next) => {
  try {
    const { search, startDate, endDate, brand, page, pageSize } = req.query as any

    const conditions = []
    if (search) conditions.push(like(promotions.name, `%${search}%`))
    if (startDate) conditions.push(gte(promotions.startDate, startDate))
    if (endDate) conditions.push(lte(promotions.endDate, endDate))
    if (brand) conditions.push(like(brands.name, `%${brand}%`))

    const where = conditions.length > 0 ? and(...conditions) : undefined
    const offset = (page - 1) * pageSize

    const [rows, countResult] = await Promise.all([
      db.select().from(promotions).leftJoin(brands, eq(promotions.brandId, brands.id)).where(where).limit(pageSize).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(promotions).leftJoin(brands, eq(promotions.brandId, brands.id)).where(where),
    ])

    const total = countResult[0]?.count ?? 0

    const data: PromotionWithBrand[] = rows
      .filter(r => r.promotions && r.brands)
      .map(r => ({
        ...r.promotions,
        brand: {
          ...r.brands!,
          hours: r.brands!.hours ? JSON.parse(r.brands!.hours) : null,
          socialLinks: JSON.parse(r.brands!.socialLinks),
        },
      }))

    const response: PaginatedResponse<PromotionWithBrand> = {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }

    res.json(response)
  } catch (err) {
    next(err)
  }
})

promotionsRouter.get('/:id', async (req, res, next) => {
  try {
    const row = await db
      .select()
      .from(promotions)
      .leftJoin(brands, eq(promotions.brandId, brands.id))
      .where(eq(promotions.id, req.params.id))
      .limit(1)

    if (!row[0]?.promotions) {
      res.status(404).json({ error: 'Promotion not found', id: req.params.id })
      return
    }

    const r = row[0]
    res.json({
      ...r.promotions,
      brand: {
        ...r.brands!,
        hours: r.brands!.hours ? JSON.parse(r.brands!.hours) : null,
        socialLinks: JSON.parse(r.brands!.socialLinks),
      },
    })
  } catch (err) {
    next(err)
  }
})
