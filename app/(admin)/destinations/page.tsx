import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DestinationFormDialog } from "@/components/admin/DestinationFormDialog"

const categoryColors: Record<string, string> = {
  GENERAL: "secondary",
  BEST_TIME_TO_VISIT: "gold",
  NEIGHBORHOODS: "info",
  HIDDEN_GEMS: "success",
  LUXURY_TIPS: "gold",
  ROMANCE_TIPS: "warning",
  FOOD_CULTURE: "amber",
}

export default async function DestinationsPage() {
  const entries = await db.destinationKnowledgeEntry.findMany({
    orderBy: [{ destination: "asc" }, { category: "asc" }],
  })

  // Group by destination
  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.destination]) acc[entry.destination] = []
    acc[entry.destination].push(entry)
    return acc
  }, {} as Record<string, typeof entries>)

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Destination Knowledge Base" subtitle={`${entries.length} knowledge entries across ${Object.keys(grouped).length} destinations`} />

      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-end">
          <DestinationFormDialog />
        </div>
        {Object.entries(grouped).map(([destination, destEntries]) => {
          const firstEntry = destEntries[0]
          return (
            <div key={destination} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="text-2xl">{firstEntry.flagEmoji}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{destination}</h3>
                  <div className="text-xs text-gray-500">{firstEntry.country} · {firstEntry.region}</div>
                </div>
                <span className="ml-auto text-xs text-gray-400">{destEntries.length} entries</span>
              </div>
              <div className="divide-y divide-gray-50">
                {destEntries.map(entry => (
                  <Link
                    key={entry.id}
                    href={`/destinations/${entry.id}`}
                    className="flex items-start gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <Badge variant={(categoryColors[entry.category] as any) || "secondary"} className="mt-0.5 shrink-0 text-xs">
                      {entry.category.replace(/_/g, ' ')}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm">{entry.title}</div>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{entry.content}</p>
                    </div>
                    {entry.isFeatured && (
                      <span className="text-xs bg-gold-100 text-gold-700 rounded-full px-2 py-0.5">Featured</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
