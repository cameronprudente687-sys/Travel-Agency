import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Star, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { PastTripFormDialog } from "@/components/admin/PastTripFormDialog"

export default async function PastTripsPage() {
  const trips = await db.pastTrip.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Past Trips" subtitle={`${trips.length} completed journeys`} />

      <div className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <PastTripFormDialog />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {trips.map(trip => (
            <Link
              key={trip.id}
              href={`/past-trips/${trip.id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
            >
              <div className="bg-gradient-to-r from-primary-900 to-primary-800 p-5 text-white">
                <div className="text-3xl mb-2">{trip.flagEmoji}</div>
                <h3 className="font-serif font-bold text-lg group-hover:text-gold-300 transition-colors">{trip.title}</h3>
                <p className="text-primary-200 text-sm">{trip.destination} · {trip.tripDate}</p>
              </div>
              <div className="p-5">
                {trip.testimonial && (
                  <blockquote className="text-sm text-gray-600 italic line-clamp-3 mb-4">
                    "{trip.testimonial}"
                  </blockquote>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{trip.durationDays} days</span>
                    <span>{trip.travelStyle}</span>
                  </div>
                  {trip.rating && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: trip.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">— {trip.clientName}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
