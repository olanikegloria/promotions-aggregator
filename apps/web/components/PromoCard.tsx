'use client'

import type { PromotionWithBrand } from '@promo/shared'
import Image from 'next/image'

interface Props {
  promo: PromotionWithBrand
}

export function PromoCard({ promo }: Props) {
  const endDate = promo.endDate
    ? new Date(promo.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      {promo.imageUrl && (
        <div className="relative h-40 w-full bg-gray-100">
          <Image
            src={promo.imageUrl}
            alt={promo.name}
            fill
            className="object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
      <div className="p-4">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
          {promo.brand.name}
        </p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">
          {promo.name}
        </h3>
        {promo.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3">{promo.description}</p>
        )}
        <div className="flex items-center justify-between">
          {endDate && (
            <span className="text-xs text-gray-500">Ends {endDate}</span>
          )}
          <a
            href={promo.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline ml-auto"
          >
            View offer →
          </a>
        </div>
      </div>
    </div>
  )
}
