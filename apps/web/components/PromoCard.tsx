'use client'

import type { PromotionWithBrand } from '@promo/shared'
import Image from 'next/image'

interface Props {
  promo: PromotionWithBrand
}

export function PromoCard({ promo }: Props) {
  const daysLeft =
    promo.endDate && !isNaN(Date.parse(promo.endDate))
      ? Math.ceil((new Date(promo.endDate).getTime() - Date.now()) / 86400000)
      : null
  const urgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7

  const endDateLabel = promo.endDate
    ? (() => {
        const d = new Date(promo.endDate)
        if (Number.isNaN(d.getTime())) return promo.endDate
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      })()
    : null

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-shadow">
      <div className="relative h-44 w-full bg-gray-100 shrink-0 overflow-hidden">
        {promo.imageUrl ? (
          <Image
            src={promo.imageUrl}
            alt={promo.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200" />
        )}
        {urgent && (
          <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Ending soon
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-500 mb-1">
          {promo.brand.name}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
          {promo.name}
        </h3>
        {promo.description && (
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{promo.description}</p>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          {endDateLabel ? (
            <span className="inline-flex items-center bg-amber-50 text-amber-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-amber-200">
              {endDateLabel}
            </span>
          ) : (
            <span />
          )}
          <a
            href={promo.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
          >
            View offer →
          </a>
        </div>
      </div>
    </div>
  )
}
