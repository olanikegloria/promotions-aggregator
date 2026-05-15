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
      <div className="border-b border-stone-200 pb-4 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-normal text-stone-900 tracking-tight">{brand.name}</h2>
            <p className="text-xs text-stone-500 mt-1 tabular-nums">
              {brand.promotionCount} offer{brand.promotionCount !== 1 ? 's' : ''}
            </p>
          </div>
          {brand.websiteUrl && (
            <a
              href={brand.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-4 decoration-stone-300"
            >
              Site
            </a>
          )}
        </div>

        {brand.hours && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Hours</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs text-stone-600">
              {Object.entries(brand.hours).map(([day, time]) => (
                <div key={day} className="flex justify-between gap-4">
                  <span className="text-stone-500">{day}</span>
                  <span>{time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {socials.length > 0 && (
          <div className="mt-3 flex gap-4 flex-wrap text-xs text-stone-500">
            {socials.map(([platform, url]) => (
              <a
                key={platform}
                href={url!}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-900 underline underline-offset-4 decoration-stone-200"
              >
                {SOCIAL_LABELS[platform] ?? platform}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="divide-y divide-stone-100 border-t border-stone-100">
        {promotions.map(p => (
          <PromoCard key={p.id} promo={p} />
        ))}
      </div>
    </section>
  )
}
