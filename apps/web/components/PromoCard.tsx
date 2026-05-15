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
  const urgent =
    daysLeft !== null && daysLeft >= 0 && daysLeft <= 7

  const endDateLabel = promo.endDate
    ? (() => {
        const d = new Date(promo.endDate)
        if (Number.isNaN(d.getTime())) {
          return promo.endDate
        }
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      })()
    : null

  return (
    <a
      href={promo.canonicalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex gap-4 py-6 no-underline text-inherit hover:bg-stone-50/80 -mx-2 px-2 rounded-md transition-colors ${
        urgent ? 'border-l-2 border-l-stone-400 pl-3' : ''
      }`}
    >
      {promo.imageUrl ? (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-stone-100">
          <Image
            src={promo.imageUrl}
            alt={promo.name}
            fill
            sizes="80px"
            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      ) : (
        <div className="h-20 w-20 shrink-0 rounded-sm bg-stone-100" aria-hidden />
      )}
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-[11px] uppercase tracking-wider text-stone-500">{promo.brand.name}</p>
          {urgent && (
            <span className="text-[10px] uppercase tracking-wider text-stone-500">
              · soon
            </span>
          )}
        </div>
        <h3 className="font-normal text-base text-stone-900 leading-snug mt-1 group-hover:text-stone-700">
          {promo.name}
        </h3>
        {promo.description && (
          <p className="text-sm text-stone-500 mt-1 line-clamp-2">{promo.description}</p>
        )}
        {endDateLabel && (
          <p className="text-xs text-stone-400 mt-2 tabular-nums">{endDateLabel}</p>
        )}
      </div>
    </a>
  )
}
