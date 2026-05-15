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
    <section>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-indigo-500 p-5 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{brand.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5 tabular-nums">
              {brand.promotionCount} offer{brand.promotionCount !== 1 ? 's' : ''}
            </p>
          </div>
          {brand.websiteUrl && (
            <a
              href={brand.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              Visit site →
            </a>
          )}
        </div>

        {brand.hours && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Hours</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-600">
              {Object.entries(brand.hours).map(([day, time]) => (
                <div key={day} className="flex justify-between gap-4">
                  <span className="text-gray-400 font-medium">{day}</span>
                  <span>{time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {socials.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {socials.map(([platform, url]) => (
              <a
                key={platform}
                href={url!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 px-2.5 py-1 rounded-full transition-colors"
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
    </section>
  )
}
