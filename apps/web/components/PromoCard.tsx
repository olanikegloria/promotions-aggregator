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
  const urgentBorder =
    daysLeft !== null && daysLeft <= 7
      ? 'border-t-2 border-t-orange-400'
      : 'border-t-2 border-t-transparent'

  const endDateLabel = promo.endDate
    ? (() => {
        const d = new Date(promo.endDate)
        if (Number.isNaN(d.getTime())) {
          return promo.endDate
        }
        return `Ends ${d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`
      })()
    : null

  return (
    <a
      href={promo.canonicalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`block border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer no-underline text-inherit ${urgentBorder}`}
    >
      {promo.imageUrl && (
        <div className="relative h-40 w-full bg-gray-100">
          <Image
            src={promo.imageUrl}
            alt={promo.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
      <div className="p-4">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
          {promo.brand.name}
        </p>
        {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && (
          <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full mb-1">
            Ends in {daysLeft === 0 ? 'today' : `${daysLeft}d`}
          </span>
        )}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">
          {promo.name}
        </h3>
        {promo.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3">{promo.description}</p>
        )}
        <div className="flex items-center justify-between">
          {endDateLabel && (
            <span className="text-xs text-gray-500">{endDateLabel}</span>
          )}
        </div>
      </div>
    </a>
  )
}
