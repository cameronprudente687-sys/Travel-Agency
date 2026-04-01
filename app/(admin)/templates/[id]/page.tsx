import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Badge } from "@/components/ui/badge"
import { parseJsonField, formatCurrency } from "@/lib/utils"
import { Clock, DollarSign, Map, Calendar, Star, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function TemplateDetailPage({ params }: { params: { id: string } }) {
  const template = await db.itineraryTemplate.findUnique({
    where: { id: params.id },
    include: {
      days: { orderBy: { dayNumber: "asc" } },
      collections: { include: { collection: true } },
    },
  })

  if (!template) notFound()

  const styles = parseJsonField<string[]>(template.travelStyles, [])
  const travelerTypes = parseJsonField<string[]>(template.travelerTypes, [])
  const highlights = parseJsonField<string[]>(template.highlights, [])
  const includes = parseJsonField<string[]>(template.includes, [])
  const excludes = parseJsonField<string[]>(template.excludes || "[]", [])
  const bestMonths = parseJsonField<number[]>(template.bestMonths || "[]", [])
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title={template.title}
        subtitle={`${template.destination}, ${template.country} · ${template.durationDays} days`}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-xl text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-5xl mb-3">{template.flagEmoji}</div>
              <h2 className="text-2xl font-serif font-bold mb-1">{template.title}</h2>
              <p className="text-primary-200 text-sm">{template.destination}, {template.country}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                {template.isSignature && <Badge variant="gold">Signature Trip</Badge>}
                {template.isBestSeller && <Badge variant="success">Best Seller</Badge>}
                {template.isFeatured && <Badge variant="navy">Featured</Badge>}
                <Badge variant="secondary">{template.status}</Badge>
              </div>
            </div>
            <div className="text-right">
              {template.basePrice && (
                <div className="text-2xl font-bold text-gold-300">
                  from {formatCurrency(template.basePrice)}
                </div>
              )}
              {template.priceNotes && (
                <p className="text-xs text-primary-300 mt-1">{template.priceNotes}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-primary-700">
            <div>
              <div className="text-xs text-primary-400 mb-1">Duration</div>
              <div className="font-semibold">{template.durationDays} days</div>
            </div>
            <div>
              <div className="text-xs text-primary-400 mb-1">Budget Level</div>
              <div className="font-semibold capitalize">{template.budgetLevel.replace(/_/g, ' ')}</div>
            </div>
            <div>
              <div className="text-xs text-primary-400 mb-1">Pace</div>
              <div className="font-semibold capitalize">{template.paceLevel}</div>
            </div>
            <div>
              <div className="text-xs text-primary-400 mb-1">Styles</div>
              <div className="font-semibold text-sm">{styles.slice(0, 2).join(', ')}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-3">About This Trip</h3>
              <p className="text-gray-600 leading-relaxed">{template.description}</p>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Trip Highlights</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Star className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Day by Day */}
            {template.days.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-5">Day-by-Day Itinerary</h3>
                <div className="space-y-6">
                  {template.days.map(day => {
                    const activities = parseJsonField<string[]>(day.activities, [])
                    const meals = parseJsonField<string[]>(day.meals || "[]", [])
                    return (
                      <div key={day.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                            {day.dayNumber}
                          </div>
                          {day.dayNumber < template.days.length && (
                            <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                          )}
                        </div>
                        <div className="pb-6 flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 mb-1">{day.title}</div>
                          <div className="text-xs text-primary-600 mb-2">{day.location}</div>
                          <p className="text-sm text-gray-600 mb-3">{day.description}</p>
                          {activities.length > 0 && (
                            <div className="space-y-1">
                              {activities.map((a, i) => (
                                <div key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                  <ChevronRight className="w-3 h-3 text-gold-500 shrink-0 mt-0.5" />
                                  {a}
                                </div>
                              ))}
                            </div>
                          )}
                          {day.accommodation && (
                            <div className="mt-2 text-xs text-primary-600">
                              🏨 {day.accommodation}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Includes/Excludes */}
            {(includes.length > 0 || excludes.length > 0) && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Includes</h3>
                {includes.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {includes.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {excludes.length > 0 && (
                  <>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Excludes</h4>
                    <ul className="space-y-2">
                      {excludes.map((item, i) => (
                        <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                          <span className="text-gray-300 shrink-0">✗</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* Best Time to Visit */}
            {bestMonths.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Best Time to Visit</h3>
                <div className="grid grid-cols-4 gap-1">
                  {monthNames.map((month, i) => (
                    <div
                      key={month}
                      className={`text-center py-1 rounded text-xs font-medium ${
                        bestMonths.includes(i + 1)
                          ? 'bg-primary-700 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {month}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Traveler Types */}
            {travelerTypes.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Best For</h3>
                <div className="flex flex-wrap gap-2">
                  {travelerTypes.map(t => (
                    <span key={t} className="text-xs bg-primary-50 text-primary-700 rounded-full px-3 py-1">
                      {t.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Collections */}
            {template.collections.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3">In Collections</h3>
                <div className="space-y-2">
                  {template.collections.map(ci => (
                    <Link
                      key={ci.collectionId}
                      href={`/collections/${ci.collectionId}`}
                      className="flex items-center gap-2 text-sm text-primary-700 hover:underline"
                    >
                      <span>{ci.collection.emoji}</span>
                      {ci.collection.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
