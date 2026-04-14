import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { parseJsonField, formatCurrency } from "@/lib/utils"
import { Compass, Mail, Phone, Star, ChevronRight, MapPin, Calendar } from "lucide-react"
import Link from "next/link"

export default async function ClientPortalPage({ params }: { params: { slug: string } }) {
  const portalPage = await db.clientPortalPage.findUnique({
    where: { slug: params.slug },
    include: {
      lead: true,
      proposal: {
        include: {
          version: true,
        },
      },
    },
  })

  if (!portalPage || !portalPage.isActive) notFound()

  const lead = portalPage.lead
  const proposal = portalPage.proposal
  const version = proposal?.version
  const highlights = parseJsonField<string[]>(portalPage.tripHighlights, [])

  // Version data
  const itinerary = parseJsonField<any[]>(version?.itinerary || "[]", [])
  const hotelIdeas = parseJsonField<any[]>(version?.hotelIdeas || "[]", [])
  const experiences = parseJsonField<any[]>(version?.experiences || "[]", [])
  const destinations = parseJsonField<string[]>(version?.destinations || "[]", [])

  // Proposal data
  const inclusions = parseJsonField<string[]>(proposal?.inclusions || "[]", [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        {/* Nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-semibold text-lg">Voyagr</span>
          </div>
          <div className="text-sm text-primary-300">Your Private Travel Portal</div>
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-3">
            Your personalized itinerary
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">
            {portalPage.title}
          </h1>

          {destinations.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-primary-200 mb-6">
              <MapPin className="w-4 h-4" />
              <span>{destinations.join(' · ')}</span>
            </div>
          )}

          {version && (
            <div className="flex items-center justify-center gap-6 text-sm text-primary-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {version.durationDays} days
              </div>
              {version.estimatedCost && (
                <div>Est. {formatCurrency(version.estimatedCost)}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Welcome Message */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-serif font-bold text-primary-900 mb-4">
            Hello, {lead.firstName}!
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {portalPage.welcomeMessage}
          </p>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-primary-900 mb-6 text-center">Trip Highlights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-3 bg-sand-50 rounded-xl p-4 border border-sand-200">
                  <Star className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                  <p className="text-gray-700 text-sm">{h}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary */}
        {itinerary.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-primary-900 mb-6">Your Day-by-Day Journey</h2>
            <div className="space-y-4">
              {itinerary.map((day: any, i: number) => {
                const activities = parseJsonField<string[]>(
                  typeof day.activities === 'string' ? day.activities : JSON.stringify(day.activities || []),
                  Array.isArray(day.activities) ? day.activities : []
                )
                return (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 bg-primary-50 border-b border-primary-100">
                      <div className="w-8 h-8 rounded-full bg-primary-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                        {day.day || i + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-primary-900">{day.title}</div>
                        {day.location && <div className="text-xs text-primary-600">{day.location}</div>}
                      </div>
                    </div>
                    <div className="p-5">
                      {day.description && (
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">{day.description}</p>
                      )}
                      {activities.length > 0 && (
                        <ul className="space-y-1.5">
                          {activities.map((a: string, j: number) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                              <ChevronRight className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      )}
                      {day.accommodation && (
                        <div className="mt-3 text-xs text-primary-600">🏨 Staying at: {day.accommodation}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Hotel Ideas */}
        {hotelIdeas.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-primary-900 mb-6">Where You'll Stay</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {hotelIdeas.map((hotel: any, i: number) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="text-2xl mb-2">🏨</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{hotel.name}</h3>
                  <p className="text-xs text-primary-600 mb-2">{hotel.location}</p>
                  <p className="text-sm text-gray-600">{hotel.description}</p>
                  {hotel.whyRecommended && (
                    <div className="mt-3 text-xs text-gold-700 bg-gold-50 rounded-lg p-2">
                      ✨ {hotel.whyRecommended}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experiences */}
        {experiences.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-primary-900 mb-6">Experiences We're Planning</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {experiences.map((exp: any, i: number) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="text-2xl mb-2">{exp.emoji || "✨"}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{exp.name}</h3>
                  <p className="text-sm text-gray-600">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What's Included */}
        {inclusions.length > 0 && (
          <div className="bg-primary-50 rounded-2xl border border-primary-100 p-6">
            <h2 className="text-xl font-serif font-bold text-primary-900 mb-4">What's Included</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {inclusions.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact / Advisor */}
        <div className="bg-primary-900 text-white rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-serif font-bold mb-2">Questions? We're here.</h2>
          <p className="text-primary-200 text-sm mb-6">
            Your advisor is available to answer questions, make adjustments, or talk through any details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:tamara.prudente@fora.travel"
              className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Your Advisor
            </a>
            <a
              href="tel:+15087286754"
              className="flex items-center gap-2 bg-primary-700 hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Us
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Compass className="w-4 h-4" />
          <span className="font-serif font-semibold text-gray-600">Voyagr</span>
        </div>
        This itinerary was designed exclusively for {lead.firstName} {lead.lastName}.
        Please do not share this link.
      </div>
    </div>
  )
}
