import { z } from 'zod'

export interface SocialLinks {
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  x: string | null
  other: string | null
}

export type OperatingHours = Record<string, string> | null

export interface Brand {
  id: string
  name: string
  websiteUrl: string | null
  hours: OperatingHours
  socialLinks: SocialLinks
  portal: string
  scrapedAt: string
}

export interface BrandWithCount extends Brand {
  promotionCount: number
}

export interface Promotion {
  id: string
  brandId: string
  name: string
  description: string | null
  imageUrl: string | null
  startDate: string | null
  endDate: string | null
  canonicalUrl: string
  portal: string
  scrapedAt: string
}

export interface PromotionWithBrand extends Promotion {
  brand: Brand
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ScrapeResult {
  scraped: number
  failed: number
  durationMs: number
}

export const GetPromotionsQuerySchema = z.object({
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  brand: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export type GetPromotionsQuery = z.infer<typeof GetPromotionsQuerySchema>

export const GetBrandsQuerySchema = z.object({
  search: z.string().optional(),
})

export type GetBrandsQuery = z.infer<typeof GetBrandsQuerySchema>
