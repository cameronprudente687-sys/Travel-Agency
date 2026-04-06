import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Badge } from "@/components/ui/badge"
import { parseJsonField } from "@/lib/utils"
import Link from "next/link"
import { Globe, MapPin, Star, ChevronRight } from "lucide-react"
import { DestinationFormDialog } from "@/components/admin/DestinationFormDialog"

const categoryConfig: Record<string, { label: string; emoji: string; variant: string }> = {
  GENERAL: { label: "Overview", emoji: "🌍", variant: "secondary" },
  BEST_TIME_TO_VISIT: { label: "When to Go", emoji: "📅", variant: "gold" },
  NEIGHBORHOODS: { label: "Neighborhoods", emoji: "🏘️", variant: "info" },
  TRANSPORTATION: { label: "Getting Around", emoji: "🚂", variant: "secondary" },
  FOOD_CULTURE: { label: "Food & Dining", emoji: "🍽️", variant: "warning" },
  HIDDEN_GEMS: { label: "Hidden Gems", emoji: "💎", variant: "success" },
  LUXURY_TIPS: { label: "Luxury Tips", emoji: "✨", variant: "gold" },
  FAMILY_TIPS: { label: "Family Tips", emoji: "👨‍👩‍👧", variant: "info" },
  ROMANCE_TIPS: { label: "Romance", emoji: "💕", variant: "error" },
  ADVENTURE_TIPS: { label: "Adventure", emoji: "🏔️", variant: "success" },
}

const gradients = [
  "from-primary-900 to-primary-700",
  "from-teal-900 to-emerald-700",
  "from-indigo-900 to-violet-700",
  "from-amber-900 to-orange-700",
  "from-rose-900 to-pink-700",
  "from-slate-800 to-gray-700",
]

export default async function DestinationsPage() {
  const entries = await db.destinationKnowledgeEntry.findMany({
    orderBy: [{ isFeatured: "desc" }, { destination: "asc" }, { category: "asc" }],
    include: { _count: { select: { seasonalityNotes: true } } },
  })

  // Group by destination
  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.destination]) acc[entry.destination] = { entries: [], flagEmoji: entry.flagEmoji, country: entry.country, region: entry.region }
    acc[entry.destination].entries.push(entry)
    return acc
  }, {} as Record<string, { entries: typeof entries; flagEmoji: string | null; country: string; region: string | null }>)

  const destCount = Object.keys(grouped).length

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Destination Knowledge" subtitle={`${entries.length} insights across ${destCount} destinations`} />

      <div className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <DestinationFormDialog />
        </div>

        {/* Destination cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(grouped).map(([destination, data], idx) => {
            const gradient = gradients[idx % gradients.length]
            const categories = Array.from(new Set(data.entries.map(e => e.category)))
            const featuredEntry = data.entries.find(e => e.isFeatured)
            const hasSeasonal = data.entries.some(e => e._count.seasonalityNotes > 0)

            return (
              <div key={destination} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Destination header */}
                <div className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-3xl">{data.flagEmoji}</span>
                      <h3 className="font-serif font-bold text-xl mt-2">{destination}</h3>
                      <p className="text-white/70 text-sm">{data.country}{data.region ? ` · ${data.region}` : ""}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white/30">{data.entries.length}</span>
                      <p className="text-xs text-white/50">entries</p>
                    </div>
                  </div>

                  {/* Category pills */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {categories.map(cat => {
                      const config = categoryConfig[cat]
                      return (
                        <span key={cat} className="text-xs bg-white/15 text-white/90 rounded-full px-2 py-0.5 flex items-center gap-1">
                          {config?.emoji} {config?.label || cat}
                        </span>
                      )
                    })}
                    {hasSeasonal && (
                      <span className="text-xs bg-gold-500/30 text-gold-200 rounded-full px-2 py-0.5">📊 Seasonality</span>
                    )}
                  </div>
                </div>

                {/* Featured entry preview */}
                {featuredEntry && (
                  <div className="px-5 py-3 bg-gold-50 border-b border-gold-100">
                    <div className="flex items-center gap-1 text-xs text-gold-700 font-medium mb-1">
                      <Star className="w-3 h-3 fill-gold-400 text-gold-400" /> Featured
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{featuredEntry.content}</p>
                  </div>
                )}

                {/* Entry list */}
                <div className="divide-y divide-gray-50">
                  {data.entries.slice(0, 5).map(entry => {
                    const config = categoryConfig[entry.category]
                    const tags = parseJsonField<string[]>(entry.tags, [])
                    return (
                      <Link
                        key={entry.id}
                        href={`/destinations/${entry.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-lg shrink-0">{config?.emoji || "📌"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 group-hover:text-primary-700 transition-colors">{entry.title}</div>
                          {tags.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {tags.slice(0, 3).map(t => (
                                <span key={t} className="text-xs text-gray-400">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 shrink-0" />
                      </Link>
                    )
                  })}
                  {data.entries.length > 5 && (
                    <div className="px-5 py-3 text-center">
                      <Link href={`/destinations/${data.entries[5].id}`} className="text-xs text-primary-600 hover:text-primary-800">
                        +{data.entries.length - 5} more entries
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {destCount === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
            <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-2">No destination knowledge yet</p>
            <p className="text-sm text-gray-400 mb-4">Start building your destination expertise</p>
            <DestinationFormDialog />
          </div>
        )}
      </div>
    </div>
  )
}
