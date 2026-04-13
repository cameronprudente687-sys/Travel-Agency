import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, formatCurrency, parseJsonField } from "@/lib/utils"
import {
  Mail, Phone, MapPin, Users, DollarSign, Clock,
  Compass, FileText, Edit, Globe
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

  // Fetch templates for itinerary builder start-from-template
  const itineraryTemplates = await db.itineraryTemplate.findMany({
    where: { status: "ACTIVE" },
    orderBy: { isBestSeller: "desc" },
    include: { days: { orderBy: { dayNumber: "asc" } } },
    take: 12,
  })

  if (!lead) notFound()

  // Fetch customer account linked to this lead
  const customerAccount = await db.user.findFirst({
    where: { leadId: lead.id, role: "CLIENT" },
  })

  const survey = lead.survey
  const aiSummary = lead.summary
  const destinations = parseJsonField<string[]>(survey?.destinationsList, [])
  const styles = parseJsonField<string[]>(survey?.travelStyles, [])
  const interests = parseJsonField<string[]>(survey?.interests, [])
  const bestFitDests = parseJsonField<any[]>(aiSummary?.bestFitDestinations, [])
  const activitiesRec = parseJsonField<string[]>(aiSummary?.activitiesRecommended, [])
  const avoidPatterns = parseJsonField<string[]>(aiSummary?.avoidPatterns, [])



  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title={`${lead.firstName} ${lead.lastName}`} subtitle={lead.email} />

      <div className="flex-1 p-6 space-y-6">
        {/* Lead Header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                {lead.firstName[0]}{lead.lastName[0]}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {lead.firstName} {lead.lastName}
                </h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
                  <span className="text-xs text-gray-500">{formatDate(lead.createdAt)}</span>
                  {survey?.oneWord && (
                    <span className="text-xs bg-gold-100 text-gold-800 rounded-full px-2 py-0.5 font-medium">
                      &ldquo;{survey.oneWord}&rdquo;
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <ItineraryBuilder leadId={lead.id} templates={itineraryTemplates} />
              {lead.portalPage && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/${lead.portalPage.slug}`} target="_blank">View Portal</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />{lead.email}
            </div>
            {lead.phone && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />{lead.phone}
              </div>
            )}
            {survey?.travelerType && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                {survey.travelerType.replace(/_/g, ' ')} · {survey.groupSize || 2} travelers
              </div>
            )}
            {survey?.budget && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <DollarSign className="w-4 h-4 text-gray-400" />{survey.budget.replace(/_/g, ' ')}
              </div>
            )}
            {survey?.pacePreference && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />{survey.pacePreference} pace
              </div>
            )}
          </div>

          {(destinations.length > 0 || styles.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {destinations.map(d => (
                <span key={d} className="text-xs bg-primary-50 text-primary-700 rounded-full px-3 py-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {d}
                </span>
              ))}
              {styles.map(s => (
                <span key={s} className="text-xs bg-sand-200 text-primary-700 rounded-full px-3 py-1">{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        {/* Workflow Guide */}
        <WorkflowGuide
          hasSurvey={!!lead.survey}
          hasVersions={lead.tripVersions.length > 0}
          hasPortal={!!lead.portalPage}
          portalPublished={lead.portalPage?.portalStatus === "PUBLISHED"}
          hasCustomerAccount={!!customerAccount}
        />

        <Tabs defaultValue="overview">
          <TabsList className="bg-white border border-gray-200 h-auto p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="survey">Survey</TabsTrigger>
            {aiSummary && <TabsTrigger value="ai-summary">AI Summary</TabsTrigger>}
            <TabsTrigger value="versions">Versions ({lead.tripVersions.length})</TabsTrigger>
            <TabsTrigger value="notes">Notes ({lead.leadNotes.length})</TabsTrigger>
            <TabsTrigger value="portal">Portal</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {survey?.tripFeeling && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Trip Feeling</h3>
                  <blockquote className="text-lg text-primary-800 font-serif italic leading-relaxed">
                    &ldquo;{survey.tripFeeling}&rdquo;
                  </blockquote>
                </div>
              )}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Key Preferences</h3>
                <div className="space-y-3">
                  {[
                    { label: "Duration", value: survey?.tripDurationMin && survey?.tripDurationMax ? `${survey.tripDurationMin}–${survey.tripDurationMax} days` : null },
                    { label: "Budget", value: survey?.budget?.replace(/_/g, ' ') },
                    { label: "Pace", value: survey?.pacePreference },
                    { label: "Dining Style", value: survey?.diningStyle },
                    { label: "Planning Style", value: survey?.planningInvolvement?.replace(/_/g, ' ') },
                  ].filter(p => p.value).map(p => (
                    <div key={p.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{p.label}</span>
                      <span className="font-medium text-gray-800 capitalize">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {interests.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.map(i => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1">{i}</span>
                    ))}
                  </div>
                </div>
              )}
              {survey?.mustHaveExperiences && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Must-Have Experiences</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{survey.mustHaveExperiences}</p>
                </div>
              )}
            </div>
            {aiSummary && (
              <div className="mt-6 bg-gradient-to-r from-primary-50 to-sand-50 rounded-xl border border-primary-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Compass className="w-4 h-4 text-primary-700" />
                  <h3 className="text-sm font-semibold text-primary-800">AI Traveler Profile</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{aiSummary.travelerSummary}</p>
                <div className="text-xs text-primary-600 font-medium">Ideal Trip Style: {aiSummary.idealTripStyle}</div>
              </div>
            )}
          </TabsContent>

          {/* Survey Tab */}
          <TabsContent value="survey" className="mt-4">
            {survey ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Traveler Info", items: [["Type", survey.travelerType?.replace(/_/g, ' ')], ["Group Size", survey.groupSize?.toString()]] },
                  { title: "Trip Basics", items: [["Duration", survey.tripDurationMin ? `${survey.tripDurationMin}–${survey.tripDurationMax} days` : null], ["Budget", survey.budget?.replace(/_/g, ' ')], ["Budget Flexible", survey.budgetFlexible ? "Yes" : "No"], ["Months", parseJsonField<number[]>(survey.tripMonths, []).map(m => new Date(2024, m-1).toLocaleString('default', {month: 'short'})).join(', ')]] },
                  { title: "Travel Style", items: [["Styles", parseJsonField<string[]>(survey.travelStyles, []).join(', ')], ["Pace", survey.pacePreference], ["Accommodation", parseJsonField<string[]>(survey.accommodationType, []).join(', ')]] },
                  { title: "Food & Dining", items: [["Dining Importance", survey.diningImportance ? `${survey.diningImportance}/10` : null], ["Dining Style", survey.diningStyle], ["Restrictions", parseJsonField<string[]>(survey.dietaryRestrictions, []).join(', ')]] },
                  { title: "Previous Travel", items: [["Countries Visited", parseJsonField<string[]>(survey.countriesVisited, []).slice(0, 6).join(', ')], ["Favorite Trip", survey.favoriteTrip], ["Least Favorite", survey.worstTripAspect]] },
                  { title: "Planning Style", items: [["Involvement", survey.planningInvolvement?.replace(/_/g, ' ')], ["Communication", survey.communicationPref]] },
                  { title: "Special Requests", items: [["Celebration", survey.celebrationDetails], ["Accessibility", survey.accessibilityNeeds], ["Other", survey.otherRequests]] },
                ].map((section) => (
                  <div key={section.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{section.title}</h3>
                    <div className="space-y-2">
                      {section.items.filter(([, v]) => v).map(([label, value]) => (
                        <div key={label} className="flex justify-between text-sm gap-4">
                          <span className="text-gray-500 shrink-0">{label}</span>
                          <span className="text-gray-800 text-right capitalize">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {survey.tripFeeling && (
                  <div className="bg-primary-50 rounded-xl border border-primary-100 p-5 md:col-span-2">
                    <h3 className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-2">The Feeling They&apos;re After</h3>
                    <p className="text-gray-800 text-sm italic">&ldquo;{survey.tripFeeling}&rdquo;</p>
                    {survey.oneWord && <p className="text-primary-600 font-semibold mt-2">One word: &ldquo;{survey.oneWord}&rdquo;</p>}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">No survey submitted yet</div>
            )}
          </TabsContent>

          {/* AI Summary Tab */}
          {aiSummary && (
            <TabsContent value="ai-summary" className="mt-4">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-primary-50 to-sand-50 rounded-xl border border-primary-100 p-6">
                  <h3 className="font-semibold text-primary-800 mb-3">Traveler Profile</h3>
                  <p className="text-gray-700 leading-relaxed">{aiSummary.travelerSummary}</p>
                  <div className="mt-4 pt-4 border-t border-primary-100">
                    <span className="text-sm font-semibold text-primary-700">Ideal Trip Style: </span>
                    <span className="text-sm text-gray-700">{aiSummary.idealTripStyle}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Best-Fit Destinations</h3>
                    <div className="space-y-3">
                      {bestFitDests.map((d, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary-700 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">{d.destination}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{d.reason}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pacing & Routing</h3>
                    <p className="text-sm text-gray-700 mb-3">{aiSummary.pacingRecommendation}</p>
                    {aiSummary.routeSuggestion && <p className="text-sm text-gray-600 italic">{aiSummary.routeSuggestion}</p>}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Accommodation & Dining</h3>
                    <div className="space-y-3">
                      <div><div className="text-xs text-gray-500 mb-1">Hotel Style</div><p className="text-sm text-gray-700">{aiSummary.hotelStyle}</p></div>
                      <div><div className="text-xs text-gray-500 mb-1">Dining Focus</div><p className="text-sm text-gray-700">{aiSummary.diningFocus}</p></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recommended Activities</h3>
                    <ul className="space-y-1.5">
                      {activitiesRec.map((a, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2 shrink-0" />{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {avoidPatterns.length > 0 && (
                    <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
                      <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-3">Patterns to Avoid</h3>
                      <ul className="space-y-1.5">
                        {avoidPatterns.map((p, i) => (
                          <li key={i} className="text-sm text-amber-800 flex items-start gap-2"><span className="text-amber-500 shrink-0">⚠</span>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="bg-primary-900 text-white rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wide mb-3">Advisor Notes</h3>
                    <p className="text-sm text-primary-100 leading-relaxed">{aiSummary.advisorNotes}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Trip Versions Tab */}
          <TabsContent value="versions" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <ItineraryBuilder leadId={lead.id} templates={itineraryTemplates} />
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
                  <div key={version.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-gray-400">V{version.versionNumber}</span>
                            <h3 className="font-semibold text-gray-900">{version.title}</h3>
                            <span className={`text-xs rounded-full px-2 py-0.5 ${version.status === 'finalized' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {version.status}
                            </span>
                            {hasLinkedProposal && <span className="text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">Has Proposal</span>}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{version.summary}</p>
                          <div className="flex flex-wrap gap-3 mt-2">
                            {versionDests.map(d => (
                              <span key={d} className="text-xs text-primary-700 bg-primary-50 rounded-full px-2 py-0.5">{d}</span>
                            ))}
                            <span className="text-xs text-gray-500">{version.durationDays} days</span>
                            {versionHotels.length > 0 && <span className="text-xs text-gray-500">{versionHotels.length} hotels</span>}
                            {versionExps.length > 0 && <span className="text-xs text-gray-500">{versionExps.length} experiences</span>}
                            {version.estimatedCost && <span className="text-xs font-medium text-primary-700">{formatCurrency(version.estimatedCost)}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <ItineraryBuilder
                            leadId={lead.id}
                            version={version}
                            templates={itineraryTemplates}
                            trigger={<Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Edit</Button>}
                          />
                          <VersionActions
                            version={version}
                            leadId={lead.id}
                            leadFirstName={lead.firstName}
                            hasProposal={hasLinkedProposal}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Day preview strip */}
                    {itineraryDays.length > 0 && (
                      <div className="px-5 pb-4">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {itineraryDays.slice(0, 8).map((day: any, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 whitespace-nowrap shrink-0">
                              <span className="w-5 h-5 rounded-full bg-primary-700 text-white text-xs flex items-center justify-center font-bold">{day.day || i + 1}</span>
                              {day.title || day.location || `Day ${i + 1}`}
                            </div>
                          ))}
                          {itineraryDays.length > 8 && (
                            <span className="text-xs text-gray-400 self-center">+{itineraryDays.length - 8} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {lead.tripVersions.length === 0 && (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">No trip versions yet</p>
                  <p className="text-sm text-gray-400 mb-4">Build a visual itinerary with the builder above</p>
                  <ItineraryBuilder leadId={lead.id} templates={itineraryTemplates} />
                </div>
              )}
            </div>
          </TabsContent>


          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-4">
            <div className="space-y-4">
              {lead.leadNotes.map(note => (
                <div key={note.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{note.author}</span>
                    <span className="text-xs text-gray-400">{formatDate(note.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{note.content}</p>
                </div>
              ))}
              <AddNoteForm leadId={lead.id} />
            </div>
          </TabsContent>

          {/* Portal Tab */}
          <TabsContent value="portal" className="mt-4">
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
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                <Globe className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-2">No portal yet</p>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Build an itinerary, generate a proposal, then click &ldquo;Publish to Portal&rdquo; on the Proposals tab to create the customer portal.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
