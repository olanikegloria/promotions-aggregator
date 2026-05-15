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

  const hasFilters = !!(search || startDate || endDate)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Promotions</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 hidden sm:block">
              The Promenade Shops at Briargate
            </p>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15z" />
            </svg>
            <input
              type="text"
              placeholder="Search promotions or brands…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(1) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg leading-none"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Date range + Group toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setPage(1) }}
              className="hidden sm:block bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <span className="text-gray-300 text-xs hidden sm:inline">—</span>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setPage(1) }}
              className="hidden sm:block bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              type="button"
              onClick={() => setGrouped(g => !g)}
              className={`text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-lg border transition-colors ${
                grouped
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 bg-white'
              }`}
            >
              {grouped ? 'By brand' : 'Group'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero strip */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-3">
          <p className="text-2xl font-bold text-gray-900">Current Offers</p>
          {promos && !loading && (
            <span className="inline-flex items-center bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {promos.total} deal{promos.total !== 1 ? 's' : ''}
            </span>
          )}
          {hasFilters && (
            <div className="flex gap-2 flex-wrap ml-2">
              {search && (
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                  {search}
                  <button type="button" onClick={() => { setSearch(''); setPage(1) }} className="text-gray-400 hover:text-gray-800 ml-0.5">×</button>
                </span>
              )}
              {startDate && (
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                  From {startDate}
                  <button type="button" onClick={() => { setStartDate(''); setPage(1) }} className="text-gray-400 hover:text-gray-800 ml-0.5">×</button>
                </span>
              )}
              {endDate && (
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                  To {endDate}
                  <button type="button" onClick={() => { setEndDate(''); setPage(1) }} className="text-gray-400 hover:text-gray-800 ml-0.5">×</button>
                </span>
              )}
              <button type="button" onClick={clearFilters} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-white border border-red-200 rounded-xl p-6 text-center mb-8 shadow-sm">
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-3 text-xs text-gray-500 hover:text-gray-900">
              Reload
            </button>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="pt-2 flex justify-between">
                    <div className="h-5 bg-gray-100 rounded-full w-16" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && promos?.data.length === 0 && (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🛍️</p>
            <p className="text-gray-500 text-base font-medium">No promotions match your filters.</p>
            <button type="button" onClick={clearFilters} className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              Reset filters
            </button>
          </div>
        )}

        {/* Grouped by brand */}
        {!loading && !error && grouped && groupedByBrand.length > 0 && (
          <div className="space-y-12">
            {groupedByBrand.map(({ brand, promotions }) => (
              <BrandSection key={brand.id} brand={brand} promotions={promotions} />
            ))}
          </div>
        )}

        {/* Flat grid */}
        {!loading && !error && !grouped && promos && promos.data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {promos.data.map(p => <PromoCard key={p.id} promo={p} />)}
          </div>
        )}

        {/* Pagination */}
        {!loading && promos && promos.totalPages > 1 && (
          <nav className="flex items-center justify-center gap-1 mt-12 text-sm text-gray-600">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
            {Array.from({ length: promos.totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - page) <= 2)
              .map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-9 px-3 py-1.5 rounded-lg border transition-colors ${
                    p === page
                      ? 'border-indigo-600 bg-indigo-600 text-white font-semibold'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            <button
              type="button"
              onClick={() => setPage(p => Math.min(promos.totalPages, p + 1))}
              disabled={page === promos.totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 disabled:cursor-not-allowed"
            >
              →
            </button>
            <span className="ml-3 text-xs text-gray-400 tabular-nums">
              Page {page} of {promos.totalPages}
            </span>
          </nav>
        )}
      </main>
    </div>
  )
}
