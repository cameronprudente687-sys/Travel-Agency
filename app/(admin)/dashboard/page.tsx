import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { LeadStatusBadge } from "@/components/admin/LeadStatusBadge"
import { formatDateShort } from "@/lib/utils"
import {
  Users, Inbox, Map, Globe, UserPlus, ArrowRight,
  Star, Clock, Sparkles, MapPin, CheckCircle, AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  // Fetch all the data we need
  const [
    newLeads, planningLeads, bookedLeads, completedLeads,
    recentLeads, totalTemplates, totalPlaces,
    publishedPortals, leadsWithoutPortal, clientAccounts,
  ] = await Promise.all([
    db.customerLead.count({ where: { status: "NEW" } }),
    db.customerLead.count({ where: { status: "PLANNING" } }),
    db.customerLead.count({ where: { status: "BOOKED" } }),
    db.customerLead.count({ where: { status: "COMPLETED" } }),
    db.customerLead.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { survey: true, portalPage: true, _count: { select: { tripVersions: true } } },
    }),
    db.itineraryTemplate.count({ where: { status: "ACTIVE" } }),
    db.savedPlace.count(),
    db.clientPortalPage.count({ where: { portalStatus: "PUBLISHED" } }),
    // Leads in planning+ without a portal
    db.customerLead.count({
      where: { status: { in: ["PLANNING", "PROPOSAL_SENT", "BOOKED"] }, portalPage: null },
    }),
    // Count client accounts
    db.user.count({ where: { role: "CLIENT" } }),
  ])

  const leadsWithoutAccount = Math.max(0, publishedPortals - clientAccounts)

  // Find leads that need attention
  const needsReview = recentLeads.filter(l => l.status === "NEW")
  const inProgress = recentLeads.filter(l => l.status === "PLANNING")
  const needsPublish = recentLeads.filter(l => l._count.tripVersions > 0 && !l.portalPage)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  })()

  return (
    <div className="flex flex-col min-h-full bg-sand-50/30">
      {/* Hero greeting */}
      <div className="bg-primary-900 text-white px-6 py-6">
        <h1 className="text-2xl font-serif font-bold">{greeting}</h1>
        <p className="text-primary-300 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex-1 p-6 space-y-6">

        {/* Pipeline — the real workflow stages */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/leads?status=NEW" className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-200 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <Inbox className="w-5 h-5 text-blue-500" />
              {newLeads > 0 && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
            </div>
            <p className="text-2xl font-bold text-gray-900">{newLeads}</p>
            <p className="text-xs text-gray-500">New Leads</p>
          </Link>
          <Link href="/leads?status=PLANNING" className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-200 transition-colors">
            <Map className="w-5 h-5 text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{planningLeads}</p>
            <p className="text-xs text-gray-500">In Planning</p>
          </Link>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <Globe className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{publishedPortals}</p>
            <p className="text-xs text-gray-500">Active Portals</p>
          </div>
          <Link href="/leads?status=BOOKED" className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-200 transition-colors">
            <CheckCircle className="w-5 h-5 text-emerald-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{bookedLeads}</p>
            <p className="text-xs text-gray-500">Booked</p>
          </Link>
        </div>

        {/* Attention needed */}
        {(newLeads > 0 || leadsWithoutPortal > 0 || leadsWithoutAccount > 0) && (
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-900">Needs Attention</h2>
            </div>
            <div className="space-y-2">
              {newLeads > 0 && (
                <Link href="/leads?status=NEW" className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-amber-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-700">{newLeads} new lead{newLeads > 1 ? "s" : ""} to review</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              )}
              {leadsWithoutPortal > 0 && (
                <Link href="/leads?status=PLANNING" className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-amber-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm text-gray-700">{leadsWithoutPortal} trip{leadsWithoutPortal > 1 ? "s" : ""} ready to publish</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              )}
              {leadsWithoutAccount > 0 && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-sm text-gray-700">{leadsWithoutAccount} portal{leadsWithoutAccount > 1 ? "s" : ""} missing customer login</span>
                  </div>
                  <UserPlus className="w-3.5 h-3.5 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent leads — the main working list */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
              <Button asChild variant="ghost" size="sm" className="text-primary-700 text-xs">
                <Link href="/leads">All leads <ArrowRight className="ml-1 w-3 h-3" /></Link>
              </Button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentLeads.map((lead) => {
                const styles = lead.survey?.travelStyles ? JSON.parse(lead.survey.travelStyles).slice(0, 2) : []
                const hasVersions = lead._count.tripVersions > 0
                const hasPortal = !!lead.portalPage
                return (
                  <Link key={lead.id} href={`/leads/${lead.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                      {lead.firstName[0]}{lead.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm group-hover:text-primary-700 transition-colors">{lead.firstName} {lead.lastName}</span>
                        {hasVersions && !hasPortal && <span className="text-xs text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">Draft</span>}
                        {hasPortal && <Globe className="w-3 h-3 text-green-500" />}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        {styles.length > 0 && <span>{styles.join(", ")}</span>}
                        {styles.length > 0 && <span>·</span>}
                        <span>{formatDateShort(lead.updatedAt)}</span>
                      </div>
                    </div>
                    <LeadStatusBadge status={lead.status} />
                  </Link>
                )
              })}
              {recentLeads.length === 0 && (
                <div className="px-5 py-12 text-center text-gray-400 text-sm">
                  No leads yet. Share your survey link to get started.
                </div>
              )}
            </div>
          </div>

          {/* Right column — quick access */}
          <div className="space-y-5">
            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
              <div className="space-y-1.5">
                {[
                  { label: "Review New Leads", href: "/leads?status=NEW", icon: Inbox, show: newLeads > 0 },
                  { label: "Continue Planning", href: "/leads?status=PLANNING", icon: Map, show: planningLeads > 0 },
                  { label: "Browse Templates", href: "/templates", icon: Star, show: true },
                  { label: "Saved Places", href: "/places", icon: MapPin, show: true },
                  { label: "Settings", href: "/settings", icon: Clock, show: true },
                ].filter(a => a.show).map(action => (
                  <Link key={action.href} href={action.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    <action.icon className="w-4 h-4 text-gray-400" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Library stats */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Your Library</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/templates" className="bg-primary-50 rounded-lg p-3 text-center hover:bg-primary-100 transition-colors">
                  <Star className="w-4 h-4 text-primary-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-primary-800">{totalTemplates}</p>
                  <p className="text-xs text-primary-500">Templates</p>
                </Link>
                <Link href="/places" className="bg-gold-50 rounded-lg p-3 text-center hover:bg-gold-100 transition-colors">
                  <Sparkles className="w-4 h-4 text-gold-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-primary-800">{totalPlaces}</p>
                  <p className="text-xs text-gold-600">Saved Places</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
