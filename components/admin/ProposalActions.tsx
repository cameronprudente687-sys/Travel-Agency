"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { publishToPortal } from "@/actions/proposals"
import { Globe, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Props {
  proposalId: string
  leadId: string
  hasPortal: boolean
  portalSlug?: string
}

export function ProposalActions({ proposalId, leadId, hasPortal, portalSlug }: Props) {
  const [isPending, startTransition] = useTransition()

  const handlePublishToPortal = () => {
    startTransition(async () => {
      try {
        await publishToPortal(proposalId, leadId)
        toast.success("Proposal published to customer portal")
      } catch {
        toast.error("Failed to publish")
      }
    })
  }

  return (
    <div className="flex gap-2">
      {!hasPortal ? (
        <Button variant="navy" size="sm" onClick={handlePublishToPortal} disabled={isPending}>
          <Globe className="w-3.5 h-3.5 mr-1" />
          {isPending ? "Publishing..." : "Publish to Portal"}
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href={`/portal/${portalSlug}`} target="_blank">
            <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Portal
          </Link>
        </Button>
      )}
    </div>
  )
}
