import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseJsonField, formatCurrency } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Star, Hotel, Sparkles, CheckCircle, Clock, ChevronRight } from "lucide-react"
import { CustomerChecklist } from "@/components/customer/CustomerChecklist"
import { TripProgress } from "@/components/customer/TripProgress"

export default async function MyTripPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const user = session.user as any
  if (user.role !== "CLIENT" || !user.leadId) redirect("/login")

  const lead = await db.customerLead.findUnique({ where: { id: user.leadId } })
  if (!lead) redirect("/login")

  const portal = await db.clientPortalPage.findFirst({
    where: { leadId: lead.id, portalStatus: "PUBLISHED" },
    include: {
      proposal: { include: { version: true } },
      checklistItems: {
        where: { isCustomerVisible: true },
        orderBy: [{ category: "asc" }, { dayNumber: "asc" }, { sortOrder: "asc" }],
        include: { completions: { where: { userId: user.id } } },
      },
    },
  })

  if (!portal) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-primary-900 mb-3">Your trip is being designed</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Your advisor is putting the finishing touches on your personalized itinerary.
          You&apos;ll receive access here as soon as it&apos;s ready.
        </p>
      </div>
    )
  }

  const version = portal.proposal?.version
  const itinerary = parseJsonField<any[]>(version?.itinerary || "[]", [])
  const hotelIdeas = parseJsonField<any[]>(version?.hotelIdeas || "[]", [])
  const experiences = parseJsonField<any[]>(version?.experiences || "[]", [])
  const destinations = parseJsonField<string[]>(version?.destinations || "[]", [])
  const highlights = parseJsonField<string[]>(portal.tripHighlights, [])
  const inclusions = parseJsonField<string[]>(portal.proposal?.inclusions || "[]", [])

  const totalItems = portal.checklistItems.length
  const completedItems = portal.checklistItems.filter(i => i.completions.length > 0 && i.completions[0].completed).length
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const preTripItems = portal.checklistItems.filter(i => i.category === "PRE_TRIP")
  const dayItems = portal.checklistItems.filter(i => i.category === "DAY_ACTIVITY")
  const duringItems = portal.checklistItems.filter(i => i.category === "DURING_TRIP")
  const postItems = portal.checklistItems.filter(i => i.category === "POST_TRIP")

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-3">Your Trip Plan</p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3">{portal.title}</h1>
          {destinations.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-primary-200 mb-4">
              <MapPin className="w-4 h-4" />
              <span>{destinations.join(" · ")}</span>
            </div>
          )}
          {version && (
            <div className="flex items-center justify-center gap-6 text-sm text-primary-300">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{version.durationDays} days</span>
              {version.estimatedCost && <span>Est. {formatCurrency(version.estimatedCost)}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <TripProgress completed={completedItems} total={totalItems} percent={progressPercent} />
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Advisor message */}
        {portal.advisorMessage && (
          <div className="bg-primary-50 rounded-2xl border border-primary-100 p-6 mb-8">
            <p className="text-sm font-semibold text-primary-700 mb-2">A note from your advisor</p>
            <p className="text-gray-700 leading-relaxed">{portal.advisorMessage}</p>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 h-auto p-1 flex-wrap">
            <TabsTrigger value="overview" className="text-base px-4 py-2">Overview</TabsTrigger>
            <TabsTrigger value="itinerary" className="text-base px-4 py-2">Itinerary</TabsTrigger>
            <TabsTrigger value="checklist" className="text-base px-4 py-2">
              Checklist {totalItems > 0 && <span className="ml-1 text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">{completedItems}/{totalItems}</span>}
            </TabsTrigger>
            <TabsTrigger value="hotels" className="text-base px-4 py-2">Hotels</TabsTrigger>
            <TabsTrigger value="experiences" className="text-base px-4 py-2">Experiences</TabsTrigger>
            <TabsTrigger value="info" className="text-base px-4 py-2">Travel Info</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-8">
              {/* Welcome */}
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-serif font-bold text-primary-900 mb-3">
                  Hello, {lead.firstName}!
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">{portal.welcomeMessage}</p>
              </div>

              {/* Highlights */}
              {highlights.length > 0 && (
                <div>
                  <h3 className="text-xl font-serif font-bold text-primary-900 mb-4">Trip Highlights</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 bg-sand-50 rounded-xl p-4 border border-sand-200">
                        <Star className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                        <p className="text-gray-700">{h}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's Included */}
              {inclusions.length > 0 && (
                <div className="bg-primary-50 rounded-2xl border border-primary-100 p-6">
                  <h3 className="text-lg font-serif font-bold text-primary-900 mb-4">What&apos;s Included</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {inclusions.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary">
            <h3 className="text-xl font-serif font-bold text-primary-900 mb-6">Your Day-by-Day Journey</h3>
            <div className="space-y-4">
              {itinerary.map((day: any, i: number) => {
                const acts = Array.isArray(day.activities) ? day.activities : parseJsonField<string[]>(day.activities, [])
                return (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 bg-primary-50 border-b border-primary-100">
                      <div className="w-9 h-9 rounded-full bg-primary-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                        {day.day || day.dayNumber || i + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-primary-900 text-base">{day.title}</div>
                        {day.location && <div className="text-xs text-primary-600">{day.location}</div>}
                      </div>
                    </div>
                    <div className="p-5">
                      {day.description && <p className="text-gray-600 mb-3 leading-relaxed">{day.description}</p>}
                      {acts.length > 0 && (
                        <ul className="space-y-1.5">
                          {acts.map((a: string, j: number) => (
                            <li key={j} className="flex items-start gap-2 text-gray-700">
                              <ChevronRight className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />{a}
                            </li>
                          ))}
                        </ul>
                      )}
                      {day.accommodation && (
                        <div className="mt-3 text-sm text-primary-600 flex items-center gap-1">
                          <Hotel className="w-4 h-4" /> {day.accommodation}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {itinerary.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="w-8 h-8 mx-auto mb-3" />
                  <p>Your day-by-day itinerary is being finalized.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist">
            <CustomerChecklist
              userId={user.id}
              preTripItems={preTripItems}
              dayItems={dayItems}
              duringItems={duringItems}
              postItems={postItems}
              completedCount={completedItems}
              totalCount={totalItems}
            />
          </TabsContent>

          {/* Hotels Tab */}
          <TabsContent value="hotels">
            <h3 className="text-xl font-serif font-bold text-primary-900 mb-6">Where You&apos;ll Stay</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {hotelIdeas.map((hotel: any, i: number) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="text-2xl mb-2"><Hotel className="w-6 h-6 text-primary-600" /></div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-base">{hotel.name}</h4>
                  {hotel.location && <p className="text-xs text-primary-600 mb-2">{hotel.location}</p>}
                  {hotel.description && <p className="text-sm text-gray-600">{hotel.description}</p>}
                  {hotel.whyRecommended && (
                    <div className="mt-3 text-xs text-gold-700 bg-gold-50 rounded-lg p-2">
                      <Sparkles className="w-3 h-3 inline mr-1" />{hotel.whyRecommended}
                    </div>
                  )}
                </div>
              ))}
              {hotelIdeas.length === 0 && (
                <div className="sm:col-span-2 text-center py-12 text-gray-400">
                  <Hotel className="w-8 h-8 mx-auto mb-3" />
                  <p>Hotel recommendations are being curated for you.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Experiences Tab */}
          <TabsContent value="experiences">
            <h3 className="text-xl font-serif font-bold text-primary-900 mb-6">Experiences We&apos;re Planning</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {experiences.map((exp: any, i: number) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="text-2xl mb-2">{exp.emoji || "✨"}</div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-base">{exp.name}</h4>
                  {exp.description && <p className="text-sm text-gray-600">{exp.description}</p>}
                </div>
              ))}
              {experiences.length === 0 && (
                <div className="sm:col-span-2 text-center py-12 text-gray-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-3" />
                  <p>Your curated experiences are being finalized.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Travel Info Tab */}
          <TabsContent value="info">
            <h3 className="text-xl font-serif font-bold text-primary-900 mb-6">Travel Information</h3>
            <div className="space-y-4">
              {portal.proposal && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h4 className="font-semibold text-gray-900 mb-2">Trip Summary</h4>
                  <p className="text-gray-600 leading-relaxed">{portal.proposal.itinerarySummary}</p>
                </div>
              )}
              {version && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-primary-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-primary-500 mb-1">Duration</div>
                    <div className="text-lg font-bold text-primary-800">{version.durationDays} days</div>
                  </div>
                  <div className="bg-primary-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-primary-500 mb-1">Destinations</div>
                    <div className="text-lg font-bold text-primary-800">{destinations.length}</div>
                  </div>
                  {version.estimatedCost && (
                    <div className="bg-primary-50 rounded-xl p-4 text-center">
                      <div className="text-xs text-primary-500 mb-1">Estimate</div>
                      <div className="text-lg font-bold text-primary-800">{formatCurrency(version.estimatedCost)}</div>
                    </div>
                  )}
                  <div className="bg-primary-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-primary-500 mb-1">Status</div>
                    <div className="text-lg font-bold text-primary-800 capitalize">{version.status}</div>
                  </div>
                </div>
              )}
              {portal.proposal?.advisorSignOff && (
                <div className="bg-primary-900 text-white rounded-2xl p-6">
                  <p className="text-sm text-gold-400 font-semibold mb-2">From Your Advisor</p>
                  <p className="text-primary-100 leading-relaxed italic">{portal.proposal.advisorSignOff}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">Documents</h4>
                <p className="text-sm text-gray-500">Travel documents, confirmations, and booking details will appear here once finalized.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
