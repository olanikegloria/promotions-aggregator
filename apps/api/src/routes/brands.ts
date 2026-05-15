import { Router } from 'express'
import { db } from '../db'
import { brands, promotions } from '../db/schema'
import { eq, sql } from 'drizzle-orm'
import type { BrandWithCount } from '@promo/shared'

export const brandsRouter = Router()

brandsRouter.get('/', async (req, res, next) => {
  try {
    const rows = await db
      .select({
        id: brands.id,
        name: brands.name,
        websiteUrl: brands.websiteUrl,
        hours: brands.hours,
        socialLinks: brands.socialLinks,
        portal: brands.portal,
        scrapedAt: brands.scrapedAt,
        promotionCount: sql<number>`count(${promotions.id})`,
      })
      .from(brands)
      .leftJoin(promotions, eq(brands.id, promotions.brandId))
      .groupBy(brands.id)

    const data: BrandWithCount[] = rows.map(r => ({
      ...r,
      hours: r.hours ? JSON.parse(r.hours) : null,
      socialLinks: JSON.parse(r.socialLinks),
    }))

    res.json(data)
  } catch (err) {
    next(err)
  }
})
