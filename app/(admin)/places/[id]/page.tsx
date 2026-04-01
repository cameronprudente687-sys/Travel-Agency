import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Badge } from "@/components/ui/badge"
import { parseJsonField } from "@/lib/utils"
import { Star, Globe, MapPin } from "lucide-react"

export default async function PlaceDetailPage({ params }: { params: { id: string } }) {
  const place = await db.savedPlace.findUnique({ where: { id: params.id } })
  if (!place) notFound()

  const bestFor = parseJsonField<string[]>(place.bestFor, [])
  const tags = parseJsonField<string[]>(place.tags, [])

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title={place.name} subtitle={`${place.destination}, ${place.country}`} />
      <div className="flex-1 p-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold text-gray-900">{place.name}</h2>
                {place.isTopPick && <Star className="w-5 h-5 fill-gold-400 text-gold-400" />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{place.flagEmoji}</span>
                <span className="text-sm text-gray-600">{place.destination}, {place.country}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary">{place.category.replace(/_/g, ' ')}</Badge>
              {place.priceLevel && <div className="text-gold-600 font-medium mt-1">{'$'.repeat(place.priceLevel)}</div>}
              {place.rating && <div className="text-sm text-gray-500 mt-1">⭐ {place.rating}</div>}
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">{place.description}</p>

          <div className="bg-gold-50 rounded-xl p-4 border border-gold-100">
            <div className="text-xs font-semibold text-gold-700 uppercase tracking-wide mb-1">Why We Recommend This</div>
            <p className="text-sm text-gray-700">{place.whyWeRecommend}</p>
          </div>

          {bestFor.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Best For</div>
              <div className="flex flex-wrap gap-2">
                {bestFor.map(t => (
                  <span key={t} className="text-xs bg-primary-50 text-primary-700 rounded-full px-3 py-1">{t.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <span key={t} className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">{t}</span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {place.address && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                {place.address}
              </div>
            )}
            {place.website && (
              <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-700 hover:underline">
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
