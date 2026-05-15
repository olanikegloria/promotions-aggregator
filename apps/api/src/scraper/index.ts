import { chromium } from 'playwright'
import { createHash } from 'crypto'
import { logger } from '../logger'
import type { Brand, Promotion } from '@promo/shared'
import fs from 'fs'
import path from 'path'

const PORTAL = 'thepromenadeshopsatbriargate'
const BASE_URL = 'https://www.thepromenadeshopsatbriargate.com'
const SALES_URL = `${BASE_URL}/sales`
const DELAY_MS = parseInt(process.env.SCRAPER_DELAY_MS ?? '1000')

function makeId(input: string): string {
  return createHash('sha1').update(input).digest('hex')
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function snapshotHtml(filename: string, html: string) {
  const dir = path.resolve('data/snapshots')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, filename), html, 'utf-8')
}

export interface ScrapedData {
  brands: Map<string, Brand>
  promotions: Promotion[]
  failedUrls: string[]
}

export async function runScraper(): Promise<ScrapedData> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
  })

  const brands = new Map<string, Brand>()
  const promotions: Promotion[] = []
  const failedUrls: string[] = []
  const now = new Date().toISOString()

  try {
    const page = await context.newPage()

    logger.info({ url: SALES_URL }, 'Navigating to sales page')
    await page.goto(SALES_URL, { waitUntil: 'networkidle', timeout: 30000 })

    const listingHtml = await page.content()
    snapshotHtml(`listing-${Date.now()}.html`, listingHtml)

    const rawCards = await page.$$eval('a[href*="/deals/"]', cards =>
      cards.map(card => ({
        name: card.querySelector('.deal-meta .major')?.textContent?.trim() ?? null,
        description: card.querySelector('.deal-description')?.textContent?.trim() ?? null,
        imageUrl: card.querySelector('img')?.getAttribute('src') ?? null,
        endDate: card.querySelector('.deal-meta .minor.motice')?.textContent?.trim() ?? null,
        startDate: null as string | null,
        detailUrl: (card as HTMLAnchorElement).href ?? null,
        brandName: card.querySelector('.deal-meta .minor:not(.motice)')?.textContent?.trim() ?? null,
      }))
    )

    logger.info({ count: rawCards.length }, 'Found promotion cards')

    for (const raw of rawCards) {
      try {
        if (!raw.name) {
          logger.warn({ raw }, 'Skipping card — missing name')
          continue
        }

        const canonicalUrl = raw.detailUrl ?? `${SALES_URL}#${makeId(raw.name)}`
        const id = makeId(canonicalUrl)
        const brandName = raw.brandName ?? 'Unknown'

        if (!brands.has(brandName)) {
          brands.set(brandName, {
            id: makeId(brandName + PORTAL),
            name: brandName,
            websiteUrl: null,
            hours: null,
            socialLinks: { instagram: null, facebook: null, tiktok: null, x: null, other: null },
            portal: PORTAL,
            scrapedAt: now,
          })
        }

        const brand = brands.get(brandName)!

        promotions.push({
          id,
          brandId: brand.id,
          name: raw.name,
          description: raw.description,
          imageUrl: raw.imageUrl,
          startDate: raw.startDate,
          endDate: raw.endDate,
          canonicalUrl,
          portal: PORTAL,
          scrapedAt: now,
        })

        await sleep(DELAY_MS)
      } catch (err) {
        logger.error({ url: raw.detailUrl, err }, 'Failed to scrape promotion')
        if (raw.detailUrl) failedUrls.push(raw.detailUrl)
      }
    }

    // ── TODO: Brand enrichment ─────────────────────────────────────────────────
    // Navigate to the store directory (e.g. BASE_URL/stores) and for each brand,
    // find their store page and extract: websiteUrl, hours, socialLinks.
    // Use the same per-brand try/catch pattern below.
    for (const [brandName, brand] of brands) {
      try {
        await sleep(DELAY_MS)
        // TODO: navigate to brand's store page and fill in:
        // brand.websiteUrl = ...
        // brand.hours = { Monday: '10am-9pm', ... }
        // brand.socialLinks = { instagram: '...', ... }
        logger.debug({ brandName }, 'Brand enrichment placeholder — TODO')
      } catch (err) {
        logger.error({ brandName, err }, 'Failed to enrich brand')
      }
    }

  } finally {
    await browser.close()
  }

  return { brands, promotions, failedUrls }
}
