import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Badge } from "@/components/ui/badge"
import { parseJsonField } from "@/lib/utils"
import Link from "next/link"
import { Star } from "lucide-react"

const categoryEmoji: Record<string, string> = {
  HOTEL: "🏨", RESORT: "🌴", BOUTIQUE_HOTEL: "🏡", VILLA: "🏰",
  RESTAURANT: "🍽️", CAFE: "☕", BAR: "🍸", EXPERIENCE: "✨",
  ACTIVITY: "🎯", TOUR: "🗺️", SPA: "🧘", BEACH: "🏖️", LANDMARK: "🏛️",
}

export default async function PlacesPage() {
  const places = await db.savedPlace.findMany({
    orderBy: [{ isTopPick: "desc" }, { destination: "asc" }],
  })

  // Group by destination
  const grouped = places.reduce((acc, place) => {
    if (!acc[place.destination]) acc[place.destination] = []
    acc[place.destination].push(place)
    return acc
  }, {} as Record<string, typeof places>)

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Saved Places" subtitle={`${places.length} curated hotels, restaurants & experiences`} />

      <div className="flex-1 p-6 space-y-6">
        {Object.entries(grouped).map(([dest, destPlaces]) => {
          const firstPlace = destPlaces[0]
          return (
            <div key={dest} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="text-2xl">{firstPlace.flagEmoji}</span>
                <h3 className="font-semibold text-gray-900">{dest}</h3>
                <span className="ml-auto text-xs text-gray-400">{destPlaces.length} places</span>
              </div>
              <div className="divide-y divide-gray-50">
                {destPlaces.map(place => {
                  const bestFor = parseJsonField<string[]>(place.bestFor, [])
                  return (
                    <Link
                      key={place.id}
                      href={`/places/${place.id}`}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{categoryEmoji[place.category] || "📍"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">{place.name}</span>
                          {place.isTopPick && <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />}
                          {place.isFeatured && <Badge variant="gold" className="text-xs">Featured</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{place.whyWeRecommend}</p>
                        {bestFor.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {bestFor.slice(0, 2).map(t => (
                              <span key={t} className="text-xs bg-sand-100 text-gray-600 rounded-full px-2 py-0.5">{t.replace(/_/g, ' ')}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <Badge variant="secondary" className="text-xs">{place.category.replace(/_/g, ' ')}</Badge>
                        {place.priceLevel && (
                          <div className="text-xs text-gold-600 mt-1">{'$'.repeat(place.priceLevel)}</div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
