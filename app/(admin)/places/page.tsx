import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { parseJsonField } from "@/lib/utils"
import Link from "next/link"
import { MapPin, Hotel, Utensils, Sparkles } from "lucide-react"
import { PlaceFormDialog } from "@/components/admin/PlaceFormDialog"
import { PlaceCard } from "@/components/admin/PlaceCard"
import { SearchBar } from "@/components/admin/SearchBar"
import { Suspense } from "react"

interface Props {
  searchParams: { tab?: string; q?: string }
}

export default async function PlacesPage({ searchParams }: Props) {
  const activeTab = searchParams.tab || "all"
  const searchQuery = searchParams.q || ""

  const where: any = {}
  if (activeTab === "stay") where.category = { in: ["HOTEL", "RESORT", "BOUTIQUE_HOTEL", "VILLA"] }
  if (activeTab === "dine") where.category = { in: ["RESTAURANT", "CAFE", "BAR"] }
  if (activeTab === "do") where.category = { in: ["EXPERIENCE", "ACTIVITY", "TOUR", "SPA", "BEACH", "LANDMARK"] }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery } },
      { destination: { contains: searchQuery } },
      { description: { contains: searchQuery } },
      { whyWeRecommend: { contains: searchQuery } },
    ]
  }

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

  // Group by destination
  const byDest = places.reduce((acc, p) => {
    if (!acc[p.destination]) acc[p.destination] = []
    acc[p.destination].push(p)
    return acc
  }, {} as Record<string, typeof places>)

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Saved Places" subtitle={`${counts.all} curated places`} />

      <div className="flex-1 p-6">
        {/* Tabs + search + create */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Suspense>
              <SearchBar basePath="/places" placeholder="Search places..." preserveParams={["tab"]} />
            </Suspense>
            <PlaceFormDialog />
          </div>
        </div>

        {/* Results info */}
        {searchQuery && (
          <p className="text-sm text-gray-500 mb-4">{places.length} result{places.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;</p>
        )}

        {/* Grouped by destination */}
        {Object.entries(byDest).map(([dest, destPlaces]) => (
          <div key={dest} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{destPlaces[0].flagEmoji}</span>
              <h2 className="font-semibold text-gray-900">{dest}</h2>
              <span className="text-xs text-gray-400">{destPlaces.length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {destPlaces.map(place => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  bestFor={parseJsonField<string[]>(place.bestFor, [])}
                />
              ))}
            </div>
          </div>
        ))}

        {places.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-2">
              {searchQuery ? `No places matching "${searchQuery}"` : "No places in this category"}
            </p>
            <PlaceFormDialog />
          </div>
        )}
      </div>
    </div>
  )
}
