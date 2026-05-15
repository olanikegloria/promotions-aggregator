import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const brands = sqliteTable('brands', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  websiteUrl: text('website_url'),
  hours: text('hours'),
  socialLinks: text('social_links').notNull().default('{}'),
  portal: text('portal').notNull(),
  scrapedAt: text('scraped_at').notNull(),
})

export const promotions = sqliteTable('promotions', {
  id: text('id').primaryKey(),
  brandId: text('brand_id').notNull().references(() => brands.id),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  canonicalUrl: text('canonical_url').notNull(),
  portal: text('portal').notNull(),
  scrapedAt: text('scraped_at').notNull(),
})
