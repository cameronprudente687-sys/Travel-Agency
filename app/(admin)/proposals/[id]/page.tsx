import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { Badge } from "@/components/ui/badge"
import { parseJsonField, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
  const proposal = await db.proposal.findUnique({
    where: { id: params.id },
    include: { lead: true, version: true, portalPage: true },
  })
  if (!proposal) notFound()

  const pricing = parseJsonField<any>(proposal.pricing, {})
  const inclusions = parseJsonField<string[]>(proposal.inclusions, [])
  const exclusions = parseJsonField<string[]>(proposal.exclusions, [])

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader title={proposal.title} subtitle={`${proposal.lead.firstName} ${proposal.lead.lastName}`} />
      <div className="flex-1 p-6 max-w-4xl space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{proposal.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={
                  proposal.status === 'ACCEPTED' ? 'success' :
                  proposal.status === 'SENT' ? 'gold' :
                  proposal.status === 'DECLINED' ? 'error' : 'secondary'
                }>{proposal.status}</Badge>
                {proposal.sentAt && <span className="text-xs text-gray-500">Sent {formatDate(proposal.sentAt)}</span>}
                {proposal.viewedAt && <span className="text-xs text-gray-500">Viewed {formatDate(proposal.viewedAt)}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              {proposal.portalPage && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/${proposal.portalPage.slug}`} target="_blank">View Portal</Link>
                </Button>
              )}
              <Button variant="navy" size="sm">Send to Client</Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Introduction</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{proposal.introMessage}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Itinerary Summary</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{proposal.itinerarySummary}</p>
          </div>

          {(inclusions.length > 0 || exclusions.length > 0) && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What's Included</h3>
              {inclusions.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {inclusions.map((item, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 shrink-0">✓</span>{item}
                    </li>
                  ))}
                </ul>
              )}
              {exclusions.length > 0 && (
                <>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Not Included</h4>
                  <ul className="space-y-2">
                    {exclusions.map((item, i) => (
                      <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                        <span className="text-gray-300 shrink-0">✗</span>{item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {Object.keys(pricing).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>
              <div className="space-y-2">
                {Object.entries(pricing).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-gray-800">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {proposal.advisorSignOff && (
          <div className="bg-primary-50 rounded-xl border border-primary-100 p-5">
            <div className="text-sm font-semibold text-primary-700 mb-1">Advisor Sign-Off</div>
            <p className="text-sm text-gray-700 italic">{proposal.advisorSignOff}</p>
          </div>
        )}
      </div>
    </div>
  )
}
