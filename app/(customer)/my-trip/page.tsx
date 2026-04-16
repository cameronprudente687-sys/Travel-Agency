import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseJsonField, formatCurrency } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin, Calendar, Star, Hotel, Sparkles, CheckCircle,
  Clock, ChevronRight, Utensils, Compass, Plane, Heart
} from "lucide-react"
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
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Compass className="w-10 h-10 text-primary-600" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-primary-900 mb-3">Your trip is being crafted</h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Your advisor is putting the finishing touches on a personalized itinerary just for you. Check back soon.
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

  let showPricing = false
  if (version?.notes) {
    try { const parsed = JSON.parse(version.notes); showPricing = parsed.pricing?.showOnPortal ?? false } catch {}
  }

  const totalItems = portal.checklistItems.length
  const completedItems = portal.checklistItems.filter(i => i.completions.length > 0 && i.completions[0].completed).length
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const preTripItems = portal.checklistItems.filter(i => i.category === "PRE_TRIP")
  const dayItems = portal.checklistItems.filter(i => i.category === "DAY_ACTIVITY")
  const duringItems = portal.checklistItems.filter(i => i.category === "DURING_TRIP")
  const postItems = portal.checklistItems.filter(i => i.category === "POST_TRIP")

  return (
    <div className="bg-sand-50/30 min-h-screen">
      {/* Hero — premium full-bleed */}
      <div className="relative bg-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(201,168,76,0.4) 0%, transparent 60%)" }} />

        <div className="relative z-10 max-w-lg mx-auto px-5 pt-10 pb-8 sm:pt-14 sm:pb-10 text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 mb-5 text-xs text-gold-300 border border-white/10">
            <Compass className="w-3 h-3" /> Your Personalized Trip
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold leading-tight mb-3">{portal.title}</h1>

          {destinations.length > 0 && (
            <p className="text-primary-200 text-base mb-4">{destinations.join(" · ")}</p>
          )}

          <div className="flex items-center justify-center gap-5 text-sm text-primary-300">
            {version && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {version.durationDays} days</span>}
            {hotelIdeas.length > 0 && <span className="flex items-center gap-1"><Hotel className="w-4 h-4" /> {hotelIdeas.length} stays</span>}
            {experiences.length > 0 && <span className="flex items-center gap-1"><Sparkles className="w-4 h-4" /> {experiences.length} experiences</span>}
          </div>

          {showPricing && version?.estimatedCost && (
            <p className="text-gold-300 text-sm mt-3">Estimated from {formatCurrency(version.estimatedCost)}</p>
          )}
        </div>
      </div>

      {/* Progress */}
      {totalItems > 0 && <TripProgress completed={completedItems} total={totalItems} percent={progressPercent} />}

      {/* Advisor note — personal concierge style */}
      {portal.advisorMessage && (
        <div className="max-w-lg mx-auto px-5 mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-gold-500" />
              <p className="text-xs font-semibold text-gold-700 uppercase tracking-wide">From Your Advisor</p>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{portal.advisorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Content — mobile-first max-w-lg */}
      <div className="max-w-lg mx-auto px-5 py-6">
        <Tabs defaultValue="overview">
          {/* Mobile-friendly pill tabs */}
          <TabsList className="bg-white border border-gray-200 rounded-xl h-auto p-1 grid grid-cols-3 sm:flex sm:flex-wrap gap-0.5 mb-6">
            <TabsTrigger value="overview" className="rounded-lg text-sm py-2 data-[state=active]:bg-primary-700 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="itinerary" className="rounded-lg text-sm py-2 data-[state=active]:bg-primary-700 data-[state=active]:text-white">Itinerary</TabsTrigger>
            <TabsTrigger value="checklist" className="rounded-lg text-sm py-2 data-[state=active]:bg-primary-700 data-[state=active]:text-white">
              Checklist {totalItems > 0 && <span className="ml-1 text-xs opacity-70">{completedItems}/{totalItems}</span>}
            </TabsTrigger>
            <TabsTrigger value="hotels" className="rounded-lg text-sm py-2 data-[state=active]:bg-primary-700 data-[state=active]:text-white">Stays</TabsTrigger>
            <TabsTrigger value="experiences" className="rounded-lg text-sm py-2 data-[state=active]:bg-primary-700 data-[state=active]:text-white">Experiences</TabsTrigger>
            <TabsTrigger value="info" className="rounded-lg text-sm py-2 data-[state=active]:bg-primary-700 data-[state=active]:text-white">Info</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-serif font-bold text-primary-900 mb-2">Welcome, {lead.firstName}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{portal.welcomeMessage}</p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <Calendar className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-primary-800">{version?.durationDays || 0}</p>
                  <p className="text-xs text-gray-400">days</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <Hotel className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-primary-800">{hotelIdeas.length}</p>
                  <p className="text-xs text-gray-400">stays</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <Sparkles className="w-5 h-5 text-gold-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-primary-800">{experiences.length}</p>
                  <p className="text-xs text-gray-400">experiences</p>
                </div>
              </div>

              {/* Highlights */}
              {highlights.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Trip Highlights</h3>
                  <div className="space-y-2">
                    {highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-3.5 border border-gray-100">
                        <Star className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{h}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inclusions.length > 0 && (
                <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
                  <h3 className="text-sm font-semibold text-primary-800 mb-3">What&apos;s Included</h3>
                  <div className="space-y-1.5">
                    {inclusions.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ITINERARY */}
          <TabsContent value="itinerary">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Day-by-Day Journey</h3>
            <div className="space-y-3">
              {itinerary.map((day: any, i: number) => {
                const acts = Array.isArray(day.activities) ? day.activities : parseJsonField<string[]>(day.activities, [])
                const meals = Array.isArray(day.meals) ? day.meals : parseJsonField<string[]>(day.meals, [])
                const transports = Array.isArray(day.transports) ? day.transports : []
                const actNotes = Array.isArray(day.activityNotes) ? day.activityNotes : []
                const mealNotes = Array.isArray(day.mealNotes) ? day.mealNotes : []
                const transportNotes = Array.isArray(day.transportNotes) ? day.transportNotes : []

                return (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Day header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-primary-900 text-white">
                      <div className="w-8 h-8 rounded-full bg-gold-500 text-primary-900 text-sm font-bold flex items-center justify-center shrink-0">
                        {day.day || day.dayNumber || i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{day.title}</p>
                        {day.location && <p className="text-xs text-primary-300">{day.location}</p>}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {day.description && <p className="text-sm text-gray-600 leading-relaxed">{day.description}</p>}

                      {/* Accommodation */}
                      {day.accommodation && (
                        <div className="flex items-start gap-2.5 bg-primary-50 rounded-lg p-3">
                          <Hotel className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-primary-800">{day.accommodation}</p>
                            {day.accommodationNote && <p className="text-xs text-primary-500 italic mt-0.5">{day.accommodationNote}</p>}
                          </div>
                        </div>
                      )}

                      {/* Activities */}
                      {acts.length > 0 && (
                        <div className="space-y-1.5">
                          {acts.map((a: string, j: number) => (
                            <div key={j} className="flex items-start gap-2.5">
                              <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-1" />
                              <div>
                                <p className="text-sm text-gray-700">{a}</p>
                                {actNotes[j] && <p className="text-xs text-gray-400 italic">{actNotes[j]}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Meals */}
                      {meals.length > 0 && (
                        <div className="space-y-1.5">
                          {meals.map((m: string, j: number) => (
                            <div key={j} className="flex items-start gap-2.5">
                              <Utensils className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-1" />
                              <div>
                                <p className="text-sm text-gray-700">{m}</p>
                                {mealNotes[j] && <p className="text-xs text-gray-400 italic">{mealNotes[j]}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Transport */}
                      {transports.length > 0 && (
                        <div className="space-y-1.5">
                          {transports.map((t: string, j: number) => (
                            <div key={j} className="flex items-start gap-2.5">
                              <Plane className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-1" />
                              <div>
                                <p className="text-sm text-gray-500">{t}</p>
                                {transportNotes[j] && <p className="text-xs text-gray-400 italic">{transportNotes[j]}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {itinerary.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Your itinerary is being finalized.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* CHECKLIST */}
          <TabsContent value="checklist">
            <CustomerChecklist userId={user.id} preTripItems={preTripItems} dayItems={dayItems} duringItems={duringItems} postItems={postItems} completedCount={completedItems} totalCount={totalItems} />
          </TabsContent>

          {/* HOTELS */}
          <TabsContent value="hotels">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Where You&apos;ll Stay</h3>
            <div className="space-y-3">
              {hotelIdeas.map((hotel: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-primary-50 px-4 py-3 border-b border-primary-100">
                    <div className="flex items-center gap-2">
                      <Hotel className="w-4 h-4 text-primary-600" />
                      <h4 className="font-semibold text-primary-900 text-sm">{hotel.name}</h4>
                    </div>
                    {hotel.location && <p className="text-xs text-primary-500 ml-6">{hotel.location}</p>}
                  </div>
                  <div className="p-4">
                    {hotel.description && <p className="text-sm text-gray-600 mb-3">{hotel.description}</p>}
                    {hotel.whyRecommended && (
                      <div className="flex items-start gap-2 bg-gold-50 rounded-lg p-3 border border-gold-100">
                        <Star className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-gold-800">{hotel.whyRecommended}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {hotelIdeas.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Hotel className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Accommodations are being curated for you.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* EXPERIENCES */}
          <TabsContent value="experiences">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Curated Experiences</h3>
            <div className="space-y-3">
              {experiences.map((exp: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center shrink-0 text-lg">
                    {exp.emoji || "✨"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm">{exp.name}</h4>
                    {exp.description && <p className="text-sm text-gray-500 mt-0.5">{exp.description}</p>}
                  </div>
                </div>
              ))}
              {experiences.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Experiences are being planned for you.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* INFO */}
          <TabsContent value="info">
            <div className="space-y-4">
              {portal.proposal && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Trip Summary</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{portal.proposal.itinerarySummary}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Duration", value: `${version?.durationDays || 0} days`, icon: Calendar },
                  { label: "Destinations", value: destinations.join(", ") || "TBD", icon: MapPin },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-3.5">
                    <stat.icon className="w-4 h-4 text-primary-500 mb-1.5" />
                    <p className="text-xs text-gray-400">{stat.label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>

              {showPricing && version?.estimatedCost && (
                <div className="bg-gold-50 rounded-xl border border-gold-200 p-4 text-center">
                  <p className="text-xs text-gold-600 mb-1">Estimated Investment</p>
                  <p className="text-xl font-bold text-primary-900">{formatCurrency(version.estimatedCost)}</p>
                </div>
              )}

              {portal.proposal?.advisorSignOff && (
                <div className="bg-primary-900 text-white rounded-2xl p-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Heart className="w-3.5 h-3.5 text-gold-400" />
                    <p className="text-xs text-gold-400 font-semibold uppercase tracking-wide">Your Advisor</p>
                  </div>
                  <p className="text-sm text-primary-200 leading-relaxed italic">{portal.proposal.advisorSignOff}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
