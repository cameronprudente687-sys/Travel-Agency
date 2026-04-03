import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Badge } from "@/components/ui/badge"
import { parseJsonField } from "@/lib/utils"
import { DestinationActions } from "@/components/admin/DestinationActions"

export default async function DestinationDetailPage({ params }: { params: { id: string } }) {
  const entry = await db.destinationKnowledgeEntry.findUnique({
    where: { id: params.id },
    include: { seasonalityNotes: { orderBy: { month: "asc" } } },
  })
  if (!entry) notFound()

  const tags = parseJsonField<string[]>(entry.tags, [])
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title={entry.title} subtitle={`${entry.destination}, ${entry.country}`} />
      <div className="flex-1 p-6 max-w-3xl">
        <div className="flex justify-end mb-4">
          <DestinationActions entry={entry} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{entry.flagEmoji}</span>
            <div>
              <h2 className="font-semibold text-gray-900">{entry.destination}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{entry.category.replace(/_/g, ' ')}</Badge>
                {entry.isFeatured && <Badge variant="gold">Featured</Badge>}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{entry.title}</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <span key={t} className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">{t}</span>
              ))}
            </div>
          )}

          {entry.seasonalityNotes.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Seasonality</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {entry.seasonalityNotes.map(note => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-sm text-gray-800 mb-1">{months[note.month - 1]}</div>
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: note.rating }).map((_, i) => <span key={i} className="text-gold-400">★</span>)}
                    </div>
                    <div className="text-xs text-gray-500">{note.weather}</div>
                    <div className="text-xs text-gray-400">Crowds: {note.crowds}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
