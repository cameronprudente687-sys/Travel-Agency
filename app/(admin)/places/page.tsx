import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Badge } from "@/components/ui/badge"
import { parseJsonField } from "@/lib/utils"
import Link from "next/link"
import { Star, MapPin, Hotel, Utensils, Sparkles } from "lucide-react"
import { PlaceFormDialog } from "@/components/admin/PlaceFormDialog"

const categoryEmoji: Record<string, string> = {
  HOTEL: "🏨", RESORT: "🌴", BOUTIQUE_HOTEL: "🏡", VILLA: "🏰",
  RESTAURANT: "🍽️", CAFE: "☕", BAR: "🍸", EXPERIENCE: "✨",
  ACTIVITY: "🎯", TOUR: "🗺️", SPA: "🧘", BEACH: "🏖️", LANDMARK: "🏛️",
}

const categoryGroup: Record<string, string> = {
  HOTEL: "stay", RESORT: "stay", BOUTIQUE_HOTEL: "stay", VILLA: "stay",
  RESTAURANT: "dine", CAFE: "dine", BAR: "dine",
  EXPERIENCE: "do", ACTIVITY: "do", TOUR: "do", SPA: "do", BEACH: "do", LANDMARK: "do",
}

const gradients = [
  "from-blue-900 to-indigo-800",
  "from-teal-800 to-emerald-700",
  "from-amber-800 to-orange-700",
  "from-rose-800 to-pink-700",
  "from-violet-800 to-purple-700",
  "from-slate-800 to-gray-700",
]

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
    { key: "all", label: "All Places", count: counts.all, icon: MapPin },
    { key: "stay", label: "Hotels", count: counts.stay, icon: Hotel },
    { key: "dine", label: "Restaurants", count: counts.dine, icon: Utensils },
    { key: "do", label: "Experiences", count: counts.do, icon: Sparkles },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Saved Places" subtitle={`Your curated library of ${counts.all} hotels, restaurants & experiences`} />

      <div className="flex-1 p-6">
        {/* Category tabs + create */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <Link
                key={tab.key}
                href={tab.key === "all" ? "/places" : `/places?tab=${tab.key}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary-700 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  activeTab === tab.key ? "bg-white/20" : "bg-gray-100"
                }`}>{tab.count}</span>
              </Link>
            ))}
          </div>
          <PlaceFormDialog />
        </div>

        {/* Places grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {places.map((place, idx) => {
            const bestFor = parseJsonField<string[]>(place.bestFor, [])
            const gradient = gradients[idx % gradients.length]
            return (
              <Link
                key={place.id}
                href={`/places/${place.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden group"
              >
                {/* Visual header */}
                <div className={`bg-gradient-to-br ${gradient} p-5 text-white relative`}>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">{categoryEmoji[place.category] || "📍"}</span>
                    <div className="flex flex-col items-end gap-1">
                      {place.isTopPick && (
                        <span className="flex items-center gap-1 bg-gold-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                          <Star className="w-3 h-3 fill-white" /> Top Pick
                        </span>
                      )}
                      {place.priceLevel && (
                        <span className="text-white/80 text-sm font-medium">{"$".repeat(place.priceLevel)}</span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-lg mt-3 leading-tight group-hover:text-gold-200 transition-colors">
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-1 text-white/70 text-sm mt-1">
                    <MapPin className="w-3 h-3" />
                    {place.destination}, {place.country}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{place.whyWeRecommend}</p>

                  {/* Tags row */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-xs bg-primary-50 text-primary-700 rounded-full px-2 py-0.5 font-medium">
                      {place.category.replace(/_/g, " ")}
                    </span>
                    {bestFor.slice(0, 2).map(t => (
                      <span key={t} className="text-xs bg-sand-100 text-gray-600 rounded-full px-2 py-0.5">
                        {t.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>

                  {/* Rating */}
                  {place.rating && (
                    <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                      <div className="flex gap-0.5">
                        {Array.from({ length: Math.round(place.rating) }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">{place.rating}</span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

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
