import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { LeadStatusBadge } from "@/components/admin/LeadStatusBadge"
import { formatDateShort } from "@/lib/utils"
import { Users, Search } from "lucide-react"
import Link from "next/link"

export default async function LeadsPage() {
  const leads = await db.customerLead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      survey: true,
      summary: true,
      _count: { select: { tripVersions: true, proposals: true } },
    },
  })

  const statusCounts = await db.customerLead.groupBy({
    by: ["status"],
    _count: true,
  })

  const countByStatus = statusCounts.reduce((acc, s) => {
    acc[s.status] = s._count
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Leads" subtitle={`${leads.length} total leads`} />

      <div className="flex-1 p-6">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["ALL", "NEW", "CONTACTED", "PLANNING", "PROPOSAL_SENT", "BOOKED", "COMPLETED"].map((status) => {
            const count = status === "ALL" ? leads.length : (countByStatus[status] || 0)
            return (
              <div
                key={status}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 flex items-center gap-1.5"
              >
                {status === "ALL" ? "All Leads" : status.replace(/_/g, " ")}
                <span className="bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 text-xs">{count}</span>
              </div>
            )
          })}
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{leads.length} leads</span>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {leads.map((lead) => {
              const styles = lead.survey?.travelStyles ? JSON.parse(lead.survey.travelStyles) : []
              const destinations = lead.survey?.destinationsList ? JSON.parse(lead.survey.destinationsList) : []

              return (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                    {lead.firstName[0]}{lead.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                        {lead.firstName} {lead.lastName}
                      </span>
                      {lead.summary && (
                        <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">AI Ready</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>{lead.email}</span>
                      {destinations.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{destinations.slice(0, 2).join(', ')}</span>
                        </>
                      )}
                      {styles.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{styles.slice(0, 2).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {lead.survey?.budget && (
                      <span className="text-xs text-gray-500 hidden sm:block">
                        {lead.survey.budget.replace(/_/g, ' ')}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-400 hidden md:flex">
                      <span>{lead._count.tripVersions} versions</span>
                      <span>·</span>
                      <span>{lead._count.proposals} proposals</span>
                    </div>
                    <LeadStatusBadge status={lead.status} />
                    <span className="text-xs text-gray-400">{formatDateShort(lead.createdAt)}</span>
                  </div>
                </Link>
              )
            })}

            {leads.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No leads yet</p>
                <p className="text-gray-400 text-sm mt-1">Share your survey link to start receiving leads</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
