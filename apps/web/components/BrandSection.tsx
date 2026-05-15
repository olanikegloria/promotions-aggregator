import type { BrandWithCount, PromotionWithBrand } from '@promo/shared'
import { PromoCard } from './PromoCard'

interface Props {
  brand: BrandWithCount
  promotions: PromotionWithBrand[]
}

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  x: 'X',
  other: 'Website',
}

export function BrandSection({ brand, promotions }: Props) {
  const socials = Object.entries(brand.socialLinks).filter(([, url]) => url != null)

  return (
    <div className="mb-10">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{brand.name}</h2>
            <p className="text-sm text-gray-500">
              {brand.promotionCount} promotion{brand.promotionCount !== 1 ? 's' : ''}
            </p>
          </div>
          {brand.websiteUrl && (
            <a
              href={brand.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Visit website →
            </a>
          )}
        </div>

        {brand.hours && (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Hours</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {Object.entries(brand.hours).map(([day, time]) => (
                <div key={day} className="flex justify-between text-xs text-gray-600">
                  <span className="font-medium">{day}</span>
                  <span>{time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {socials.length > 0 && (
          <div className="mt-3 flex gap-3 flex-wrap">
            {socials.map(([platform, url]) => (
              <a
                key={platform}
                href={url!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-blue-600 underline"
              >
                {SOCIAL_LABELS[platform] ?? platform}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map(p => (
          <PromoCard key={p.id} promo={p} />
        ))}
      </div>
    </div>
  )
}
