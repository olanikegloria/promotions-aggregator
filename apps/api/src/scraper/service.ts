import { db } from '../db'
import { brands as brandsTable, promotions as promotionsTable } from '../db/schema'
import { runScraper } from './index'
import { logger } from '../logger'

export async function scrapeAndPersist() {
  const start = Date.now()
  const { brands, promotions, failedUrls } = await runScraper()

  for (const brand of brands.values()) {
    await db
      .insert(brandsTable)
      .values({
        id: brand.id,
        name: brand.name,
        websiteUrl: brand.websiteUrl,
        hours: brand.hours ? JSON.stringify(brand.hours) : null,
        socialLinks: JSON.stringify(brand.socialLinks),
        portal: brand.portal,
        scrapedAt: brand.scrapedAt,
      })
      .onConflictDoUpdate({
        target: brandsTable.id,
        set: {
          name: brand.name,
          websiteUrl: brand.websiteUrl,
          hours: brand.hours ? JSON.stringify(brand.hours) : null,
          socialLinks: JSON.stringify(brand.socialLinks),
          scrapedAt: brand.scrapedAt,
        },
      })
  }

  for (const promo of promotions) {
    await db
      .insert(promotionsTable)
      .values(promo)
      .onConflictDoUpdate({
        target: promotionsTable.id,
        set: {
          name: promo.name,
          description: promo.description,
          imageUrl: promo.imageUrl,
          startDate: promo.startDate,
          endDate: promo.endDate,
          scrapedAt: promo.scrapedAt,
        },
      })
  }

  const durationMs = Date.now() - start
  logger.info({ scraped: promotions.length, failed: failedUrls.length, durationMs }, 'Scrape complete')

  return { scraped: promotions.length, failed: failedUrls.length, durationMs }
}
