import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { parseJsonField } from "@/lib/utils"
import { Star } from "lucide-react"

export default async function PastTripDetailPage({ params }: { params: { id: string } }) {
  const trip = await db.pastTrip.findUnique({ where: { id: params.id } })
  if (!trip) notFound()

  const highlights = parseJsonField<string[]>(trip.highlights, [])

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title={trip.title} subtitle={`${trip.destination} · ${trip.tripDate}`} />
      <div className="flex-1 p-6 max-w-3xl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{trip.flagEmoji}</span>
            <div>
              <h2 className="text-xl font-serif font-bold text-primary-900">{trip.title}</h2>
              <div className="text-sm text-gray-500">{trip.destination}, {trip.country} · {trip.durationDays} days · {trip.tripDate}</div>
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: trip.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                ))}
              </div>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">{trip.summary}</p>

          {highlights.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Trip Highlights</h3>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Star className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {trip.testimonial && (
            <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
              <blockquote className="text-gray-700 italic leading-relaxed">"{trip.testimonial}"</blockquote>
              <div className="text-sm text-primary-700 font-medium mt-3">— {trip.clientName}</div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ["Style", trip.travelStyle],
              ["Traveler Type", trip.travelerType.replace(/_/g, ' ')],
              ["Budget Level", trip.budgetLevel.replace(/_/g, ' ')],
              ["Duration", `${trip.durationDays} days`],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">{label}</div>
                <div className="text-sm font-medium text-gray-800 capitalize">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
