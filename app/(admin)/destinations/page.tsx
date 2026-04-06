import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { parseJsonField } from "@/lib/utils"
import Link from "next/link"
import { Globe, ChevronRight, Star, Calendar, MapPin } from "lucide-react"
import { DestinationFormDialog } from "@/components/admin/DestinationFormDialog"

const categoryConfig: Record<string, { label: string; emoji: string }> = {
  GENERAL: { label: "Overview", emoji: "🌍" },
  BEST_TIME_TO_VISIT: { label: "When to Go", emoji: "📅" },
  NEIGHBORHOODS: { label: "Neighborhoods", emoji: "🏘️" },
  TRANSPORTATION: { label: "Getting Around", emoji: "🚂" },
  FOOD_CULTURE: { label: "Food & Dining", emoji: "🍽️" },
  HIDDEN_GEMS: { label: "Hidden Gems", emoji: "💎" },
  LUXURY_TIPS: { label: "Luxury Tips", emoji: "✨" },
  FAMILY_TIPS: { label: "Family Tips", emoji: "👨‍👩‍👧" },
  ROMANCE_TIPS: { label: "Romance", emoji: "💕" },
  ADVENTURE_TIPS: { label: "Adventure", emoji: "🏔️" },
}

export default async function DestinationsPage() {
  const entries = await db.destinationKnowledgeEntry.findMany({
    orderBy: [{ isFeatured: "desc" }, { destination: "asc" }, { category: "asc" }],
    include: { _count: { select: { seasonalityNotes: true } } },
  })

  // Count saved places per destination for cross-reference
  const placeCounts = await db.savedPlace.groupBy({
    by: ["destination"],
    _count: true,
  })
  const placeCountMap = placeCounts.reduce((acc, p) => {
    acc[p.destination] = p._count
    return acc
  }, {} as Record<string, number>)

  // Group by destination
  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.destination]) acc[entry.destination] = {
      entries: [], flagEmoji: entry.flagEmoji, country: entry.country, region: entry.region,
    }
    acc[entry.destination].entries.push(entry)
    return acc
  }, {} as Record<string, { entries: typeof entries; flagEmoji: string | null; country: string; region: string | null }>)

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Destination Knowledge" subtitle={`${Object.keys(grouped).length} destinations`} />

      <div className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <DestinationFormDialog />
        </div>

        {/* Destination cards — each is a mini travel guide */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(grouped).map(([destination, data]) => {
            const categories = Array.from(new Set(data.entries.map(e => e.category)))
            const featuredEntry = data.entries.find(e => e.isFeatured)
            const savedPlaces = placeCountMap[destination] || 0

            return (
              <div key={destination} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Destination header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <span className="text-3xl">{data.flagEmoji}</span>
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-lg text-gray-900">{destination}</h3>
                    <p className="text-xs text-gray-500">{data.country}{data.region ? ` · ${data.region}` : ""}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400 space-y-0.5">
                    <div>{data.entries.length} guides</div>
                    {savedPlaces > 0 && <div>{savedPlaces} saved places</div>}
                  </div>
                </div>

                {/* Featured tip — most useful content first */}
                {featuredEntry && (
                  <Link href={`/destinations/${featuredEntry.id}`} className="block px-5 py-3 bg-primary-50/50 border-b border-primary-100/50 hover:bg-primary-50 transition-colors">
                    <div className="flex items-center gap-1 text-xs text-primary-600 font-medium mb-0.5">
                      <Star className="w-3 h-3" /> Top Tip
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{featuredEntry.content}</p>
                  </Link>
                )}

                {/* Category quick-nav — what knowledge exists */}
                <div className="px-5 py-3 flex flex-wrap gap-1.5 border-b border-gray-50">
                  {categories.map(cat => {
                    const c = categoryConfig[cat]
                    return (
                      <span key={cat} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-0.5">
                        {c?.emoji} {c?.label || cat}
                      </span>
                    )
                  })}
                </div>

                {/* Entry list — scannable, clickable */}
                <div className="divide-y divide-gray-50">
                  {data.entries.slice(0, 4).map(entry => {
                    const c = categoryConfig[entry.category]
                    return (
                      <Link
                        key={entry.id}
                        href={`/destinations/${entry.id}`}
                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-base shrink-0">{c?.emoji || "📌"}</span>
                        <span className="flex-1 text-sm text-gray-700 group-hover:text-primary-700 transition-colors truncate">{entry.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-400 shrink-0" />
                      </Link>
                    )
                  })}
                  {data.entries.length > 4 && (
                    <Link href={`/destinations/${data.entries[4].id}`} className="block px-5 py-2.5 text-center text-xs text-primary-600 hover:text-primary-800">
                      View all {data.entries.length} entries
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {Object.keys(grouped).length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
            <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-4">No destination knowledge yet</p>
            <DestinationFormDialog />
          </div>
        )}
      </div>
    </div>
  )
}
