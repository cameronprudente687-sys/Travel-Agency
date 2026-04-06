import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { parseJsonField } from "@/lib/utils"
import Link from "next/link"
import { Star, MapPin, Hotel, Utensils, Sparkles, ExternalLink } from "lucide-react"
import { PlaceFormDialog } from "@/components/admin/PlaceFormDialog"
import { PlaceActions } from "@/components/admin/PlaceActions"

const categoryEmoji: Record<string, string> = {
  HOTEL: "🏨", RESORT: "🌴", BOUTIQUE_HOTEL: "🏡", VILLA: "🏰",
  RESTAURANT: "🍽️", CAFE: "☕", BAR: "🍸", EXPERIENCE: "✨",
  ACTIVITY: "🎯", TOUR: "🗺️", SPA: "🧘", BEACH: "🏖️", LANDMARK: "🏛️",
}

interface Props {
  searchParams: { tab?: string }
}

export default async function PlacesPage({ searchParams }: Props) {
  const activeTab = searchParams.tab || "all"

  const where: any = {}
  if (activeTab === "stay") where.category = { in: ["HOTEL", "RESORT", "BOUTIQUE_HOTEL", "VILLA"] }
  if (activeTab === "dine") where.category = { in: ["RESTAURANT", "CAFE", "BAR"] }
  if (activeTab === "do") where.category = { in: ["EXPERIENCE", "ACTIVITY", "TOUR", "SPA", "BEACH", "LANDMARK"] }

  const places = await db.savedPlace.findMany({
    where,
    orderBy: [{ isTopPick: "desc" }, { isFeatured: "desc" }, { name: "asc" }],
  })

  const counts = {
    all: await db.savedPlace.count(),
    stay: await db.savedPlace.count({ where: { category: { in: ["HOTEL", "RESORT", "BOUTIQUE_HOTEL", "VILLA"] } } }),
    dine: await db.savedPlace.count({ where: { category: { in: ["RESTAURANT", "CAFE", "BAR"] } } }),
    do: await db.savedPlace.count({ where: { category: { in: ["EXPERIENCE", "ACTIVITY", "TOUR", "SPA", "BEACH", "LANDMARK"] } } }),
  }

  const tabs = [
    { key: "all", label: "All", count: counts.all, icon: MapPin },
    { key: "stay", label: "Stay", count: counts.stay, icon: Hotel },
    { key: "dine", label: "Dine", count: counts.dine, icon: Utensils },
    { key: "do", label: "Experience", count: counts.do, icon: Sparkles },
  ]

  // Group by destination for scanning
  const byDest = places.reduce((acc, p) => {
    const key = p.destination
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {} as Record<string, typeof places>)

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Saved Places" subtitle={`${counts.all} curated places`} />

      <div className="flex-1 p-6">
        {/* Tabs + create */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {tabs.map(tab => (
              <Link
                key={tab.key}
                href={tab.key === "all" ? "/places" : `/places?tab=${tab.key}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-white text-primary-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                <span className="text-xs text-gray-400">{tab.count}</span>
              </Link>
            ))}
          </div>
          <PlaceFormDialog />
        </div>

        {/* Grouped by destination */}
        {Object.entries(byDest).map(([dest, destPlaces]) => (
          <div key={dest} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{destPlaces[0].flagEmoji}</span>
              <h2 className="font-semibold text-gray-900">{dest}</h2>
              <span className="text-xs text-gray-400">{destPlaces.length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {destPlaces.map(place => {
                const bestFor = parseJsonField<string[]>(place.bestFor, [])
                return (
                  <div
                    key={place.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-200 transition-colors group"
                  >
                    {/* Top row: emoji + name + price */}
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{categoryEmoji[place.category] || "📍"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/places/${place.id}`} className="font-semibold text-gray-900 text-base hover:text-primary-700 transition-colors truncate">
                            {place.name}
                          </Link>
                          {place.isTopPick && <Star className="w-4 h-4 fill-gold-400 text-gold-400 shrink-0" />}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {place.category.replace(/_/g, " ")}
                          {place.priceLevel ? ` · ${"$".repeat(place.priceLevel)}` : ""}
                          {place.rating ? ` · ${place.rating}★` : ""}
                        </div>
                      </div>
                    </div>

                    {/* Why recommended — the most useful info */}
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">{place.whyWeRecommend}</p>

                    {/* Tags — only show if they add info */}
                    {bestFor.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {bestFor.slice(0, 3).map(t => (
                          <span key={t} className="text-xs text-gray-500 bg-gray-50 rounded px-1.5 py-0.5">{t.replace(/_/g, " ")}</span>
                        ))}
                      </div>
                    )}

                    {/* Actions — visible on hover for clean look, always accessible */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                      <PlaceActions place={place} />
                      {place.website && (
                        <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-primary-600 flex items-center gap-0.5 ml-auto">
                          <ExternalLink className="w-3 h-3" /> Website
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {places.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-2">No places in this category</p>
            <PlaceFormDialog />
          </div>
        )}
      </div>
    </div>
  )
}
