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
    <main className="max-w-2xl mx-auto px-6 py-14">
      <header className="border-b border-stone-200 pb-10 mb-0">
        <h1 className="text-3xl font-light tracking-tight text-stone-900">Promotions</h1>
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mt-3">
          The Promenade Shops at Briargate
        </p>
      </header>

      <div className="sticky top-0 z-10 bg-stone-50/95 border-b border-stone-200 -mx-6 px-6 py-5 mb-8">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full bg-white border border-stone-200 rounded-md pl-3 pr-8 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-800 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(1) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-lg leading-none"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setPage(1) }}
              className="flex-1 min-w-[8.5rem] bg-white border border-stone-200 rounded-md px-2 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-800"
            />
            <span className="text-stone-300 text-xs hidden sm:inline">—</span>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setPage(1) }}
              className="flex-1 min-w-[8.5rem] bg-white border border-stone-200 rounded-md px-2 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-800"
            />
            <button
              type="button"
              onClick={() => setGrouped(g => !g)}
              className={`text-[11px] uppercase tracking-wider px-3 py-2 rounded-md border transition-colors ${
                grouped
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-white'
              }`}
            >
              {grouped ? 'By brand' : 'Group'}
            </button>
          </div>
        </div>
      </div>

      {(search || startDate || endDate) && (
        <div className="flex gap-2 flex-wrap items-center mb-8 -mt-2">
          {search && (
            <span className="inline-flex items-center gap-1.5 border border-stone-200 bg-white text-stone-600 text-xs px-2 py-1 rounded-md">
              {search}
              <button type="button" onClick={() => { setSearch(''); setPage(1) }} className="text-stone-400 hover:text-stone-800">×</button>
            </span>
          )}
          {startDate && (
            <span className="inline-flex items-center gap-1.5 border border-stone-200 bg-white text-stone-600 text-xs px-2 py-1 rounded-md">
              {startDate}
              <button type="button" onClick={() => { setStartDate(''); setPage(1) }} className="text-stone-400 hover:text-stone-800">×</button>
            </span>
          )}
          {endDate && (
            <span className="inline-flex items-center gap-1.5 border border-stone-200 bg-white text-stone-600 text-xs px-2 py-1 rounded-md">
              {endDate}
              <button type="button" onClick={() => { setEndDate(''); setPage(1) }} className="text-stone-400 hover:text-stone-800">×</button>
            </span>
          )}
          <button type="button" onClick={clearFilters} className="text-xs text-stone-500 hover:text-stone-800">
            Clear
          </button>
        </div>
      )}

      {promos && !loading && (
        <p className="text-xs text-stone-500 tabular-nums mb-8">
          {promos.total === 0
            ? 'No results.'
            : `${(page - 1) * 20 + 1}–${Math.min(page * 20, promos.total)} of ${promos.total}`}
        </p>
      )}

      {error && (
        <div className="border border-stone-200 bg-white p-6 text-center mb-8">
          <p className="text-stone-700 text-sm">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-3 text-xs text-stone-500 hover:text-stone-900">
            Reload
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse border-b border-stone-100 pb-6">
              <div className="h-3 bg-stone-200 rounded w-24 mb-3" />
              <div className="h-4 bg-stone-200 rounded max-w-md w-3/4 mb-2" />
              <div className="h-3 bg-stone-100 rounded w-32" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && promos?.data.length === 0 && (
        <div className="text-center py-20 border-t border-stone-100">
          <p className="text-stone-500 text-sm">Nothing matches.</p>
          <button type="button" onClick={clearFilters} className="mt-4 text-xs text-stone-600 hover:text-stone-900">
            Reset filters
          </button>
        </div>
      )}

      {!loading && !error && grouped && groupedByBrand.length > 0 && (
        <div className="space-y-16">
          {groupedByBrand.map(({ brand, promotions }) => (
            <BrandSection key={brand.id} brand={brand} promotions={promotions} />
          ))}
        </div>
      )}

      {!loading && !error && !grouped && promos && promos.data.length > 0 && (
        <div className="divide-y divide-stone-100 border-t border-stone-100">
          {promos.data.map(p => <PromoCard key={p.id} promo={p} />)}
        </div>
      )}

      {!loading && promos && promos.totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1 mt-12 pt-8 border-t border-stone-200 text-sm text-stone-600">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 disabled:opacity-30 hover:text-stone-900"
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
                className={`min-w-[2rem] px-2 py-1 rounded ${
                  p === page ? 'text-stone-900 font-medium' : 'hover:text-stone-900'
                }`}
              >
                {p}
              </button>
            ))}
          <button
            type="button"
            onClick={() => setPage(p => Math.min(promos.totalPages, p + 1))}
            disabled={page === promos.totalPages}
            className="px-2 py-1 disabled:opacity-30 hover:text-stone-900"
          >
            →
          </button>
        </nav>
      )}
    </main>
  )
}
