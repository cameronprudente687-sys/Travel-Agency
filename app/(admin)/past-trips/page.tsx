import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { parseJsonField } from "@/lib/utils"
import { Star, Clock, Users, DollarSign, Quote } from "lucide-react"
import Link from "next/link"
import { PastTripFormDialog } from "@/components/admin/PastTripFormDialog"
import { PastTripActions } from "@/components/admin/PastTripActions"

const budgetLabel: Record<string, string> = {
  UNDER_3K: "Budget", THREE_TO_5K: "Mid-Range", FIVE_TO_10K: "Premium",
  TEN_TO_20K: "Luxury", OVER_20K: "Ultra Luxury",
}

export default async function PastTripsPage() {
  const trips = await db.pastTrip.findMany({
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
  })

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Past Trips" subtitle={`${trips.length} completed journeys`} />

      <div className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <PastTripFormDialog />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {trips.map(trip => {
            const highlights = parseJsonField<string[]>(trip.highlights, [])

            return (
              <div key={trip.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Header — compact, scannable */}
                <div className="bg-primary-900 px-5 py-4 text-white flex items-center gap-3">
                  <span className="text-3xl shrink-0">{trip.flagEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/past-trips/${trip.id}`} className="font-serif font-bold text-lg hover:text-gold-300 transition-colors block truncate">
                      {trip.title}
                    </Link>
                    <p className="text-primary-300 text-sm">{trip.destination} · {trip.tripDate}</p>
                  </div>
                  {trip.rating && (
                    <div className="flex gap-0.5 shrink-0">
                      {Array.from({ length: trip.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" /> {trip.durationDays} days</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gray-400" /> {trip.travelerType.replace(/_/g, " ")}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-gray-400" /> {budgetLabel[trip.budgetLevel] || trip.budgetLevel}</span>
                    <span className="text-xs text-gray-500 bg-gray-50 rounded px-1.5 py-0.5">{trip.travelStyle}</span>
                  </div>

                  {/* Testimonial — the most compelling content */}
                  {trip.testimonial && (
                    <div className="bg-sand-50 rounded-lg p-3 border border-sand-100">
                      <p className="text-sm text-gray-700 italic line-clamp-3 leading-relaxed">&ldquo;{trip.testimonial}&rdquo;</p>
                      <p className="text-xs text-gray-500 mt-1.5 font-medium not-italic">— {trip.clientName}</p>
                    </div>
                  )}

                  {/* Highlights — compact chips */}
                  {highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {highlights.slice(0, 4).map((h, i) => (
                        <span key={i} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-0.5 line-clamp-1">{h}</span>
                      ))}
                      {highlights.length > 4 && <span className="text-xs text-gray-400 self-center">+{highlights.length - 4}</span>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100">
                    <PastTripActions trip={trip} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {trips.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-4">No past trips yet</p>
            <PastTripFormDialog />
          </div>
        )}
      </div>
    </div>
  )
}
