import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { parseJsonField } from "@/lib/utils"
import { Star, Clock, Users, DollarSign, Quote } from "lucide-react"
import Link from "next/link"
import { PastTripFormDialog } from "@/components/admin/PastTripFormDialog"

const budgetLabel: Record<string, string> = {
  UNDER_3K: "Budget", THREE_TO_5K: "Mid-Range", FIVE_TO_10K: "Premium",
  TEN_TO_20K: "Luxury", OVER_20K: "Ultra Luxury",
}

const gradients = [
  "from-primary-900 to-primary-700",
  "from-teal-900 to-teal-700",
  "from-indigo-900 to-violet-700",
  "from-rose-900 to-pink-700",
  "from-amber-900 to-orange-700",
  "from-emerald-900 to-green-700",
]

export default async function PastTripsPage() {
  const trips = await db.pastTrip.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Past Trips" subtitle={`${trips.length} completed journeys — your portfolio of success`} />

      <div className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <PastTripFormDialog />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip, idx) => {
            const highlights = parseJsonField<string[]>(trip.highlights, [])
            const gradient = gradients[idx % gradients.length]

            return (
              <Link
                key={trip.id}
                href={`/past-trips/${trip.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden group"
              >
                {/* Hero */}
                <div className={`bg-gradient-to-br ${gradient} p-6 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-4xl mb-3">{trip.flagEmoji}</div>
                      <h3 className="font-serif font-bold text-xl group-hover:text-gold-200 transition-colors">{trip.title}</h3>
                      <p className="text-white/70 text-sm mt-1">{trip.destination} · {trip.tripDate}</p>
                    </div>
                    {trip.rating && (
                      <div className="flex gap-0.5 bg-white/10 rounded-lg px-2 py-1">
                        {Array.from({ length: trip.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="flex gap-4 mt-4 pt-3 border-t border-white/20 text-sm text-white/80">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {trip.durationDays} days</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {trip.travelerType.replace(/_/g, " ")}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {budgetLabel[trip.budgetLevel] || trip.budgetLevel}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  {/* Testimonial */}
                  {trip.testimonial && (
                    <div className="bg-sand-50 rounded-xl p-4 border border-sand-200 relative">
                      <Quote className="w-5 h-5 text-gold-400 mb-1" />
                      <blockquote className="text-sm text-gray-700 italic leading-relaxed line-clamp-3">
                        {trip.testimonial}
                      </blockquote>
                      <p className="text-xs text-gray-500 mt-2 font-medium not-italic">— {trip.clientName}</p>
                    </div>
                  )}

                  {/* Highlights */}
                  {highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {highlights.slice(0, 4).map((h, i) => (
                        <span key={i} className="text-xs bg-primary-50 text-primary-700 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-gold-500" />
                          <span className="line-clamp-1">{h}</span>
                        </span>
                      ))}
                      {highlights.length > 4 && (
                        <span className="text-xs text-gray-400 self-center">+{highlights.length - 4} more</span>
                      )}
                    </div>
                  )}

                  {/* Style tag */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{trip.travelStyle}</span>
                    {!trip.testimonial && <span className="text-xs text-gray-500">— {trip.clientName}</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {trips.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-2">No past trips yet</p>
            <p className="text-sm text-gray-400 mb-4">Record completed trips to build your portfolio</p>
            <PastTripFormDialog />
          </div>
        )}
      </div>
    </div>
  )
}
