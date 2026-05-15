'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getPromotions, getBrands } from '@/lib/api'
import { PromoCard } from '@/components/PromoCard'
import { BrandSection } from '@/components/BrandSection'
import type { PromotionWithBrand, BrandWithCount, PaginatedResponse } from '@promo/shared'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [startDate, setStartDate] = useState(searchParams.get('startDate') ?? '')
  const [endDate, setEndDate] = useState(searchParams.get('endDate') ?? '')
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1))
  const [grouped, setGrouped] = useState(searchParams.get('grouped') === 'true')

  const [promos, setPromos] = useState<PaginatedResponse<PromotionWithBrand> | null>(null)
  const [brands, setBrands] = useState<BrandWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (page > 1) params.set('page', String(page))
    if (grouped) params.set('grouped', 'true')
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [debouncedSearch, startDate, endDate, page, grouped, router])

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      getPromotions({
        search: debouncedSearch || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
      }),
      getBrands(),
    ])
      .then(([p, b]) => { setPromos(p); setBrands(b) })
      .catch(() => setError('Failed to load promotions. Is the API running on port 4000?'))
      .finally(() => setLoading(false))
  }, [debouncedSearch, startDate, endDate, page])

  const clearFilters = () => { setSearch(''); setStartDate(''); setEndDate(''); setPage(1) }

  const groupedByBrand = grouped
    ? brands
        .map(brand => ({
          brand,
          promotions: (promos?.data ?? []).filter(p => p.brandId === brand.id),
        }))
        .filter(g => g.promotions.length > 0)
    : []

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Promotions</h1>
        <p className="text-gray-500 text-sm">The Promenade Shops at Briargate</p>
      </div>

      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 -mx-4 px-4 py-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search promotions, brands, or descriptions..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(1) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <input
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setGrouped(g => !g)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              grouped ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {grouped ? 'Grouped by brand' : 'Group by brand'}
          </button>
        </div>
      </div>

      {(search || startDate || endDate) && (
        <div className="flex gap-2 flex-wrap mb-4">
          {search && (
            <span className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
              Search: {search}
              <button type="button" onClick={() => { setSearch(''); setPage(1) }} className="ml-1 hover:text-blue-600">×</button>
            </span>
          )}
          {startDate && (
            <span className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
              From: {startDate}
              <button type="button" onClick={() => { setStartDate(''); setPage(1) }} className="ml-1 hover:text-blue-600">×</button>
            </span>
          )}
          {endDate && (
            <span className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
              To: {endDate}
              <button type="button" onClick={() => { setEndDate(''); setPage(1) }} className="ml-1 hover:text-blue-600">×</button>
            </span>
          )}
          <button type="button" onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 underline">
            Clear all
          </button>
        </div>
      )}

      {promos && !loading && (
        <p className="text-sm text-gray-500 mb-4">
          {promos.total === 0
            ? 'No promotions found.'
            : `Showing ${(page - 1) * 20 + 1}–${Math.min(page * 20, promos.total)} of ${promos.total}`}
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-xs text-red-600 underline">
            Try again
          </button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && promos?.data.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm mb-2">No promotions match your filters.</p>
          <button onClick={clearFilters} className="text-blue-600 text-sm underline">Clear filters</button>
        </div>
      )}

      {!loading && !error && grouped && groupedByBrand.length > 0 && (
        <div>
          {groupedByBrand.map(({ brand, promotions }) => (
            <BrandSection key={brand.id} brand={brand} promotions={promotions} />
          ))}
        </div>
      )}

      {!loading && !error && !grouped && promos && promos.data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.data.map(p => <PromoCard key={p.id} promo={p} />)}
        </div>
      )}

      {!loading && promos && promos.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            ← Prev
          </button>
          {Array.from({ length: promos.totalPages }, (_, i) => i + 1)
            .filter(p => Math.abs(p - page) <= 2)
            .map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-sm border rounded-lg ${
                  p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          <button
            onClick={() => setPage(p => Math.min(promos.totalPages, p + 1))}
            disabled={page === promos.totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </main>
  )
}
