import type {
  PaginatedResponse,
  PromotionWithBrand,
  BrandWithCount,
  GetPromotionsQuery,
} from '@promo/shared'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export async function getPromotions(
  params: Partial<GetPromotionsQuery>
): Promise<PaginatedResponse<PromotionWithBrand>> {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => [k, String(v)])
  )
  const res = await fetch(`${API_BASE}/promotions?${qs}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch promotions: ${res.status}`)
  return res.json()
}

export async function getBrands(): Promise<BrandWithCount[]> {
  const res = await fetch(`${API_BASE}/brands`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch brands: ${res.status}`)
  return res.json()
}
