import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { StatCard } from "@/components/admin/StatCard"
import { LeadStatusBadge } from "@/components/admin/LeadStatusBadge"
import { formatDateShort } from "@/lib/utils"
import { Users, TrendingUp, FileText, Map, Star, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const [
    totalLeads,
    newLeads,
    planningLeads,
    proposalLeads,
    bookedLeads,
    recentLeads,
    featuredTemplates,
    totalTemplates,
  ] = await Promise.all([
    db.customerLead.count(),
    db.customerLead.count({ where: { status: "NEW" } }),
    db.customerLead.count({ where: { status: "PLANNING" } }),
    db.customerLead.count({ where: { status: "PROPOSAL_SENT" } }),
    db.customerLead.count({ where: { status: "BOOKED" } }),
    db.customerLead.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { survey: true },
    }),
    db.itineraryTemplate.findMany({
      where: { isFeatured: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    db.itineraryTemplate.count({ where: { status: "ACTIVE" } }),
  ])

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title="Dashboard"
        subtitle={`Welcome back — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      />

      <div className="flex-1 p-6 space-y-8">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Leads" value={totalLeads} icon={Users} color="navy" />
          <StatCard title="New" value={newLeads} icon={TrendingUp} color="info" subtitle="Awaiting contact" />
          <StatCard title="Planning" value={planningLeads} icon={Map} color="amber" subtitle="In progress" />
          <StatCard title="Proposal Sent" value={proposalLeads} icon={FileText} color="gold" subtitle="Awaiting response" />
          <StatCard title="Booked" value={bookedLeads} icon={Star} color="green" subtitle="Confirmed trips" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "View All Leads", href: "/leads", color: "bg-primary-700" },
            { label: "Browse Templates", href: "/templates", color: "bg-gold-600" },
            { label: "Manage Proposals", href: "/proposals", color: "bg-emerald-700" },
            { label: "Settings", href: "/settings", color: "bg-gray-700" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`${action.color} text-white rounded-xl p-4 text-sm font-medium flex items-center justify-between group hover:opacity-90 transition-opacity`}
            >
              {action.label}
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Leads */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Leads</h2>
              <Button asChild variant="ghost" size="sm" className="text-primary-700">
                <Link href="/leads">View all <ArrowRight className="ml-1 w-3 h-3" /></Link>
              </Button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                    {lead.firstName[0]}{lead.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">
                      {lead.firstName} {lead.lastName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {lead.survey?.travelStyles
                        ? JSON.parse(lead.survey.travelStyles).slice(0, 2).join(', ')
                        : lead.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <LeadStatusBadge status={lead.status} />
                    <span className="text-xs text-gray-400">{formatDateShort(lead.createdAt)}</span>
                  </div>
                </Link>
              ))}
              {recentLeads.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-400 text-sm">
                  No leads yet. Share your survey link to get started.
                </div>
              )}
            </div>
          </div>

          {/* Featured Templates */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Top Templates</h2>
              <Button asChild variant="ghost" size="sm" className="text-primary-700">
                <Link href="/templates">View all</Link>
              </Button>
            </div>
            <div className="divide-y divide-gray-50">
              {featuredTemplates.map((t) => (
                <Link
                  key={t.id}
                  href={`/templates/${t.id}`}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">{t.flagEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{t.title}</div>
                    <div className="text-xs text-gray-500">{t.durationDays} days · {t.budgetLevel.replace(/_/g, ' ')}</div>
                  </div>
                  {t.isBestSeller && (
                    <Star className="w-4 h-4 fill-gold-400 text-gold-400 shrink-0" />
                  )}
                </Link>
              ))}
              {featuredTemplates.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">
                  No featured templates yet.
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">{totalTemplates} active templates in library</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
