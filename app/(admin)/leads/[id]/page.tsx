import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, formatCurrency, parseJsonField } from "@/lib/utils"
import {
  Mail, Phone, MapPin, Users, DollarSign, Clock,
  Compass, FileText, Edit, Globe, Star, Calendar
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ItineraryBuilder } from "@/components/admin/ItineraryBuilder"
import { VersionActions } from "@/components/admin/VersionActions"
import { VersionComparison } from "@/components/admin/VersionComparison"
import { AddNoteForm } from "@/components/admin/AddNoteForm"
import { PortalControls } from "@/components/admin/PortalControls"
import { WorkflowGuide } from "@/components/admin/WorkflowGuide"

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await db.customerLead.findUnique({
    where: { id: params.id },
    include: {
      survey: true,
      summary: true,
      tripVersions: { orderBy: { versionNumber: "asc" } },
      proposals: { orderBy: { createdAt: "desc" } },
      leadNotes: { orderBy: { createdAt: "desc" } },
      portalPage: {
        include: {
          checklistItems: { orderBy: [{ category: "asc" }, { sortOrder: "asc" }] },
        },
      },
    },
  })

  const checklistTemplates = await db.checklistTemplate.findMany({ orderBy: { name: "asc" } })
  const itineraryTemplates = await db.itineraryTemplate.findMany({
    where: { status: "ACTIVE" },
    orderBy: { isBestSeller: "desc" },
    include: { days: { orderBy: { dayNumber: "asc" } } },
    take: 12,
  })

  if (!lead) notFound()

  const customerAccount = await db.user.findFirst({
    where: { leadId: lead.id, role: "CLIENT" },
  })

  const survey = lead.survey
  const aiSummary = lead.summary
  const clientFullName = `${lead.firstName} ${lead.lastName}`
  // Serializable survey for client components (strip Date fields)
  const surveyForBuilder = survey ? {
    travelerType: survey.travelerType, groupSize: survey.groupSize,
    budget: survey.budget, tripDurationMin: survey.tripDurationMin,
    tripDurationMax: survey.tripDurationMax, pacePreference: survey.pacePreference,
    travelStyles: survey.travelStyles, accommodationType: survey.accommodationType,
    interests: survey.interests, mustHaveExperiences: survey.mustHaveExperiences,
    avoidExperiences: survey.avoidExperiences, diningImportance: survey.diningImportance,
    diningStyle: survey.diningStyle, dietaryRestrictions: survey.dietaryRestrictions,
    tripFeeling: survey.tripFeeling, oneWord: survey.oneWord,
    destinationsList: survey.destinationsList,
    celebrationDetails: survey.celebrationDetails,
    accessibilityNeeds: survey.accessibilityNeeds,
    otherRequests: survey.otherRequests,
  } : undefined
  const destinations = parseJsonField<string[]>(survey?.destinationsList, [])
  const styles = parseJsonField<string[]>(survey?.travelStyles, [])
  const interests = parseJsonField<string[]>(survey?.interests, [])
  const bestFitDests = parseJsonField<any[]>(aiSummary?.bestFitDestinations, [])
  const activitiesRec = parseJsonField<string[]>(aiSummary?.activitiesRecommended, [])
  const avoidPatterns = parseJsonField<string[]>(aiSummary?.avoidPatterns, [])

  return (
    <div className="flex flex-col min-h-full bg-sand-50/50">
      {/* Hero Header — replaces plain AdminHeader */}
      <div className="bg-primary-900 text-white px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xl font-serif">
              {lead.firstName[0]}{lead.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold">{lead.firstName} {lead.lastName}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-primary-300 text-sm">{lead.email}</span>
                {lead.phone && <span className="text-primary-400 text-sm">{lead.phone}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
            <ItineraryBuilder leadId={lead.id} templates={itineraryTemplates} survey={surveyForBuilder} clientName={clientFullName} />
            {lead.portalPage && (
              <Button asChild variant="outline" size="sm" className="border-white/30 text-white bg-white/10 hover:bg-white/20">
                <Link href={`/portal/${lead.portalPage.slug}`} target="_blank">View Portal</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10 text-sm text-primary-300">
          {survey?.travelerType && (
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{survey.travelerType.replace(/_/g, " ")} · {survey.groupSize || 2}</span>
          )}
          {survey?.budget && (
            <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />{survey.budget.replace(/_/g, " ")}</span>
          )}
          {survey?.tripDurationMin && (
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{survey.tripDurationMin}–{survey.tripDurationMax} days</span>
          )}
          {survey?.pacePreference && (
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{survey.pacePreference} pace</span>
          )}
          {destinations.length > 0 && (
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gold-400" />{destinations.join(", ")}</span>
          )}
          {survey?.oneWord && (
            <span className="text-gold-300 font-medium">&ldquo;{survey.oneWord}&rdquo;</span>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 space-y-5">
        {/* Workflow + travel style tags */}
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1">
            <WorkflowGuide
              hasSurvey={!!lead.survey}
              hasVersions={lead.tripVersions.length > 0}
              hasPortal={!!lead.portalPage}
              portalPublished={lead.portalPage?.portalStatus === "PUBLISHED"}
              hasCustomerAccount={!!customerAccount}
            />
          </div>

          {/* Trip feeling — the most important insight */}
          {survey?.tripFeeling && (
            <div className="lg:w-80 bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gold-600 uppercase tracking-wide mb-2">How they want it to feel</p>
              <blockquote className="text-base text-primary-800 font-serif italic leading-relaxed">
                &ldquo;{survey.tripFeeling}&rdquo;
              </blockquote>
              {styles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                  {styles.map(s => (
                    <span key={s} className="text-xs text-primary-700 bg-primary-50 rounded px-2 py-0.5">{s}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue={lead.tripVersions.length > 0 ? "versions" : "overview"}>
          <TabsList className="bg-white border border-gray-200 h-auto p-1 rounded-lg">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700">Overview</TabsTrigger>
            <TabsTrigger value="versions" className="rounded-md data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700">
              Itineraries {lead.tripVersions.length > 0 && <span className="ml-1 text-xs bg-primary-100 text-primary-700 rounded-full px-1.5">{lead.tripVersions.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="portal" className="rounded-md data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700">
              Portal {lead.portalPage?.portalStatus === "PUBLISHED" && <span className="ml-1 w-2 h-2 rounded-full bg-green-500 inline-block" />}
            </TabsTrigger>
            <TabsTrigger value="notes" className="rounded-md data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700">
              Notes {lead.leadNotes.length > 0 && <span className="ml-1 text-xs text-gray-400">{lead.leadNotes.length}</span>}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left column — preferences */}
              <div className="lg:col-span-2 space-y-5">
                {/* Key preferences */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Trip Preferences</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Duration", value: survey?.tripDurationMin && survey?.tripDurationMax ? `${survey.tripDurationMin}–${survey.tripDurationMax} days` : null, icon: Calendar },
                      { label: "Budget", value: survey?.budget?.replace(/_/g, " "), icon: DollarSign },
                      { label: "Pace", value: survey?.pacePreference, icon: Clock },
                      { label: "Dining", value: survey?.diningStyle, icon: Star },
                      { label: "Planning", value: survey?.planningInvolvement?.replace(/_/g, " "), icon: Users },
                      { label: "Contact", value: survey?.communicationPref, icon: Mail },
                    ].filter(p => p.value).map(p => (
                      <div key={p.label} className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sand-100 flex items-center justify-center shrink-0 mt-0.5">
                          <p.icon className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{p.label}</p>
                          <p className="text-sm font-medium text-gray-800 capitalize">{p.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interests + must-haves */}
                {(interests.length > 0 || survey?.mustHaveExperiences) && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Interests & Must-Haves</h3>
                    {interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {interests.map(i => (
                          <span key={i} className="text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">{i}</span>
                        ))}
                      </div>
                    )}
                    {survey?.mustHaveExperiences && (
                      <p className="text-sm text-gray-600 leading-relaxed">{survey.mustHaveExperiences}</p>
                    )}
                  </div>
                )}

                {/* Survey details — collapsed into sections */}
                {survey && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Full Survey Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                      {[
                        ["Type", survey.travelerType?.replace(/_/g, " ")],
                        ["Group", survey.groupSize?.toString()],
                        ["Styles", parseJsonField<string[]>(survey.travelStyles, []).join(", ")],
                        ["Accommodation", parseJsonField<string[]>(survey.accommodationType, []).join(", ")],
                        ["Dining Importance", survey.diningImportance ? `${survey.diningImportance}/10` : null],
                        ["Restrictions", parseJsonField<string[]>(survey.dietaryRestrictions, []).join(", ")],
                        ["Countries Visited", parseJsonField<string[]>(survey.countriesVisited, []).slice(0, 5).join(", ")],
                        ["Favorite Trip", survey.favoriteTrip],
                        ["Celebration", survey.celebrationDetails],
                        ["Accessibility", survey.accessibilityNeeds],
                      ].filter(([, v]) => v).map(([label, value]) => (
                        <div key={label} className="flex justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
                          <span className="text-gray-500">{label}</span>
                          <span className="text-gray-800 text-right capitalize max-w-[60%] truncate">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column — AI profile */}
              <div className="space-y-5">
                {aiSummary && (
                  <>
                    <div className="bg-gradient-to-br from-primary-50 to-sand-50 rounded-xl border border-primary-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Compass className="w-4 h-4 text-primary-600" />
                        <h3 className="text-sm font-semibold text-primary-800">Traveler Profile</h3>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{aiSummary.travelerSummary}</p>
                      <p className="text-xs text-primary-600 font-medium mt-3">{aiSummary.idealTripStyle}</p>
                    </div>

                    {bestFitDests.length > 0 && (
                      <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommended Destinations</h3>
                        <div className="space-y-2.5">
                          {bestFitDests.slice(0, 3).map((d, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-primary-700 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{d.destination}</p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{d.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-primary-900 text-white rounded-xl p-5">
                      <h3 className="text-xs font-semibold text-gold-400 uppercase tracking-wide mb-2">Advisor Notes</h3>
                      <p className="text-sm text-primary-200 leading-relaxed">{aiSummary.advisorNotes}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Itineraries Tab */}
          <TabsContent value="versions" className="mt-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <ItineraryBuilder leadId={lead.id} templates={itineraryTemplates} survey={surveyForBuilder} clientName={clientFullName} />
                {lead.tripVersions.length >= 2 && (
                  <VersionComparison versions={lead.tripVersions} />
                )}
              </div>
              {lead.tripVersions.map(version => {
                const versionDests = parseJsonField<string[]>(version.destinations, [])
                const itineraryDays = parseJsonField<any[]>(version.itinerary, [])
                const versionHotels = parseJsonField<any[]>(version.hotelIdeas, [])
                const versionExps = parseJsonField<any[]>(version.experiences, [])
                const hasLinkedProposal = lead.proposals.some((p: any) => p.versionId === version.id)
                return (
                  <div key={version.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-primary-400 bg-primary-50 rounded px-1.5 py-0.5">V{version.versionNumber}</span>
                            <h3 className="font-semibold text-gray-900 text-base">{version.title}</h3>
                            <span className={`text-xs rounded-full px-2 py-0.5 ${version.status === "finalized" ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                              {version.status}
                            </span>
                            {hasLinkedProposal && <span className="text-xs text-green-600 flex items-center gap-0.5"><Globe className="w-3 h-3" /> Published</span>}
                          </div>
                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{version.summary}</p>
                          <div className="flex flex-wrap gap-3 mt-2.5">
                            {versionDests.map(d => (
                              <span key={d} className="text-xs text-primary-700 bg-primary-50 rounded-full px-2.5 py-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{d}</span>
                            ))}
                            <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{version.durationDays} days</span>
                            {versionHotels.length > 0 && <span className="text-xs text-gray-500">{versionHotels.length} hotels</span>}
                            {versionExps.length > 0 && <span className="text-xs text-gray-500">{versionExps.length} experiences</span>}
                            {version.estimatedCost && <span className="text-sm font-semibold text-primary-700">{formatCurrency(version.estimatedCost)}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <ItineraryBuilder
                            leadId={lead.id}
                            version={version}
                            templates={itineraryTemplates}
                            survey={surveyForBuilder}
                            clientName={clientFullName}
                            trigger={<Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Edit</Button>}
                          />
                          <VersionActions version={version} leadId={lead.id} leadFirstName={lead.firstName} hasProposal={hasLinkedProposal} />
                        </div>
                      </div>
                    </div>
                    {itineraryDays.length > 0 && (
                      <div className="px-5 pb-4 pt-1 border-t border-gray-50">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {itineraryDays.slice(0, 8).map((day: any, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 bg-sand-50 border border-sand-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 whitespace-nowrap shrink-0">
                              <span className="w-5 h-5 rounded-full bg-primary-700 text-white text-xs flex items-center justify-center font-bold">{day.day || i + 1}</span>
                              {day.title || day.location || `Day ${i + 1}`}
                            </div>
                          ))}
                          {itineraryDays.length > 8 && <span className="text-xs text-gray-400 self-center">+{itineraryDays.length - 8}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {lead.tripVersions.length === 0 && (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-1">No itineraries yet</p>
                  <p className="text-sm text-gray-400 mb-5">Click &ldquo;Build Itinerary&rdquo; above to start designing this trip</p>
                  <ItineraryBuilder leadId={lead.id} templates={itineraryTemplates} survey={surveyForBuilder} clientName={clientFullName} />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Portal Tab */}
          <TabsContent value="portal" className="mt-5">
            {lead.portalPage ? (
              <PortalControls
                portal={lead.portalPage}
                leadId={lead.id}
                leadEmail={lead.email}
                leadFirstName={lead.firstName}
                customerAccount={customerAccount ? { id: customerAccount.id, email: customerAccount.email, name: customerAccount.name, createdAt: customerAccount.createdAt.toISOString() } : null}
                checklistItems={lead.portalPage.checklistItems}
                checklistTemplates={checklistTemplates}
              />
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
                <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-1">No portal yet</p>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Build an itinerary first, then click &ldquo;Publish Trip&rdquo; to create the customer portal.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-5">
            <div className="space-y-3">
              {lead.leadNotes.map(note => (
                <div key={note.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{note.author}</span>
                    <span className="text-xs text-gray-400">{formatDate(note.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{note.content}</p>
                </div>
              ))}
              <AddNoteForm leadId={lead.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
