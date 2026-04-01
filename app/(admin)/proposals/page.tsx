import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Badge } from "@/components/ui/badge"
import { formatDateShort } from "@/lib/utils"
import Link from "next/link"
import { FileText } from "lucide-react"

const statusConfig: Record<string, string> = {
  DRAFT: "secondary",
  SENT: "gold",
  VIEWED: "info",
  ACCEPTED: "success",
  DECLINED: "error",
  REVISED: "warning",
}

export default async function ProposalsPage() {
  const proposals = await db.proposal.findMany({
    orderBy: { createdAt: "desc" },
    include: { lead: true, version: true },
  })

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title="Proposals" subtitle={`${proposals.length} total proposals`} />

      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {proposals.map(proposal => (
              <Link
                key={proposal.id}
                href={`/proposals/${proposal.id}`}
                className="flex items-start gap-4 px-6 py-5 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                  {proposal.lead.firstName[0]}{proposal.lead.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                    {proposal.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {proposal.lead.firstName} {proposal.lead.lastName}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{proposal.introMessage?.slice(0, 100)}...</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={(statusConfig[proposal.status] as any) || "secondary"}>
                    {proposal.status}
                  </Badge>
                  <span className="text-xs text-gray-400">{formatDateShort(proposal.createdAt)}</span>
                </div>
              </Link>
            ))}
            {proposals.length === 0 && (
              <div className="px-6 py-16 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No proposals yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
